

import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {ApiService} from "../api-service.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {IAddressBalance, IDonationCampaign, IUserSS} from '../model/interfaces';
import {UtilsService} from '../utils.service';
import {StorageService} from '../storage.service';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-create-donation-campaign',
  templateUrl: './create-donation-campaign.component.html'
})
export class CreateDonationCampaignComponent implements OnInit {

  dCampaignForm: FormGroup;
  donationCampaignCreated: boolean = false;
  donationCampaignName: string = '';
  donationContractType: boolean = false;
  @ViewChild('fileInput') fileInput: ElementRef;
  addressesWithBalance: IAddressBalance[];

  constructor(private apiService: ApiService, private fb: FormBuilder, private utilsService: UtilsService, private storageService: StorageService) {

  }

  ngOnInit() {
    this.utilsService.getInitialAddressesWithBalance().then(result => {
      this.addressesWithBalance = result;
    });

    this.apiService.addressBalancesObserveable.subscribe(addresses => {
      this.addressesWithBalance = addresses;
    });

    this.createDonationCampaignForm();
  }


  createDonationCampaignForm() {
    this.dCampaignForm = this.fb.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      description: ['', Validators.compose([Validators.required])],
      website: ['', Validators.compose([Validators.required])],
      email: ['', Validators.compose([Validators.required, Validators.pattern("[^ @]*@[^ @]*")])],
      image: null,
      address: ['', Validators.compose([Validators.required])],
      fundingGoal: null,
      timeGoal: null
    });
  }


  onFileChange(event) {
    let reader = new FileReader();
    if(event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.dCampaignForm.get('image').setValue({
          filename: file.name,
          filetype: file.type,
          value: reader.result.split(',')[1]
        });


        let formData = this.dCampaignForm.value;

        console.log(formData);

      };

    }
  }


  async onSubmit() {

    let formData = this.dCampaignForm.value;

    let institution: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);
    console.log(institution);
    let institutionId = institution.id;

    let donationCampaign: IDonationCampaign = {
      name: formData.name,
      email: formData.email,
      address: formData.address,
      description: formData.description,
      image: formData.image.value,
      fileName: formData.image.filename,
      website: formData.website,
      institutionId:  institutionId
    };

    if (this.donationContractType) {
        donationCampaign.timeGoal = Date.parse(formData.timeGoal);
        donationCampaign.fundingGoal = formData.fundingGoal;

        console.log("DONATION CAMPAIGN TIME GOAL", donationCampaign.timeGoal);
        console.log("DONATION CAMPAIGN FUNDING GOAL", donationCampaign.fundingGoal);

      let addressBalance = this.utilsService.findAddressBalance(donationCampaign.address, this.addressesWithBalance);


      await this.apiService.createDonationCampaignContractFn(donationCampaign.address, addressBalance, donationCampaign.fundingGoal, donationCampaign.timeGoal).then(transactionRes => {

        donationCampaign.txid = transactionRes.txid;
        donationCampaign.fundingGoal = transactionRes.weiAmount;
        return Promise.resolve(true);

      }, err => {
        console.log("ERROR WHILE CREATING CONTRACT TRANSACTION", err);
        return Promise.resolve(true);
      });


      this.apiService.createDonationCampaignContract(donationCampaign).then(result => {

        let resultObj = <any>result;

        this.donationCampaignName = resultObj.name;
        this.donationCampaignCreated = true;

      }, err => {
        console.log("ERROR WHILE CREATING DONATION CAMPAIGN CONTRACT", err);
      });

      console.log("DONATION CAMPAIGN CONTRACT CREATED!", donationCampaign);

    } else {
      this.apiService.createDonationCampaign(donationCampaign).then(result => {

        let resultObj = <any>result;

        this.donationCampaignName = resultObj.name;
        this.donationCampaignCreated = true;

      });

      console.log(formData);

    }


  }

}

// timeGoal: Date.parse(formData.timeGoal),
//   fundingGoal: formData.fundingGoal
