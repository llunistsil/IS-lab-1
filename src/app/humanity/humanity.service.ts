import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Human } from './models/human';
import { PaginatedRequest, PaginatedResponse } from './models/params';
import { Car } from './models/car';

@Injectable({
  providedIn: 'root'
})
export class HumanityService {
  public readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  getHumanList$(params: PaginatedRequest): Observable<PaginatedResponse<Human>> {
    const url = `${ environment.apiUrl }/human-being`;

    return this.http
      .get<PaginatedResponse<Human>>(url, { headers: this.authService.getAuthHeaders(), params: params });
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

  createHuman$(human: Human): Observable<void> {
    return this.http.post<void>(
      `${ environment.apiUrl }/human-being/create`,
      {
        name: human.name,
        coordinates: human.coordinates,
        car: human.car,
        real_hero: human.realHero,
        has_toothpick: human.hasToothpick,
        mood: human.mood,
        impact_speed: human.impactSpeed,
        soundtrack_name: human.soundTrackName,
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
      human,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  attachCar$(human: Human, car: Car): Observable<void> {
    const requestBody = {
      car_id: car.id,
      human_id: human.id
    };
    return this.http.patch<void>(
      `${ environment.apiUrl }/human-being/attach-car`,
      requestBody,
      { headers: this.authService.getAuthHeaders() }
    );
  }

  createCar$(car: Car): Observable<void> {
    return this.http.post<void>(
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
}
