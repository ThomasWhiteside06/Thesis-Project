import { Component } from '@angular/core';
import { ThemeService } from '../services/theme';
import { currencies } from '../currencies';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { UserService } from '../services/user';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  constructor(public themeService: ThemeService, private userService: UserService, private cdr: ChangeDetectorRef) {
    this.loadUser();
  }
  currencies = currencies;
  selectedCurrency = 'GBP';
  email:string = '';
  password:string = '';
  forename:string = '';
  surname:string = '';

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  submitForm(form: NgForm): void {
    if (this.email && this.password && this.forename && this.surname) {
      console.log('Form Submitted!');
      form.resetForm();
    } else {
      console.log('Please enter all fields!')
    }
  }

  loadUser(): void {
    const userId = "303a8279-3df3-4567-bac2-0f5645810998"; //temp until login built
    this.userService.getUser(userId).subscribe(user => {
        this.email = user.email;
        this.forename = user.firstName;
        this.surname = user.lastname;
        this.cdr.detectChanges();
    });
}
}


