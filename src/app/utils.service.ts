import {Injectable} from '@angular/core';
import {BigNumber} from 'bignumber.js';
import * as global from './globals';
import {IAddressBalance, IType, IUserDB, IUserSS} from './model/interfaces';
import {SessionStorageKeys, UserTypes} from './model/enums';
import {StorageService} from './storage.service';


@Injectable()
export class UtilsService {

  weiFactor = 1000000000000000000;
  public gasPrice = 1000000000;
  public gasLimit = 300000;

  constructor(private storageService: StorageService) {}

  public shortenText(text: string) {
    if (text.length <= 150) {
      return text;
    }
    return text.substr(0, 150) + '...';
  }

  public getNumberFromHex(hex: string) {
    if(hex) {
      return new BigNumber(hex).toNumber();
    }
    return 0;
  }

  public getHexValue(value: any) {
    return new BigNumber(value).toString(16);
  }

  public getEtherFromWei(wei: string|number) {
    if(wei !== null && wei !== undefined) {
      const weiBN = new BigNumber(wei);
      const ether = weiBN.dividedBy(this.weiFactor).toNumber();
      return ether;
    } else {
      return 0;
    }
  }

  public getWeiFromEther(ether: string|number) {
    if(ether !== null && ether !== undefined) {
      const etherBN = new BigNumber(ether);
      const wei = etherBN.times(this.weiFactor).toNumber();
      return wei;
    } else {
      return 0;
    }

  }

  getUSDValue(ether: number, priceEthereum: string) {

    let usdValue = 0;

    if (priceEthereum) {
      const usdBN = new BigNumber(priceEthereum);
      usdValue = usdBN.times(ether).toNumber();
    }

    return usdValue;

  }

  async getUserAddresses() {

    let addressesDB = [];
    await this.getInitialAddressesWithBalance().then(result => {
      addressesDB = result;
    });

    const addresses = addressesDB.map(addrObject => addrObject.address);

    return Promise.resolve(addresses);
  }


  async getInitialAddressesWithBalance() {
    let addressesDB = [];

    const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    await this.storageService.getItemDB(user.hash).then(result => {
      addressesDB = result.addresses;
      return Promise.resolve(true);
    }, err => {
      return Promise.resolve(true);
    });

    addressesDB.sort(this.compareFunction);

    if(addressesDB.length === 0) {
      return Promise.reject("Error");
    }

    return Promise.resolve(addressesDB);

  }

  setUserType(type) {

    const userType: IType = {
      type: type
    };

    this.storageService.setItemSS(SessionStorageKeys.UserType, userType);

  }


  getEthereumObject(address: string) {

    const addrObjFound = global.ethereumKeyPairs.find(addrObject => addrObject.address === address);

    return addrObjFound;

  }



  getPrivateKeyForAdddress(address: string) {

    const addrObjFound = global.ethereumKeyPairs.find(addrObject => addrObject.address === address);

    if (addrObjFound) {
      return addrObjFound.privateKeyString;
    }

    return '0';

  }

  async storeUserAddresses(addresses: IAddressBalance[]) {
    const userSS: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    let user;

    await this.storageService.getItemDB(userSS.hash).then((result: IUserDB) => {
      user = result;
    });

    user.addresses = addresses;
    let writeError = false;
    await this.storageService.setItemDB(userSS.hash, user).then(result => {
      return Promise.resolve(true);
    }, err => {
      writeError = true;
      return Promise.resolve(true);
    });

    if(writeError) {
      return Promise.reject("Storage write error");
    }

    return Promise.resolve(true);

  }

  compareFunction(a, b) {
    return a.address.localeCompare(b.address);
  }

  findAddressBalance(address, addressesWithBalance) {

    if(address) {
      let addrObj = addressesWithBalance.find(addressObj => addressObj.address === address);
      return addrObj.balance;

    } else {
      return 0;
    }
  }

}
