import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalDismissReasons, NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../api-service.service";
import {Location} from '@angular/common';
import {IAddressBalance} from "../model/interfaces";
import {UtilsService} from '../utils.service';

const qr = require('qr-encode');


@Component({
  selector: 'app-deposit-withdraw',
  templateUrl: './deposit-withdraw.component.html',
  styleUrls: ['./deposit-withdraw.component.css']
})
export class DepositWithdrawComponent implements OnInit {

  dwForm: FormGroup;
  closeResult: string;
  addresses: string[];
  addressesWithBalance: IAddressBalance[];
  selectedBalance;
  txId: string;
  transactionSuccessful:boolean = false;
  transactionError:boolean = false;
  transactionErrorMessage:string;
  selectedAddress: string;
  addressQRCode;
  modalRef: NgbModalRef;


  constructor( private route: ActivatedRoute,
               private location: Location,
               private apiService: ApiService,
               private fb: FormBuilder,
               private modalService: NgbModal,
               public utilsService: UtilsService) { }

  ngOnInit() {


    this.createForm();

    this.getAddresses();

    this.utilsService.getInitialAddressesWithBalance().then(result => {
      this.addressesWithBalance = result;
    });
    this.apiService.addressBalancesObserveable.subscribe(addresses => {
      this.addressesWithBalance = addresses;
    });

  }

  createForm() {
    this.dwForm = this.fb.group({
      addressFrom: ['', Validators.compose([Validators.required])],
      addressTo: ['', Validators.compose([Validators.required])],
      amount: [0, Validators.compose([Validators.required])],
    });
  }

  onSubmit() {

    let formValue = this.dwForm.value;

    console.log(formValue);
  }

  open(content) {
   this.modalRef =  this.modalService.open(content);
   this.modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      console.log(this.closeResult);
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openQRCodeDialog(address, content) {
    this.selectedAddress = address;
    this.addressQRCode = qr(this.selectedAddress, {type: 6, size: 4, level: 'Q'});
    this.open(content);
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

  getAddresses() {
      this.utilsService.getUserAddresses().then(result => {
        this.addresses = result;
      });
  }

  getIndexOfAddress(address) {
    return this.addresses.indexOf(address);
  }

  checkTransactionDetails(addressFrom, addressTo, amount) {

    const addressFromBalance = this.utilsService.findAddressBalance(addressFrom, this.addressesWithBalance);
    this.selectedBalance = addressFromBalance;

    if(addressFromBalance >= amount) {

      this.apiService.makeTransaction(addressFrom, addressTo, amount, addressFromBalance, '', false).then(txId => {
        this.txId = txId;
        this.transactionSuccessful = true;
        this.modalRef.close('Withdraw successful');
      }, err => {
        this.transactionError = true;
        this.transactionErrorMessage = err;
        this.modalRef.close('Withdraw error');
      });

    } else {
      this.transactionError = true;
      this.transactionErrorMessage = 'Withdraw amount is greater than amount on the address';
    }


  }


}
