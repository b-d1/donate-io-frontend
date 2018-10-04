import {Injectable, OnDestroy} from '@angular/core';
import {IInstitution, IUser, IAddressBalance, IDonationCampaign, IUserSS, IType, IGasPrice} from './model/interfaces';
import {Observable, Observer, from, timer} from 'rxjs';
import {first} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BigNumber} from 'bignumber.js';
import * as global from './globals';
import {UtilsService} from './utils.service';
import {StorageService} from './storage.service';
import {DBStorageKeys, SessionStorageKeys, SocketMessages, UserTypes} from './model/enums';
import {SocketService} from './socket.service';

const ethereumTx = require('ethereumjs-tx');
const Buffer = require('buffer/').Buffer;
const Web3 = require('web3');

@Injectable()
export class ApiService implements OnDestroy {

  // institutions:  Institution[];

  public addressBalancesObserver: Observer<IAddressBalance[]>;
  public addressBalancesObserveable: Observable<IAddressBalance[]>;

  public donationCampaignObserver: Observer<IDonationCampaign[]>;
  public donationCampaignObservable: Observable<IDonationCampaign[]>;

  public priceEthereum: string;

  public gasPrice;
  public donationCampaigns: IDonationCampaign[] = [];
  private userEthereumDataInterval;
  private web3;
  private DonationCampaignsContractInstance;

  constructor(private http: HttpClient, private utilsService: UtilsService, private storageService: StorageService, private socketService: SocketService) {

    this.connectToWeb3();
    this.createContractInstances();
    this.addressBalancesObserveable = Observable.create((observer: Observer<IAddressBalance[]>) => {
      this.addressBalancesObserver = observer;
    });


    this.donationCampaignObservable = Observable.create((observer: Observer<IDonationCampaign[]>) => {
      this.donationCampaignObserver = observer;
    });

    // this.createDonationCampaignContractFn();

  }

  ngOnDestroy() {
    if (this.userEthereumDataInterval) {
      clearInterval(this.userEthereumDataInterval);
    }
  }

  getAddressesBalanceDetails() {
    from(this.readBalances()).subscribe(() => {
      this.subscribeToBalance();
    });
  }

  getDonatonCampaigns() {
    from(this.getDonationCampgs()).subscribe(() => {
      this.subscribeToDonationCampaigns();
    });
  }

  subscribeToBalance() {
    timer(10000).pipe(first()).subscribe(() => this.getAddressesBalanceDetails());
  }

  subscribeToDonationCampaigns() {
    timer(10000).pipe(first()).subscribe(() => this.getDonatonCampaigns());
  }


  updateUser(email: string, password: string, name: string) {

    const updateBody = {
      name: name,
      email: email,
      password: password
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/updateUser', updateBody, httpOptions).toPromise().then(data => {

      console.log('User updated');
      const dataAny = <any>data;
      const user: IUser = {
        name: dataAny.name,
        email: dataAny.email,
        id: dataAny.id,
        hash: dataAny.hash,
        numDontaions: dataAny.numberOfDonations,
        donationPoints: dataAny.donationPoints
      };

      const userSS: IUserSS = {
        email: user.email,
        name: user.name,
        id: user.id,
        hash: user.hash
      };

      this.storageService.setItemSS(SessionStorageKeys.UserData, userSS);

      return Promise.resolve(user);
    });


  }

  registerUser(email: string, password: string, name: string) {

    const registerBody = {
      name: name,
      email: email,
      password: password
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/registerUser', registerBody, httpOptions).toPromise().then(data => {

      this.utilsService.setUserType(UserTypes.User);

      console.log('User registered');
        const dataAny = <any>data;
        const user: IUser = {
          name: dataAny.name,
          email: dataAny.email,
          id: dataAny.id,
          hash: dataAny.hash,
          numDontaions: dataAny.numberOfDonations,
          donationPoints: dataAny.donationPoints
      };
        return Promise.resolve(user);
    });

  }



  registerInstitution(email: string, password: string, name: string) {

    const registerBody = {
      name: name,
      email: email,
      password: password
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/registerInstitution', registerBody, httpOptions).toPromise().then(data => {

      this.utilsService.setUserType(UserTypes.Institution);

      console.log('User registered');
      const dataAny = <any>data;
      const inst: IInstitution = {
        name: dataAny.name,
        email: dataAny.email,
        id: dataAny.id,
        hash: dataAny.hash
      };
      return Promise.resolve(inst);
    });


  }



  logInUser(email: string, password: string) {
    const loginBody = {
      email: email,
      password: password
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/login', loginBody, httpOptions).toPromise().then(data => {
      console.log('User loggedIn', data);
      const dataAny = <any>data;
      if (dataAny.type === UserTypes.User) {
        const user: IUser = {
          name: dataAny.login.name,
          email: dataAny.login.email,
          id: dataAny.login.id,
          numDontaions: dataAny.login.numberOfDonations,
          donationPoints: dataAny.login.donationPoints,
          hash: dataAny.login.hash
        };
        this.utilsService.setUserType(UserTypes.User);

        return user;
      } else if (dataAny.type === UserTypes.Institution) {
        const institution: IInstitution = {
          name: dataAny.login.name,
          email: dataAny.login.email,
          id: dataAny.login.id,
          hash: dataAny.login.hash
        };
        this.utilsService.setUserType(UserTypes.Institution);
        return institution;
      }
    });


  }

  getQRCodeImg(email: string, type: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.get(`http://localhost:8085/api/getQRCode?email=${email}&type=${type}`, httpOptions).toPromise().then(data => {
      console.log('QR Image obtained');
      const dataAny = <any>data;
      return dataAny.url;
    });

  }

  verifyQRCode(email: string, code: string, type: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.get(`http://localhost:8085/api/verifyQRCode?qrcode=${code}&email=${email}&type=${type}`, httpOptions).toPromise().then(data => {
      console.log('QR Image obtained');
      const dataAny = <any>data;
      return dataAny;
    });
  }


  async getDonationCampgs() {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    let contractCampaigns;

    await this.http.get(`http://localhost:8085/api/getDonationCampaignsContract`, httpOptions).toPromise().then(data => {
      console.log('Donation contract campaigns obtained');
      contractCampaigns = <any>data;
      return Promise.resolve(true);
    });


    return this.http.get(`http://localhost:8085/api/getDonationCampaigns`, httpOptions).toPromise().then(data => {
      console.log('Donation campaigns obtained');
      let dataAny = <any>data;
      dataAny = dataAny.concat(contractCampaigns);
      const donationCampaigns: IDonationCampaign[] = [];
      for (let i = 0; i < dataAny.length; i++) {
        let donationCampaign: IDonationCampaign = {
          name: dataAny[i].name,
          website: dataAny[i].website,
          email: dataAny[i].email,
          description: dataAny[i].description,
          address: dataAny[i].address,
          institutionId: dataAny[i].institutionId,
          image: `http://localhost:8085/api/getDonationCampaignImage?imageName=${dataAny[i].image}`
        };

        if(dataAny[i].fundingGoal) {
          donationCampaign.fundingGoal = dataAny[i].fundingGoal;
        }

        donationCampaigns.push(donationCampaign);
      }

      if (this.donationCampaignObserver) {
        this.donationCampaignObserver.next(donationCampaigns);
      }

      this.donationCampaigns = donationCampaigns;
      return Promise.resolve(true);

    }, err => {
      const donationCampaigns: IDonationCampaign[] = [];
      if (this.donationCampaignObserver) {
        this.donationCampaignObserver.next(donationCampaigns);
        return Promise.resolve(true);
      }
    }).catch(err => {

      const donationCampaigns: IDonationCampaign[] = [];
      if (this.donationCampaignObserver) {
        this.donationCampaignObserver.next(donationCampaigns);
        return Promise.resolve(true);
      }

    });



  }


  getAddressBalance(address) {
    return this.http.get(`https://ropsten.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=IV94DWBSQ37YCDMJSZGTU6K4PF6GX51H7A`).toPromise().then(result => {
      console.log(result);
      return result;
    });
  }

  connectToWeb3() {
    this.web3 = new Web3('https://ropsten.infura.io/v3/7639deda6f374a59b23a5233702d7afb');
  }

  createContractInstances() {
    const donationCampaignsInterface = [
      {
        "constant": true,
        "inputs": [],
        "name": "numCampaigns",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "numSucceededCampaigns",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignFundingGoalReached",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignGoalsReached",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignTimeExpiredNotFunded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignSucceeded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignStopped",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "from",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "DonationReceived",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "name": "donationCampaignId",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "fundingGoal",
            "type": "uint256"
          },
          {
            "indexed": false,
            "name": "timeGoal",
            "type": "uint256"
          }
        ],
        "name": "DonationCampaignCreated",
        "type": "event"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "fundingGoal",
            "type": "uint256"
          },
          {
            "name": "timeGoal",
            "type": "uint256"
          }
        ],
        "name": "newCampaign",
        "outputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "donate",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "withdrawFromFailedCampaign",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "withdraw",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "stopDonationCampaign",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "getCampaignCollectedAmount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "getCampaignGoals",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "donationCampaignId",
            "type": "uint256"
          }
        ],
        "name": "checkCampaignStatus",
        "outputs": [
          {
            "name": "",
            "type": "uint8"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    const donationCampaignsAddress = '0x2cfC1b07c32DC8f017015d21736d125ba1599176';
    this.DonationCampaignsContractInstance = new this.web3.eth.Contract(donationCampaignsInterface, donationCampaignsAddress, {});
  }
  //
  // findAddressBalance(address) {
  //
  //   if (address) {
  //     const addrObj = this.addressesWithBalance.find(addressObj => addressObj.address === address);
  //
  //     this.selectedBalance = addrObj.balance; // save multiple calls
  //
  //     return addrObj.balance;
  //
  //   } else {
  //     return 0;
  //   }
  // }
  //
  //
  async createDonationCampaignContractFn(addressFrom, addressFromBalance, amount, timeGoal) {


    let weiAmount = this.web3.utils.toWei(amount + "", "ether");

    console.log("WEI AMOUNT", weiAmount);

    const data = this.DonationCampaignsContractInstance.methods.newCampaign(weiAmount, timeGoal).encodeABI();
    let txid;
    await this.makeContractTransaction(addressFrom, '0x2cfC1b07c32DC8f017015d21736d125ba1599176', addressFromBalance,  data, 0 ).then(txidRes => {
      console.log("TX ID", txidRes);
      txid = txidRes;
      return Promise.resolve(true);
    }, err => {
      console.log("ERROR CREATING CONTRACT TRANSACTION", err);
      return Promise.resolve(true);
    });

    return Promise.resolve({txid, weiAmount});
  }


  async makeContractDonation(addressFrom, addressFromBalance, donationAmount, campaignId) {

  }

  async makeContractTransaction(addressFrom, addressTo, addressFromBalance, data, amount) {
    let gasPrice = this.utilsService.gasPrice;

    await this.storageService.getItemDB(DBStorageKeys.GasPrice).then(result => {
      gasPrice = result;
      return Promise.resolve(true);
    }, err => {
      return Promise.resolve(true);
    });

    const gasPriceBN = new BigNumber(gasPrice);
    const gasLimit = this.utilsService.gasLimit;
    const fee = gasPriceBN.times(gasLimit);
    const fromAddressBalanceWei = this.utilsService.getWeiFromEther(addressFromBalance);
    const fromAddressBalanceBN = new BigNumber(fromAddressBalanceWei);


    if (fromAddressBalanceBN.isGreaterThanOrEqualTo(fee)) {

      const gasPriceHex = this.utilsService.getHexValue(gasPriceBN.toString(10));
      const gasLimitHex = this.utilsService.getHexValue(gasLimit);


      let nonce;

      await this.getTransactionCount(addressFrom).then((count) => {
        nonce = count;
        return Promise.resolve(true);
      }, err => {
        return Promise.resolve(true);
      });

      if (nonce === null || nonce === undefined) {
        return Promise.reject('Transaction count error!');
      }


      const txParams = {
        nonce: nonce,
        gasPrice: `0x${gasPriceHex}`,
        gasLimit: `0x${gasLimitHex}`,
        to: addressTo,
        from: addressFrom,
        value: `0x0`,
        data: data,
        chainId: 3 // Ropsten chainID
      };

      const tx = new ethereumTx(txParams);

      let etherObj;

      etherObj = this.utilsService.getEthereumObject(addressFrom);


      const privateKey = etherObj.privateKey;

      const privateKeyBuffer = new Buffer(privateKey, 'hex');
      tx.sign(privateKeyBuffer);

      if (tx.verifySignature()) {
        console.log('valid signature');
      }

      const serializedTx = tx.serialize();
      const hash = tx.hash();

      let txId;
      await this.sendTransaction(serializedTx).then(result => {

        txId = result;
        console.log('TRANSACTION SEND DATA RESULTS', result);
        return Promise.resolve(true);
      }, err => {
        return Promise.resolve(true);
      });

      return Promise.resolve(txId);

    }

  }

  async makeTransaction(addressFrom, addressTo, amount, addressFromBalance, description, isDonation, donationDetails?) {
    let gasPrice = this.utilsService.gasPrice;

    await this.storageService.getItemDB(DBStorageKeys.GasPrice).then(result => {
      gasPrice = result;
      return Promise.resolve(true);
    }, err => {
      return Promise.resolve(true);
    });

    const gasPriceBN = new BigNumber(gasPrice);


    const amountInWei = this.utilsService.getWeiFromEther(amount);
    const amountBN = new BigNumber(amountInWei);
    const gasLimit = this.utilsService.gasLimit;
    const fee = gasPriceBN.times(gasLimit);
    const totalAmount = amountBN.plus(fee);
    const fromAddressBalanceWei = this.utilsService.getWeiFromEther(addressFromBalance);
    const fromAddressBalanceBN = new BigNumber(fromAddressBalanceWei);

    if (fromAddressBalanceBN.isGreaterThanOrEqualTo(totalAmount)) {

      const gasPriceHex = this.utilsService.getHexValue(gasPriceBN.toString(10));
      const valueHex = this.utilsService.getHexValue(amountBN.toString(10));
      const gasLimitHex = this.utilsService.getHexValue(gasLimit);


      let nonce;

      await this.getTransactionCount(addressFrom).then((count) => {
        nonce = count;
        return Promise.resolve(true);
      }, err => {
        return Promise.resolve(true);
      });

      if (nonce === null || nonce === undefined) {
        return Promise.reject('Transaction count error!');
      }


      const txParams = {
        nonce: nonce,
        gasPrice: `0x${gasPriceHex}`,
        gasLimit: `0x${gasLimitHex}`,
        to: addressTo,
        from: addressFrom,
        value: `0x${valueHex}`,
        data: '',
        chainId: 3 // Ropsten chainID
      };

      const tx = new ethereumTx(txParams);

      let etherObj;

      etherObj = this.utilsService.getEthereumObject(addressFrom);


      const privateKey = etherObj.privateKey;

      const privateKeyBuffer = new Buffer(privateKey, 'hex');
      tx.sign(privateKeyBuffer);

      if (tx.verifySignature()) {
        console.log('valid signature');
      }

      const serializedTx = tx.serialize();
      const hash = tx.hash();

      let txId;
      await this.sendTransaction(serializedTx).then(result => {

        txId = result;
        console.log('TRANSACTION SEND DATA RESULTS', result);
        return Promise.resolve(true);
      }, err => {
        return Promise.resolve(true);
      });

      if (!txId) {
        return Promise.reject('Error while broadcasting transaction to network!');
      }

      if (!isDonation) {
        return Promise.resolve(txId);
      }

      txParams['txId'] = txId;
      txParams['fee'] = '0x' + fee.toString(16);
      txParams['description'] = description;

      let createDonationError = false;
      await this.sendDonationToServer(txParams, donationDetails).then(result => {

        console.log('Donation sent successfully!');
        return Promise.resolve(true);

      }, err => {
        console.log('ERROR WHILE CREATING DONATION CAMPAIGN', err);
        createDonationError = true;
        return Promise.resolve(true);
      });

      if (createDonationError) {
        return Promise.reject('Error while creating donation.');
      }

      return Promise.resolve(txId);

    }
  }

  sendDonationToServer(txParams, donationDetails) {

    const donationBody = {
      userEmail: donationDetails.userEmail,
      donationCampaignName: donationDetails.donationCampaignName,
      addressFrom: txParams.from,
      addressTo: txParams.to,
      amount: txParams.value,
      fee: txParams.fee,
      description: txParams.description,
      transactionId: txParams.txId
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    console.log('SENDING DATA TO SERVER', donationBody);

    return this.http.post('http://localhost:8085/api/createDonation', donationBody, httpOptions).toPromise().then(data => {

      console.log('Donation created successfully!');
      const dataAny = <any>data;
      return Promise.resolve(true);
    }, err => {
      return Promise.reject('Error while creating donation.');
    });


  }

  getTransactionCount(address: string) {
    return this.http.get(`https://ropsten.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=IV94DWBSQ37YCDMJSZGTU6K4PF6GX51H7A`).toPromise().then(result => {
        const resultObj = <any>result;
      return resultObj.result;
    }, err => {
      return '0x0';
    }).catch(err => {
      return '0x0';
    });
  }

  async readBalances() {
    console.log("getting addresses with balance");
    let addresssesWithBalance: IAddressBalance[] = [];

    await this.utilsService.getInitialAddressesWithBalance().then((result: IAddressBalance[]) => {
      addresssesWithBalance = result;
      return Promise.resolve(true);
    });

    this.addressBalancesObserver.next(addresssesWithBalance);

    return Promise.resolve(addresssesWithBalance);
  }

  getBalances() {
    this.socketService.onMultipleBalancesReceived().subscribe(result => {
      console.log("MULTIPLE BALANCES RECEIVED", result);
      this.processEthereumBalances(result);
    });
  }

  async processEthereumBalances(balances) {
    balances.sort(this.utilsService.compareFunction);
    console.log("Processing ETH balances");
    let addressesWithBalance: IAddressBalance[] = [];

    let usdPrice = '0';

    await this.obtainUSDPrice().then(result => {
      console.log("USD PRICE OBTAINED", usdPrice);
      usdPrice = result;
      return Promise.resolve(true);
    });

    for(let i = 0; i < balances.length; i++) {
      let addressBalance: IAddressBalance = {
        address: balances[i].address,
        balance: this.utilsService.getEtherFromWei(balances[i].balance),
        balanceUSD: 0
      };

      addressBalance.balanceUSD = this.utilsService.getUSDValue(addressBalance.balance, usdPrice);
      addressesWithBalance.push(addressBalance);
    }

    console.log("Addresses with balances obtained", addressesWithBalance);

    await this.utilsService.storeUserAddresses(addressesWithBalance).then(result => {
      console.log("User addresses stored");
    }, err => {
      console.log("Error while storing user addresses");
    });

  }

  async obtainUSDPrice() {
    let usdPrice;

    await this.getPrice().then(result => {
      usdPrice = result;
      return Promise.resolve(true);
    }, err => {
      return Promise.resolve(true);
    });

    if(!usdPrice) {
      await this.storageService.getItemDB(DBStorageKeys.EthereumPriceUSD).then(result => {
        usdPrice = result;
      });
    }
    return Promise.resolve(usdPrice);
  }

  getPrice() {

   return this.http.get('https://api.coinmarketcap.com/v1/ticker/ethereum/').toPromise().then((result) => {

      let priceEthereum = result[0].price_usd;
      this.storageService.setItemDB(DBStorageKeys.EthereumPriceUSD, priceEthereum).then(writeRes => {

      return Promise.resolve(priceEthereum);

      });

    });

  }

  public sendTransaction(serializedTransaction) {
    const hexTransaction = '0x' + serializedTransaction.toString('hex');
    return this.sentTransactionRequest(hexTransaction).then(result => {
      const resultObj = <any>result;
      return Promise.resolve(resultObj.result);
    });
  }

  public sentTransactionRequest(hexTransaction) {

    return this.http.get(`https://ropsten.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${hexTransaction}&apikey=IV94DWBSQ37YCDMJSZGTU6K4PF6GX51H7A`).toPromise().then(result => {
      console.log('TRANSACTION SENT RESULT', result);
      return result;
    });

  }

  public getGasPrice() {

    this.socketService.onGasPriceReceived().subscribe((result: IGasPrice) => {

      let gasPriceHex = new BigNumber(result.gasPrice).toString(16);
      gasPriceHex = `0x${gasPriceHex}`;

      this.storageService.setItemDB(DBStorageKeys.GasPrice, gasPriceHex).then(writeRes => {
      });

    });

  }


  public createDonationCampaignContract(donationCampaign: IDonationCampaign) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/createCampaignContract', donationCampaign, httpOptions).toPromise().then(result => {
      console.log('CAMPAIGN CREATED', result);
      return Promise.resolve(result);
    }, err => {
      console.log("ERROR WHILE CREATING CONTRACT CAMPAIGN", err);
      return Promise.resolve(true);
    });
  }

  public createDonationCampaign(donationCampaign: IDonationCampaign) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.post('http://localhost:8085/api/createCampaign', donationCampaign, httpOptions).toPromise().then(result => {
      console.log('RESULT', result);
      return Promise.resolve(result);
    });
  }

  getDonationCampaign(name: string) {
    const dntCampaign = this.donationCampaigns.find(donationCampaign => donationCampaign.name.toLowerCase() === name.toLowerCase());

    return from([dntCampaign]);
  }

  getDonationCampaignsByInstitution() {

      const institution: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);
      console.log('GET INSTITUTION', institution);
      const institutionId = institution.id;
      const institutionDonationCampaigns = this.donationCampaigns.filter(donationCampaign => institutionId === donationCampaign.institutionId);
      console.log('INSTITUTION CAMPAIGNS', institutionDonationCampaigns);
      return institutionDonationCampaigns;

  }

  // add JWT

  getUserDonations(email: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.get(`http://localhost:8085/api/getUserDonations?email=${email}`).toPromise().then(result => {
      const userDonations = <any>result;
      return Promise.resolve(userDonations);
    });
  }


  getInstitutionDonations(email: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.get(`http://localhost:8085/api/getInstitutionDonations?email=${email}`).toPromise().then(result => {
      const institutionDonations = <any>result;
      return Promise.resolve(institutionDonations);
    });
  }

  getInstitutionContractDonations(email: string) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    return this.http.get(`http://localhost:8085/api/getInstitutionContractDonations?email=${email}`).toPromise().then(result => {
      const institutionDonations = <any>result;
      return Promise.resolve(institutionDonations);
    });
  }

  readUserEthereumData() {

    this.userEthereumDataInterval = setInterval(() => {
      this.socketService.send(SocketMessages.GetGasPrice, {});

      this.utilsService.getUserAddresses().then(result => {
        console.log("GETTING USER ADDRESSES", result);
        this.socketService.send(SocketMessages.GetMultipleBalances, {addresses: result});
      });
    }, 10000);

  }


}



