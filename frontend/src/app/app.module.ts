import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SignupComponent } from './components/signup/signup.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SigninComponent } from './components/signin/signin.component';
import { HomeComponent } from './components/home/home.component';
import { TokenInterceptor } from './interceptors/token.interceptor';
import { MainHeaderComponent } from './components/header/main-header/main-header.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { GuestHeaderComponent } from './components/header/guest-header/guest-header.component';
import { ProfileComponent } from './components/user/profile/profile.component';
import { AboutComponent } from './components/about/about.component';
import { ContactComponent } from './components/contact/contact.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
import { AddNewAccountComponent } from './components/admin/add-new-account/add-new-account.component';
import { AddminProfileComponent } from './components/admin/addmin-profile/addmin-profile.component';
import { AdminScheduleComponent } from './components/admin/admin-schedule/admin-schedule.component';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AddUpdateScheduleComponent } from './components/admin/add-update-schedule/add-update-schedule.component';
import { AdminRoomComponent } from './components/admin/admin-room/admin-room.component';
import { AddNewRoomComponent } from './components/admin/add-new-room/add-new-room.component';
import { AdminSystemComponent } from './components/admin/admin-system/admin-system.component';
import { PharmacistMedicineComponent } from './components/pharmacist/pharmacist-medicine/pharmacist-medicine.component';
import { AddNewMedicineComponent } from './components/pharmacist/add-new-medicine/add-new-medicine.component';
import { PharmacistProfileComponent } from './components/pharmacist/pharmacist-profile/pharmacist-profile.component';
import { DoctorMedicalExaminationComponent } from './components/doctor/doctor-medical-examination/doctor-medical-examination.component';
import { AddMedicalExaminationComponent } from './components/doctor/add-medical-examination/add-medical-examination.component';
import { AddPrescriptionComponent } from './components/doctor/add-prescription/add-prescription.component';
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
import { NgxPaginationModule } from 'ngx-pagination';

import { ManagerRevenuePredictionComponent } from './components/manager/manager-revenue-prediction/manager-revenue-prediction.component';
import { DoctorScheduleComponent } from './components/doctor/doctor-schedule/doctor-schedule.component';
import { DoctorViewScheduleComponent } from './components/doctor/doctor-view-schedule/doctor-view-schedule.component';
import { ManagerBlogComponent } from './components/manager/manager-blog/manager-blog.component';
import { AddNewBlogComponent } from './components/manager/add-new-blog/add-new-blog.component';
import { ManagerViewBlogComponent } from './components/manager/manager-view-blog/manager-view-blog.component';
import { ViewBlogComponent } from './components/view-blog/view-blog.component';
import { BlogSearchComponent } from './components/blog-search/blog-search.component';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SigninComponent,
    HomeComponent,
    MainHeaderComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    GuestHeaderComponent,
    ProfileComponent,
    AboutComponent,
    ContactComponent,
    NotFoundComponent,
    AdminHomeComponent,
    AddNewAccountComponent,
    AddminProfileComponent,
    AdminScheduleComponent,
    AddUpdateScheduleComponent,
    AdminRoomComponent,
    AddNewRoomComponent,
    AdminSystemComponent,
    PharmacistMedicineComponent,
    AddNewMedicineComponent,
    PharmacistProfileComponent,
    DoctorMedicalExaminationComponent,
    AddMedicalExaminationComponent,
    AddPrescriptionComponent,
    DoctorProfileComponent,
    PharmacistConfirmAppointmentComponent,
    PharmacistAddConfirmAppointmentComponent,
    DoctorHistoryPatientComponent,
    ManagerAppointmentComponent,
    ManageChangeAppointmentComponent,
    ManagerProfileComponent,
    PatientAppointmentComponent,
    PatientViewAppointmentComponent,
    DiseasePredictionComponent,
    DoctorDetailComponent,
    DoctorSearchComponent,
    ManagerStatisticComponent,
    ManagerRevenuePredictionComponent,
    DoctorScheduleComponent,
    DoctorViewScheduleComponent,
    ManagerBlogComponent,
    AddNewBlogComponent,
    ManagerViewBlogComponent,
    ViewBlogComponent,
    BlogSearchComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FullCalendarModule,
    NgxPaginationModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
