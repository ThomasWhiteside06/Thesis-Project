import { Component } from '@angular/core';
import { ThemeService } from '../services/theme';
import { currencies } from '../currencies';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { ChangeDetectorRef } from '@angular/core';
import { UpdateUser } from '../models/users';
import type { NewUser } from '../models/users';


@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  constructor(public themeService: ThemeService, private userService: UserService, private authService: AuthService, private cdr: ChangeDetectorRef) {
    this.loadUser();
  }
  currencies = currencies;
  selectedCurrency: string = 'GBP';
  userId: string = '';
  email:string = '';
  password:string = '';
  forename:string = '';
  surname:string = '';
  newEmail:string = '';
  newPassword:string = '';
  newForename:string = '';
  newSurname:string = '';

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleColourblind(): void {
    this.themeService.toggleColourblind();
  }

  submitForm(): void {
    const updatedUser:UpdateUser = {
        email: this.email,
        firstName: this.forename,
        lastname: this.surname,
        currency: this.selectedCurrency
    };
    console.log('Updating user:', this.userId);
    console.log('Data being sent:', updatedUser);
    if (this.password) {updatedUser.password = this.password;}
    this.userService.updateUser(this.userId, updatedUser).subscribe({
        next: (response) => {
            console.log('User updated:', response);
            this.password = '';
        },
        error: (error) => {console.error('Failed to update user:', error);console.error('Backend response:', error.error)}
    });
  }

  loadUser(): void {
    const userId = this.authService.getUserId();
    this.userService.getUser(userId).subscribe(user => {
        this.userId = user.id;
        this.email = user.email;
        this.forename = user.firstName;
        this.surname = user.lastname;
        this.selectedCurrency = user.currency!;
        this.cdr.detectChanges();
    });
  }

  addUser(): void {
    console.log('Selected currency:', this.selectedCurrency);
    const newUser:NewUser = {
        email: this.newEmail,
        password: this.newPassword,
        firstName: this.newForename,
        lastname: this.newSurname,
        currency: this.selectedCurrency
    };
    console.log('Creating User:', newUser);
    this.userService.addUser(newUser).subscribe({
        next: (response) => {
            console.log('User created:', response);
            this.newPassword = '';
        },
        error: (error) => {console.error('Failed to update user:', error);console.error('Backend response:', error.error)}
    });
  }

  deleteUser():void {
    this.userService.deleteUser(this.userId).subscribe(response => {console.log(response)})
  }
}


