import React, { useState } from 'react';
import GameHeader from './GameHeader';

interface Props {
  onComplete: (score: number) => void;
}

interface FactoryState {
  workers: number;
  robots: number;
  profit: number;
  surplusValue: number;
  unemployment: number;
  socialScore: number;
  round: number;
}

interface Decision {
  id: string;
  label: string;
  icon: string;
  color: string;
  effect: Partial<FactoryState>;
  description: string;
  marxNote: string;
}

const INITIAL_STATE: FactoryState = {
  workers: 10,
  robots: 2,
  profit: 40,
  surplusValue: 60,
  unemployment: 5,
  socialScore: 70,
  round: 1,
};

const ROUNDS: Array<{ title: string; scenario: string; decisions: Decision[] }> = [
  {
    title: 'Vòng 1: Làn sóng tự động hóa',
    scenario: 'Công ty đối thủ vừa thay toàn bộ dây chuyền bằng robot, giá thành giảm 30%. Bạn phải quyết định chiến lược cho nhà máy trong năm tới.',
    decisions: [
      {
        id: 'A', label: 'Thay 5 công nhân bằng robot', icon: '🤖',
        color: '#ef4444',
        effect: { workers: -5, robots: 5, profit: 25, surplusValue: -15, unemployment: 20, socialScore: -20 },
        description: 'Tăng lợi nhuận ngắn hạn, giảm chi phí lao động',
        marxNote: 'Tư bản thay thế lao động sống bằng lao động chết (máy móc). Lợi nhuận tăng nhưng nguồn sinh ra giá trị thặng dư thu hẹp!',
      },
      {
        id: 'B', label: 'Đào tạo lại công nhân về kỹ năng số', icon: '📚',
        color: '#10b981',
        effect: { workers: 0, robots: 2, profit: -5, surplusValue: 10, unemployment: -3, socialScore: 20 },
        description: 'Đầu tư ngắn hạn, nâng cao năng suất lao động',
        marxNote: 'Tăng "lao động phức tạp" – lao động có kỹ năng cao tạo ra nhiều giá trị hơn trong cùng đơn vị thời gian. Đây là hướng bền vững!',
      },
      {
        id: 'C', label: 'Giữ nguyên, chờ xem tình hình', icon: '⏸️',
        color: '#f59e0b',
        effect: { workers: 0, robots: 0, profit: -10, surplusValue: 0, unemployment: 0, socialScore: 0 },
        description: 'Giữ ổn định nhưng mất cạnh tranh',
        marxNote: 'Trong quy luật cạnh tranh tư bản, đứng yên là tụt lùi. Nhà máy dần mất thị phần khi đối thủ tự động hóa.',
      },
    ],
  },
  {
    title: 'Vòng 2: Khủng hoảng việc làm',
    scenario: '30% công nhân trong khu vực mất việc do robot. Chính quyền kêu gọi doanh nghiệp có trách nhiệm xã hội. Bạn sẽ làm gì?',
    decisions: [
      {
        id: 'A', label: 'Lập quỹ hỗ trợ chuyển đổi nghề', icon: '🤝',
        color: '#10b981',
        effect: { workers: 3, robots: 0, profit: -8, surplusValue: 5, unemployment: -15, socialScore: 30 },
        description: 'Đầu tư vào cộng đồng, xây dựng thương hiệu',
        marxNote: 'Giải pháp Mác đề xuất: Phân phối lại thành quả tự động hóa cho người lao động bị thay thế, tránh mâu thuẫn giai cấp leo thang.',
      },
      {
        id: 'B', label: 'Tuyển thêm kỹ sư AI & lập trình viên', icon: '💻',
        color: '#8b5cf6',
        effect: { workers: 2, robots: 3, profit: 15, surplusValue: 8, unemployment: 5, socialScore: 10 },
        description: 'Mở rộng sản xuất với lao động chất lượng cao',
        marxNote: 'Lao động phức tạp (kỹ sư AI) tạo ra nhiều giá trị hơn lao động giản đơn. Nhưng cần giải quyết vấn đề công nhân truyền thống.',
      },
      {
        id: 'C', label: 'Mở rộng robot, tối đa hóa lợi nhuận', icon: '💰',
        color: '#ef4444',
        effect: { workers: -3, robots: 5, profit: 30, surplusValue: -20, unemployment: 25, socialScore: -35 },
        description: 'Tối đa lợi nhuận ngắn hạn, bỏ qua hậu quả',
        marxNote: 'NGUY HIỂM! Khi toàn xã hội tự động hóa, ai sẽ mua hàng? Mâu thuẫn giữa tư bản và lao động leo thang – khủng hoảng kinh tế-xã hội!',
      },
    ],
  },
  {
    title: 'Vòng 3: Tầm nhìn dài hạn',
    scenario: 'Chính phủ ban hành chính sách "Công nghiệp hóa xanh 2045". Doanh nghiệp cần chọn hướng phát triển 10 năm tới.',
    decisions: [
      {
        id: 'A', label: 'Hợp tác với trường ĐH, R&D AI nội địa', icon: '🔬',
        color: '#00d4ff',
        effect: { workers: 5, robots: 3, profit: 20, surplusValue: 20, unemployment: -20, socialScore: 40 },
        description: 'Đầu tư vào tri thức và đổi mới sáng tạo',
        marxNote: 'Tuyệt vời! Phát triển "lực lượng sản xuất" thông qua nghiên cứu khoa học, nâng cao năng suất lao động chung của xã hội – đúng quy luật phát triển lịch sử.',
      },
      {
        id: 'B', label: 'Nhập khẩu công nghệ nước ngoài', icon: '🌍',
        color: '#f59e0b',
        effect: { workers: 0, robots: 5, profit: 10, surplusValue: 0, unemployment: 5, socialScore: -5 },
        description: 'Nhanh chóng nâng cấp nhưng phụ thuộc ngoại lai',
        marxNote: 'Rủi ro: Bị lệ thuộc công nghệ nước ngoài. Giá trị thặng dư chảy ra nước ngoài thông qua chuyển giao bản quyền và lợi nhuận.',
      },
      {
        id: 'C', label: 'Mô hình hợp tác xã: công nhân + AI', icon: '🤝',
        color: '#10b981',
        effect: { workers: 8, robots: 4, profit: 15, surplusValue: 25, unemployment: -25, socialScore: 50 },
        description: 'Chia sẻ lợi ích giữa lao động và tư bản',
        marxNote: 'Lý tưởng nhất! Công nhân cùng kiểm soát phương tiện sản xuất (gồm AI/robot) – giải quyết mâu thuẫn lao động-tư bản theo tinh thần Mác!',
      },
    ],
  },
];

export default function FactoryGame({ onComplete }: Props) {
  const [state, setState] = useState<FactoryState>(INITIAL_STATE);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const currentRound = ROUNDS[roundIndex];
  const progress = (roundIndex / ROUNDS.length) * 100;

  const handleSelect = (decision: Decision) => {
    if (showResult) return;
    setSelectedDecision(decision);
  };

  const handleConfirm = () => {
    if (!selectedDecision) return;
    const e = selectedDecision.effect;
    setState(prev => ({
      ...prev,
      workers: Math.max(0, prev.workers + (e.workers || 0)),
      robots: Math.max(0, prev.robots + (e.robots || 0)),
      profit: Math.min(150, Math.max(0, prev.profit + (e.profit || 0))),
      surplusValue: Math.min(150, Math.max(0, prev.surplusValue + (e.surplusValue || 0))),
      unemployment: Math.min(100, Math.max(0, prev.unemployment + (e.unemployment || 0))),
      socialScore: Math.min(100, Math.max(0, prev.socialScore + (e.socialScore || 0))),
      round: prev.round + 1,
    }));
    // Score based on social + surplusValue balance
    const roundScore = selectedDecision.color === '#10b981' || selectedDecision.color === '#00d4ff' ? 8 : selectedDecision.color === '#f59e0b' || selectedDecision.color === '#8b5cf6' ? 5 : 2;
    setTotalScore(s => s + roundScore);
    setHistory(h => [...h, `V${roundIndex + 1}: ${selectedDecision.label}`]);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedDecision(null);
    if (roundIndex < ROUNDS.length - 1) {
      setRoundIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  const MetricBar = ({ label, value, color, max = 100 }: { label: string; value: number; color: string; max?: number }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{label}</span>
        <span style={{ color, fontSize: 13 }}>{value}{label.includes('Điểm') ? '' : label.includes('CN') || label.includes('Robot') ? ' người/chiếc' : '%'}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 6, height: 8 }}>
        <div style={{ width: `${Math.min(100, (value / max) * 100)}%`, height: '100%', borderRadius: 6, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );

  if (finished) {
    const finalScore = Math.round((totalScore / 24) * 100);
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="scale-in glass-card" style={{ maxWidth: 560, width: '100%', borderRadius: 24, padding: 40, textAlign: 'center', border: '1px solid rgba(139,92,246,0.3)' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{finalScore >= 75 ? '🏆' : finalScore >= 50 ? '⚖️' : '⚠️'}</div>
          <h2 style={{ color: '#8b5cf6', marginBottom: 8 }}>Màn 2 Hoàn Thành!</h2>
          <h3 style={{ color: '#f59e0b', marginBottom: 20 }}>Nhà Máy Số</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: '👷 Công nhân', value: state.workers, color: '#00d4ff' },
              { label: '🤖 Robot', value: state.robots, color: '#8b5cf6' },
              { label: '💰 Lợi nhuận', value: state.profit, color: '#10b981' },
              { label: '🫂 Điểm XH', value: state.socialScore, color: '#f59e0b' },
            ].map((m, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, border: `1px solid ${m.color}33` }}>
                <div style={{ color: m.color, fontSize: 22, fontWeight: 'bold' }}>{m.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{m.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <p style={{ color: '#f59e0b', fontSize: 13, marginBottom: 4 }}>💡 Bài học chính:</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              Tự động hóa tạo ra nghịch lý: tăng lợi nhuận cá nhân nhưng làm cạn kiệt nguồn giá trị thặng dư của toàn xã hội. Giải pháp bền vững là cân bằng công nghệ với trách nhiệm xã hội.
            </p>
          </div>

          <div style={{ color: '#8b5cf6', fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>{totalScore}/24 điểm</div>
          <button className="btn-gold" onClick={() => onComplete(totalScore)} style={{ padding: '14px 40px', borderRadius: 50, fontSize: 16 }}>
            Tiếp tục Màn 3 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <GameHeader stage={2} title="Nhà Máy Số" subtitle="Quản lý nhà máy trong thời đại AI – Cân bằng lợi nhuận và trách nhiệm xã hội" progress={progress} color="#8b5cf6" />

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,260px)', gap: 20 }}>
          {/* Main game area */}
          <div>
            {/* Scenario */}
            <div className="glass-card" style={{ borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ color: '#8b5cf6', fontSize: 13, letterSpacing: 1, marginBottom: 8 }}>📋 {currentRound.title}</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{currentRound.scenario}</p>
            </div>

            {/* Decisions */}
            {!showResult ? (
              <>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>Chọn quyết định của bạn:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {currentRound.decisions.map((decision) => (
                    <div
                      key={decision.id}
                      className="card-hover"
                      onClick={() => handleSelect(decision)}
                      style={{
                        borderRadius: 14,
                        padding: 18,
                        border: `1px solid ${selectedDecision?.id === decision.id ? decision.color : 'rgba(255,255,255,0.1)'}`,
                        background: selectedDecision?.id === decision.id ? `${decision.color}15` : 'rgba(255,255,255,0.03)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        <div style={{ fontSize: 28, flexShrink: 0 }}>{decision.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: decision.color, fontWeight: 'bold', marginBottom: 4, fontSize: 15 }}>
                            {decision.id}. {decision.label}
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{decision.description}</div>
                        </div>
                        {selectedDecision?.id === decision.id && (
                          <div style={{ color: decision.color, fontSize: 20, flexShrink: 0 }}>●</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn-purple"
                  onClick={handleConfirm}
                  disabled={!selectedDecision}
                  style={{ padding: '13px 32px', borderRadius: 50, fontSize: 15, opacity: selectedDecision ? 1 : 0.4, cursor: selectedDecision ? 'pointer' : 'not-allowed', width: '100%' }}
                >
                  Xác nhận quyết định →
                </button>
              </>
            ) : (
              <div className="fade-in">
                {/* Result feedback */}
                <div style={{
                  background: `${selectedDecision!.color}15`,
                  border: `1px solid ${selectedDecision!.color}44`,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 32 }}>{selectedDecision!.icon}</div>
                    <div>
                      <div style={{ color: selectedDecision!.color, fontWeight: 'bold', marginBottom: 8 }}>
                        Bạn đã chọn: {selectedDecision!.label}
                      </div>
                      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                        {selectedDecision!.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderLeft: '4px solid #f59e0b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold', marginBottom: 4 }}>📖 Phân tích theo lý luận Mác:</p>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                    {selectedDecision!.marxNote}
                  </p>
                </div>

                <button className="btn-purple" onClick={handleNext} style={{ padding: '13px 32px', borderRadius: 50, fontSize: 15, width: '100%' }}>
                  {roundIndex < ROUNDS.length - 1 ? `Vòng ${roundIndex + 2} →` : 'Xem kết quả →'}
                </button>
              </div>
            )}
          </div>

          {/* Sidebar - Factory Stats */}
          <div>
            <div className="glass-card" style={{ borderRadius: 16, padding: 20, border: '1px solid rgba(139,92,246,0.2)', position: 'sticky', top: 20 }}>
              <div style={{ color: '#8b5cf6', fontSize: 13, letterSpacing: 1, marginBottom: 16 }}>📊 TRẠNG THÁI NHÀ MÁY</div>

              {/* Factory visualization */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20, background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 12 }}>
                {Array.from({ length: 15 }, (_, i) => {
                  const isWorker = i < state.workers;
                  const isRobot = i >= state.workers && i < state.workers + state.robots;
                  return (
                    <div key={i} style={{ fontSize: 18 }}>
                      {isWorker ? '👷' : isRobot ? '🤖' : '⬜'}
                    </div>
                  );
                })}
              </div>

              <MetricBar label="👷 Công nhân" value={state.workers} max={20} color="#00d4ff" />
              <MetricBar label="🤖 Robot" value={state.robots} max={20} color="#8b5cf6" />
              <MetricBar label="💰 Lợi nhuận" value={state.profit} color="#10b981" />
              <MetricBar label="⚡ Giá trị thặng dư" value={state.surplusValue} color="#f59e0b" />
              <MetricBar label="😟 Thất nghiệp" value={state.unemployment} color="#ef4444" />
              <MetricBar label="🫂 Điểm xã hội" value={state.socialScore} color="#10b981" />

              <div style={{ marginTop: 16, padding: 10, background: 'rgba(245,158,11,0.08)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                <p style={{ color: 'rgba(245,158,11,0.8)', fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                  💡 Chú ý: Khi robot nhiều hơn người, giá trị thặng dư giảm dần – vì chỉ lao động người mới tạo ra giá trị!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}