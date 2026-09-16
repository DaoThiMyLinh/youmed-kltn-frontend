import { FiHome, FiCalendar, FiUser, FiClock, FiFileText, FiPlusCircle } from 'react-icons/fi';
import React from 'react';

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export const menuConfig: Record<string, MenuItem[]> = {
  PATIENT: [
    { title: 'Dashboard', path: '/patient', icon: FiHome },
    { title: 'Profile', path: '/patient/profile', icon: FiUser },
    { title: 'Appointments', path: '/patient/appointments', icon: FiCalendar },
    { title: 'Book Appointment', path: '/patient/booking', icon: FiPlusCircle },
    { title: 'Medical History', path: '/patient/history', icon: FiClock },
    { title: 'Prescriptions', path: '/patient/prescriptions', icon: FiFileText },
  ],
  DOCTOR: [
    { title: 'Dashboard', path: '/doctor', icon: FiHome },
    { title: 'Schedule', path: '/doctor/schedule', icon: FiClock },
    { title: 'Appointments', path: '/doctor/appointments', icon: FiCalendar },
    { title: 'Medical Records', path: '/doctor/medical-records', icon: FiFileText },
    { title: 'Profile', path: '/doctor/profile', icon: FiUser },
  ],
  ADMIN: [
    { title: 'Dashboard', path: '/admin', icon: FiHome },
  ]
};
