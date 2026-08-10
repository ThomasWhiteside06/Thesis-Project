import { Component } from '@angular/core';
import { ThemeService } from '../services/theme';

@Component({
  selector: 'app-nav-bar',
  imports: [],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  constructor(private themeService: ThemeService) {}
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}