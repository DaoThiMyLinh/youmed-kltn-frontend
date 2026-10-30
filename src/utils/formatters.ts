/**
 * Utility functions for formatting and normalizing user data
 */

export const formatGender = (gender?: string | null, t?: (key: string) => string): string => {
  if (!gender) return t ? t('profile.notProvided') : 'Chưa cung cấp';
  const g = gender.trim().toUpperCase();
  if (g === 'MALE' || g === 'NAM') return t ? t('profile.male') : 'Nam';
  if (g === 'FEMALE' || g === 'NU' || g === 'NỮ') return t ? t('profile.female') : 'Nữ';
  if (g === 'OTHER' || g === 'KHAC' || g === 'KHÁC') return t ? t('profile.other') : 'Khác';
  if (t) {
    const translated = t(`profile.${gender.toLowerCase()}`);
    if (translated && !translated.startsWith('profile.')) return translated;
  }
  return gender;
};

export const normalizeGender = (gender?: string | null): string => {
  if (!gender) return '';
  const g = gender.trim().toUpperCase();
  if (g === 'MALE' || g === 'NAM') return 'MALE';
  if (g === 'FEMALE' || g === 'NU' || g === 'NỮ') return 'FEMALE';
  if (g === 'OTHER' || g === 'KHAC' || g === 'KHÁC') return 'OTHER';
  return gender;
};
