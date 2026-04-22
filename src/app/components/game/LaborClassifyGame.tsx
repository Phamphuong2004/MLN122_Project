import React, { useState } from 'react';
import GameHeader from './GameHeader';

interface Props {
  onComplete: (score: number) => void;
}

interface LaborCard {
  id: number;
  emoji: string;
  activity: string;
  detail: string;
  createsValue: boolean;
  explanation: string;
}

const CARDS: LaborCard[] = [
  {
    id: 1, emoji: '👗', activity: 'Công nhân may áo (8 giờ/ngày)',
    detail: 'Tay nghề thủ công, hao phí sức lao động trực tiếp',
    createsValue: true,
    explanation: '✅ ĐÚNG! Đây là lao động sống (lao động trừu tượng) của con người, trực tiếp tạo ra giá trị mới cho hàng hóa. Mỗi giờ lao động cụ thể hoá thành giá trị.',
  },
  {
    id: 2, emoji: '🤖', activity: 'Robot may tự động (24h/ngày)',
    detail: 'Máy móc hiện đại, không cần nghỉ ngơi',
    createsValue: false,
    explanation: '❌ Robot KHÔNG tạo ra giá trị mới! Theo Mác, máy móc chỉ chuyển dần giá trị của bản thân (khấu hao) vào sản phẩm. Chỉ lao động trừu tượng của người mới tạo ra giá trị.',
  },
  {
    id: 3, emoji: '💻', activity: 'Lập trình viên viết code AI',
    detail: 'Lao động trí tuệ, thiết kế hệ thống',
    createsValue: true,
    explanation: '✅ ĐÚNG! Lập trình viên hao phí sức lao động trí não – đây là lao động trừu tượng tạo ra giá trị. Lao động phức tạp tạo ra nhiều giá trị hơn lao động giản đơn trong cùng thời gian.',
  },
  {
    id: 4, emoji: '🗣️', activity: 'ChatBot AI tư vấn khách hàng',
    detail: 'Trả lời tự động 24/7, xử lý ngôn ngữ',
    createsValue: false,
    explanation: '❌ ChatBot KHÔNG tạo ra giá trị! AI là sản phẩm của lao động người đã được kết tinh vào đó. Khi hoạt động, AI chỉ chuyển giá trị đã có sang dịch vụ, không sinh ra giá trị mới.',
  },
  {
    id: 5, emoji: '🌾', activity: 'Nông dân trồng và thu hoạch lúa',
    detail: 'Lao động thể chất truyền thống, mùa vụ nông nghiệp',
    createsValue: true,
    explanation: '✅ ĐÚNG! Nông dân hao phí sức lực (lao động trừu tượng) kết tinh vào hạt gạo. Đây là lao động cụ thể tạo ra giá trị sử dụng (gạo), đồng thời lao động trừu tượng tạo ra giá trị.',
  },
  {
    id: 6, emoji: '🚜', activity: 'Máy gặt lúa tự động',
    detail: 'Máy nông nghiệp hiện đại, gặt 10 hecta/ngày',
    createsValue: false,
    explanation: '❌ Máy gặt KHÔNG tạo giá trị! Nó thực hiện lao động cụ thể (gặt lúa) nhưng thiếu yếu tố lao động trừu tượng của con người. Giá trị máy gặt dần khấu hao vào sản phẩm.',
  },
  {
    id: 7, emoji: '👨‍🏫', activity: 'Giáo viên giảng bài trực tiếp',
    detail: 'Truyền đạt kiến thức, đào tạo nhân lực',
    createsValue: true,
    explanation: '✅ ĐÚNG! Giáo viên thực hiện lao động trừu tượng tạo ra dịch vụ giáo dục. Đặc biệt, lao động đào tạo còn tạo ra "hàng hóa sức lao động" có chất lượng cao hơn cho xã hội.',
  },
  {
    id: 8, emoji: '🎓', activity: 'Phần mềm AI dạy học (E-learning)',
    detail: 'Tự học cá nhân hoá, không cần giáo viên',
    createsValue: false,
    explanation: '❌ Phần mềm AI KHÔNG tạo giá trị! Nó là kết tinh của lao động người đã làm ra nó. Khi dạy học, nó truyền tải giá trị đã được mã hoá, không phải tạo ra giá trị mới.',
  },
];

type Answer = 'yes' | 'no' | null;

export default function LaborClassifyGame({ onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const card = CARDS[currentIndex];
  const isCorrect = selectedAnswer !== null && ((selectedAnswer === 'yes') === card.createsValue);
  const totalCards = CARDS.length;
  const progress = (currentIndex / totalCards) * 100;

  const handleAnswer = (answer: Answer) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    const correct = (answer === 'yes') === card.createsValue;
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    setAnswers(prev => ({ ...prev, [card.id]: selectedAnswer }));
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentIndex < totalCards - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const pct = Math.round((score / totalCards) * 100);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="scale-in glass-card" style={{ maxWidth: 500, width: '100%', borderRadius: 24, padding: 40, textAlign: 'center', border: '1px solid rgba(0,212,255,0.3)' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{pct >= 75 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 style={{ color: '#00d4ff', marginBottom: 8 }}>Màn 1 Hoàn Thành!</h2>
          <h3 style={{ color: '#f59e0b', marginBottom: 24 }}>Phân Loại Lao Động</h3>
          <div style={{ background: 'rgba(0,212,255,0.1)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ color: '#00d4ff', fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: 'bold' }}>
              {score}/{totalCards}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
              {pct}% chính xác
            </p>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 16, marginBottom: 28, textAlign: 'left' }}>
            <p style={{ color: '#f59e0b', fontSize: 13, marginBottom: 4 }}>💡 Bài học chính:</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Chỉ lao động trừu tượng của CON NGƯỜI mới tạo ra giá trị. Máy móc và AI chỉ chuyển giao giá trị đã có – đây là nền tảng lý luận Mác về lao động và giá trị.
            </p>
          </div>
          <button className="btn-gold" onClick={() => onComplete(score)} style={{ padding: '14px 40px', borderRadius: 50, fontSize: 16 }}>
            Tiếp tục Màn 2 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <GameHeader
        stage={1}
        title="Phân Loại Lao Động"
        subtitle="Lao động nào tạo ra GIÁ TRỊ theo lý luận Mác?"
        progress={progress}
        color="#00d4ff"
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 650, margin: '0 auto', width: '100%' }}>

        {/* Counter */}
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 16, textAlign: 'center' }}>
          Thẻ {currentIndex + 1} / {totalCards}
          <span style={{ marginLeft: 16, color: '#10b981' }}>✓ {score} đúng</span>
        </div>

        {/* Card */}
        <div key={currentIndex} className="scale-in glass-card" style={{
          width: '100%',
          borderRadius: 20,
          padding: 'clamp(24px, 4vw, 40px)',
          marginBottom: 24,
          border: showFeedback
            ? isCorrect ? '1px solid #10b981' : '1px solid #ef4444'
            : '1px solid rgba(0,212,255,0.2)',
          background: showFeedback
            ? isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'
            : 'rgba(255,255,255,0.03)',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{card.emoji}</div>
            <h3 style={{ color: 'white', marginBottom: 8, fontSize: 'clamp(16px, 2.5vw, 22px)' }}>{card.activity}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 28 }}>{card.detail}</p>

            {!showFeedback ? (
              <>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20, fontSize: 15 }}>
                  Hoạt động này có <strong style={{ color: '#f59e0b' }}>tạo ra GIÁ TRỊ</strong> theo Mác không?
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="btn-green"
                    onClick={() => handleAnswer('yes')}
                    style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16 }}
                  >
                    ✅ CÓ – Tạo ra giá trị
                  </button>
                  <button
                    className="btn-red"
                    onClick={() => handleAnswer('no')}
                    style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16 }}
                  >
                    ❌ KHÔNG – Không tạo giá trị
                  </button>
                </div>
              </>
            ) : (
              <div className="fade-in">
                <div style={{
                  background: isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  border: `1px solid ${isCorrect ? '#10b981' : '#ef4444'}44`,
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20,
                  textAlign: 'left',
                }}>
                  <p style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
                    {isCorrect ? '🎉 Chính xác!' : '💡 Chưa đúng!'}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0, fontSize: 14 }}>
                    {card.explanation}
                  </p>
                </div>
                <button
                  className="btn-cyan"
                  onClick={handleNext}
                  style={{ padding: '12px 32px', borderRadius: 50, fontSize: 15 }}
                >
                  {currentIndex < totalCards - 1 ? 'Thẻ tiếp theo →' : 'Xem kết quả →'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Theory reminder */}
        <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 20px', maxWidth: 500, textAlign: 'center' }}>
          <p style={{ color: 'rgba(245,158,11,0.8)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>
            💡 <strong>Ghi nhớ:</strong> Lao động trừu tượng = hao phí sức người nói chung → tạo ra GIÁ TRỊ
          </p>
        </div>
      </div>
    </div>
  );
}
