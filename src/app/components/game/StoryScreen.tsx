import React, { useState } from 'react';

interface Props {
  onContinue: () => void;
}

const panels = [
  {
    id: 0,
    icon: '👷',
    title: 'Anh Minh – Công nhân nhà máy',
    text: 'Năm 2025, anh Minh làm việc tại một nhà máy may mặc ở Bình Dương. Mỗi ngày anh ngồi 8 tiếng, may hàng trăm chiếc áo. Theo Mác, lao động của anh Minh có hai mặt:',
    highlight: '"Lao động cụ thể" tạo ra chiếc áo (giá trị sử dụng) và "Lao động trừu tượng" hao phí sức người tạo ra Giá trị (value).',
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.05)',
  },
  {
    id: 1,
    icon: '🤖',
    title: 'Ngày ấy đã đến...',
    text: 'Một buổi sáng, những chiếc robot may mặc được chuyển vào nhà máy. Chúng làm việc 24/7, không mệt mỏi, không đình công. Ông chủ mỉm cười. Anh Minh lo lắng nhìn vào tờ thông báo...',
    highlight: '"Thông báo: Nhà máy sẽ tự động hóa 60% dây chuyền trong 3 tháng tới. Một số vị trí sẽ bị cắt giảm."',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.05)',
  },
  {
    id: 2,
    icon: '💡',
    title: 'Câu hỏi Mác đặt ra',
    text: 'Mác dạy rằng: Giá trị hàng hóa được tạo ra bởi lao động trừu tượng của CON NGƯỜI. Khi robot thay thế người lao động, câu hỏi đặt ra là:',
    highlight: 'Robot/AI có tạo ra giá trị mới không? Hay chúng chỉ chuyển giao giá trị từ máy móc vào sản phẩm? Và giá trị thặng dư đến từ đâu khi không còn lao động sống?',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.05)',
  },
  {
    id: 3,
    icon: '🇻🇳',
    title: 'Việt Nam trước thách thức',
    text: 'Với hơn 55 triệu lao động, Việt Nam đang trong thời kỳ công nghiệp hóa – hiện đại hóa. AI và tự động hóa vừa là cơ hội vừa là thách thức. Đảng và Nhà nước đã đặt ra mục tiêu:',
    highlight: '"Phát triển nguồn nhân lực chất lượng cao – Không để ai bị bỏ lại phía sau trong cuộc cách mạng số."',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.05)',
  },
];

export default function StoryScreen({ onContinue }: Props) {
  const [currentPanel, setCurrentPanel] = useState(0);

  const panel = panels[currentPanel];
  const isLast = currentPanel === panels.length - 1;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ maxWidth: 700, width: '100%', zIndex: 10 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '6px 20px', marginBottom: 16 }}>
            <span style={{ color: '#f59e0b', fontSize: 13, letterSpacing: 2 }}>📖 CÂU CHUYỆN MỞ ĐẦU</span>
          </div>
          <h2 style={{ color: 'white', marginBottom: 0 }}>Từ Nhà Máy Đến Kỷ Nguyên AI</h2>
        </div>

        {/* Panel indicator */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {panels.map((_, i) => (
            <div key={i} style={{
              width: i === currentPanel ? 32 : 10,
              height: 10,
              borderRadius: 5,
              background: i === currentPanel ? panel.color : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        {/* Story card */}
        <div key={currentPanel} className="scale-in glass-card" style={{
          borderRadius: 20,
          padding: 'clamp(24px, 4vw, 48px)',
          border: `1px solid ${panel.color}33`,
          background: panel.bg,
          marginBottom: 32,
          minHeight: 300,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {/* Icon */}
          <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 20 }} className="float">
            {panel.icon}
          </div>

          {/* Title */}
          <h2 style={{ color: panel.color, textAlign: 'center', marginBottom: 20, fontSize: 'clamp(18px, 3vw, 26px)' }}>
            {panel.title}
          </h2>

          {/* Main text */}
          <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: 20, textAlign: 'center', fontSize: 'clamp(14px, 1.8vw, 16px)' }}>
            {panel.text}
          </p>

          {/* Highlighted quote */}
          <div style={{
            background: `${panel.color}15`,
            border: `1px solid ${panel.color}44`,
            borderLeft: `4px solid ${panel.color}`,
            borderRadius: 8,
            padding: '16px 20px',
          }}>
            <p style={{ color: panel.color, lineHeight: 1.7, margin: 0, fontStyle: 'italic', fontSize: 'clamp(13px, 1.5vw, 15px)' }}>
              "{panel.highlight}"
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {currentPanel > 0 && (
            <button
              className="btn-purple"
              onClick={() => setCurrentPanel(p => p - 1)}
              style={{ padding: '12px 28px', borderRadius: 50, fontSize: 15 }}
            >
              ← Quay lại
            </button>
          )}

          {!isLast ? (
            <button
              className="btn-cyan"
              onClick={() => setCurrentPanel(p => p + 1)}
              style={{ padding: '12px 36px', borderRadius: 50, fontSize: 15 }}
            >
              Tiếp theo →
            </button>
          ) : (
            <button
              className="btn-gold"
              onClick={onContinue}
              style={{ padding: '14px 40px', borderRadius: 50, fontSize: 16 }}
            >
              🎮 BẮT ĐẦU CHƠI →
            </button>
          )}
        </div>

        {/* Panel counter */}
        <p style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 13, marginTop: 16 }}>
          {currentPanel + 1} / {panels.length}
        </p>
      </div>
    </div>
  );
}
