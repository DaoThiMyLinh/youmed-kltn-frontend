import type { Symptom, Diagnosis, Medicine } from '../types/masterData';

export const DEFAULT_SYMPTOMS: Symptom[] = [
  // Nội khoa
  { id: 1, name: 'Ợ chua, trào ngược', specialtyName: 'Nội khoa', description: 'Dịch dạ dày trào ngược lên thực quản' },
  { id: 2, name: 'Đau tức vùng thượng vị', specialtyName: 'Nội khoa', description: 'Đau âm ỉ hoặc quặn thắt sau khi ăn' },
  { id: 3, name: 'Đầy bụng khó tiêu', specialtyName: 'Nội khoa', description: 'Cảm giác chướng bụng, ậm ạch' },
  { id: 4, name: 'Buồn nôn, nôn mửa', specialtyName: 'Nội khoa', description: 'Cảm giác muốn nôn sau bữa ăn' },
  { id: 5, name: 'Tiêu chảy nhiều lần', specialtyName: 'Nội khoa', description: 'Đi ngoài phân lỏng, mất nước' },

  // Nhi khoa
  { id: 6, name: 'Sốt cao co giật', specialtyName: 'Nhi khoa', description: 'Nhiệt độ cơ thể trẻ trên 39 độ C' },
  { id: 7, name: 'Ho đờm, khò khè', specialtyName: 'Nhi khoa', description: 'Tiếng thở rít khò khè về đêm' },
  { id: 8, name: 'Bé biếng ăn, quấy khóc', specialtyName: 'Nhi khoa', description: 'Bỏ bú, quấy khóc không dứt' },
  { id: 9, name: 'Nôn trớ nhiều sau bú', specialtyName: 'Nhi khoa', description: 'Trào ngược thức ăn ở trẻ sơ sinh' },

  // Tim mạch
  { id: 10, name: 'Đau thắt ngực trái khi gắng sức', specialtyName: 'Tim mạch', description: 'Cảm giác đè nặng vùng trước tim' },
  { id: 11, name: 'Hồi hộp, đánh trống ngực', specialtyName: 'Tim mạch', description: 'Tim đập nhanh hoặc loạn nhịp' },
  { id: 12, name: 'Khó thở khi nằm đầu thấp', specialtyName: 'Tim mạch', description: 'Cảm giác hụt hơi, ngột ngạt khi nằm' },
  { id: 13, name: 'Phù hai mu bàn chân', specialtyName: 'Tim mạch', description: 'Ứ dịch chi dưới, ấn lõm' },

  // Da liễu
  { id: 14, name: 'Ngứa ngáy, nổi mề đay', specialtyName: 'Da liễu', description: 'Nổi mảng đỏ gồ trên da, ngứa dữ dội' },
  { id: 15, name: 'Mụn bọc sưng viêm', specialtyName: 'Da liễu', description: 'Mụn viêm mủ, sưng đỏ vùng mặt' },
  { id: 16, name: 'Khô ráp, bong tróc vảy da', specialtyName: 'Da liễu', description: 'Viêm da tiếp xúc, nứt nẻ chảy dịch' },

  // Mắt
  { id: 17, name: 'Cộm xốn, đỏ mắt', specialtyName: 'Mắt', description: 'Đỏ củng mạc, ngứa rát mắt' },
  { id: 18, name: 'Nhìn mờ, lóa mắt', specialtyName: 'Mắt', description: 'Thị lực suy giảm khi nhìn xa hoặc gần' },
  { id: 19, name: 'Chảy nước mắt sống, mỏi mắt', specialtyName: 'Mắt', description: 'Mỏi điều tiết khi xem màn hình' },

  // Tai Mũi Họng
  { id: 20, name: 'Đau rát cổ họng, nuốt đau', specialtyName: 'Tai Mũi Họng', description: 'Cổ họng đỏ rát, vướng víu khi nuốt' },
  { id: 21, name: 'Nghẹt mũi, chảy nước mũi xanh', specialtyName: 'Tai Mũi Họng', description: 'Dịch mũi đặc vàng hoặc xanh' },
  { id: 22, name: 'Ù tai, đau nhói trong tai', specialtyName: 'Tai Mũi Họng', description: 'Cảm giác có tiếng ve kêu trong tai' },
  { id: 23, name: 'Khàn tiếng kéo dài', specialtyName: 'Tai Mũi Họng', description: 'Giọng nói khàn đục hoặc mất tiếng' },

  // Răng Hàm Mặt
  { id: 24, name: 'Đau buốt răng khi ăn nóng lạnh', specialtyName: 'Răng Hàm Mặt', description: 'Ê buốt tận chân răng' },
  { id: 25, name: 'Sưng nướu, chảy máu chân răng', specialtyName: 'Răng Hàm Mặt', description: 'Nướu đỏ phì đại, chảy máu khi chải răng' },
  { id: 26, name: 'Đau khớp thái dương hàm', specialtyName: 'Răng Hàm Mặt', description: 'Khó há miệng to, phát tiếng lục cục' },

  // Cơ xương khớp
  { id: 27, name: 'Đau nhức khớp gối khi vận động', specialtyName: 'Cơ xương khớp', description: 'Đau tăng khi leo cầu thang, lạo xạo' },
  { id: 28, name: 'Cứng khớp buổi sáng > 30 phút', specialtyName: 'Cơ xương khớp', description: 'Khó co duỗi khớp các ngón tay' },
  { id: 29, name: 'Đau mỏi thắt lưng lan xuống hông', specialtyName: 'Cơ xương khớp', description: 'Đau cột sống thắt lưng cấp/mạn' },

  // Thần kinh
  { id: 30, name: 'Đau nửa đầu giật theo mạch đập', specialtyName: 'Thần kinh', description: 'Cơn đau nửa đầu Migraine kèm sợ ánh sáng' },
  { id: 31, name: 'Mất ngủ kinh niên, ngủ chập chờn', specialtyName: 'Thần kinh', description: 'Khó vào giấc, thức giấc giữa đêm' },
  { id: 32, name: 'Chóng mặt hoa mắt mất thăng bằng', specialtyName: 'Thần kinh', description: 'Cảm giác trời đất quay cuồng' },

  // Sản phụ khoa
  { id: 33, name: 'Đau tức vùng hạ vị, trễ kinh', specialtyName: 'Sản phụ khoa', description: 'Rối loạn chu kỳ, đau âm ỉ bụng dưới' },
  { id: 34, name: 'Khí hư bất thường, ngứa ngáy', specialtyName: 'Sản phụ khoa', description: 'Viêm nhiễm phụ khoa, mùi khó chịu' }
];

export const DEFAULT_DIAGNOSES: Diagnosis[] = [
  // Nội khoa
  { id: 1, name: 'Viêm loét dạ dày tá tràng', specialtyName: 'Nội khoa', description: 'Tổn thương viêm trợt niêm mạc dạ dày' },
  { id: 2, name: 'Trào ngược dạ dày thực quản (GERD)', specialtyName: 'Nội khoa', description: 'Trào ngược dịch vị độ A-B' },
  { id: 3, name: 'Hội chứng ruột kích thích (IBS)', specialtyName: 'Nội khoa', description: 'Rối loạn nhu động đại tràng co thắt' },
  { id: 4, name: 'Tiểu đường type 2', specialtyName: 'Nội khoa', description: 'Rối loạn chuyển hóa glucose' },

  // Nhi khoa
  { id: 5, name: 'Viêm phế quản cấp ở trẻ em', specialtyName: 'Nhi khoa', description: 'Viêm nhiễm đường hô hấp dưới cấp' },
  { id: 6, name: 'Sốt siêu vi (Sốt virus)', specialtyName: 'Nhi khoa', description: 'Nhiễm siêu vi đường hô hấp/tiêu hóa' },
  { id: 7, name: 'Rối loạn tiêu hóa cấp ở trẻ', specialtyName: 'Nhi khoa', description: 'Tiêu chảy do loạn khuẩn ruột' },

  // Tim mạch
  { id: 8, name: 'Tăng huyết áp nguyên phát độ 2', specialtyName: 'Tim mạch', description: 'Huyết áp tâm thu >= 140 mmHg' },
  { id: 9, name: 'Rối loạn lipid máu hỗn hợp', specialtyName: 'Tim mạch', description: 'Tăng Cholesterol và Triglyceride' },
  { id: 10, name: 'Thiếu máu cơ tim cục bộ', specialtyName: 'Tim mạch', description: 'Xơ vữa động mạch vành' },

  // Da liễu
  { id: 11, name: 'Viêm da cơ địa (Eczema)', specialtyName: 'Da liễu', description: 'Viêm da dị ứng mạn tính' },
  { id: 12, name: 'Mụn trứng cá bọc viêm mức vừa', specialtyName: 'Da liễu', description: 'Nhiễm khuẩn nang lông tuyến bã' },
  { id: 13, name: 'Mề đay cấp tính', specialtyName: 'Da liễu', description: 'Phản ứng dị ứng thức ăn/thời tiết' },

  // Mắt
  { id: 14, name: 'Viêm kết mạc cấp (Đau mắt đỏ)', specialtyName: 'Mắt', description: 'Nhiễm khuẩn/virus màng kết mạc' },
  { id: 15, name: 'Tật khúc xạ cận - loạn thị', specialtyName: 'Mắt', description: 'Rối loạn quang học mắt' },
  { id: 16, name: 'Khô mắt do điều tiết', specialtyName: 'Mắt', description: 'Hội chứng thị giác màn hình' },

  // Tai Mũi Họng
  { id: 17, name: 'Viêm họng cấp tính', specialtyName: 'Tai Mũi Họng', description: 'Viêm đỏ niêm mạc họng' },
  { id: 18, name: 'Viêm amidan hốc mủ', specialtyName: 'Tai Mũi Họng', description: 'Viêm amidan cấp có chấm mủ' },
  { id: 19, name: 'Viêm xoang hàm/trán cấp', specialtyName: 'Tai Mũi Họng', description: 'Ứ dịch mủ trong các hốc xoang' },
  { id: 20, name: 'Viêm tai giữa thanh dịch', specialtyName: 'Tai Mũi Họng', description: 'Tắc vòi nhĩ, ứ dịch hòm nhĩ' },

  // Răng Hàm Mặt
  { id: 21, name: 'Sâu men ngà răng 36, 46', specialtyName: 'Răng Hàm Mặt', description: 'Mất khoáng men răng tạo lỗ sâu' },
  { id: 22, name: 'Viêm nướu răng quanh thân răng', specialtyName: 'Răng Hàm Mặt', description: 'Vôi răng bám gây viêm nướu' },
  { id: 23, name: 'Viêm tủy răng không phục hồi', specialtyName: 'Răng Hàm Mặt', description: 'Tủy răng hoại tử gây đau nhức' },

  // Cơ xương khớp
  { id: 24, name: 'Thoái hóa khớp gối hai bên độ 2', specialtyName: 'Cơ xương khớp', description: 'Hẹp khe khớp, gai xương rìa khớp' },
  { id: 25, name: 'Thoát vị đĩa đệm cột sống L4-L5', specialtyName: 'Cơ xương khớp', description: 'Chèn ép rễ thần kinh thắt lưng' },
  { id: 26, name: 'Viêm khớp dạng thấp tiến triển', specialtyName: 'Cơ xương khớp', description: 'Bệnh tự miễn mạn tính tại khớp' },

  // Thần kinh
  { id: 27, name: 'Đau nửa đầu Migraine có tiền triệu', specialtyName: 'Thần kinh', description: 'Đau đầu vận mạch thần kinh' },
  { id: 28, name: 'Rối loạn tiền đình ngoại biên', specialtyName: 'Thần kinh', description: 'Tổn thương mê đạo tiền đình' },
  { id: 29, name: 'Suy nhược thần kinh, mất ngủ', specialtyName: 'Thần kinh', description: 'Căng thẳng stress kéo dài' },

  // Sản phụ khoa
  { id: 30, name: 'Viêm âm đạo do nấm Candida', specialtyName: 'Sản phụ khoa', description: 'Nhiễm nấm sinh dục gây ngứa rát' },
  { id: 31, name: 'Theo dõi thai kỳ phát triển bình thường', specialtyName: 'Sản phụ khoa', description: 'Thai phát triển theo tuổi thai' }
];

export const DEFAULT_MEDICINES: Medicine[] = [
  { id: 1, name: 'Paracetamol 500mg', unit: 'Viên', description: 'Giảm đau, hạ sốt' },
  { id: 2, name: 'Augmentin 1g', unit: 'Viên', description: 'Kháng sinh nhiễm khuẩn' },
  { id: 3, name: 'Amoxicillin 500mg', unit: 'Viên', description: 'Kháng sinh' },
  { id: 4, name: 'Panadol Extra', unit: 'Viên', description: 'Giảm đau nhanh' },
  { id: 5, name: 'Ibuprofen 400mg', unit: 'Viên', description: 'Kháng viêm không steroid' },
  { id: 6, name: 'Omeprazole 20mg', unit: 'Viên', description: 'Giảm tiết axit dạ dày' },
  { id: 7, name: 'Phosphalugel (Chữ P)', unit: 'Gói', description: 'Trung hòa axit dạ dày' },
  { id: 8, name: 'Amlodipine 5mg', unit: 'Viên', description: 'Hạ huyết áp' },
  { id: 9, name: 'Losartan 50mg', unit: 'Viên', description: 'Hạ huyết áp' },
  { id: 10, name: 'Vitamin C 1000mg', unit: 'Viên sủi', description: 'Tăng đề kháng' },
  { id: 11, name: 'Decolgen', unit: 'Viên', description: 'Trị cảm cúm, nghẹt mũi' },
  { id: 12, name: 'Prospan', unit: 'Chai', description: 'Siro trị ho' },
  { id: 13, name: 'Loratadine 10mg', unit: 'Viên', description: 'Chống dị ứng' },
  { id: 14, name: 'Berberin 100mg', unit: 'Viên', description: 'Trị tiêu chảy, nhiễm khuẩn ruột' },
  { id: 15, name: 'Gaviscon', unit: 'Gói', description: 'Trị trào ngược dạ dày' }
];
