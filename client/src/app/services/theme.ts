import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  darkMode: boolean;
  colourblindMode: boolean;
  constructor() {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.colourblindMode = localStorage.getItem('colourblindMode') === 'true';
    this.applyTheme();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }

  toggleColourblind(): void {
    this.colourblindMode = !this.colourblindMode;
    localStorage.setItem('colourblindMode', this.colourblindMode.toString());
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
    document.body.classList.toggle('colourblind-mode', this.colourblindMode);
  }
}