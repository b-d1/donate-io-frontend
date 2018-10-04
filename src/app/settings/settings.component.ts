import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CryptoService} from '../crypto.service';

import * as global from '../globals';
import {ApiService} from '../api-service.service';
import {StorageService} from '../storage.service';
import {IUserSS} from '../model/interfaces';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  detailsForm: FormGroup;
  generateAddressForm: FormGroup;
  addressGenerated = false;
  updateSuccessful = false;
  updateError = false;
  address = '';

  constructor(private fb: FormBuilder, private cryptoService: CryptoService, private apiService: ApiService, private storageService: StorageService) { }

  ngOnInit() {

    const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    console.log('USER OBTAINED', user);

    const userObj = {
      name: user.name,
      email: user.email
    };

    this.createDetailsForm();

    this.createGenerateAddressForm();

    this.detailsForm.patchValue(userObj);

  }

  createGenerateAddressForm() {
    this.generateAddressForm = this.fb.group({
      alias: ['']
    });
  }

  createDetailsForm() {
    this.detailsForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      email: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      password: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(30)])],
      confPassword: ['', Validators.compose([Validators.minLength(8), Validators.maxLength(30)])]
    }, { validator: this.checkIfMatchingPasswords('password', 'confPassword')});
  }



  onSubmit() {
    const formValue = this.detailsForm.value;
    if (this.detailsForm.valid) {
        this.apiService.updateUser(formValue.email, formValue.password, formValue.name).then(user => {
          console.log('User updated successfully!', user);
          this.updateSuccessful = true;
          return Promise.resolve(true);
        }, err => {
          console.log('Error');
          this.updateError = true;
          return Promise.resolve(true);
        });
    } else {

    }
    console.log(formValue);
  }

  generateAddress() {

    const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    this.cryptoService.generateAddresses(1, user.hash).then(result => {
      console.log('Address generated');
      // this.addressGenerated = true;

      const lastAddress = global.ethereumKeyPairs[global.ethereumKeyPairs.length - 1].address;
      this.address = lastAddress;
      this.addressGenerated = true;

    });

  }

  checkIfMatchingPasswords(passwordKey: string, passwordConfirmationKey: string) {
    return (group: FormGroup) => {
      const passwordInput = group.controls[passwordKey],
        passwordConfirmationInput = group.controls[passwordConfirmationKey];
      if (passwordInput.value !== passwordConfirmationInput.value) {
        return passwordConfirmationInput.setErrors({notEquivalent: true});
      } else {
        return passwordConfirmationInput.setErrors(null);
      }
    };
  }

}
