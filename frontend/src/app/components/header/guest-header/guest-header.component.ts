import { Component} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserStoreService } from 'src/app/services/user-store.service';

@Component({
  selector: 'app-guest-header',
  templateUrl: './guest-header.component.html',
  styleUrls: ['./guest-header.component.css'],
})
export class GuestHeaderComponent {
  public fullname!: string;
  public role!: string;
  public isSHow: boolean = true;

  constructor() {}
}
