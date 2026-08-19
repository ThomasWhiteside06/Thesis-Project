import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { NewUser } from "../models/users";

@Injectable({
  providedIn: 'root'
})
export class loginService {
  private readonly LOGIN_URL = `https://budget-backend-c188.onrender.com`;
  private readonly http = inject(HttpClient);

  signup(user: NewUser) {
    return this.http.post(`${this.LOGIN_URL}/login/signup`, user, {
      withCredentials: true
    });
  }

  login(email: string, password: string) {
    return this.http.post(`${this.LOGIN_URL}/login/login`, { email, password }, {
      withCredentials: true
    });
  }

  getMe() {
    return this.http.get(`${this.LOGIN_URL}/login/me`, {
      withCredentials: true
    });
  }

  logout() {
    return this.http.post(`${this.LOGIN_URL}/login/logout`, {}, {
      withCredentials: true
    });
  }
}

