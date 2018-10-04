import {Injectable} from '@angular/core';
import {NgForage} from 'ngforage';

@Injectable()
export class StorageService {

  constructor(private ngf: NgForage) {}

  public getItemDB<T = any>(key: string): Promise<T> {
    return this.ngf.getItem<T>(key);
  }

  public setItemDB<T = any>(key: string, data: any): Promise<T> {
    return this.ngf.setItem<T>(key, data);
  }

  public getItemSS(key: string): any {
    return JSON.parse(sessionStorage.getItem(key));
  }

  public setItemSS(key: string, data: any): any {
     sessionStorage.setItem(key, JSON.stringify(data));
  }

  public removeItemSS(key: string): any {
    sessionStorage.removeItem(key)
  }

}
