import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PatientLayout from '../layouts/patient/PatientLayout';
import DoctorLayout from '../layouts/doctor/DoctorLayout';
import AdminLayout from '../layouts/admin/AdminLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Home from '../pages/patient/Home';
import DoctorList from '../pages/patient/DoctorList';
import DoctorDetail from '../pages/patient/DoctorDetail';
import PatientSpecialtyList from '../pages/patient/PatientSpecialtyList';
import PatientProfile from '../pages/patient/PatientProfile';
import PatientProfileEdit from '../pages/patient/PatientProfileEdit';
import PatientAppointments from '../pages/patient/PatientAppointments';
import PatientAppointmentDetail from '../pages/patient/PatientAppointmentDetail';
import PatientBooking from '../pages/patient/PatientBooking';
import PatientHistory from '../pages/patient/PatientHistory';
import PatientPrescriptions from '../pages/patient/PatientPrescriptions';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import DoctorSchedule from '../pages/doctor/DoctorSchedule';
import DoctorAppointments from '../pages/doctor/DoctorAppointments';
import DoctorConsultation from '../pages/doctor/DoctorConsultation';
import ConsultationHistory from '../pages/doctor/ConsultationHistory';
import DoctorProfile from '../pages/doctor/DoctorProfile';
import DoctorProfileEdit from '../pages/doctor/DoctorProfileEdit';
import AdminDashboard from '../pages/admin/AdminDashboard';
import NotFound from '../pages/error/NotFound';
import Unauthorized from '../pages/error/Unauthorized';
import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* PUBLIC Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* PROTECTED Routes wrapped inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route element={<ProtectedRoute />}>

          {/* PATIENT Routes */}
          <Route path="/patient" element={<RoleGuard allowedRoles={['PATIENT']} />}>
            <Route element={<PatientLayout />}>
              <Route index element={<Home />} />
              <Route path="doctors" element={<DoctorList />} />
              <Route path="doctors/:id" element={<DoctorDetail />} />
              <Route path="specialties" element={<PatientSpecialtyList />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="profile/edit" element={<PatientProfileEdit />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
              <Route path="booking" element={<PatientBooking />} />
              <Route path="history" element={<PatientHistory />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
            </Route>
          </Route>

          {/* PATIENT Legacy Redirects */}
          <Route path="/patient-dashboard" element={<Navigate to="/patient" replace />} />
          <Route path="/profile" element={<Navigate to="/patient/profile" replace />} />
          <Route path="/appointments" element={<Navigate to="/patient/appointments" replace />} />
          <Route path="/booking" element={<Navigate to="/patient/booking" replace />} />
          <Route path="/medical-history" element={<Navigate to="/patient/history" replace />} />

          {/* DOCTOR Routes */}
          <Route path="/doctor" element={<RoleGuard allowedRoles={['DOCTOR']} />}>
            <Route element={<DoctorLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="profile/edit" element={<DoctorProfileEdit />} />
              <Route path="schedule" element={<DoctorSchedule />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="consultation/:id" element={<DoctorConsultation />} />
              <Route path="medical-records" element={<ConsultationHistory />} />
            </Route>
          </Route>

          {/* DOCTOR Legacy Redirects */}
          <Route path="/doctor-dashboard" element={<Navigate to="/doctor" replace />} />
          <Route path="/doctor-profile" element={<Navigate to="/doctor/profile" replace />} />
          <Route path="/schedule" element={<Navigate to="/doctor/schedule" replace />} />
          <Route path="/doctor-appointments" element={<Navigate to="/doctor/appointments" replace />} />

          {/* ADMIN Routes */}
          <Route path="/admin" element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>

        </Route> {/* End ProtectedRoute */}
      </Route> {/* End MainLayout */}

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
