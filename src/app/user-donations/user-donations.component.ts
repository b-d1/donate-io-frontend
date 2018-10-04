import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api-service.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UtilsService} from '../utils.service';
import {StorageService} from '../storage.service';
import {IUserSS} from '../model/interfaces';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-user-donations',
  templateUrl: './user-donations.component.html',
  styleUrls: ['./user-donations.component.css']
})
export class UserDonationsComponent implements OnInit {

  userDonations = [];
  modalRef: NgbModalRef;
  closeResult: string;
  currentDonation;
  totalDonations: number;

  constructor(private apiService: ApiService, public utilsService: UtilsService, private modalService: NgbModal, private storageService: StorageService) { }

  ngOnInit() {

    const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    this.apiService.getUserDonations(user.email).then(result => {

      this.userDonations = result;
      this.totalDonations = this.userDonations.length;

      for (let i = 0; i < this.userDonations.length; i++) {
        const userDonation = this.userDonations[i];
        if (userDonation.createdOn && userDonation.createdOn !== '') {
          userDonation.createdOn = new Date(userDonation.createdOn).toUTCString();
        }
      }

      console.log('User donations received', result);
    });

  }

  displayDonationDetails(content, donation) {
    this.currentDonation = donation;
    this.modalRef =  this.modalService.open(content);
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      console.log(this.closeResult);
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

}
