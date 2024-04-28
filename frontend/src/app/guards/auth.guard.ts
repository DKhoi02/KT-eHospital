import { AuthService } from 'src/app/services/auth.service';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
      const expectedRole = next.data['expectedRole'];

      const token = this.authService.decodedToken()

      if (expectedRole && token.role !== expectedRole) {
        Swal.fire({
          title: 'Access Denied',
          text: 'Please sign in with correct role before access',
          icon: 'warning',
        });
        this.router.navigate(['signin']);
        localStorage.clear()
        return false;
      }

    return true;
  }
}

// if (!this.authService.isSignIned()) {
//   this.authService.signOut();
//   this.router.navigate(['signin']);
//   return false;
// }
