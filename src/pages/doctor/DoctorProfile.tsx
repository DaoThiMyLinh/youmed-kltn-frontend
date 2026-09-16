import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, Button, Loading, Badge } from '../../components';
import { FiEdit2, FiMail, FiPhone, FiUser, FiMapPin, FiCalendar, FiUsers, FiBriefcase, FiDollarSign, FiInfo } from 'react-icons/fi';
import { fetchProfileThunk, selectPatientProfile, selectPatientLoading } from '../../store/features/patient/patientSlice';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';
import type { Doctor } from '../../types/appointment';

const DoctorProfile = () => {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();
  const profile = useSelector(selectPatientProfile);
  const loadingUser = useSelector(selectPatientLoading);

  const [doctorInfo, setDoctorInfo] = useState<Doctor | null>(null);
  const [loadingDoctor, setLoadingDoctor] = useState(false);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchProfileThunk());
    }
  }, [dispatch, profile]);

  useEffect(() => {
    const fetchDoctorInfo = async () => {
      if (!profile?.email) return;
      try {
        setLoadingDoctor(true);
        // Find doctor by email from the list of all doctors
        const response = await axiosClient.get('/doctors?size=1000');
        const doctor = response.data.content.find((d: any) => d.email === profile.email);
        if (doctor) {
          setDoctorInfo(doctor);
        }
      } catch (error) {
        console.error('Failed to fetch doctor info:', error);
      } finally {
        setLoadingDoctor(false);
      }
    };

    if (profile) {
      fetchDoctorInfo();
    }
  }, [profile]);

  if ((loadingUser || loadingDoctor) && !profile) return <Loading size="lg" className="mt-20" />;

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('profile.myProfile')}</h1>
        <Link to="/doctor/profile/edit">
          <Button leftIcon={<FiEdit2 />}>{t('profile.editProfile')}</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="bg-primary/5 p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-100 relative">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 border border-slate-200 shrink-0">
              <FiUser className="w-12 h-12" />
            </div>
            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
                {doctorInfo && (
                  <Badge variant={doctorInfo.active ? 'success' : 'danger'}>
                    {doctorInfo.active ? t('schedule.active') : t('schedule.inactive')}
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mb-1">
                <FiMail className="w-4 h-4" /> {profile.email}
              </p>
              {doctorInfo?.specialty && (
                <p className="text-emerald-600 font-medium flex items-center justify-center md:justify-start gap-2">
                  <FiBriefcase className="w-4 h-4" /> {doctorInfo.specialty.name}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Personal Information (From User Profile) */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FiUser className="text-primary" /> {t('profile.personalInfo')}
              </h3>
              <div className="space-y-6">
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
              </div>
            </div>

            {/* Professional Information (From Doctor Profile) */}
            <div className="p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <FiBriefcase className="text-primary" /> Professional Information
              </h3>
              
              {loadingDoctor ? (
                <div className="flex justify-center py-10"><Loading size="sm" /></div>
              ) : doctorInfo ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <FiBriefcase className="w-4 h-4" /> {t('appointment.specialty')}
                    </span>
                    <span className="text-slate-900 font-medium">
                      {doctorInfo.specialty?.name || t('profile.notProvided')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <FiDollarSign className="w-4 h-4" /> {t('appointment.consultationFee')}
                    </span>
                    <span className="text-slate-900 font-medium">
                      {doctorInfo.consultationFee ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(doctorInfo.consultationFee) : t('appointment.free')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                      <FiInfo className="w-4 h-4" /> Biography
                    </span>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-md border border-slate-100">
                      {doctorInfo.biography || t('booking.noBiography')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-500 border border-dashed rounded-lg bg-slate-50">
                  <p>Doctor professional info not found.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfile;
