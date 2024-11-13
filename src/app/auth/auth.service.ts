import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  Observable,
  of,
  map,
  EMPTY,
  catchError,
} from 'rxjs';
import { Router } from '@angular/router';
import { User } from './models/user';
import { AuthRequest, AuthResponse } from './models/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService{
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly #USER_STORAGE_KEY = 'user';

  #currentUser: User | null = null;

  get currentUser(): User | null {
    this.#currentUser = this.restoreUser();
    return this.#currentUser;
  }

  set currentUser(value: User | null) {
    this.#currentUser = value;
    this.storeUser();
  }

  get isAuthenticated(): boolean {
    return this.#currentUser != null;
  }

  login(request: AuthRequest): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/authenticate`;

    const loginObservable = this.http.post<AuthResponse>(url, request, {
      observe: 'response',
    });

    return loginObservable.pipe(
      catchError((res) => of(res)),
      map((res) => {
        switch (res.status) {
          case 200:
            this.currentUser = {
              username: request.username,
              token: res.body!.accessToken,
              accountType: res.body!.role,
            };
            break;
          case 403:
            throw new Error('Wrong username or password');
          default:
            throw new Error('Login error');
        }

        return res.body!;
      })
    );
  }

  register(request: AuthRequest): Observable<AuthResponse> {
    const url = `${environment.apiUrl}/auth/register`;

    const registerObservable = this.http.post<AuthResponse>(url, request, {
      observe: 'response',
    });

    return registerObservable.pipe(
      catchError((res) => of(res)),
      map((res) => {
        switch (res.status) {
          case 200:
            this.currentUser = {
              username: request.username,
              token: res.body!.accessToken,
              accountType: res.body!.role,
            };
            break;
          case 409:
            throw new Error('User already exists');
          default:
            throw new Error('Register error');
        }

        return res.body!;
      })
    );
  }

  logout(): Observable<unknown> {
    localStorage.removeItem(this.#USER_STORAGE_KEY);

    return EMPTY;
  }

  authViaToken(): Observable<boolean> {
    const user = this.restoreUser();

    if (user == undefined || user.token == undefined) {
      return of(false);
    }

    const url = `${environment.apiUrl}/auth/verify-token`;
    const checkTokenObservable = this.http.get(url, {
      headers: this.getAuthHeaders(user),
      responseType: 'text',
    });

    return checkTokenObservable.pipe(
      map(() => {
        this.currentUser = user;

        return true;
      }),
      catchError(() => {
        this.currentUser = null;

        return of(false);
      })
    );
  }

  requestAdminRights(): Observable<void> {
    const url = `${environment.apiUrl}/admin/registration-requests`;

    return this.http
      .post(url, null, {
        headers: this.getAuthHeaders(this.currentUser),
        observe: 'response',
      })
      .pipe(
        catchError((res) => of(res)),
        map((res) => {
          switch (res.status) {
            case 201:
              return;
            case 400:
              throw new Error('Request already exists');
            default:
              throw new Error('Unknown error');
          }
        })
      );
  }

  redirectAfterAuth(): void {
    void this.router.navigate(['']);
  }

  getAuthHeaders(
    user: User | null | 'current-user' = 'current-user'
  ): HttpHeaders {
    if (user === 'current-user') {
      user = this.currentUser;
    }

    let headers = new HttpHeaders();
    if (user && user.token) {
      headers = headers.set('Authorization', `Bearer ${user.token}`);
    }

    return headers;
  }

  /**
   * Восстановить сохранённые данные пользователя.
   *
   * @returns данные пользователя или `null`, если они не были сохранены
   */
  private restoreUser(): User | null {
    const storedUserCredentials = localStorage.getItem(this.#USER_STORAGE_KEY);

    return storedUserCredentials ? JSON.parse(storedUserCredentials) : null;
  }

  /**
   * Сохранить данные пользователя.
   */
  private storeUser(): void {
    if (this.#currentUser === null) {
      localStorage.removeItem(this.#USER_STORAGE_KEY);
      return;
    }

    const userJson = JSON.stringify(this.#currentUser);
    localStorage.setItem(this.#USER_STORAGE_KEY, userJson);
  }
}
