import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgForageModule, NgForageConfig } from 'ngforage';

import { AppComponent } from './app.component';
import {ApiService} from './api-service.service';
import {CryptoService} from './crypto.service';
import {BalancesComponent} from './balances/balances.component';
import {RegisterComponent} from './register-component/register.component';
import {RegisterSuccessfulComponent} from './register-successful/register-successful.component';
import {UserDonationsComponent} from './user-donations/user-donations.component';
import {SettingsComponent} from './settings/settings.component';
import {CreateDonationCampaignComponent} from './create-donation-campaign/create-donation-campaign.component';
import {InstitutionDonationsComponent} from './institution-donations/institution-donations.component';
import {DepositWithdrawComponent} from './deposit-withdraw/deposit-withdraw.component';
import {G2faAuthComponent} from './g2fa-auth-component/g2fa-auth.component';
import {InstitutionDetailsComponent} from './institution-details/institution-details.component';
import {InstitutionListComponent} from './institution-list/institution-list.component';
import {LoginComponent} from './login/login.component';
import {MainPageComponent} from './main-page/main-page.component';
import {ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {RouterModule} from '@angular/router';
import {UtilsService} from './utils.service';
import {StorageService} from './storage.service';
import {SocketService} from './socket.service';

@NgModule({
  declarations: [
    AppComponent,
    BalancesComponent,
    RegisterComponent,
    RegisterSuccessfulComponent,
    UserDonationsComponent,
    SettingsComponent,
    CreateDonationCampaignComponent,
    InstitutionDonationsComponent,
    DepositWithdrawComponent,
    G2faAuthComponent,
    InstitutionDetailsComponent,
    InstitutionListComponent,
    LoginComponent,
    MainPageComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot([
      {
        path: '',
        redirectTo: '/institutions',
        pathMatch: 'full'
      },
      {
        path: 'institutions',
        component: InstitutionListComponent
      },
      {
        path: 'depositWithdraw',
        component: DepositWithdrawComponent
      },
      {
        path: 'balances',
        component: BalancesComponent
      },
      {
        path: 'userDonations',
        component: UserDonationsComponent
      },
      {
        path: 'institutionDonations',
        component: InstitutionDonationsComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
      },
      {
        path: 'createDonationCampaign',
        component: CreateDonationCampaignComponent
      },
      {
        path: 'details/:name',
        component: InstitutionDetailsComponent
      },
    ]),
    NgForageModule.forRoot({
      name: 'DonateIO',
      driver: [
        NgForageConfig.DRIVER_INDEXEDDB,
        NgForageConfig.DRIVER_LOCALSTORAGE
      ],
      storeName: 'donate_io',
      description: 'Local database'
    })
  ],
  providers: [ApiService, CryptoService, UtilsService, StorageService, SocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
