import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api-service.service";
import {IAddressBalance} from "../model/interfaces";
import {ModalDismissReasons, NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UtilsService} from '../utils.service';

const qr = require('qr-encode');

@Component({
  selector: 'app-balances',
  templateUrl: './balances.component.html',
  styleUrls: ['./balances.component.css']
})
export class BalancesComponent implements OnInit {

  addressBalances: IAddressBalance[];
  ethereumPrice: string;
  totalETH: any;
  totalUSD: any;
  closeResult: string;
  selectedAddress: IAddressBalance;
  privateKey: string;
  addressQRCode: string;
  privateKeyQRCode: string;


  constructor(private apiService: ApiService, private utilsService: UtilsService, private modalService: NgbModal) {
  }

  ngOnInit() {
    this.utilsService.getInitialAddressesWithBalance().then(result => {
      console.log("ADDRESSES RECEIVED");
      this.addressBalances = result;

      this.totalETH = 0;
      this.totalUSD = 0;

      for(let i = 0; i < this.addressBalances.length; i++) {
        this.totalETH += this.addressBalances[i].balance;
        this.totalUSD += this.addressBalances[i].balanceUSD;
      }

      this.totalUSD = this.totalUSD.toFixed(3);

    });

    this.apiService.obtainUSDPrice().then(result => {
      this.ethereumPrice = Number(result).toFixed(3);
    });

    this.apiService.addressBalancesObserveable.subscribe(data => {
      console.log("data received");
      this.addressBalances = data;
    });


  }

  open(address, content) {

    console.log(address);

    this.selectedAddress = address;
    this.privateKey = this.utilsService.getPrivateKeyForAdddress(this.selectedAddress.address);
    this.addressQRCode = qr(address.address, {type: 6, size: 4, level: 'Q'});
    this.privateKeyQRCode = qr(this.privateKey, {type: 6, size: 4, level: 'Q'});



    this.modalService.open(content).result.then((result) => {
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
      return `with: ${reason}`;
    }
  }

  getIndexOfAddress(address) {
    return this.addressBalances.indexOf(address);
  }


}
