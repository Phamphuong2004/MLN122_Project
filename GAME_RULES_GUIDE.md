# 📚 Game Rules & Instructions Guide

## Cấu trúc mới

Dự án đã được thêm **Game Rules Modal** - một component hiển thị luật chơi trước khi bắt đầu từng game.

```
src/app/
├── components/game/
│   ├── GameRulesModal.tsx        ← NEW: Modal hiển thị luật
│   ├── LaborClassifyGame.tsx     ← UPDATED: Thêm rules
│   ├── FactoryGame.tsx           ← Có thể thêm rules
│   ├── QuizGame.tsx              ← Có thể thêm rules
│   └── VietnamGame.tsx           ← Có thể thêm rules
└── utils/
    └── gameRules.ts              ← NEW: Lưu trữ luật chơi
```

---

## 🎮 Cách hoạt động

### **1. Player mở game → Thấy Rules Modal**

```
LaborClassifyGame mở
    ↓
showRules = true
    ↓
Hiển thị GameRulesModal
    ↓
Player đọc luật
    ↓
Click "Bắt đầu chơi"
    ↓
showRules = false → Game bắt đầu
```

### **2. GameRulesModal Component**

```tsx
<GameRulesModal
  gameTitle="👷 Phân loại lao động"
  rules={[
    "Bạn sẽ được xem 8 tình huống...",
    "Phân loại thành lao động cụ thể...",
    // ... more rules
  ]}
  onStart={() => setShowRules(false)}
/>
```

---

## 📖 Game Rules Hiện có

### **Game 1: Phân loại lao động (LaborClassifyGame)**

```
📋 Luật chơi:
1. Bạn sẽ được xem 8 tình huống lao động khác nhau
2. Phân loại từng tình huống thành: Lao động cụ thể hay Lao động trừu tượng
3. Lao động cụ thể: có hình thức, tạo ra giá trị sử dụng (ví dụ: thợ may may áo)
4. Lao động trừu tượng: hao phí sức lao động chung, tạo ra giá trị trao đổi
5. Mỗi câu trả lời đúng được 1 điểm, sai được 0 điểm
6. Tối đa 8 điểm, sẽ chuyển thành phần trăm
```

### **Game 2: Nhà máy số (FactoryGame)**

```
📋 Luật chơi:
1. Bạn quản lý một nhà máy qua 4 vòng (rounds)
2. Mỗi vòng, bạn sẽ nhận một tình huống kinh tế cụ thể
3. Chọn 1 trong 3 chiến lược để phản ứng
4. Mỗi chiến lược có tác động khác nhau lên: lợi nhuận, việc làm, giá trị thặng dư, điểm xã hội
5. Mục tiêu: cân bằng giữa lợi nhuận và trách nhiệm xã hội
6. Điểm cuối = tổng điểm từ 4 vòng (max 24)
```

### **Game 3: Câu đố giá trị (QuizGame)**

```
📋 Luật chơi:
1. Trả lời 6 câu hỏi về lý thuyết Mác và kinh tế chính trị
2. Mỗi câu hỏi có 4 đáp án: A, B, C, D
3. Chỉ có 1 đáp án đúng duy nhất
4. Sau khi chọn, bạn sẽ thấy giải thích chi tiết
5. Mỗi câu trả lời đúng được 1 điểm, sai được 0 điểm
6. Tối đa 6 điểm, sẽ chuyển thành phần trăm
```

### **Game 4: Việt Nam 2045 (VietnamGame)**

```
📋 Luật chơi:
1. Bạn là một nhà lập chính sách Việt Nam đến năm 2045
2. Trả lời các câu hỏi về chiến lược phát triển kinh tế-xã hội
3. Điểm được tính dựa trên mức độ chính xác của câu trả lời
4. Cân nhắc giữa tăng trưởng kinh tế, bình đẳng xã hội và bảo vệ môi trường
5. Mỗi câu trả lời có điểm số cụ thể (0-25 điểm mỗi câu)
6. Tối đa 100 điểm từ tất cả các câu hỏi
```

---

## 🔧 Cách sử dụng

### **Đã setup cho LaborClassifyGame:**

```tsx
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

export default function LaborClassifyGame({ onComplete }) {
  const [showRules, setShowRules] = useState(true);

  // Hiển thị rules trước
  if (showRules) {
    return (
      <GameRulesModal
        gameTitle={GAME_RULES.laborClassify.title}
        rules={GAME_RULES.laborClassify.rules}
        onStart={() => setShowRules(false)}
      />
    );
  }

  // Game bắt đầu ở đây
  return <div>Game content...</div>;
}
```

---

## 📝 Thêm Rules cho FactoryGame

```tsx
// FactoryGame.tsx - Bên trên component
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

export default function FactoryGame({ onComplete }) {
  const [showRules, setShowRules] = useState(true);

  if (showRules) {
    return (
      <GameRulesModal
        gameTitle={GAME_RULES.factory.title}
        rules={GAME_RULES.factory.rules}
        onStart={() => setShowRules(false)}
      />
    );
  }

  // ... existing game code
}
```

---

## 📝 Thêm Rules cho QuizGame

```tsx
// QuizGame.tsx - Bên trên component
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

export default function QuizGame({ onComplete }) {
  const [showRules, setShowRules] = useState(true);

  if (showRules) {
    return (
      <GameRulesModal
        gameTitle={GAME_RULES.quiz.title}
        rules={GAME_RULES.quiz.rules}
        onStart={() => setShowRules(false)}
      />
    );
  }

  // ... existing game code
}
```

---

## 📝 Thêm Rules cho VietnamGame

```tsx
// VietnamGame.tsx - Bên trên component
import GameRulesModal from "./GameRulesModal";
import { GAME_RULES } from "../utils/gameRules";

export default function VietnamGame({ onComplete }) {
  const [showRules, setShowRules] = useState(true);

  if (showRules) {
    return (
      <GameRulesModal
        gameTitle={GAME_RULES.vietnam.title}
        rules={GAME_RULES.vietnam.rules}
        onStart={() => setShowRules(false)}
      />
    );
  }

  // ... existing game code
}
```

---

## 🎨 Tùy chỉnh Rules

### **Sửa luật của một game:**

```tsx
// src/app/utils/gameRules.ts
export const GAME_RULES = {
  laborClassify: {
    title: "👷 Phân loại lao động",
    rules: [
      "Bạn sẽ được xem 8 tình huống lao động khác nhau",
      "Phân loại từng tình huống thành: Lao động cụ thể hay Lao động trừu tượng",
      // ... thêm/sửa luật ở đây
    ],
  },
  // ... other games
};
```

### **Thêm game mới:**

```tsx
export const GAME_RULES = {
  // ... existing games
  newGame: {
    title: "🎮 Tên game mới",
    rules: ["Luật 1", "Luật 2", "Luật 3"],
  },
};

export const GAME_DESCRIPTIONS = {
  // ... existing
  newGame: "Mô tả game mới",
};
```

---

## 🎯 Features của GameRulesModal

### **Hiển thị:**

- ✅ Tiêu đề game với emoji
- ✅ Danh sách luật đánh số
- ✅ Animated entrance
- ✅ Nút "Bắt đầu chơi" & "Đóng"

### **Styling:**

- ✅ Responsive design
- ✅ Dark mode (phù hợp theme game)
- ✅ Framer Motion animations
- ✅ Glass-morphism effect (tùy chọn)

---

## 💡 Best Practices

### **Viết luật tốt:**

- ✅ Ngắn gọn, dễ hiểu
- ✅ Tập trung vào cách chơi
- ✅ Không quá chi tiết
- ✅ Sử dụng bullet points

### **Ví dụ tốt:**

```
"Mỗi câu hỏi có 4 đáp án: A, B, C, D"
"Chỉ có 1 đáp án đúng duy nhất"
"Mỗi câu đúng được 1 điểm"
```

### **Ví dụ kém:**

```
"Trả lời các câu hỏi rất chi tiết về các khái niệm lý thuyết kinh tế Mác phức tạp..."
```

---

## 📊 Component Structure

```tsx
GameRulesModal
├── Header
│   ├── Icon (BookOpen)
│   └── Title
├── Rules List
│   └── Rule Item (animated)
│       ├── Number Badge
│       └── Rule Text
└── Action Buttons
    ├── Close (optional)
    └── Start Game
```

---

## ✅ Testing

### **Test Local:**

```bash
npm run dev
# Vào từng game, xem rules modal hiển thị
# Click "Bắt đầu chơi" → game bắt đầu
```

### **Test checklist:**

- [ ] Rules modal mở tự động
- [ ] Rules hiển thị đúng
- [ ] Click "Bắt đầu chơi" → game bắt đầu
- [ ] Click "Đóng" → đóng modal
- [ ] Responsive trên mobile
- [ ] Animation smooth

---

## 🚀 Deploy

```bash
# Build
npm run build

# Deploy (already configured with GitHub Actions)
git add .
git commit -m "Add game rules modals"
git push origin main
# Vercel auto deploys
```

---

**Hoàn tất! 🎉 Game của bạn giờ có Rules Modal!**

Người chơi sẽ thấy luật rõ ràng trước khi chơi. 📖✨
