import { Injectable } from '@angular/core';
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

import * as global from './globals';
import {IAddressBalance, IKeyPair, IUserDB} from './model/interfaces';
import {StorageService} from './storage.service';

@Injectable()
export class CryptoService {

  constructor(private storageService: StorageService) { }


  async setCryptoInfo(hash: string) {

    const mnemonic = bip39.generateMnemonic();

    const user: IUserDB = {
      mnemonic: mnemonic,
      ethereum: {
        addressIndex: 0,
        derivationPath: ''
      },
      addresses: []
    };

    let storageError;
    await this.storageService.setItemDB(hash, user).then(result => {
      console.log('Data written in DB successfully', result);
      return Promise.resolve(true);
    }, err => {
      console.log('Error while writing user data in localDB', err);
      storageError = err;
      return Promise.resolve(true);
    });

    if (storageError) {
      return Promise.reject("Error while setting user info: " + storageError);
    }
    return Promise.resolve(true);

  }

  async generateAddresses(numAddresses: number, hash: string) {

    let user: IUserDB;

    await this.storageService.getItemDB(hash).then(result => {
      console.log("USER OBTAINED LF", result);
      user = result;
      return Promise.resolve(true);
    }, err => {
      console.log('Error while getting user LF', err);
      return Promise.resolve(true);
    });

    if (!user) {
      throw new Error('Error while obtaining user');
    }

    const seed = bip39.mnemonicToSeed(user.mnemonic);

    const root = new hdkey.fromMasterSeed(seed);
    let lastAddressIndex = user.ethereum && user.ethereum.addressIndex;


    const defaultPath = `m/44'/60'/0'/0/`;
    let path;
    let node;

    for (let i = 0; i < numAddresses; i++) {
      path = defaultPath + (lastAddressIndex++);
      node = root.derivePath(path);

      const wallet = node.getWallet();

      const keyPair: IKeyPair = {
        address: wallet.getAddressString(),
        privateKey: wallet.getPrivateKey(),
        privateKeyString: wallet.getPrivateKeyString()
      };

      const addressBalance: IAddressBalance = {
        address: keyPair.address,
        balance: 0,
        balanceUSD: 0
      };

      user.addresses.push(addressBalance);
      global.ethereumKeyPairs.push(keyPair);

    }

    user.ethereum.addressIndex = lastAddressIndex;
    user.ethereum.derivationPath = path;

    let writeError = false;

    await this.storageService.setItemDB(hash, user).then(result => {
      console.log("User successfully written!", result);
      return Promise.resolve(true);
    }, err => {
      writeError = true;
      console.log("Error while writing user");
      return Promise.resolve(true);
    });

    if (writeError) {
      throw new Error("User write error");
    }

    return Promise.resolve(true);


  }

  async generatePreviousAddresses(hash: string) {

    let user: IUserDB;

    await this.storageService.getItemDB(hash).then(result => {
      user = result;
      return Promise.resolve(true);
    }, err => {
      console.log('Error while getting user');
      return Promise.resolve(true);
    });

    if (!user) {
      throw new Error('Error while obtaining user');
    }
    const seed = bip39.mnemonicToSeed(user.mnemonic);

    const root = new hdkey.fromMasterSeed(seed);
    const lastAddressIndex = user.ethereum && user.ethereum.addressIndex;


    const defaultPath = `m/44'/60'/0'/0/`;
    let path;
    let node;



    for (let i = 0; i < lastAddressIndex; i++) {
      path = defaultPath + i;
      node = root.derivePath(path);

      const wallet = node.getWallet();
      global.ethereumKeyPairs.push({ 'address': wallet.getAddressString(), 'privateKey': wallet.getPrivateKey(), 'privateKeyString': wallet.getPrivateKeyString() });
    }

    return Promise.resolve(true);
  }


}
