import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Human, HumanDTO } from './models/human';
import { PaginatedRequest, PaginatedResponse } from './models/params';
import { Car } from './models/car';

@Injectable({
  providedIn: 'root'
})
export class HumanityService {
  public readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  getHumanList$(params: PaginatedRequest): Observable<PaginatedResponse<HumanDTO>> {
    const url = `${ environment.apiUrl }/human-being`;

    return this.http
      .get<PaginatedResponse<HumanDTO>>(url, { headers: this.authService.getAuthHeaders(), params: params });
  }

  getHumanByNameContaining$(): Observable<PaginatedResponse<Human>> {
    const url = `${ environment.apiUrl }/human-being/name-containing`;

    return this.http
      .get<PaginatedResponse<Human>>(url, { headers: this.authService.getAuthHeaders() });
  }

  getCarList$(params: PaginatedRequest): Observable<PaginatedResponse<Car>> {
    const url = `${ environment.apiUrl }/car`;

    return this.http
      .get<PaginatedResponse<Car>>(url, { headers: this.authService.getAuthHeaders(), params: params });
  }

  getCarByNameContaining$(): Observable<PaginatedResponse<Car>> {
    const url = `${ environment.apiUrl }/car/name-containing`;

    return this.http
      .get<PaginatedResponse<Car>>(url, { headers: this.authService.getAuthHeaders() });
  }

  createHuman$(human: Human): Observable<any> {
    return this.http.post<any>(
      `${ environment.apiUrl }/human-being/create`,
      {
        name: human.name,
        coordinates: human.coordinates,
        car: human.car,
        real_hero: human.realHero,
        has_toothpick: human.hasToothpick,
        mood: human.mood,
        impact_speed: human.impactSpeed,
        soundtrack_name: human.soundtrackName,
        minutes_of_waiting: human.minutesOfWaiting,
        weapon_type: human.weaponType
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  removeHuman$(human: Human): Observable<void> {
    return this.http.delete<void>(
      `${ environment.apiUrl }/human-being/${ human.id }`,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  updateHuman$(human: Human): Observable<void> {
    return this.http.put<void>(
      `${ environment.apiUrl }/human-being/${ human.id }`,
      {
        name: human.name,
        coordinates: human.coordinates,
        car: human.car,
        real_hero: human.realHero,
        has_toothpick: human.hasToothpick,
        mood: human.mood,
        impact_speed: human.impactSpeed,
        soundtrack_name: human.soundtrackName,
        minutes_of_waiting: human.minutesOfWaiting,
        weapon_type: human.weaponType
      },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  accessAdmin$(id: number): Observable<void> {
    return this.http.put<void>(
      `${ environment.apiUrl }/human-being/${ id }/edit-status/allow`,
      {
        id: id
      },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  disAccessAdmin$(id: number): Observable<void> {
    return this.http.put<void>(
      `${ environment.apiUrl }/human-being/${ id }/edit-status/delete`,
      {
        id: id
      },
      { headers: this.authService.getAuthHeaders() }
    );
  }

  attachCar$(idHuman: number, idCar: number): Observable<void> {
    const requestBody = {
      car_id: idCar,
      human_id: idHuman
    };
    return this.http.put<void>(
      `${ environment.apiUrl }/human-being/attach-car`,
      requestBody,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createCar$(car: Car): Observable<Car> {
    return this.http.post<Car>(
      `${ environment.apiUrl }/car/create`,
      car,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  removeCar$(car: Car): Observable<void> {
    return this.http.delete<void>(
      `${ environment.apiUrl }/car/${ car.id }`,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  updateCar$(car: Car): Observable<void> {
    return this.http.put<void>(
      `${ environment.apiUrl }/car/${ car.id }`,
      car,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  setSorrow$(): Observable<void> {
    return this.http.put<void>(
      `${ environment.apiUrl }/function/assign/sorrow-mood`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteWithoutToothpick$(): Observable<void> {
    return this.http.delete<void>(
      `${ environment.apiUrl }/function/delete/toothpick-false`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  deleteByWeaponType$(weaponType: any): Observable<void> {
    return this.http.delete<void>(
      `${ environment.apiUrl }/function/delete/weaponType/${ weaponType }`,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  countMinutes$(num: any): Observable<number> {
    return this.http.get<number>(
      `${ environment.apiUrl }/function/count-minutes-less-than`,
      { headers: this.authService.getAuthHeaders(), params: { maxMinutesOfWaiting: num } }
    );
  }

  uniqueImpactSpeed$(): Observable<number[]> {
    return this.http.get<number[]>(
      `${ environment.apiUrl }/function/uniqueImpactSpeed`
    );
  }

}
