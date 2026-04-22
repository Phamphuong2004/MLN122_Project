import React from 'react';

interface Props {
  stage: number;
  title: string;
  subtitle: string;
  progress: number;
  color: string;
}

const STAGE_ICONS = ['⚖️', '🏭', '🧠', '🇻🇳'];
const STAGE_NAMES = ['Phân Loại Lao Động', 'Nhà Máy Số', 'Câu Đố Giá Trị', 'Việt Nam 2045'];

export default function GameHeader({ stage, title, subtitle, progress, color }: Props) {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', width: '100%', paddingBottom: 24 }}>
      {/* Top bar with stage indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STAGE_NAMES.map((name, i) => {
          const stageNum = i + 1;
          const isActive = stageNum === stage;
          const isDone = stageNum < stage;
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: isActive ? `${color}20` : isDone ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive ? color : isDone ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 0.3s',
            }}>
              <span style={{ fontSize: 14 }}>{STAGE_ICONS[i]}</span>
              <span style={{ fontSize: 12, color: isActive ? color : isDone ? '#10b981' : 'rgba(255,255,255,0.3)', display: 'none', whiteSpace: 'nowrap' }}
                className="hidden-mobile">
                {name}
              </span>
              {isDone && <span style={{ color: '#10b981', fontSize: 12 }}>✓</span>}
              {isActive && <span style={{ color, fontSize: 12 }}>●</span>}
            </div>
          );
        })}
      </div>

      {/* Title section */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ display: 'inline-block', background: `${color}15`, border: `1px solid ${color}44`, borderRadius: 20, padding: '5px 18px', marginBottom: 12 }}>
          <span style={{ color, fontSize: 12, letterSpacing: 2 }}>MÀN {stage} / 4</span>
        </div>
        <h2 style={{ color: 'white', marginBottom: 6, fontSize: 'clamp(20px, 3vw, 28px)' }}>{title}</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(13px, 1.8vw, 16px)', margin: 0 }}>{subtitle}</p>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, height: 8, overflow: 'hidden' }}>
        <div className="progress-bar-fill" style={{ height: '100%', width: `${progress}%`, borderRadius: 10, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
    </div>
  );
}
