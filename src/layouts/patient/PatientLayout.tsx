import { Outlet } from 'react-router-dom';
import { PatientHeader } from '../../components/layout/patient/PatientHeader';
import { PatientFooter } from '../../components/layout/patient/PatientFooter';
import { AiChatWidget } from '../../components';

const PatientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PatientHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PatientFooter />
      <AiChatWidget />
    </div>
  );
};

export default PatientLayout;
