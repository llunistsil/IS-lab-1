import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Client, IFrame, IMessage } from '@stomp/stompjs';
import { WSData } from './models/web-socket';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class HumanityWebSocketService implements OnDestroy {
  private client: Client;
  private connectionStatus$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private messages$ = new Subject<WSData>();

  constructor() {
    this.client = new Client({
      brokerURL: environment.wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.info(str),
    });

    this.client.onConnect = this.onConnect.bind(this);
    this.client.onStompError = this.onStompError.bind(this);

    this.client.activate(); // Активируем клиент
  }

  /**
   * Обработчик успешного подключения
   */
  private onConnect() {
    console.log('Connected to WebSocket server!');

    // Устанавливаем статус подключения
    this.connectionStatus$.next(true);

    // Подписка на тему "/topic/human-being"
    this.client.subscribe('/topic/human-being', (message: IMessage) => {
      const parsedData = JSON.parse(message.body);
      this.messages$.next(parsedData);
    });

  }

  /**
   * Обработчик ошибок STOMP
   * @param frame
   */
  private onStompError(frame: IFrame) { // изменяем тип на IFrame
    console.error('Broker error:', frame.headers['message']);
    console.error('Details:', frame.body);
    this.connectionStatus$.next(false);
  }

  /**
   * Отправка сообщения
   * @param destination Точка назначения (например, "/app/something")
   * @param body Тело сообщения
   */
  public send(destination: string, body: any) {
    if (this.client && this.client.connected) {
      this.client.publish({ destination, body: JSON.stringify(body) });
    } else {
      console.error('Cannot send message: WebSocket is not connected');
    }
  }

  /**
   * Получение событий (сообщений) по теме "/topic/human-being"
   */
  public onMessage<T>(): Observable<WSData> {
    return this.messages$.asObservable();
  }

  /**
   * Получение статуса подключения
   */
  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Завершение работы WebSocket при уничтожении сервиса
   */
  public ngOnDestroy(): void {
    if (this.client) {
      this.client.deactivate().then(() => console.log('WebSocket has been destroyed'));
    }
    this.connectionStatus$.complete();
    this.messages$.complete();
  }
}