import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Button, Loading } from '../../components';
import { FiEdit2, FiMail, FiPhone, FiUser, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { fetchProfileThunk, selectPatientProfile, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { selectUserRole } from '../../store/features/auth/authSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PatientProfile = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const profile = useSelector(selectPatientProfile);
  const loading = useSelector(selectPatientLoading);
  const role = useSelector(selectUserRole);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, profile]);

  if (loading && !profile) return <Loading size="lg" className="mt-20" />;

  if (!profile) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('profile.myProfile')}</h1>
        <Link to={role === 'DOCTOR' ? "/doctor-profile/edit" : "/profile/edit"}>
          <Button leftIcon={<FiEdit2 />}>{t('profile.editProfile')}</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="bg-primary/5 p-8 flex items-center gap-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 border border-slate-200">
              <FiUser className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
              <p className="text-slate-500 mt-1 flex items-center gap-2">
                <FiMail className="w-4 h-4" /> {profile.email}
              </p>
            </div>
          </div>
          
          <div className="p-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('profile.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FiPhone className="w-4 h-4" /> {t('profile.phoneNumber')}
                </span>
                <span className="text-slate-900 font-medium">{profile.phone || t('profile.notProvided')}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" /> {t('profile.address')}
                </span>
                <span className="text-slate-900 font-medium">{profile.address || t('profile.notProvided')}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FiUsers className="w-4 h-4" /> {t('profile.gender')}
                </span>
                <span className="text-slate-900 font-medium capitalize">
                  {profile.gender ? t(`profile.${profile.gender.toLowerCase()}`) : t('profile.notProvided')}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FiCalendar className="w-4 h-4" /> {t('profile.dateOfBirth')}
                </span>
                <span className="text-slate-900 font-medium">{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : t('profile.notProvided')}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <FiUser className="w-4 h-4" /> {t('profile.role')}
                </span>
                <span className="text-slate-900 font-medium capitalize">
                  {profile.role === 'PATIENT' 
                    ? t('profile.patientRole') 
                    : profile.role === 'DOCTOR' 
                      ? t('profile.doctorRole') 
                      : profile.role}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;
