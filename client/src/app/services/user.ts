import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { type User, type UpdateUser, NewUser } from '../models/users'

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://budget-backend-c188.onrender.com/api';
    constructor(private http: HttpClient) {}

    getUser(userId: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
    }

    addUser(user: NewUser): Observable<User> {
        return this.http.post<User>(`${this.apiUrl}/users/`, user); 
    }

    updateUser(userId: string, user: UpdateUser): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/users/${userId}`, user);
    }

    deleteUser(userId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
    }
}