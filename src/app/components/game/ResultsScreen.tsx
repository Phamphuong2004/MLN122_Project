import React from "react";

// Minimal shape for scores so this file doesn't depend on App exports.
// If you prefer a shared type, we can export/import it from a central types file.
type GameScores = {
  game1: number;
  game2: number;
  game3: number;
  game4: number;
};

interface Props {
  scores: GameScores;
  onRestart: () => void;
}

export default function ResultsScreen({ scores, onRestart }: Props) {
  const game1Pct = Math.round((scores.game1 / 8) * 100);
  const game2Pct = Math.round((scores.game2 / 24) * 100);
  const game3Pct = Math.round((scores.game3 / 6) * 100);
  const game4Pct = Math.round((scores.game4 / 100) * 100);
  const overall = Math.round((game1Pct + game2Pct + game3Pct + game4Pct) / 4);

  return (
    <div style={{ padding: 20 }}>
      <h2>Kết quả</h2>
      <p>Điểm tổng: {overall}%</p>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button
          onClick={onRestart}
          style={{ padding: "8px 12px", borderRadius: 8 }}
        >
          🔄 Chơi lại
        </button>
      </div>
      <hr style={{ margin: "16px 0" }} />
      <h3>Tóm tắt</h3>
      <ul>
        <li>Phân loại lao động: {game1Pct}%</li>
        <li>Nhà máy số: {game2Pct}%</li>
        <li>Câu đố giá trị: {game3Pct}%</li>
        <li>Việt Nam 2045: {game4Pct}%</li>
      </ul>
    </div>
  );
}
