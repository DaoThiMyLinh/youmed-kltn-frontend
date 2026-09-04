import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import PatientLayout from '../layouts/PatientLayout';
import DoctorLayout from '../layouts/DoctorLayout';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import PatientDashboard from '../pages/patient/PatientDashboard';
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
          <Route element={<RoleGuard allowedRoles={['PATIENT']} />}>
            <Route element={<PatientLayout />}>
              <Route path="patient-dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="profile/edit" element={<PatientProfileEdit />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="appointments/:id" element={<PatientAppointmentDetail />} />
              <Route path="booking" element={<PatientBooking />} />
              <Route path="medical-history" element={<PatientHistory />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
            </Route>
          </Route>

        {/* DOCTOR Routes */}
        <Route element={<RoleGuard allowedRoles={['DOCTOR']} />}>
          <Route element={<DoctorLayout />}>
            <Route path="doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="doctor-profile" element={<PatientProfile />} />
            <Route path="doctor-profile/edit" element={<PatientProfileEdit />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="doctor-appointments" element={<DoctorAppointments />} />
            <Route path="consultation/:id" element={<DoctorConsultation />} />
            <Route path="medical-records" element={<ConsultationHistory />} />
            {/* Add more doctor routes here */}
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
