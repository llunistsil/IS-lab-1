import { Car } from './car';
import { PaginatedRequest } from './params';



export interface Coordinates {
  x: number;
  y: number;
}

export enum Mood {
  SORROW,
  LONGING,
  APATHY,
  CALM,
  RAGE,
}

export enum WeaponType {
  HAMMER,
  AXE,
  SHOTGUN,
  MACHINE_GUN,
  BAT,
}

export interface Human {
  id: number;
  name: string;
  coordinates: Coordinates;
  creationDate: Date;
  realHero?: boolean;
  hasToothpick: boolean;
  car: Car;
  mood: Mood;
  impactSpeed?: number;
  soundTrackName: string;
  minutesOfWaiting: number;
  weaponType: WeaponType;
}

export type HumanRequest = {
  name?: string;
  substring?: string;
  pagination?: PaginatedRequest;
};

export enum ActionWithHumans {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}