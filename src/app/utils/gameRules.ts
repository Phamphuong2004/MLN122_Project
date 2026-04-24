// Game rules and instructions (ngôn ngữ: tiếng Việt - ngắn gọn, rõ ràng)

export const GAME_RULES = {
  laborClassify: {
    title: "👷 Phân loại lao động",
    rules: [
      "Bạn sẽ xem 8 tình huống. Với mỗi tình huống, chọn 'Lao động cụ thể' hoặc 'Lao động trừu tượng'.",
      "'Lao động cụ thể' là công việc có hình thức rõ ràng và tạo ra sản phẩm/dịch vụ (ví dụ: thợ may).",
      "'Lao động trừu tượng' là lao động góp vào giá trị trao đổi, không gắn với sản phẩm cụ thể.",
      "Mỗi câu trả lời đúng: +1 điểm. Không trừ điểm khi sai.",
      "Tổng tối đa: 8 điểm. Điểm sẽ hiển thị dưới dạng phần trăm.",
    ],
  },
  factory: {
    title: "🏭 Nhà máy số - Lựa chọn chiến lược",
    rules: [
      "Bạn quản lý nhà máy trong 4 vòng (rounds).",
      "Mỗi vòng, chọn 1 trong 3 chiến lược để ứng phó với tình huống.",
      "Mỗi chiến lược ảnh hưởng khác nhau tới lợi nhuận, việc làm và điểm xã hội.",
      "Mục tiêu: cân bằng lợi nhuận và trách nhiệm xã hội theo mục tiêu trò chơi.",
      "Điểm cuối = tổng điểm từ 4 vòng. Tổng tối đa: 24 điểm.",
    ],
  },
  quiz: {
    title: "💡 Câu đố giá trị",
    rules: [
      "Trả lời 6 câu hỏi về lý thuyết (Mác, kinh tế chính trị).",
      "Mỗi câu có 4 đáp án (A/B/C/D). Chỉ chọn 1 đáp án.",
      "Sau khi trả lời bạn sẽ thấy giải thích chi tiết.",
      "Mỗi câu đúng: +1 điểm. Tổng tối đa: 6 điểm (hiển thị phần trăm).",
    ],
  },
  vietnam: {
    title: "🇻🇳 Việt Nam 2045 - Lập chính sách",
    rules: [
      "Bạn đưa ra quyết định chính sách để phát triển đến năm 2045.",
      "Mỗi câu hỏi yêu cầu cân nhắc: tăng trưởng, công bằng xã hội và môi trường.",
      "Mỗi câu có điểm từ 0 đến 25, tùy mức độ chính xác.",
      "Tổng điểm tối đa: 100 điểm.",
    ],
  },
};

export const GAME_DESCRIPTIONS = {
  laborClassify: "Phân loại các tình huống theo hai loại lao động.",
  factory: "Quản lý nhà máy: lựa chọn chiến lược và cân bằng tác động.",
  quiz: "Kiểm tra kiến thức về giá trị và kinh tế chính trị.",
  vietnam: "Lập chính sách hướng tới phát triển bền vững cho Việt Nam.",
};
