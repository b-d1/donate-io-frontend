import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IType, IUser, IUserSS} from '../model/interfaces';
import {ApiService} from '../api-service.service';
import {StorageService} from '../storage.service';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-g2fa-auth-component',
  templateUrl: './g2fa-auth.component.html',
  styleUrls: ['./g2fa-auth.component.css']
})
export class G2faAuthComponent implements OnInit {
  @Input() user: IUser;

  @Output() onAuth = new EventEmitter<boolean>();


  authForm: FormGroup;
  authSuccessful = false;
  constructor(private fb: FormBuilder, private apiService: ApiService, private storageService: StorageService) {

  }


  createForm() {
    this.authForm = this.fb.group({
      code: ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)])]
    });
  }

  ngOnInit() {
    this.createForm();

  }


  onSubmit() {

    const formValue = this.authForm.value;
    if (this.authForm.valid) {

      const type: IType = this.storageService.getItemSS(SessionStorageKeys.UserType);

      this.apiService.verifyQRCode(this.user.email, formValue.code, type.type).then(result => {
        console.log('USER VERIFIED SUCCESSFULLY');
        this.authSuccessful = true;
        this.onAuth.emit(true);
      });

    }
  }
}
