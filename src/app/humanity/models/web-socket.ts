import { Observable } from 'rxjs';
import { InjectionToken } from '@angular/core';
import { Human } from './human';

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  reconnectAttempts?: number;
}

export interface IWsMessage {
  event: string;
  data: WSData;
}

export interface IWebsocketService {
  on(event: string): Observable<WSData>;

  send(event: string, data: any): void;

  status: Observable<boolean>;
}

export const WS_CONFIG = new InjectionToken<WebSocketConfig>('WebSocketConfig');

export enum WSOperationType {
  CREATE_HUMAN = "CREATE_HUMAN",
  UPDATE_HUMAN = "UPDATE_HUMAN",
  DELETE_HUMAN = "DELETE_HUMAN",
  ATTACH_CAR = "ATTACH_CAR",
  UPDATE_CAR = "UPDATE_CAR"
}

export interface WSData {
  humanBeing: Human;
  operationType: WSOperationType,
}

