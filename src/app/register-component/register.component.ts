import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {IUser} from '../model/interfaces';
import {ApiService} from '../api-service.service';
import {CryptoService} from '../crypto.service';

@Component({
  selector: 'app-register-component',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  @Output() onRegister = new EventEmitter<IUser>();


  registerForm: FormGroup;
  registerSuccessful = false;
  registerError = false;
  errorMessage: string;
  constructor(private fb: FormBuilder, private apiService: ApiService, private cryptoService: CryptoService) {

  }


  createForm() {
    this.registerForm = this.fb.group({
      email: ['', Validators.compose([Validators.required, Validators.pattern('[^ @]*@[^ @]*')])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
      confPassword: ['', Validators.compose([Validators.required, Validators.minLength(8), Validators.maxLength(30)])],
      userType: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
    }, { validator: this.checkIfMatchingPasswords('password', 'confPassword')});
  }

  ngOnInit() {
    this.createForm();

  }


  onSubmit() {


      const formValue = this.registerForm.value;
      console.log(formValue);
      if (this.registerForm.valid) {

        let registerCallback = async (user) => {

          let cryptoInfoError;
          await this.cryptoService.setCryptoInfo(user.hash).then(result => {
            return Promise.resolve(true);
          }, err => {
            cryptoInfoError = err;
            return Promise.resolve(true);
          });

          if (cryptoInfoError) {
            console.log("CRYPTO INFO ERROR");
            return;
          }


          await this.cryptoService.generateAddresses(1, user.hash).then(result => {
            return Promise.resolve(true);
          });

          this.registerSuccessful = true;
          this.onRegister.emit(user);

        };

        if (formValue.userType === 'donor') {
          this.apiService.registerUser(formValue.email, formValue.password, formValue.name).then(registerCallback, error => {
            console.log('ERROR', error);
            this.registerError = true;
            this.errorMessage = error.error.message;
          });
        } else if (formValue.userType === 'institution') {

          this.apiService.registerInstitution(formValue.email, formValue.password, formValue.name).then(registerCallback, error => {

            this.registerError = true;
            this.errorMessage = error.error.message;
          });


      }
    }
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
