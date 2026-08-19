import { Component ,inject,computed} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../login/AuthState.service';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar {
  auth = inject(AuthStateService)
  userName = computed( () =>this.auth.globalUser()?.firstName ?? null)

}