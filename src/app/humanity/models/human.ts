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
  car?: Car;
  mood: Mood;
  impactSpeed?: number;
  soundtrackName: string;
  minutesOfWaiting: number;
  weaponType: WeaponType;
  editAdminStatus: boolean;
}

export interface HumanDTO {
  'id': number;
  'name': string;
  'coordinates': Coordinates;
  'creation_date': Date;
  'real_hero': boolean;
  'has_toothpick': boolean;
  'car': Car;
  'mood': Mood;
  'impact_speed': number;
  'soundtrack_name': string;
  'minutes_of_waiting': number;
  'weapon_type': WeaponType;
  'edit_admin_status': boolean;
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

export const toHuman = (human: HumanDTO) => {
  return {
    id: human.id,
      name: human.name,
      coordinates: human.coordinates,
      creationDate: human.creation_date,
      realHero: human.real_hero,
      hasToothpick: human.has_toothpick,
      car: human.car,
      mood: human.mood,
      impactSpeed: human.impact_speed,
      soundtrackName: human.soundtrack_name,
      minutesOfWaiting: human.minutes_of_waiting,
      weaponType: human.weapon_type,
      editAdminStatus: human.edit_admin_status,
  }
}