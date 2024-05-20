import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserStoreService } from './services/user-store.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  public fullname!: string;
  public role!: string;
  public isSHowMainHeader: boolean = true;
  public isSHowGuestHeader: boolean = false;
  isDevToolsOpened: boolean = false;
  private broadcastChannel!: BroadcastChannel;

  constructor(
    private auth: AuthService,
    private userStore: UserStoreService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.broadcastChannel = new BroadcastChannel('auth_channel');
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.ngOnInit();
    }, 0);
    this.userStore.getRoleFromStore().subscribe((val) => {
      const roleFromToken = this.auth.getRoleFromToken();
      this.role = val || roleFromToken;
    });

    this.showMainHeader();
    this.checkDevTools();
    if (this.isDevToolsOpened) {
      // window.location.reload();
    }

    this.broadcastChannel.onmessage = (event) => {
      if (event.data === 'reloadAllPage') {
        if (window.location.href.startsWith('http://localhost:4200')) {
          window.location.reload();
        }
      }
    };
  }

  checkDevTools(): void {
    const widthThreshold = 200;
    const check = () => {
      this.isDevToolsOpened =
        window.outerWidth - window.innerWidth > widthThreshold;
    };
    check();
    window.addEventListener('resize', check);
    setInterval(check, 1000);
  }

  ngOnDestroy() {
    this.broadcastChannel.close();
  }

  showMainHeader() {
    const currentPath =
      this.activatedRoute.firstChild?.snapshot.routeConfig?.path;
    if (
      currentPath == 'signin' ||
      currentPath == 'signup' ||
      currentPath == 'forgotpassword' ||
      currentPath == 'resetpassword' ||
      currentPath == '**'
    ) {
      this.isSHowMainHeader = false;
      this.isSHowGuestHeader = true;
    } else if (
      currentPath == '' ||
      currentPath == 'about' ||
      currentPath == 'contact' ||
      currentPath == 'doctor-detail' ||
      currentPath == 'disease-prediction' ||
      currentPath == 'view-blog' ||
      currentPath == 'blog-search'
    ) {
      this.isSHowMainHeader = true;
      this.isSHowGuestHeader = false;
    } else if (this.role) {
      this.isSHowMainHeader = false;
      this.isSHowGuestHeader = false;
    }
  }
}
