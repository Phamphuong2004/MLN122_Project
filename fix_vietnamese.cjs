const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/components/rpg/RPGGame.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Mapping text không dấu → có dấu
const replacements = [
  ['Lenh Chuyen Ca Thu', 'Lệnh Chuyển Ca Thứ'],
  ['Nha may Sang Nam', 'Nhà máy Sáng Nam'],
  ['Binh Duong', 'Bình Dương'],
  ['To may so 3', 'Tổ máy số 3'],
  ['Truong phong nhan su', 'Trưởng phòng nhân sự'],
  ['Toan canh tinh huong', 'Toàn cảnh tình huống'],
  ['Ca sang dau tuan bat dau', 'Ca sáng đầu tuần bắt đầu'],
  ['bang thong bao dien tu', 'bảng thông báo điện tử'],
  ['nhap nhay dong chu', 'nhấp nháy dòng chữ'],
  ['Du an Loom-X', 'Dự án Loom-X'],
  ['se duoc kich hoat', 'sẽ được kích hoạt'],
  ['Tu khoi van phong', 'Từ khối văn phòng'],
  ['dot tai cau truc', 'đợt tái cấu trúc'],
  ['nhan su moi', 'nhân sự mới'],
  ['cuon vao', 'cuốn vào'],
  ['tam trang', 'tâm trạng'],
  ['cu lam da roi', 'cũ làm đã rồi'],
  ['Ba Hoa', 'Ba Hoa'],
  ['Toi chua the noi het', 'Tôi chưa thể nói hết'],
  ['Chi biet rang', 'Chỉ biết rằng'],
  ['sau 72 gio', 'sau 72 giờ'],
  ['day chuyen moi se vao', 'dây chuyền mới sẽ vào'],
  ['Neu muon ton tai', 'Nếu muốn tồn tại'],
  ['Sang Nam', 'Sáng Nam'],
  ['moi nguoi phai', 'mỗi người phải'],
  ['tu chon cach dung', 'tự chọn cách đứng'],
  ['cuoc thay doi', 'cuộc thay đổi'],
  ['Ban xin danh sach', 'Bạn xin danh sách'],
  ['vi tri se bi anh huong', 'vị trí sẽ bị ảnh hưởng'],
  ['muon biet quan he giua', 'muốn biết quan hệ giữa'],
  ['nang suat moi', 'năng suất mới'],
  ['so phan lao dong cu', 'số phận lao động cũ'],
  ['khong tra loi thang', 'không trả lời thẳng'],
  ['su im lang', 'sự im lặng'],
  ['noi len rat nhieu', 'nói lên rất nhiều'],
  ['da buoc nha may phai lo dien', 'đã buộc nhà máy phải lộ diện'],
  ['khong chi la dau tu may moc', 'không chỉ là đầu tư máy móc'],
  ['ma la sap xep lai', 'mà là sắp xếp lại'],
  ['ai duoc o lai va ai bi day ra ngoai', 'ai được ở lại và ai bị đẩy ra ngoài'],
  ['Ban khong hoi vong vo', 'Bạn không hỏi vòng vo'],
  ['yeu cau noi ro truoc mat', 'yêu cầu nói rõ trước mặt'],
  ['ca to may', 'cả tổ máy'],
  ['robot vao thi cong nhan nao se mat ca', 'robot vào thì công nhân nào sẽ mất cả'],
  ['cong nhan nao bi ep tang toc', 'công nhân nào bị ép tăng tốc'],
  ['May nguoi dung canh do', 'Mấy người đứng cạnh đó'],
  ['quay sang nhin ban', 'quay sang nhìn bạn'],
  ['Lan dau tien trong buoi sang', 'Lần đầu tiên trong buổi sáng'],
  ['noi lo trong xuong', 'nỗi lo trong xưởng'],
  ['duoc noi ra bang giong noi', 'được nói ra bằng giọng nói'],
  ['mot con nguoi', 'một con người'],
  ['khong phai bang tin don', 'không phải bằng tin đồn'],
  ['hanh lang', 'hành lang'],
  ['Dieu tra tai cau truc', 'Điều tra tái cấu trúc'],
  ['Len tieng tai xuong', 'Lên tiếng tại xưởng'],
  ['quyen xem ban mo phong', 'quyền xem bản mô phỏng'],
  ['quyet dinh phai hieu', 'quyết định phải hiểu'],
  ['he thong truoc khi', 'hệ thống trước khi'],
  ['he thong quyet dinh', 'hệ thống quyết định'],
  ['so phan cua minh', 'số phận của mình'],
  ['Tham nhap he thong', 'Thâm nhập hệ thống'],
  ['Ban giu im lang', 'Bạn giữ im lặng'],
  ['chon quan sat', 'chọn quan sát'],
  ['di theo dong nguoi', 'đi theo dòng người'],
  ['ve to may so 3', 'về tổ máy số 3'],
  ['chua co cau tra loi', 'chưa có câu trả lời'],
  ['nhung khong khi', 'nhưng không khí'],
  ['da bao cho ban biet', 'đã báo cho bạn biết'],
  ['se khong con la chuyen', 'sẽ không còn là chuyện'],
  ['lam viec binh thuong nua', 'làm việc bình thường nữa'],
];

// Apply replacements
replacements.forEach(([old, ne]) => {
  const regex = new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  content = content.replace(regex, ne);
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ Vietnamese diacritics restored successfully!');
