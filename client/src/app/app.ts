import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Home } from './home/home';
import { NavBar } from './nav-bar/nav-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client');
}
