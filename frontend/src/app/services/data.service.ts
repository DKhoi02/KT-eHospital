import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private readonly ADMIN_ADD_UPDATE_SCHEDULE = 'admin_add_update_schedule';
  private readonly PHARMACIST_ADD_CONFIRM_APPOINTMENT =
    'pharmacist_add_confirm_appointment';
  private readonly DOCTOR_ADD_MEDICAL_EXAMINATION =
    'doctor_add_medical_examination';
  private readonly DOCTOR_HISTORY_PATIENT = 'doctor_history_patient';
  private readonly DOCTOR_ADD_PRESCRIPTION = 'doctor_add_prescription';
  private readonly DOCTOR_DETAIL = 'doctor_detail';
  private readonly VIEW_BLOG = 'view_blog';
  private readonly DOCTOR_VIEW_SCHEDULE = 'doctor_view_schedule';
  private readonly MANAGER_CHANGE_APPOINTMENT = 'manager_change_appointment';
  private readonly MANAGER_VIEW_BLOG = 'manager_view_blog';
  private readonly PATIENT_VIEW_APPOINTMENT = 'patient_view_appointment';

  getAdminAddUpdateSchedule(): any {
    return localStorage.getItem(this.ADMIN_ADD_UPDATE_SCHEDULE)?.toString();
  }

  setAdminAddUpdateSchedule(date: string) {
    localStorage.setItem(this.ADMIN_ADD_UPDATE_SCHEDULE, date);
  }

  getPharmacistAddConfirmAppointment(): any {
    return localStorage
      .getItem(this.PHARMACIST_ADD_CONFIRM_APPOINTMENT)
      ?.toString();
  }

  setPharmacistAddConfirmAppointment(id: string) {
    localStorage.setItem(this.PHARMACIST_ADD_CONFIRM_APPOINTMENT, id);
  }

  getDoctorAddMedicalExamination(): any {
    return localStorage
      .getItem(this.DOCTOR_ADD_MEDICAL_EXAMINATION)
      ?.toString();
  }

  setDoctorAddMedicalExamination(id: string) {
    localStorage.setItem(this.DOCTOR_ADD_MEDICAL_EXAMINATION, id);
  }

  getDoctorHistoryPatient(): any {
    return localStorage.getItem(this.DOCTOR_HISTORY_PATIENT)?.toString();
  }

  setDoctorHistoryPatient(id: string) {
    localStorage.setItem(this.DOCTOR_HISTORY_PATIENT, id);
  }

  getDoctorAddPrescription(): any {
    return localStorage.getItem(this.DOCTOR_ADD_PRESCRIPTION)?.toString();
  }

  setDoctorAddPrescription(id: string) {
    localStorage.setItem(this.DOCTOR_ADD_PRESCRIPTION, id);
  }

  getDoctorDetail(): any {
    return localStorage.getItem(this.DOCTOR_DETAIL)?.toString();
  }

  setDoctorDetail(email: string) {
    localStorage.setItem(this.DOCTOR_DETAIL, email);
  }

  getViewBlog(): any {
    return localStorage.getItem(this.VIEW_BLOG)?.toString();
  }

  setViewBlog(id: string) {
    localStorage.setItem(this.VIEW_BLOG, id);
  }

  getDoctorViewSchedule(): any {
    return localStorage.getItem(this.DOCTOR_VIEW_SCHEDULE)?.toString();
  }

  setDoctorViewSchedule(date: string) {
    localStorage.setItem(this.DOCTOR_VIEW_SCHEDULE, date);
  }

  getManagerChangeAppointment(): any {
    return localStorage.getItem(this.MANAGER_CHANGE_APPOINTMENT)?.toString();
  }

  setManagerChangeAppointment(id: string) {
    localStorage.setItem(this.MANAGER_CHANGE_APPOINTMENT, id);
  }

  getManagerViewBlog(): any {
    return localStorage.getItem(this.MANAGER_VIEW_BLOG)?.toString();
  }

  setManagerViewBlog(id: string) {
    localStorage.setItem(this.MANAGER_VIEW_BLOG, id);
  }

  getPatientViewAppointment(): any {
    return localStorage.getItem(this.PATIENT_VIEW_APPOINTMENT)?.toString();
  }

  setPatientViewAppointment(id: string) {
    localStorage.setItem(this.PATIENT_VIEW_APPOINTMENT, id);
  }
}
