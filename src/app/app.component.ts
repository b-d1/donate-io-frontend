import {Component, OnInit} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {IUser, IUserSS} from './model/interfaces';
import {ApiService} from './api-service.service';
import {StorageService} from './storage.service';
import {log} from 'util';
import {SessionStorageKeys, SocketMessages, UserTypes} from './model/enums';
import {SocketService} from './socket.service';
import {error} from '@angular/compiler/src/util';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  loginScreen = true;
  registerScreen = false;
  g2faScreen = false;
  loggedInScreen = false;
  setupGFAScreen = false;
  user: any;
  userType: UserTypes = UserTypes.User;

  constructor(private apiService: ApiService, private storageService: StorageService, private socketService: SocketService) {

    window.onbeforeunload = (ev) => {
      console.log("BEFORE UNLOAD");
      // this.storageService.removeItemSS(SessionStorageKeys.UserData);
      // this.storageService.removeItemSS(SessionStorageKeys.UserType);
    };

    }

  ngOnInit() {
    const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    console.log("USER TYPE", this.userType);

    if (user) {
      this.loginScreen = false;
      this.loggedInScreen = true;
    }
    //

    this.initSubscriptions();
    this.apiService.getPrice();

    // /
    // this.socketService.send(SocketMessages.GetBalance, {address: "0x56B34a4f2558B7Fcff7C9409C561AEa9fe0eC8f1"});
    // this.socketService.send(SocketMessages.GetGasPrice, {});
    // this.socketService.send(SocketMessages.GetMultipleBalances, {addresses: ["0x56B34a4f2558B7Fcff7C9409C561AEa9fe0eC8f1", "0x2f85488a3670e370cb4ea8b9ffc0a2f40cec0021"]});
    //
    // this.socketService.onMessage().subscribe(result => {
    //   console.log("SOCKET MESSAGE RECEIVED", result);
    // });
    //
    // this.socketService.onBalanceReceived().subscribe(result => {
    //   console.log("BALANCES RECEIVED", result);
    // });
    //
    // this.socketService.onMultipleBalancesReceived().subscribe(result => {
    //   console.log("MULTIPLE BALANCES RECEIVED", result);
    // });
    //
    //
    // this.socketService.onGasPriceReceived().subscribe(result => {
    //   console.log("Gas price received", result);
    // });
    //
    //
    // this.socketService.onError().subscribe(result => {
    //   console.log("SOCKET ERROR RECEIVED", result);
    // });


  }

  onLogin(loginUser: IUser) {
    if (loginUser) {
      this.loginScreen = false;
      this.user = loginUser;
      this.g2faScreen = true;
      // remove the following code and uncomment the line above to setup gfa
      // this.loggedInScreen = true;
      // const u: IUserSS = {
      //   name: loginUser.name,
      //   email: loginUser.email,
      //   id: loginUser.id,
      //   hash: loginUser.hash
      // };
      // this.storageService.setItemSS('DonateIO', u);
      // this.setupObservers();

    }
  }

  onRegister(registeredUser: IUser) {
    if (registeredUser) {
      this.loginScreen = false;
      this.registerScreen = false;
      this.loggedInScreen = false;
      this.user = registeredUser;
      this.setupGFAScreen = true;
    }
  }


  onAuth(authUser: boolean) {
    if (authUser) {
      // Save user

      const u: IUserSS = {
        name: this.user.name,
        email: this.user.email,
        hash: this.user.hash,
        id: this.user.id
      };


      console.log("SETTING USER DATA", u);
      console.log("SETTING USER DATA USER", this.user);

      this.storageService.setItemSS(SessionStorageKeys.UserData, u);
      this.userType = this.storageService.getItemSS(SessionStorageKeys.UserType);

      this.setupObservers();
      this.loginScreen = false;
      this.setupGFAScreen = false;
      this.g2faScreen = false;
      this.loggedInScreen = true;

    }
  }

  changeToLogin() {
    this.loginScreen = true;
    this.registerScreen = false;
  }

  changeToRegister() {
    this.registerScreen = true;
    this.loginScreen = false;
  }

  setupObservers() {
    this.apiService.getGasPrice();
    this.apiService.getBalances();
    this.apiService.readUserEthereumData();
    this.apiService.getAddressesBalanceDetails();
    this.apiService.donationCampaignObservable.subscribe();
    this.apiService.getDonatonCampaigns();
  }



  initSubscriptions() {
    this.socketService.initSocket();
    this.apiService.addressBalancesObserveable.subscribe();
  }

}
