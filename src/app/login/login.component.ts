import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IUser} from '../model/interfaces';
import {ApiService} from '../api-service.service';
import {CryptoService} from '../crypto.service';
import {StorageService} from '../storage.service';

@Component({
  selector: 'app-login-component',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @Output() onLogin = new EventEmitter<IUser>();


  loginForm: FormGroup;
  login = true;
  loginSuccessful = false;
  loginError = false;
  errorMessage: string;
  constructor(private fb: FormBuilder, private apiService: ApiService, private cryptoService: CryptoService, private storageService: StorageService) {

  }


  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('[^ @]*@[^ @]*')])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
    });
  }

  ngOnInit() {
    this.createForm();

  }

  switchToRegister() {
    this.login = false;
  }


  onSubmit() {

    // const userExists = JSON.parse(localStorage.getItem('DonateIO'));

    // if (!userExists) {
    //   this.loginError = true;
    //   this.errorMessage = 'User doesn\'t exists, please register first!';
    // } else if (userExists.email !== this.loginForm.controls.email.value) {
    //   this.loginError = true;
    //   this.errorMessage = `User with email: ${this.loginForm.controls.email.value} haven't been registered on this device!`;
    // } else {
      if (this.loginForm.valid) {

        this.apiService.logInUser(this.loginForm.controls.email.value, this.loginForm.controls.password.value).then(async (user) => {

          // check if userExists

          let userExists = true;
          let error = false;

          console.log("USER OBTAINED FROM API SERVICE", user);

          await this.storageService.getItemDB(user.hash).then(result => {
            console.log("ITEM DB OBTAINED LF", result);
            if (result === null) {
              userExists = false;
            }
            return Promise.resolve(true);
          }, err => {
            console.log("ERROR WHILE OBTAINING ITEM FROM LF", err);
            error = true;
              return Promise.resolve(true);
          });

          if (error) {
            // throw new Error("Storage service error");
            this.loginError = true;
            this.errorMessage = "Storage service error";
            return;
          }


          if(!userExists) {
            await this.cryptoService.setCryptoInfo(user.hash);
            await this.cryptoService.generateAddresses(1, user.hash).then();
          } else {
            console.log("Generating prev addresses");
            this.cryptoService.generatePreviousAddresses(user.hash);
          }

          this.loginSuccessful = true;
          this.onLogin.emit(user);
        }, error => {
          this.loginError = true;
          this.errorMessage = error.error.message;
        });

      }
    }
  }
// }
