import React, { useState } from 'react';
import GameHeader from './GameHeader';

interface Props {
  onComplete: (score: number) => void;
}

interface PolicyChoice {
  id: string;
  icon: string;
  label: string;
  detail: string;
  points: number;
  color: string;
  consequence: string;
  marxLink: string;
}

interface PolicyRound {
  id: number;
  area: string;
  areaIcon: string;
  scenario: string;
  stat: string;
  choices: PolicyChoice[];
}

const POLICY_ROUNDS: PolicyRound[] = [
  {
    id: 1,
    area: 'GIÁO DỤC & ĐÀO TẠO',
    areaIcon: '🎓',
    scenario: 'Bạn là Bộ trưởng GD&ĐT năm 2025. Dự báo đến 2030, 47% công việc Việt Nam có nguy cơ bị tự động hóa. Ngân sách bổ sung 10.000 tỷ đồng – bạn đầu tư vào đâu?',
    stat: '47% việc làm có nguy cơ bị AI thay thế vào 2030',
    choices: [
      {
        id: 'A', icon: '💻', label: 'Chuyển đổi số toàn diện: STEM, AI, kỹ năng số cho 100% trường học',
        detail: 'Đầu tư hạ tầng số, đào tạo giáo viên STEM, chương trình quốc gia về AI',
        points: 25, color: '#00d4ff',
        consequence: '✅ Xuất sắc! Việt Nam có 2 triệu lao động kỹ năng số vào 2030. GDP tăng 8.5%. Cạnh tranh được với công nghệ nước ngoài.',
        marxLink: 'Theo Mác: Đào tạo "lao động phức tạp" – mỗi giờ lao động kỹ năng cao = nhiều giờ lao động giản đơn → tạo nhiều giá trị hơn.',
      },
      {
        id: 'B', icon: '🏫', label: 'Nâng cấp cơ sở vật chất trường học truyền thống',
        detail: 'Xây thêm trường, mua sắm thiết bị thông thường, tăng lương giáo viên',
        points: 10, color: '#f59e0b',
        consequence: '⚠️ Cải thiện nhẹ. Nhưng chương trình lạc hậu, học sinh vẫn thiếu kỹ năng số. Không theo kịp yêu cầu thị trường lao động AI.',
        marxLink: 'Cải thiện "lực lượng sản xuất" vật chất nhưng thiếu cải cách "quan hệ sản xuất" và chất lượng lao động.',
      },
      {
        id: 'C', icon: '📋', label: 'Chỉ đào tạo nghề truyền thống, giữ nguyên chương trình phổ thông',
        detail: 'Ưu tiên nghề truyền thống, không thay đổi chương trình đại trà',
        points: 2, color: '#ef4444',
        consequence: '❌ Nguy hiểm! Đến 2030 hàng triệu lao động không có kỹ năng phù hợp. Việt Nam tụt hậu, phụ thuộc công nghệ nước ngoài.',
        marxLink: 'Vi phạm quy luật phát triển: lực lượng sản xuất (AI) tiến về phía trước nhưng quan hệ đào tạo không theo kịp → mâu thuẫn nội tại.',
      },
    ],
  },
  {
    id: 2,
    area: 'BẢO VỆ NGƯỜI LAO ĐỘNG',
    areaIcon: '🛡️',
    scenario: 'Làn sóng robot hóa khiến 500.000 công nhân dệt may, điện tử mất việc trong 2 năm. Quốc hội đề xuất 3 phương án xử lý. Bạn bỏ phiếu cho phương án nào?',
    stat: '500.000 công nhân mất việc trong 2 năm do tự động hóa',
    choices: [
      {
        id: 'A', icon: '🔄', label: 'Quỹ tái đào tạo nghề + trợ cấp chuyển đổi 24 tháng',
        detail: 'Thành lập Quỹ Robot Hóa (đánh thuế doanh nghiệp tự động hóa), hỗ trợ đào tạo lại, trợ cấp sinh hoạt trong thời gian chuyển đổi',
        points: 25, color: '#10b981',
        consequence: '✅ Xuất sắc! 80% công nhân tìm được việc mới trong 18 tháng. Ổn định xã hội, giảm bất bình đẳng. Mô hình được quốc tế ca ngợi.',
        marxLink: 'Giải quyết mâu thuẫn tư bản – lao động bằng phân phối lại thành quả tự động hóa. Đúng tinh thần "không để ai bỏ lại phía sau" trong CNH-HĐH.',
      },
      {
        id: 'B', icon: '🚫', label: 'Cấm hoặc hạn chế doanh nghiệp sử dụng robot trong 5 năm',
        detail: 'Ban hành luật giới hạn tỷ lệ robot/người tối đa 20% trong dây chuyền sản xuất',
        points: 5, color: '#f59e0b',
        consequence: '⚠️ Ngắn hạn ổn định việc làm, nhưng doanh nghiệp mất cạnh tranh quốc tế. FDI rút lui. Kinh tế trì trệ dài hạn.',
        marxLink: 'Cố kìm hãm sự phát triển của "lực lượng sản xuất" – vi phạm quy luật lịch sử. Không thể ngăn được tiến bộ kỹ thuật, chỉ trì hoãn.',
      },
      {
        id: 'C', icon: '💸', label: 'Để thị trường tự điều tiết, không can thiệp',
        detail: 'Tin vào "bàn tay vô hình" – thị trường sẽ tự tạo ra cơ hội việc làm mới',
        points: 3, color: '#ef4444',
        consequence: '❌ Tệ! Bất bình đẳng tăng vọt, tội phạm và bất ổn xã hội leo thang. Phong trào công nhân nổi dậy. Tăng trưởng kinh tế sụp đổ.',
        marxLink: 'Kinh tế tư bản thả nổi luôn tạo ra "đội quân thất nghiệp công nghiệp" (Marx). Nhà nước XHCN cần can thiệp để bảo vệ quyền lợi người lao động.',
      },
    ],
  },
  {
    id: 3,
    area: 'PHÁT TRIỂN CÔNG NGHỆ',
    areaIcon: '🚀',
    scenario: 'Chính phủ có 50.000 tỷ đồng ngân sách đặc biệt cho chiến lược công nghệ đến 2030. Ba tập đoàn lớn đề xuất 3 phương án hợp tác. Bạn chọn phương án nào?',
    stat: '50.000 tỷ đồng ngân sách công nghệ quốc gia',
    choices: [
      {
        id: 'A', icon: '🔬', label: 'Xây dựng hệ sinh thái AI "Made in Vietnam"',
        detail: 'Thành lập VinAI Research, FPT AI Lab quốc gia, trung tâm dữ liệu Việt Nam, chương trình 10.000 kỹ sư AI cấp cao',
        points: 25, color: '#00d4ff',
        consequence: '✅ Xuất sắc! Việt Nam có AI stack riêng đến 2030. Không lệ thuộc công nghệ nước ngoài. Xuất khẩu phần mềm đạt 10 tỷ USD. Sở hữu phương tiện sản xuất số!',
        marxLink: 'Sở hữu "phương tiện sản xuất" thế hệ mới (AI, dữ liệu, hạ tầng số). Theo Mác, ai kiểm soát tư liệu sản xuất, người đó nắm quyền lực kinh tế.',
      },
      {
        id: 'B', icon: '🌏', label: 'Hợp tác nhập khẩu AI từ Mỹ, EU, Nhật Bản',
        detail: 'Mua license công nghệ Google Cloud, Microsoft Azure, Amazon AWS, ký thỏa thuận chuyển giao công nghệ',
        points: 12, color: '#f59e0b',
        consequence: '⚠️ Nhanh chóng có AI nhưng phụ thuộc hoàn toàn. Giá trị gia tăng chảy ra nước ngoài. Dữ liệu người Việt bị kiểm soát bởi tập đoàn nước ngoài.',
        marxLink: 'Rơi vào "quan hệ sản xuất" lệ thuộc: Việt Nam cung cấp lao động và tài nguyên số, nước ngoài nắm tư liệu sản xuất AI → mất chủ quyền kinh tế số.',
      },
      {
        id: 'C', icon: '🏗️', label: 'Ưu tiên hạ tầng vật chất: cảng, đường, điện',
        detail: 'Tiếp tục đầu tư cơ sở hạ tầng truyền thống, để công nghệ số tự phát triển sau',
        points: 5, color: '#8b5cf6',
        consequence: '⚠️ Hạ tầng vật chất tốt hơn nhưng bỏ lỡ cuộc cách mạng số. Đến 2030 Việt Nam tụt hậu 10-15 năm so với các nước cùng khu vực về kinh tế số.',
        marxLink: 'Hạ tầng vật chất quan trọng nhưng trong thế kỷ 21, "lực lượng sản xuất" chủ yếu là dữ liệu, AI và lao động tri thức – không thể bỏ qua.',
      },
    ],
  },
  {
    id: 4,
    area: 'PHÂN PHỐI & AN SINH',
    areaIcon: '⚖️',
    scenario: 'AI và robot tạo ra lợi nhuận khổng lồ cho một nhóm nhỏ chủ sở hữu công nghệ, trong khi nhiều người lao động thu nhập giảm. Bạn đề xuất cơ chế phân phối nào?',
    stat: 'Top 1% dân số sở hữu 40% thu nhập từ tự động hóa',
    choices: [
      {
        id: 'A', icon: '🤝', label: 'Thuế robot + Thu nhập cơ bản toàn cầu (UBI)',
        detail: 'Đánh thuế 10-20% lợi nhuận từ tự động hóa, lập Quỹ An Sinh Số, trả UBI 3 triệu/tháng cho công dân từ 18-60 tuổi không có việc làm',
        points: 25, color: '#10b981',
        consequence: '✅ Xuất sắc! Bất bình đẳng thu hẹp. Người lao động có an toàn tài chính để học nghề mới. Tiêu dùng nội địa tăng, kinh tế ổn định bền vững.',
        marxLink: 'Phân phối "theo lao động" + an sinh xã hội – đúng định hướng XHCN. Thành quả của lực lượng sản xuất (AI/robot) phải được phân phối công bằng cho xã hội.',
      },
      {
        id: 'B', icon: '📈', label: 'Ưu đãi thuế mạnh để thu hút FDI công nghệ cao',
        detail: 'Miễn thuế 10 năm cho doanh nghiệp AI, tạo điều kiện tối đa để tư nhân làm giàu từ công nghệ',
        points: 8, color: '#f59e0b',
        consequence: '⚠️ Thu hút được FDI ngắn hạn nhưng bất bình đẳng tăng mạnh. Lợi nhuận chủ yếu ra nước ngoài. Xã hội phân cực nguy hiểm.',
        marxLink: 'Chiến lược "nhỏ giọt" (trickle-down) thực tế không hoạt động. Mác phân tích: tư bản luôn có xu hướng tập trung, không tự phân phối về phía lao động.',
      },
      {
        id: 'C', icon: '🏛️', label: 'Quốc hữu hóa các nền tảng AI lớn',
        detail: 'Nhà nước trực tiếp quản lý và vận hành các hệ thống AI, dữ liệu quốc gia',
        points: 10, color: '#8b5cf6',
        consequence: '⚠️ Bảo đảm chủ quyền số nhưng có thể kém hiệu quả nếu quản lý quan liêu. Cần cân bằng giữa quản lý nhà nước và sự sáng tạo của tư nhân.',
        marxLink: 'Kiểm soát tư liệu sản xuất số (AI) là hướng đi đúng theo Mác. Nhưng cần cơ chế quản trị hiệu quả, tránh bộ máy quan liêu không linh hoạt.',
      },
    ],
  },
];

export default function VietnamGame({ onComplete }: Props) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<PolicyChoice | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [choiceHistory, setChoiceHistory] = useState<PolicyChoice[]>([]);

  const round = POLICY_ROUNDS[roundIndex];
  const progress = (roundIndex / POLICY_ROUNDS.length) * 100;

  const handleSelect = (choice: PolicyChoice) => {
    if (showResult) return;
    setSelectedChoice(choice);
  };

  const handleConfirm = () => {
    if (!selectedChoice) return;
    setTotalScore(s => s + selectedChoice.points);
    setChoiceHistory(h => [...h, selectedChoice]);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedChoice(null);
    if (roundIndex < POLICY_ROUNDS.length - 1) {
      setRoundIndex(i => i + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const maxScore = 100;
    const pct = Math.round((totalScore / maxScore) * 100);
    const grade = pct >= 90 ? 'Xuất sắc' : pct >= 75 ? 'Tốt' : pct >= 60 ? 'Khá' : 'Cần cải thiện';
    const gradeIcon = pct >= 90 ? '🏆' : pct >= 75 ? '🌟' : pct >= 60 ? '📈' : '📚';
    const gradeColor = pct >= 90 ? '#10b981' : pct >= 75 ? '#00d4ff' : pct >= 60 ? '#f59e0b' : '#ef4444';

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="scale-in glass-card" style={{ maxWidth: 600, width: '100%', borderRadius: 24, padding: 40, border: '1px solid rgba(16,185,129,0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>{gradeIcon}</div>
            <h2 style={{ color: '#10b981', marginBottom: 8 }}>Màn 4 Hoàn Thành!</h2>
            <h3 style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>Việt Nam 2045 – Chiến lược gia</h3>
            <div style={{ color: gradeColor, fontSize: 56, fontWeight: 'bold', lineHeight: 1 }}>{totalScore}/{maxScore}</div>
            <div style={{ color: gradeColor, fontSize: 20, marginTop: 4 }}>{grade}</div>
          </div>

          {/* Summary of choices */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 12, letterSpacing: 1 }}>CÁC QUYẾT SÁCH ĐÃ CHỌN:</div>
            {choiceHistory.map((choice, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, marginBottom: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${choice.color}33` }}>
                <span style={{ fontSize: 20 }}>{choice.icon}</span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, flex: 1 }}>{choice.label}</span>
                <span style={{ color: choice.points >= 20 ? '#10b981' : choice.points >= 10 ? '#f59e0b' : '#ef4444', fontWeight: 'bold', fontSize: 14 }}>+{choice.points}</span>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <p style={{ color: '#10b981', fontSize: 13, marginBottom: 6, fontWeight: 'bold' }}>🇻🇳 Kết luận cho Việt Nam:</p>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Việt Nam cần chiến lược "3 Cùng": Cùng phát triển công nghệ AI Made in Vietnam + Cùng bảo vệ người lao động chuyển đổi + Cùng phân phối thành quả công bằng. Đây là sự vận dụng sáng tạo lý luận Mác vào thực tiễn CNH–HĐH thời đại số.
            </p>
          </div>

          <button className="btn-green" onClick={() => onComplete(totalScore)} style={{ padding: '14px 40px', borderRadius: 50, fontSize: 16, width: '100%' }}>
            🏆 Xem Kết Quả Tổng Hợp →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <GameHeader stage={4} title="Việt Nam 2045" subtitle="Bạn là nhà hoạch định chính sách – Định hướng Việt Nam trong kỷ nguyên AI" progress={progress} color="#10b981" />

        {/* Round header */}
        <div className="glass-card" style={{ borderRadius: 16, padding: 20, marginBottom: 20, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 32 }}>{round.areaIcon}</span>
            <div>
              <div style={{ color: '#10b981', fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>LĨNH VỰC {roundIndex + 1}/{POLICY_ROUNDS.length}</div>
              <div style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{round.area}</div>
            </div>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>{round.scenario}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ color: '#ef4444', fontSize: 13 }}>📊 {round.stat}</span>
          </div>
        </div>

        {/* Choices */}
        {!showResult ? (
          <>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>Chọn chính sách của bạn:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {round.choices.map((choice) => (
                <div
                  key={choice.id}
                  onClick={() => handleSelect(choice)}
                  className="card-hover"
                  style={{
                    borderRadius: 14,
                    padding: 20,
                    border: `1px solid ${selectedChoice?.id === choice.id ? choice.color : 'rgba(255,255,255,0.1)'}`,
                    background: selectedChoice?.id === choice.id ? `${choice.color}12` : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ fontSize: 28, flexShrink: 0 }}>{choice.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: choice.color, fontWeight: 'bold', marginBottom: 6, fontSize: 15 }}>
                        Phương án {choice.id}: {choice.label}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>{choice.detail}</div>
                    </div>
                    {selectedChoice?.id === choice.id && (
                      <div style={{ color: choice.color, fontSize: 24, flexShrink: 0 }}>✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn-green"
              onClick={handleConfirm}
              disabled={!selectedChoice}
              style={{ padding: '14px 32px', borderRadius: 50, fontSize: 15, opacity: selectedChoice ? 1 : 0.4, cursor: selectedChoice ? 'pointer' : 'not-allowed', width: '100%' }}
            >
              Ban hành chính sách →
            </button>
          </>
        ) : (
          <div className="fade-in">
            {/* Consequence */}
            <div style={{
              background: `${selectedChoice!.color}10`,
              border: `1px solid ${selectedChoice!.color}44`,
              borderRadius: 16,
              padding: 22,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{selectedChoice!.icon}</span>
                <div>
                  <div style={{ color: selectedChoice!.color, fontWeight: 'bold', fontSize: 15, marginBottom: 4 }}>
                    Phương án {selectedChoice!.id} được ban hành
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{selectedChoice!.detail}</div>
                </div>
                <div style={{ flexShrink: 0, background: selectedChoice!.points >= 20 ? 'rgba(16,185,129,0.2)' : selectedChoice!.points >= 10 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)', borderRadius: 12, padding: '8px 14px', textAlign: 'center' }}>
                  <div style={{ color: selectedChoice!.points >= 20 ? '#10b981' : selectedChoice!.points >= 10 ? '#f59e0b' : '#ef4444', fontSize: 20, fontWeight: 'bold' }}>+{selectedChoice!.points}</div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>điểm</div>
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  {selectedChoice!.consequence}
                </p>
              </div>
            </div>

            {/* Marx analysis */}
            <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderLeft: '4px solid #f59e0b', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 'bold', marginBottom: 6 }}>📚 Liên hệ lý luận Mác:</p>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {selectedChoice!.marxLink}
              </p>
            </div>

            <button className="btn-green" onClick={handleNext} style={{ padding: '14px 32px', borderRadius: 50, fontSize: 15, width: '100%' }}>
              {roundIndex < POLICY_ROUNDS.length - 1 ? `Lĩnh vực tiếp theo →` : 'Xem kết quả →'}
            </button>
          </div>
        )}

        {/* Score tracker */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#10b981', fontSize: 14 }}>Tổng điểm hiện tại: {totalScore}/{roundIndex * 25} điểm</span>
        </div>
      </div>
    </div>
  );
}
