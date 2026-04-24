# ✅ Game Rules Implementation - Summary

## 🎯 Những gì vừa làm

### **Tạo Game Rules Modal System**

Bạn giờ có một hệ thống hoàn chỉnh để hiển thị **luật chơi (rules)** trước khi bắt đầu từng game.

---

## 📁 Files Mới Tạo

```
src/app/
├── components/game/
│   └── GameRulesModal.tsx          ← Component hiển thị luật
└── utils/
    └── gameRules.ts                ← Lưu trữ luật cho tất cả games

+ GAME_RULES_GUIDE.md              ← Hướng dẫn chi tiết
```

---

## 🎮 Cách Hoạt Động

### **Khi Player mở game:**

```
1. Component mở
   ↓
2. showRules = true
   ↓
3. GameRulesModal hiển thị
   ↓
4. Player đọc luật
   ↓
5. Click "Bắt đầu chơi"
   ↓
6. showRules = false
   ↓
7. Game bắt đầu
```

### **Example - LaborClassifyGame:**

```tsx
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

export default function LaborClassifyGame({ onComplete }) {
  const [showRules, setShowRules] = useState(true);

  if (showRules) {
    return (
      <GameRulesModal
        gameTitle={GAME_RULES.laborClassify.title}
        rules={GAME_RULES.laborClassify.rules}
        onStart={() => setShowRules(false)}
      />
    );
  }

  // Game code here...
}
```

---

## 📋 Luật Của Từng Game

### **Game 1 — Phân loại lao động**

- Bạn sẽ xem 8 tình huống. Với mỗi tình huống, chọn "Lao động cụ thể" hoặc "Lao động trừu tượng".
- "Lao động cụ thể": công việc có hình thức rõ ràng, tạo ra sản phẩm/dịch vụ (ví dụ: thợ may).
- "Lao động trừu tượng": lao động góp vào giá trị trao đổi, không gắn sản phẩm cụ thể.
- Mỗi câu đúng: +1 điểm. Tổng tối đa: 8 điểm (hiển thị phần trăm).

### **Game 2 — Nhà máy số**

- Quản lý nhà máy qua 4 vòng (rounds).
- Mỗi vòng chọn 1 trong 3 chiến lược để ứng phó với tình huống.
- Mỗi chiến lược ảnh hưởng tới: lợi nhuận, việc làm và điểm xã hội.
- Tổng điểm = điểm cộng dồn 4 vòng. Tổng tối đa: 24 điểm.

### **Game 3 — Câu đố giá trị**

- Trả lời 6 câu hỏi kiến thức (Mác, kinh tế chính trị).
- Mỗi câu có 4 đáp án (A/B/C/D); chỉ chọn 1 đáp án.
- Sau khi trả lời, bạn sẽ thấy lời giải thích cho đáp án đúng.
- Mỗi câu đúng: +1 điểm. Tổng tối đa: 6 điểm (hiển thị phần trăm).

### **Game 4 — Việt Nam 2045**

- Bạn là nhà lập chính sách, đưa ra quyết định cho tương lai đến năm 2045.
- Mỗi câu hỏi yêu cầu cân nhắc giữa: tăng trưởng kinh tế, công bằng xã hội và bảo vệ môi trường.
- Mỗi câu có điểm từ 0 đến 25 tùy mức độ chính xác. Tổng tối đa: 100 điểm.

---

## 🔧 Thêm Rules cho Các Game Khác

### **LaborClassifyGame** ✅ (Đã làm)

### **FactoryGame** (Cần làm):

```tsx
// Thêm import ở trên
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

// Thêm state
const [showRules, setShowRules] = useState(true);

// Thêm check ở đầu component
if (showRules) {
  return (
    <GameRulesModal
      gameTitle={GAME_RULES.factory.title}
      rules={GAME_RULES.factory.rules}
      onStart={() => setShowRules(false)}
    />
  );
}
```

### **QuizGame** (Cần làm):

```tsx
if (showRules) {
  return (
    <GameRulesModal
      gameTitle={GAME_RULES.quiz.title}
      rules={GAME_RULES.quiz.rules}
      onStart={() => setShowRules(false)}
    />
  );
}
```

### **VietnamGame** (Cần làm):

```tsx
if (showRules) {
  return (
    <GameRulesModal
      gameTitle={GAME_RULES.vietnam.title}
      rules={GAME_RULES.vietnam.rules}
      onStart={() => setShowRules(false)}
    />
  );
}
```

---

## 🎨 GameRulesModal Component

### **Props:**

```tsx
interface GameRulesModalProps {
  gameTitle: string; // Tiêu đề game
  rules: string[]; // Danh sách luật
  onStart: () => void; // Callback khi click "Bắt đầu"
  onClose?: () => void; // Callback khi click "Đóng"
}
```

### **Features:**

- ✅ Animated entrance
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Numbered rules list
- ✅ Clean UI

---

## 📝 Tùy chỉnh Luật

### **Sửa luật hiện có:**

```tsx
// src/app/utils/gameRules.ts
export const GAME_RULES = {
  laborClassify: {
    title: "👷 Phân loại lao động",
    rules: [
      "Luật 1",
      "Luật 2", // ← Sửa ở đây
      "Luật 3",
    ],
  },
};
```

### **Thêm luật mới:**

```tsx
export const GAME_RULES = {
  // ... existing
  newGame: {
    title: "🎮 Game mới",
    rules: ["Luật 1", "Luật 2", "Luật 3"],
  },
};
```

---

## ✅ Testing

### **Test Local:**

```bash
npm run dev
# Mở http://localhost:5173
# Click vào từng game
# Xem rules modal hiển thị
```

### **Checklist:**

- [ ] Rules modal mở tự động
- [ ] Nội dung hiển thị đúng
- [ ] Click "Bắt đầu chơi" → game chạy
- [ ] Click "Đóng" → đóng modal
- [ ] Responsive mobile
- [ ] Animation smooth

---

## 🚀 Next Steps

### **1. Test tất cả games:**

```bash
npm run dev
```

### **2. Thêm rules cho 3 games còn lại:**

- [ ] FactoryGame
- [ ] QuizGame
- [ ] VietnamGame

### **3. Deploy:**

```bash
git add .
git commit -m "Add game rules modals for all games"
git push origin main
# Vercel auto deploys
```

---

## 📚 Documentation

- **GAME_RULES_GUIDE.md** - Hướng dẫn chi tiết
- **README.md** - Project overview
- **QUICKSTART.md** - Cách sử dụng

---

## 💡 Tips

### **Viết luật tốt:**

- Ngắn gọn, dễ hiểu
- Sử dụng bullet points
- Tập trung vào cách chơi
- Thêm emoji cho dễ nhìn

### **Tương lai có thể thêm:**

- 🔍 "Xem lại luật" nút trong game
- 📊 Tooltip giải thích từ
- 🎬 Animated rules intro
- 🎥 Video hướng dẫn

---

## 🎉 Hoàn tất!

Bạn giờ đã có:

- ✅ Game Rules Modal Component
- ✅ Luật cho 4 games
- ✅ LaborClassifyGame integrated
- ✅ Responsive design
- ✅ Animated UI

**Tiếp theo: Integrate rules cho 3 games còn lại** 🎮

---

**Enjoy! 🚀**
