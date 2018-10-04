import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Location} from '@angular/common';
import {ApiService} from '../api-service.service';
import {IInstitution, IDonationCampaign, IAddressBalance, IUserSS} from '../model/interfaces';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbModal, ModalDismissReasons, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import {UtilsService} from '../utils.service';
import {StorageService} from '../storage.service';
import {SessionStorageKeys} from '../model/enums';

@Component({
  selector: 'app-institution-details',
  templateUrl: './institution-details.component.html',
  styleUrls: ['./institution-details.component.css']
})
export class InstitutionDetailsComponent implements OnInit {

  donateForm: FormGroup;
  name: string;
  donationCampaign: IDonationCampaign;
  closeResult: string;
  addressesWithBalance: IAddressBalance[];
  modalRef: NgbModalRef;
  txId: string;
  selectedBalance;
  transactionSuccessful = false;
  transactionError = false;
  transactionErrorMessage: string;

  constructor( private route: ActivatedRoute,
               private location: Location,
               private apiService: ApiService,
               private fb: FormBuilder,
               private modalService: NgbModal,
               private storageService: StorageService,
               public utilsService: UtilsService) { }


  createForm() {
    this.donateForm = this.fb.group({
      addressFrom: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      amount: ['', Validators.compose([Validators.required, Validators.minLength(2), Validators.maxLength(30)])],
      description: [''],
    });
  }

  ngOnInit() {

    this.createForm();

    this.route.paramMap
      .pipe(switchMap((params: ParamMap) => this.apiService.getDonationCampaign(params.get('name')))).subscribe(donationCampaign => {
        console.log(donationCampaign);
        this.donationCampaign = donationCampaign;
      });



    this.utilsService.getInitialAddressesWithBalance().then(result => {
      this.addressesWithBalance = result;
    });
    this.apiService.addressBalancesObserveable.subscribe(addresses => {
      this.addressesWithBalance = addresses;
    });

  }

  onSubmit() {

    const formValue = this.donateForm.value;

    console.log(formValue);
  }

  open(event, content) {

    console.log(event);

    this.modalRef = this.modalService.open(content);
    this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      console.log(this.closeResult);
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  checkTransactionDetails(addressFrom, addressTo, amount, description) {

    const addressFromBalance = this.utilsService.findAddressBalance(addressFrom, this.addressesWithBalance);
    this.selectedBalance = addressFromBalance;


    if (addressFromBalance >= amount) {

      const user: IUserSS = this.storageService.getItemSS(SessionStorageKeys.UserData);


      const donationDetails = {
        donationCampaignName: this.donationCampaign.name,
        userEmail: user.email
      };

      this.apiService.makeTransaction(addressFrom, addressTo, amount, addressFromBalance, description, true, donationDetails).then(txId => {
        this.txId = txId;
        this.transactionSuccessful = true;
        this.modalRef.close('Donation successful');
      }, err => {
        this.transactionError = true;
        this.transactionErrorMessage = err;
        this.modalRef.close('Donation error');
      });

    } else {
      this.transactionError = true;
      this.transactionErrorMessage = 'Donation amount is greater than amount on the address';
    }


  }

}
