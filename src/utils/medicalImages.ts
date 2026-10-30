/**
 * Hệ thống quản lý hình ảnh Chuyên khoa & Avatar Bác sĩ Phòng khám YouMed
 * Cung cấp ảnh chất lượng cao (Unsplash Medical CDN) & Fallback y tế chuyên nghiệp
 */

export interface SpecialtyVisual {
  idName: string;
  name: string;
  imageUrl: string;
  bannerUrl: string;
  iconName: string;
  gradient: string;
  accentColor: string;
  badge: string;
}

export const SPECIALTY_VISUALS: Record<string, SpecialtyVisual> = {
  'Nội khoa': {
    idName: 'noi-khoa',
    name: 'Nội khoa',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'stethoscope',
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: '#10b981',
    badge: 'Chăm sóc toàn diện'
  },
  'Nhi khoa': {
    idName: 'nhi-khoa',
    name: 'Nhi khoa',
    imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'smile',
    gradient: 'from-amber-400 to-orange-500',
    accentColor: '#f59e0b',
    badge: 'Ân cần & Thân thiện'
  },
  'Sản phụ khoa': {
    idName: 'san-phu-khoa',
    name: 'Sản phụ khoa',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'heart',
    gradient: 'from-rose-400 to-pink-600',
    accentColor: '#ec4899',
    badge: 'Đồng hành cùng Mẹ & Bé'
  },
  'Da liễu': {
    idName: 'da-lieu',
    name: 'Da liễu',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'sparkles',
    gradient: 'from-fuchsia-500 to-purple-600',
    accentColor: '#c026d3',
    badge: 'Phục hồi làn da khỏe'
  },
  'Mắt': {
    idName: 'mat',
    name: 'Mắt',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'eye',
    gradient: 'from-cyan-500 to-blue-600',
    accentColor: '#0284c7',
    badge: 'Thị lực sáng ngời'
  },
  'Tai Mũi Họng': {
    idName: 'tai-mui-hong',
    name: 'Tai Mũi Họng',
    imageUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'headphones',
    gradient: 'from-sky-500 to-indigo-600',
    accentColor: '#0ea5e9',
    badge: 'Nội soi kỹ thuật số'
  },
  'Răng Hàm Mặt': {
    idName: 'rang-ham-mat',
    name: 'Răng Hàm Mặt',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'smile',
    gradient: 'from-teal-500 to-emerald-600',
    accentColor: '#14b8a6',
    badge: 'Nha khoa thẩm mỹ hiện đại'
  },
  'Tim mạch': {
    idName: 'tim-mach',
    name: 'Tim mạch',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'activity',
    gradient: 'from-red-500 to-rose-600',
    accentColor: '#ef4444',
    badge: 'Chuyên gia tim mạch đầu ngành'
  },
  'Thần kinh': {
    idName: 'than-kinh',
    name: 'Thần kinh',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'zap',
    gradient: 'from-violet-500 to-purple-700',
    accentColor: '#8b5cf6',
    badge: 'Chẩn đoán chuyên sâu'
  },
  'Cơ xương khớp': {
    idName: 'co-xuong-khop',
    name: 'Cơ xương khớp',
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'shield',
    gradient: 'from-amber-500 to-yellow-600',
    accentColor: '#d97706',
    badge: 'Vận động dẻo dai'
  },
  'Truyền nhiễm': {
    idName: 'truyen-nhiem',
    name: 'Truyền nhiễm',
    imageUrl: 'https://images.unsplash.com/photo-1618961734760-466979ce555b?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1618961734760-466979ce555b?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'shield',
    gradient: 'from-emerald-600 to-teal-800',
    accentColor: '#059669',
    badge: 'Tiêm chủng & Điều trị khẩn cấp'
  },
  'Hô hấp': {
    idName: 'ho-hap',
    name: 'Hô hấp',
    imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'wind',
    gradient: 'from-blue-500 to-cyan-600',
    accentColor: '#3b82f6',
    badge: 'Đo chức năng hô hấp chuẩn'
  },
  'Tiêu hóa - Gan mật': {
    idName: 'tieu-hoa-gan-mat',
    name: 'Tiêu hóa - Gan mật',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&h=400&q=80',
    iconName: 'check-circle',
    gradient: 'from-amber-600 to-orange-700',
    accentColor: '#ea580c',
    badge: 'Nội soi tiêu hóa không đau'
  }
};

/**
 * Lấy thông tin hình ảnh chuyên khoa
 */
export function getSpecialtyVisual(specialtyName?: string): SpecialtyVisual {
  if (!specialtyName) {
    return SPECIALTY_VISUALS['Nội khoa'];
  }
  const matchedKey = Object.keys(SPECIALTY_VISUALS).find((key) =>
    specialtyName.toLowerCase().includes(key.toLowerCase()) ||
    key.toLowerCase().includes(specialtyName.toLowerCase())
  );
  return matchedKey ? SPECIALTY_VISUALS[matchedKey] : SPECIALTY_VISUALS['Nội khoa'];
}

/**
 * Danh sách ảnh chân dung Bác sĩ theo ID / Email / Tên
 */
export const DOCTOR_AVATARS: Record<string, string> = {
  // Truyền nhiễm
  'bs.chaunhietdoi@youmed.com': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.dungtruyennhiem@youmed.com': 'https://images.unsplash.com/photo-1594824813571-638f0263445d?auto=format&fit=crop&w=400&h=400&q=80',
  
  // Hô hấp & Tiêu hóa
  'bs.thanhtuyenhohap@youmed.com': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.minhtieuhoa@youmed.com': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80',

  // Nội khoa
  'bs.tuan@youmed.com': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.binh@youmed.com': 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.mai@youmed.com': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&h=400&q=80',

  // Nhi khoa
  'bs.lan@youmed.com': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.son@youmed.com': 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.trang@youmed.com': 'https://images.unsplash.com/photo-1651008376805-4f40f06a48d8?auto=format&fit=crop&w=400&h=400&q=80',

  // Sản phụ khoa
  'bs.oanh@youmed.com': 'https://images.unsplash.com/photo-1594824813639-6523023e1f2b?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.ngocanh@youmed.com': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',

  // Da liễu
  'bs.huong@youmed.com': 'https://images.unsplash.com/photo-1594824813571-638f0263445d?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.huy@youmed.com': 'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.linh@youmed.com': 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&h=400&q=80',

  // Mắt
  'bs.minh@youmed.com': 'https://images.unsplash.com/photo-1624727828489-a1e03b7837ea?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.nam@youmed.com': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=400&h=400&q=80',

  // Tai Mũi Họng
  'bs.thao@youmed.com': 'https://images.unsplash.com/photo-1651008376805-4f40f06a48d8?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.dang@youmed.com': 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=400&h=400&q=80',

  // Răng Hàm Mặt
  'bs.hung@youmed.com': 'https://images.unsplash.com/photo-1637059824899-a441006a6875?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.ha@youmed.com': 'https://images.unsplash.com/photo-1594824813639-6523023e1f2b?auto=format&fit=crop&w=400&h=400&q=80',

  // Tim mạch
  'bs.dung@youmed.com': 'https://images.unsplash.com/photo-1625498542602-6bfb30f39b3f?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.cuong@youmed.com': 'https://images.unsplash.com/photo-1622253694242-abeb37a33e97?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.minhtuan@youmed.com': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&h=400&q=80',

  // Thần kinh
  'bs.hungtk@youmed.com': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.hang@youmed.com': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',

  // Cơ xương khớp
  'bs.khoa@youmed.com': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.trong@youmed.com': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
  'bs.hanh@youmed.com': 'https://images.unsplash.com/photo-1594824813571-638f0263445d?auto=format&fit=crop&w=400&h=400&q=80'
};

// Fallback collections for unknown doctors
const MALE_DOCTOR_FALLBACKS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?auto=format&fit=crop&w=400&h=400&q=80'
];

const FEMALE_DOCTOR_FALLBACKS = [
  'https://images.unsplash.com/photo-1594824813571-638f0263445d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1651008376805-4f40f06a48d8?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1594824813639-6523023e1f2b?auto=format&fit=crop&w=400&h=400&q=80'
];

/**
 * Lấy avatar Bác sĩ theo Email hoặc Tên hoặc Giới tính
 */
export function getDoctorAvatar(email?: string, fullName?: string, doctorId?: number): string {
  if (email && DOCTOR_AVATARS[email]) {
    return DOCTOR_AVATARS[email];
  }

  // Tên có chứa các tên nữ phổ biến
  const isFemale = fullName && (
    fullName.includes('Thị') ||
    fullName.includes('Mai') ||
    fullName.includes('Lan') ||
    fullName.includes('Trang') ||
    fullName.includes('Oanh') ||
    fullName.includes('Ngọc Anh') ||
    fullName.includes('Hương') ||
    fullName.includes('Linh') ||
    fullName.includes('Thảo') ||
    fullName.includes('Hà') ||
    fullName.includes('Hằng') ||
    fullName.includes('Hạnh') ||
    fullName.includes('Dung') ||
    fullName.includes('Tuyền')
  );

  const id = doctorId || (fullName ? fullName.charCodeAt(0) + fullName.length : 1);
  if (isFemale) {
    return FEMALE_DOCTOR_FALLBACKS[id % FEMALE_DOCTOR_FALLBACKS.length];
  }
  return MALE_DOCTOR_FALLBACKS[id % MALE_DOCTOR_FALLBACKS.length];
}
