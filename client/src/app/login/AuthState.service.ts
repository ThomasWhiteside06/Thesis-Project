import { inject, Injectable,signal, effect ,computed} from "@angular/core";
import { loginService } from "./auth.service";
import { Router } from "@angular/router";
import { User } from "../models/users";

@Injectable({
  providedIn:'root'
})

export class AuthStateService {
  private readonly api = inject(loginService)
  private readonly router = inject(Router)

  globalUser = signal<User | null>(null)
  globalUserId = computed(() => this.globalUser()?.id ?? null)
  


  constructor() {
    this.loadUser()

    effect(() => {
      const user = this.globalUser()
      if (user) {
        console.log('loggin', user.firstName + ' ' + user.lastname)
      } else {
        console.log(' logged out')
      }

    })
  }

  loadUser() {
    this.api.getMe().subscribe({
      next: (res: any) => this.globalUser.set(res.user),
      error: () => this.globalUser.set(null)
    })
  }

  login(email: string, password: string) {
    this.api.login(email, password).subscribe({
      next: () => {
        this.api.getMe().subscribe({
          next: (res: any) =>{
            this.globalUser.set(res.user)
           this.router.navigateByUrl('/budget') 
          },
          error:() => this.globalUser.set(null)
        })
      },
      error: () => this.globalUser.set(null)
      })
  }
  
  logout() {
    this.api.logout().subscribe(() => {
      this.globalUser.set(null)
      this.router.navigateByUrl('/login')
    })
  }
}