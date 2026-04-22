import React, { useEffect, useState } from 'react';

interface Props {
  onStart: () => void;
}

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 3,
  duration: Math.random() * 3 + 2,
}));

export default function WelcomeScreen({ onStart }: Props) {
  const [visible, setVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setTitleVisible(true), 400);
    const t3 = setTimeout(() => setSubtitleVisible(true), 900);
    const t4 = setTimeout(() => setBtnVisible(true), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '20px',
    }}>
      {/* Background particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: `${p.top}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          background: p.id % 3 === 0 ? '#00d4ff' : p.id % 3 === 1 ? '#f59e0b' : '#8b5cf6',
          borderRadius: '50%',
          opacity: 0.4,
          animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
        }} />
      ))}

      {/* Background grid lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Glowing orbs */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* Main content */}
      <div style={{ textAlign: 'center', maxWidth: 700, zIndex: 10, opacity: visible ? 1 : 0, transition: 'opacity 0.5s' }}>

        {/* Icon */}
        <div className="float" style={{ fontSize: 80, marginBottom: 20 }}>
          🏭
        </div>

        {/* Badge */}
        <div style={{ display: 'inline-block', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 20, padding: '6px 20px', marginBottom: 24, opacity: visible ? 1 : 0, transition: 'opacity 0.5s 0.2s' }}>
          <span style={{ color: '#00d4ff', fontSize: 13, letterSpacing: 2 }}>TRIẾT HỌC MÁC–LÊNiN • CHƯƠNG 6</span>
        </div>

        {/* Title */}
        <div style={{ opacity: titleVisible ? 1 : 0, transform: titleVisible ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.7s ease' }}>
          <h1 className="neon-text" style={{ color: '#00d4ff', fontSize: 'clamp(28px, 5vw, 52px)', marginBottom: 8, letterSpacing: 1 }}>
            TRÍ TUỆ NHÂN TẠO
          </h1>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(22px, 4vw, 42px)', marginBottom: 8 }}>
            &
          </h1>
          <h1 className="gold-text" style={{ color: '#f59e0b', fontSize: 'clamp(22px, 4vw, 42px)', marginBottom: 24 }}>
            NGƯỜI LAO ĐỘNG
          </h1>
        </div>

        {/* Subtitle */}
        <div style={{ opacity: subtitleVisible ? 1 : 0, transform: subtitleVisible ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s ease' }}>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(14px, 2vw, 18px)', lineHeight: 1.7, marginBottom: 12 }}>
            Khám phá sự biến đổi bản chất của lao động trong kỷ nguyên số
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(12px, 1.5vw, 15px)', marginBottom: 40 }}>
            Qua 4 màn chơi tương tác • Lý luận Mác về giá trị • Chiến lược Việt Nam 2045
          </p>

          {/* Feature chips */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            {[
              { icon: '⚖️', text: 'Phân loại Lao Động', color: '#00d4ff' },
              { icon: '🏭', text: 'Nhà máy Số', color: '#8b5cf6' },
              { icon: '🧠', text: 'Câu đố Giá trị', color: '#f59e0b' },
              { icon: '🇻🇳', text: 'Việt Nam 2045', color: '#10b981' },
            ].map((chip, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: `1px solid ${chip.color}33`, borderRadius: 25, padding: '8px 16px' }}>
                <span>{chip.icon}</span>
                <span style={{ color: chip.color, fontSize: 13 }}>{chip.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ opacity: btnVisible ? 1 : 0, transform: btnVisible ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.5s ease' }}>
          <button
            className="btn-cyan"
            onClick={onStart}
            style={{
              padding: '16px 48px',
              borderRadius: 50,
              fontSize: 18,
              letterSpacing: 1,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>🚀 BẮT ĐẦU HÀNH TRÌNH</span>
          </button>

          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>
            Thời gian: ~10 phút • 4 màn chơi • Có giải thích lý thuyết
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, #00d4ff, #f59e0b, #8b5cf6, transparent)',
      }} />
    </div>
  );
}
