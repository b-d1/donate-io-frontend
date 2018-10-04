import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as socketIo from 'socket.io-client';
import {SocketMessages} from './model/enums';

@Injectable()
export class SocketService {

  private socket;

  private serverUrl = 'http://localhost:8081';

  public initSocket(): void {
    this.socket = socketIo(this.serverUrl);
  }

  public send(message: string, data: any): void {
    this.socket.emit(message, data);
  }

  public onMessage(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on('hello', (data: any) => observer.next(data));
    });
  }

  public onBalanceReceived(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(SocketMessages.BalanceObtained, (data: any) => observer.next(data));
    });
  }

  public onGasPriceReceived(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(SocketMessages.GasPriceObtained, (data: any) => observer.next(data));
    });
  }

  public onMultipleBalancesReceived(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(SocketMessages.MultipleBalancesObtained, (data: any) => observer.next(data));
    });
  }

  public onError(): Observable<any> {
    return new Observable<any>(observer => {
      this.socket.on(SocketMessages.Error, (data: any) => observer.next(data));
    });
  }

  public onEvent(event: Event): Observable<any> {
    return new Observable<Event>(observer => {
      this.socket.on(event, () => observer.next());
    });
  }

}
