import React, { useState } from "react";
import GameHeader from "./GameHeader";

interface Props {
  onComplete: (score: number) => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  emoji: string;
  options: { id: string; text: string }[];
  correct: string;
  explanation: string;
  concept: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    emoji: "⚙️",
    question: "Theo lý luận Mác, điều gì tạo ra GIÁI TRỊ của hàng hóa?",
    concept: "Nguồn gốc giá trị",
    options: [
      { id: "A", text: "Máy móc và công nghệ hiện đại" },
      {
        id: "B",
        text: "Lao động trừu tượng của con người kết tinh vào hàng hóa",
      },
      { id: "C", text: "Vốn đầu tư và nguyên vật liệu" },
      { id: "D", text: "Trí tuệ nhân tạo và dữ liệu lớn" },
    ],
    correct: "B",
    explanation:
      'Mác khẳng định: Giá trị hàng hóa là lao động trừu tượng của con người được kết tinh vào hàng hóa. Máy móc, tư bản, AI chỉ chuyển giao giá trị đã có — không tạo ra giá trị mới. Đây là học thuyết "Thuyết Lao động về Giá trị" (Lý thuyết Giá trị).',
  },
  {
    id: 2,
    emoji: "🔄",
    question: "Lao động CỤ THỂ và lao động TRỪU TƯỢNG khác nhau như thế nào?",
    concept: "Hai mặt của lao động",
    options: [
      {
        id: "A",
        text: "Lao động cụ thể: làm trong nhà máy. Lao động trừu tượng: làm ở văn phòng",
      },
      {
        id: "B",
        text: "Lao động cụ thể: hao phí cơ bắp. Lao động trừu tượng: hao phí trí não",
      },
      {
        id: "C",
        text: "Lao động cụ thể tạo ra giá trị sử dụng. Lao động trừu tượng tạo ra giá trị (trao đổi)",
      },
      {
        id: "D",
        text: "Không có sự khác biệt, đây là hai tên gọi khác nhau của cùng một khái niệm",
      },
    ],
    correct: "C",
    explanation:
      "Lao động cụ thể là lao động có hình thức nhất định (thợ may may áo, thợ mộc làm bàn) → tạo ra GIÁ TRỊ SỬ DỤNG. Lao động trừu tượng là sự hao phí sức người nói chung, không phân biệt loại → tạo ra GIÁ TRỊ (exchange value). Hai mặt này thống nhất trong mỗi hàng hóa.",
  },
  {
    id: 3,
    emoji: "🏭",
    question:
      "Khi nhà máy thay toàn bộ công nhân bằng robot, điều gì xảy ra với GIẢI TRỊ THẶNG DƯ?",
    concept: "Giá trị thặng dư trong tự động hóa",
    options: [
      { id: "A", text: "Giá trị thặng dư tăng vô hạn vì robot làm việc 24/7" },
      {
        id: "B",
        text: "Giá trị thặng dư của nhà máy đó tăng, nhưng của toàn xã hội có xu hướng giảm",
      },
      {
        id: "C",
        text: 'Giá trị thặng dư không thay đổi vì robot cũng là "lao động"',
      },
      { id: "D", text: "Giá trị thặng dư tăng bền vững cho toàn nền kinh tế" },
    ],
    correct: "B",
    explanation:
      'Nghịch lý tự động hóa: Một nhà máy dùng robot có lợi nhuận cao hơn đối thủ (do robot không đòi lương). Nhưng nếu TOÀN XÃ HỘI tự động hóa → lao động sống giảm → nguồn tạo giá trị thặng dư thu hẹp → khủng hoảng tích lũy tư bản. Mác gọi đây là "xu hướng giảm sút của tỷ suất lợi nhuận bình quân".',
  },
  {
    id: 4,
    emoji: "🤖",
    question: 'Trong lý luận Mác, AI và robot thuộc loại "tư bản" nào?',
    concept: "Tư bản bất biến vs khả biến",
    options: [
      {
        id: "A",
        text: "Tư bản khả biến – vì chúng biến đổi và học hỏi theo thời gian",
      },
      {
        id: "B",
        text: "Tư bản bất biến – vì chúng chỉ chuyển dần giá trị vào sản phẩm, không tạo giá trị mới",
      },
      {
        id: "C",
        text: "Cả hai loại tư bản – tùy theo mức độ thông minh của AI",
      },
      { id: "D", text: "Không thuộc loại nào vì Mác chưa biết đến AI" },
    ],
    correct: "B",
    explanation:
      "Mác phân biệt: Tư bản bất biến (c) = máy móc, nguyên liệu – chỉ chuyển giá trị, không tạo thêm. Tư bản khả biến (v) = sức lao động người – tạo ra giá trị mới và giá trị thặng dư (m). AI, robot dù thông minh đến đâu cũng là tư bản BẤT BIẾN! Bí mật tạo ra giá trị thặng dư chỉ có ở lao động NGƯỜI.",
  },
  {
    id: 5,
    emoji: "🇻🇳",
    question:
      "Trong kỷ nguyên AI, chiến lược nào ĐÚNG nhất cho người lao động Việt Nam?",
    concept: "Định hướng phát triển nhân lực",
    options: [
      { id: "A", text: "Từ chối AI và robot để bảo vệ việc làm truyền thống" },
      { id: "B", text: "Chỉ cần có bằng cấp đại học là đủ cạnh tranh" },
      {
        id: "C",
        text: "Nâng cao lao động phức tạp: kỹ năng số, sáng tạo, tư duy phản biện – điều AI chưa thể thay thế",
      },
      {
        id: "D",
        text: "Xuất khẩu lao động phổ thông, tránh cạnh tranh với AI trong nước",
      },
    ],
    correct: "C",
    explanation:
      'AI thay thế được lao động lặp lại, nhưng khó thay thế lao động sáng tạo, tư duy phản biện, cảm xúc, đạo đức. Nghị quyết 52/2019 của ĐCS Việt Nam nhấn mạnh: phát triển nguồn nhân lực chất lượng cao, kỹ năng số, STEM. Đây là "lao động phức tạp" theo Mác – tạo ra nhiều giá trị nhất trong kỷ nguyên số!',
  },
  {
    id: 6,
    emoji: "📊",
    question: 'Công thức "Tỷ suất giá trị thặng dư" (m\') của Mác là gì?',
    concept: "Tỷ suất bóc lột",
    options: [
      {
        id: "A",
        text: "m' = Giá trị thặng dư (m) / Tư bản bất biến (c) × 100%",
      },
      {
        id: "B",
        text: "m' = Tư bản bất biến (c) / Tư bản khả biến (v) × 100%",
      },
      {
        id: "C",
        text: "m' = Giá trị thặng dư (m) / Tư bản khả biến (v) × 100%",
      },
      {
        id: "D",
        text: "m' = Tổng giá trị (c+v+m) / Tư bản khả biến (v) × 100%",
      },
    ],
    correct: "C",
    explanation:
      "Tỷ suất giá trị thặng dư m' = m/v × 100%, phản ánh mức độ bóc lột lao động. Ví dụ: nếu m = 60% giờ làm thêm, v = 40% giờ cần thiết → m' = 150%. Khi robot thay người (v → 0), công thức này không còn áp dụng được – phản ánh giới hạn lý thuyết của tư bản khi tự động hóa hoàn toàn.",
  },
];

export default function QuizGame({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[currentIndex];
  const isCorrect = selected === question.correct;
  const progress = (currentIndex / QUESTIONS.length) * 100;

  const handleAnswer = (optionId: string) => {
    if (showExplanation) return;
    setSelected(optionId);
    setShowExplanation(true);
    if (optionId === question.correct) setScore((s) => s + 1);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const pct = Math.round((score / QUESTIONS.length) * 100);
    const grade =
      pct >= 90
        ? "A+"
        : pct >= 80
          ? "A"
          : pct >= 70
            ? "B"
            : pct >= 60
              ? "C"
              : "D";
    const gradeColor =
      pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <div
          className="scale-in glass-card"
          style={{
            maxWidth: 520,
            width: "100%",
            borderRadius: 24,
            padding: 40,
            textAlign: "center",
            border: "1px solid rgba(245,158,11,0.3)",
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>
            {pct >= 80 ? "🧠" : pct >= 60 ? "📚" : "💡"}
          </div>
          <h2 style={{ color: "#f59e0b", marginBottom: 8 }}>
            Màn 3 Hoàn Thành!
          </h2>
          <h3 style={{ color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>
            Câu Đố Giá Trị
          </h3>

          <div
            style={{
              background: "rgba(245,158,11,0.1)",
              borderRadius: 20,
              padding: 28,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                color: gradeColor,
                fontSize: 72,
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {grade}
            </div>
            <div style={{ color: "white", fontSize: 28, marginTop: 8 }}>
              {score}/{QUESTIONS.length} câu đúng
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {pct}% chính xác
            </div>
          </div>

          <div
            style={{
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              textAlign: "left",
            }}
          >
            <p style={{ color: "#f59e0b", fontSize: 13, marginBottom: 6 }}>
              💡 Tóm tắt kiến thức:
            </p>
            <div
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 13,
                lineHeight: 1.7,
              }}
            >
              <div>• Giá trị ← Lao động trừu tượng (con người)</div>
              <div>• Giá trị sử dụng ← Lao động cụ thể</div>
              <div>• AI/Robot = Tư bản bất biến, chỉ chuyển giá trị</div>
              <div>• Giá trị thặng dư m = m/v × 100%</div>
              <div>• Tương lai: lao động sáng tạo, tri thức</div>
            </div>
          </div>

          <button
            className="btn-gold"
            onClick={() => onComplete(score)}
            style={{ padding: "14px 40px", borderRadius: 50, fontSize: 16 }}
          >
            Màn cuối: Việt Nam 2045 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <GameHeader
          stage={3}
          title="Câu Đố Giá Trị"
          subtitle="Kiểm tra hiểu biết về lý luận Mác và AI trong thời đại mới"
          progress={progress}
          color="#f59e0b"
        />

        <div
          style={{
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 20,
              padding: "4px 14px",
            }}
          >
            <span style={{ color: "#f59e0b", fontSize: 13 }}>
              📌 {question.concept}
            </span>
          </div>
          <span style={{ color: "#10b981", fontSize: 14 }}>✓ {score} đúng</span>
        </div>

        {/* Question card */}
        <div
          key={currentIndex}
          className="scale-in glass-card"
          style={{
            borderRadius: 20,
            padding: "clamp(20px, 4vw, 36px)",
            marginBottom: 20,
            border: "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {question.emoji}
            </div>
            <h3
              style={{
                color: "white",
                lineHeight: 1.5,
                fontSize: "clamp(15px, 2.5vw, 19px)",
              }}
            >
              {question.question}
            </h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {question.options.map((option) => {
              let borderColor = "rgba(255,255,255,0.15)";
              let bg = "rgba(255,255,255,0.03)";
              let textColor = "rgba(255,255,255,0.8)";

              if (showExplanation) {
                if (option.id === question.correct) {
                  borderColor = "#10b981";
                  bg = "rgba(16,185,129,0.12)";
                  textColor = "#ffffff";
                } else if (
                  option.id === selected &&
                  option.id !== question.correct
                ) {
                  borderColor = "#ef4444";
                  bg = "rgba(239,68,68,0.12)";
                  textColor = "rgba(255,255,255,0.7)";
                }
              } else if (selected === option.id) {
                borderColor = "#f59e0b";
                bg = "rgba(245,158,11,0.1)";
              }

              return (
                <div
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  style={{
                    borderRadius: 12,
                    padding: "14px 18px",
                    border: `1px solid ${borderColor}`,
                    background: bg,
                    cursor: showExplanation ? "default" : "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                  className={showExplanation ? "" : "card-hover"}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background:
                        showExplanation && option.id === question.correct
                          ? "#10b981"
                          : showExplanation &&
                              option.id === selected &&
                              option.id !== question.correct
                            ? "#ef4444"
                            : "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 14,
                      fontWeight: "bold",
                      color:
                        showExplanation &&
                        (option.id === question.correct ||
                          option.id === selected)
                          ? "white"
                          : "rgba(255,255,255,0.6)",
                    }}
                  >
                    {showExplanation && option.id === question.correct
                      ? "✓"
                      : showExplanation &&
                          option.id === selected &&
                          option.id !== question.correct
                        ? "✗"
                        : option.id}
                  </div>
                  <span
                    style={{
                      color: textColor,
                      fontSize: "clamp(13px, 1.8vw, 15px)",
                      lineHeight: 1.5,
                    }}
                  >
                    {option.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="slide-up">
            <div
              style={{
                background: isCorrect
                  ? "rgba(16,185,129,0.08)"
                  : "rgba(245,158,11,0.08)",
                border: `1px solid ${isCorrect ? "#10b981" : "#f59e0b"}44`,
                borderLeft: `4px solid ${isCorrect ? "#10b981" : "#f59e0b"}`,
                borderRadius: 14,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color: isCorrect ? "#10b981" : "#f59e0b",
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                {isCorrect ? "🎉 Xuất sắc!" : "📖 Chưa đúng – Cùng tìm hiểu:"}
              </div>
              <p
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: 14,
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {question.explanation}
              </p>
            </div>

            <button
              className="btn-gold"
              onClick={handleNext}
              style={{
                padding: "13px 32px",
                borderRadius: 50,
                fontSize: 15,
                width: "100%",
              }}
            >
              {currentIndex < QUESTIONS.length - 1
                ? `Câu ${currentIndex + 2} →`
                : "Xem kết quả →"}
            </button>
          </div>
        )}

        <p
          style={{
            color: "rgba(255,255,255,0.3)",
            textAlign: "center",
            fontSize: 13,
            marginTop: 16,
          }}
        >
          Câu {currentIndex + 1} / {QUESTIONS.length}
        </p>
      </div>
    </div>
  );
}
