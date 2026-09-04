import { FiHome, FiCalendar, FiUser, FiClock, FiFileText } from 'react-icons/fi';
import React from 'react';

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ElementType;
}

export const menuConfig: Record<string, MenuItem[]> = {
  PATIENT: [
    { title: 'Dashboard', path: '/patient-dashboard', icon: FiHome },
    { title: 'Book Appointment', path: '/booking', icon: FiCalendar },
    { title: 'Appointments', path: '/appointments', icon: FiCalendar },
    { title: 'Profile', path: '/profile', icon: FiUser },
    { title: 'Medical History', path: '/medical-history', icon: FiClock },
    { title: 'Prescriptions', path: '/prescriptions', icon: FiFileText },
  ],
  DOCTOR: [
    { title: 'Dashboard', path: '/doctor-dashboard', icon: FiHome },
    { title: 'Appointments', path: '/doctor-appointments', icon: FiClock },
    { title: 'Schedule', path: '/schedule', icon: FiCalendar },
    { title: 'History', path: '/medical-records', icon: FiFileText },
    { title: 'Profile', path: '/doctor-profile', icon: FiUser },
  ],
};
