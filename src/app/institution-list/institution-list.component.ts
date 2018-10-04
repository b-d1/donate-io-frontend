import { Component, OnInit } from '@angular/core';
import {ApiService} from '../api-service.service';
import {IInstitution, IDonationCampaign} from '../model/interfaces';
import {UtilsService} from '../utils.service';
import {StorageService} from '../storage.service';
import {SessionStorageKeys, UserTypes} from '../model/enums';
import {Router} from "@angular/router";


@Component({
  selector: 'app-institution-list',
  templateUrl: './institution-list.component.html',
  styleUrls: ['./institution-list.component.css']
})
export class InstitutionListComponent implements OnInit {

  isUser = true;
  donationCampaigns: IDonationCampaign[] = [];

  constructor(private apiService: ApiService, private utilsService: UtilsService, private storageService: StorageService, private router: Router) { }

  ngOnInit() {
    const type = this.storageService.getItemSS(SessionStorageKeys.UserType).type;
    if (type === UserTypes.User) {
      this.isUser = true;
      this.donationCampaigns = this.apiService.donationCampaigns;
      this.apiService.donationCampaignObservable.subscribe(data => {
        console.log('Data received');
        console.log("THIS DONATION CAMPAIGNS", this.donationCampaigns);
        this.donationCampaigns = data;
      });
    } else if (type === UserTypes.Institution) {
      this.router.navigate(['/institutionDonations']);
    }

  }

  shortenText(text) {
    return this.utilsService.shortenText(text);
  }
}
