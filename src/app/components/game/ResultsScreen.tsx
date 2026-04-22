import React, { useEffect, useState } from 'react';
import { GameScores } from '../../App';

interface Props {
  scores: GameScores;
  onRestart: () => void;
}

const GAME_INFO = [
  { key: 'game1' as keyof GameScores, name: 'Phân Loại Lao Động', icon: '⚖️', maxScore: 8, color: '#00d4ff' },
  { key: 'game2' as keyof GameScores, name: 'Nhà Máy Số', icon: '🏭', maxScore: 24, color: '#8b5cf6' },
  { key: 'game3' as keyof GameScores, name: 'Câu Đố Giá Trị', icon: '🧠', maxScore: 6, color: '#f59e0b' },
  { key: 'game4' as keyof GameScores, name: 'Việt Nam 2045', icon: '🇻🇳', maxScore: 100, color: '#10b981' },
];

const KEY_CONCEPTS = [
  {
    icon: '⚗️',
    title: 'Hai mặt của Lao Động',
    content: 'Lao động cụ thể → Giá trị sử dụng\nLao động trừu tượng → Giá trị (trao đổi)',
    color: '#00d4ff',
  },
  {
    icon: '💎',
    title: 'Nguồn gốc Giá Trị',
    content: 'Chỉ lao động trừu tượng của CON NGƯỜI mới tạo ra giá trị. AI/Robot chỉ CHUYỂN GIÁ TRỊ đã có.',
    color: '#f59e0b',
  },
  {
    icon: '🔩',
    title: 'Tư Bản Bất Biến vs Khả Biến',
    content: 'Tư bản bất biến (c): máy móc, AI, nguyên liệu\nTư bản khả biến (v): sức lao động người → tạo ra m',
    color: '#8b5cf6',
  },
  {
    icon: '📉',
    title: 'Nghịch Lý Tự Động Hóa',
    content: 'Tự động hóa tăng lợi nhuận cá nhân nhưng thu hẹp nguồn tạo giá trị thặng dư toàn xã hội.',
    color: '#ef4444',
  },
  {
    icon: '🎓',
    title: 'Lao Động Phức Tạp',
    content: '1 giờ lao động phức tạp (kỹ sư AI) = nhiều giờ lao động giản đơn → tạo nhiều giá trị hơn.',
    color: '#10b981',
  },
  {
    icon: '🇻🇳',
    title: 'Định Hướng Việt Nam',
    content: 'Phát triển nguồn nhân lực chất lượng cao, kỹ năng số, sáng tạo – không để ai bị bỏ lại phía sau.',
    color: '#ff6b35',
  },
];

function Firework({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`,
      width: 4, height: 4, borderRadius: '50%',
      background: color, animation: 'float 2s ease-in-out infinite',
      boxShadow: `0 0 6px ${color}`,
    }} />
  );
}

export default function ResultsScreen({ scores, onRestart }: Props) {
  const [animating, setAnimating] = useState(true);
  const [showConcepts, setShowConcepts] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimating(false), 500);
    const t2 = setTimeout(() => setShowConcepts(true), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Calculate normalized scores
  const game1Pct = Math.round((scores.game1 / 8) * 100);
  const game2Pct = Math.round((scores.game2 / 24) * 100);
  const game3Pct = Math.round((scores.game3 / 6) * 100);
  const game4Pct = Math.round((scores.game4 / 100) * 100);

  const overallPct = Math.round((game1Pct + game2Pct + game3Pct + game4Pct) / 4);

  const getGrade = (pct: number) => {
    if (pct >= 90) return { label: 'XUẤT SẮC', icon: '🏆', color: '#fbbf24', sub: 'Bạn đã nắm vững lý luận Mác về lao động và AI!' };
    if (pct >= 75) return { label: 'TỐT', icon: '🌟', color: '#10b981', sub: 'Bạn hiểu rõ các khái niệm cơ bản về lao động và giá trị.' };
    if (pct >= 60) return { label: 'KHÁ', icon: '📚', color: '#00d4ff', sub: 'Nắm được kiến thức nền, cần ôn lại lý luận giá trị thặng dư.' };
    return { label: 'CẦN CỐ GẮNG', icon: '💪', color: '#f59e0b', sub: 'Hãy đọc lại Chương 6 và thử lại!' };
  };

  const grade = getGrade(overallPct);
  const fireworks = Array.from({ length: 12 }, (_, i) => ({
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 5,
    color: ['#00d4ff', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'][i % 5],
  }));

  return (
    <div style={{ minHeight: '100vh', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      {/* Particle background */}
      {overallPct >= 60 && fireworks.map((fw, i) => (
        <Firework key={i} x={fw.x} y={fw.y} color={fw.color} />
      ))}

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 60%)' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div className="slide-up" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 80, marginBottom: 12 }} className="float">{grade.icon}</div>
          <h1 className="neon-text" style={{ color: '#00d4ff', fontSize: 'clamp(24px, 5vw, 44px)', marginBottom: 8 }}>
            KẾT QUẢ CUỐI CÙNG
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>Trí Tuệ Nhân Tạo & Người Lao Động</p>
        </div>

        {/* Overall score */}
        <div className="glow-card glass-card" style={{
          borderRadius: 24,
          padding: 'clamp(24px, 4vw, 48px)',
          marginBottom: 24,
          border: `2px solid ${grade.color}44`,
          background: `${grade.color}08`,
          textAlign: 'center',
        }}>
          {/* Circular score */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <circle
                cx="90" cy="90" r="80" fill="none"
                stroke={grade.color} strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - overallPct / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 8px ${grade.color})` }}
              />
            </svg>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              textAlign: 'center',
            }}>
              <div style={{ color: grade.color, fontSize: 42, fontWeight: 'bold', lineHeight: 1 }}>{overallPct}%</div>
              <div style={{ color: grade.color, fontSize: 14, marginTop: 4 }}>{grade.label}</div>
            </div>
          </div>

          <h2 style={{ color: 'white', marginBottom: 8 }}>{grade.icon} {grade.label}</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>{grade.sub}</p>
        </div>

        {/* Per-game scores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { name: 'Phân Loại Lao Động', icon: '⚖️', pct: game1Pct, raw: `${scores.game1}/8`, color: '#00d4ff' },
            { name: 'Nhà Máy Số', icon: '🏭', pct: game2Pct, raw: `${scores.game2}/24`, color: '#8b5cf6' },
            { name: 'Câu Đố Giá Trị', icon: '🧠', pct: game3Pct, raw: `${scores.game3}/6`, color: '#f59e0b' },
            { name: 'Việt Nam 2045', icon: '🇻🇳', pct: game4Pct, raw: `${scores.game4}/100`, color: '#10b981' },
          ].map((game, i) => (
            <div key={i} className="glass-card" style={{ borderRadius: 16, padding: 20, border: `1px solid ${game.color}33`, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{game.icon}</div>
              <div style={{ color: game.color, fontSize: 28, fontWeight: 'bold' }}>{game.pct}%</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 12 }}>{game.name}</div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${game.pct}%`, height: '100%', background: game.color, borderRadius: 6, transition: 'width 1s ease 0.5s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Key Concepts Summary */}
        <div style={{ marginBottom: 28, opacity: showConcepts ? 1 : 0, transform: showConcepts ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ display: 'inline-block', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '6px 20px', marginBottom: 12 }}>
              <span style={{ color: '#f59e0b', fontSize: 12, letterSpacing: 2 }}>📖 TỔNG HỢP KIẾN THỨC CHƯƠNG 6</span>
            </div>
            <h3 style={{ color: 'white' }}>Những điều đã học trong hành trình này</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
            {KEY_CONCEPTS.map((concept, i) => (
              <div key={i} className="glass-card" style={{ borderRadius: 14, padding: 18, border: `1px solid ${concept.color}25`, borderLeft: `3px solid ${concept.color}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{concept.icon}</span>
                  <div>
                    <div style={{ color: concept.color, fontWeight: 'bold', fontSize: 13, marginBottom: 6 }}>{concept.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{concept.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marx Quote */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,212,255,0.08))',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 28,
          textAlign: 'center',
        }}>
          <p style={{ color: '#f59e0b', fontSize: 'clamp(14px, 2vw, 18px)', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 8 }}>
            "Máy móc chỉ tạo ra giá trị trong chừng mực chúng thay thế lao động. Nhưng nếu tất cả đều được sản xuất bằng máy móc, thì giá trị sẽ lấy từ đâu?"
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>– Karl Marx, Tư Bản Luận</p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', paddingBottom: 40 }}>
          <button
            className="btn-purple"
            onClick={onRestart}
            style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16 }}
          >
            🔄 Chơi lại từ đầu
          </button>
          <button
            className="btn-gold"
            onClick={() => {
              const text = `🎮 Tôi vừa hoàn thành Web Game "Trí Tuệ Nhân Tạo & Người Lao Động" (Chương 6 - Triết học Mác–Lênin)!\n📊 Điểm tổng: ${overallPct}% - ${grade.label}\n🏆 Bạn có dám thử không?`;
              alert(text);
            }}
            style={{ padding: '14px 36px', borderRadius: 50, fontSize: 16 }}
          >
            📤 Chia sẻ kết quả
          </button>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingBottom: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.6 }}>
            Dựa trên lý luận Chương 6 – Triết học Mác–Lênin<br />
            Chủ đề: Trí tuệ nhân tạo và người lao động – Sự biến đổi bản chất của lao động trong thời đại mới
          </p>
        </div>
      </div>
    </div>
  );
}
