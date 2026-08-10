import { Component } from '@angular/core';
import { ThemeService } from '../services/theme';
import { currencies } from '../currencies';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';


@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  constructor(public themeService: ThemeService) {}
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
}


