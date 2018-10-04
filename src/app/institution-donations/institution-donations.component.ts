import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api-service.service';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UtilsService} from '../utils.service';
import {IUserSS} from '../model/interfaces';
import {StorageService} from '../storage.service';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-institution-donations',
  templateUrl: './institution-donations.component.html',
  styleUrls: ['./institution-donations.component.css']
})
export class InstitutionDonationsComponent implements OnInit {

  donationCampaigns = [];
  modalRef: NgbModalRef;
  closeResult: string;
  currentDonationCampaign;
  currentDonation;

  constructor(private apiService: ApiService, public utilsService: UtilsService, private modalService: NgbModal, private storageService: StorageService) { }

  async ngOnInit() {

    const institution: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);

    await this.apiService.getInstitutionContractDonations(institution.email).then(result => {
      console.log("CONTRACT DONATION CAMPAIGNS OBTAINED");
      this.donationCampaigns = result.donationCampaigns;
      return Promise.resolve(true);
    });

    this.apiService.getInstitutionDonations(institution.email).then(result => {
      console.log('INSTITUTION DONATIONS RECEIVED', result);
      this.donationCampaigns = this.donationCampaigns.concat(result.donationCampaigns);

      for (let i = 0; i < this.donationCampaigns.length; i++) {
        const donationCampaign = this.donationCampaigns[i];

        for (let j = 0; j < donationCampaign.donations.length; j++) {
          const donation = donationCampaign.donations[j];
          if (donation.createdOn && donation.createdOn !== '') {
            donation.createdOn = new Date(donation.createdOn).toUTCString();
          }
        }
      }

    });

  }


  selectDonationCampaign(donationCampaign) {
    this.currentDonationCampaign = donationCampaign;
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


  shortenText(text) {
    return this.utilsService.shortenText(text);
  }



}
