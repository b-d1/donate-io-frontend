import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api-service.service';
import {StorageService} from '../storage.service';
import {SessionStorageKeys, UserTypes} from '../model/enums';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  isUser = true;
  userType: string;
  userTypes = UserTypes;

  constructor(private storageService: StorageService) { }

  ngOnInit() {

    this.userType = this.storageService.getItemSS(SessionStorageKeys.UserType).type;

  }

  logOut() {
    this.storageService.removeItemSS(SessionStorageKeys.UserData);
    this.storageService.removeItemSS(SessionStorageKeys.UserType);
  }

}
