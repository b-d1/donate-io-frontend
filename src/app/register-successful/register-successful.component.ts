import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApiService} from '../api-service.service';
import {IType, IUser, IUserSS} from '../model/interfaces';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '../storage.service';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-register-successful',
  templateUrl: './register-successful.component.html',
  styleUrls: ['./register-successful.component.css']
})
export class RegisterSuccessfulComponent implements OnInit {
  @Output() onAuth = new EventEmitter<boolean>();
  qrCodePhoto: string;
  authForm: FormGroup;
  @Input()
  user: IUser;
  constructor(private apiService: ApiService, private fb: FormBuilder, private storageService: StorageService) { }

  ngOnInit() {

    this.createForm();

    const type: IType = this.storageService.getItemSS(SessionStorageKeys.UserType);

    this.apiService.getQRCodeImg(this.user.email, type.type).then(image => {
      this.qrCodePhoto = image;
    });

  }


  createForm() {
    this.authForm = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])]
    });
  }


  onSubmit() {

    const formValue = this.authForm.value;

    if (this.authForm.valid) {

      const type: IType = this.storageService.getItemSS(SessionStorageKeys.UserType);

      this.apiService.verifyQRCode(this.user.email, formValue.code, type.type).then(result => {
        console.log('USER VERIFIED SUCCESSFULLY');
        this.onAuth.emit(true);
      });

    }

    console.log(formValue);
  }

}
