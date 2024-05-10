import { AddUpdateScheduleComponent } from './components/admin/add-update-schedule/add-update-schedule.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { NgModule } from '@angular/core';
import {
  RouterModule,
  Routes,
  CanActivate,
  CanActivateFn,
  provideRouter,
  withHashLocation,
} from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { HomeComponent } from './components/home/home.component';
import { AuthGuard} from './guards/auth.guard';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
import { AddNewAccountComponent } from './components/admin/add-new-account/add-new-account.component';
import { AddminProfileComponent } from './components/admin/addmin-profile/addmin-profile.component';
import { AdminScheduleComponent } from './components/admin/admin-schedule/admin-schedule.component';
import { AdminRoomComponent } from './components/admin/admin-room/admin-room.component';
import { AddNewRoomComponent } from './components/admin/add-new-room/add-new-room.component';
import { AdminSystemComponent } from './components/admin/admin-system/admin-system.component';
import { PharmacistMedicineComponent } from './components/pharmacist/pharmacist-medicine/pharmacist-medicine.component';
import { AddNewMedicineComponent } from './components/pharmacist/add-new-medicine/add-new-medicine.component';
import { PharmacistProfileComponent } from './components/pharmacist/pharmacist-profile/pharmacist-profile.component';
import { DoctorMedicalExaminationComponent } from './components/doctor/doctor-medical-examination/doctor-medical-examination.component';
import { AddMedicalExaminationComponent } from './components/doctor/add-medical-examination/add-medical-examination.component';
import { AddPrescriptionComponent } from './components/doctor/add-prescription/add-prescription.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DoctorProfileComponent } from './components/doctor/doctor-profile/doctor-profile.component';
import { PharmacistConfirmAppointmentComponent } from './components/pharmacist/pharmacist-confirm-appointment/pharmacist-confirm-appointment.component';
import { PharmacistAddConfirmAppointmentComponent } from './components/pharmacist/pharmacist-add-confirm-appointment/pharmacist-add-confirm-appointment.component';
import { DoctorHistoryPatientComponent } from './components/doctor/doctor-history-patient/doctor-history-patient.component';
import { ManagerAppointmentComponent } from './components/manager/manager-appointment/manager-appointment.component';
import { ManageChangeAppointmentComponent } from './components/manager/manage-change-appointment/manage-change-appointment.component';
import { ManagerProfileComponent } from './components/manager/manager-profile/manager-profile.component';
import { PatientAppointmentComponent } from './components/user/patient-appointment/patient-appointment.component';
import { PatientViewAppointmentComponent } from './components/user/patient-view-appointment/patient-view-appointment.component';
import { DiseasePredictionComponent } from './components/disease-prediction/disease-prediction.component';
import { DoctorDetailComponent } from './components/doctor/doctor-detail/doctor-detail.component';
import { DoctorSearchComponent } from './components/doctor/doctor-search/doctor-search.component';
import { ManagerStatisticComponent } from './components/manager/manager-statistic/manager-statistic.component';
import { ManagerRevenuePredictionComponent } from './components/manager/manager-revenue-prediction/manager-revenue-prediction.component';
import { DoctorScheduleComponent } from './components/doctor/doctor-schedule/doctor-schedule.component';
import { DoctorViewScheduleComponent } from './components/doctor/doctor-view-schedule/doctor-view-schedule.component';
import { ManagerBlogComponent } from './components/manager/manager-blog/manager-blog.component';
import { AddNewBlogComponent } from './components/manager/add-new-blog/add-new-blog.component';
import { ManagerViewBlogComponent } from './components/manager/manager-view-blog/manager-view-blog.component';
import { ViewBlogComponent } from './components/view-blog/view-blog.component';
import { BlogSearchComponent } from './components/blog-search/blog-search.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'signin', component: SigninComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'forgotpassword', component: ForgetPasswordComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'disease-prediction', component: DiseasePredictionComponent },
  { path: 'view-blog', component: ViewBlogComponent },
  { path: 'blog-search', component: BlogSearchComponent },
  // admin
  {
    path: 'admin-account',
    component: AdminHomeComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-add-new-account',
    component: AddNewAccountComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-profile',
    component: AddminProfileComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-schedule',
    component: AdminScheduleComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-add-update-schedule',
    component: AddUpdateScheduleComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-room',
    component: AdminRoomComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-add-new-room',
    component: AddNewRoomComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },
  {
    path: 'admin-system',
    component: AdminSystemComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Admin',
    },
  },

  //pharmacist
  {
    path: 'pharmacist-medicine',
    component: PharmacistMedicineComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Pharmacist',
    },
  },
  {
    path: 'pharmacist-add-new-medicine',
    component: AddNewMedicineComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Pharmacist',
    },
  },
  {
    path: 'pharmacist-profile',
    component: PharmacistProfileComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Pharmacist',
    },
  },
  {
    path: 'pharmacist-confirm-appointment',
    component: PharmacistConfirmAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Pharmacist',
    },
  },
  {
    path: 'pharmacist-add-confirm-appointment',
    component: PharmacistAddConfirmAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Pharmacist',
    },
  },

  //doctor
  {
    path: 'doctor-medical-examination',
    component: DoctorMedicalExaminationComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-add-medical-examination',
    component: AddMedicalExaminationComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-add-prescription',
    component: AddPrescriptionComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-profile',
    component: DoctorProfileComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-history-patient',
    component: DoctorHistoryPatientComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-detail',
    component: DoctorDetailComponent,
  },
  {
    path: 'doctor-search',
    component: DoctorSearchComponent,
  },
  {
    path: 'doctor-schedule',
    component: DoctorScheduleComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },
  {
    path: 'doctor-view-schedule',
    component: DoctorViewScheduleComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Doctor',
    },
  },

  // manager
  {
    path: 'manager-appointment',
    component: ManagerAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-change-appointment',
    component: ManageChangeAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-profile',
    component: ManagerProfileComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-statistic',
    component: ManagerStatisticComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-revenue-prediction',
    component: ManagerRevenuePredictionComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-blog',
    component: ManagerBlogComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-add-new-blog',
    component: AddNewBlogComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },
  {
    path: 'manager-view-blog',
    component: ManagerViewBlogComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Manager',
    },
  },

  //patient
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Patient',
    },
  },
  {
    path: 'patient-appointment',
    component: PatientAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Patient',
    },
  },
  {
    path: 'patient-view-appointment',
    component: PatientViewAppointmentComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: 'Patient',
    },
  },

  { path: '**', component: NotFoundComponent },
];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withHashLocation())],
});

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
