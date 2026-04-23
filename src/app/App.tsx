import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RPGGame, { Phase, Character } from "./components/rpg/RPGGame";
import FloatingNavbar from "./components/ui/FloatingNavbar";

// ── HomeScreen (Trang chủ thực thụ) ──
function HomeScreen({
  onNavigate,
}: {
  onNavigate: (p: Phase, s?: number) => void;
}) {
  const gameEntries = [
    {
      label: "Bản chất lao động",
      desc: "Phân tích Lao động Cụ thể & Trừu tượng trong kỷ nguyên AI.",
      slide: 0,
    },
    {
      label: "Giá trị thặng dư",
      desc: 'Giải mã nguồn gốc của "m" khi máy móc dần thay thế con người.',
      slide: 1,
    },
    {
      label: "Sự biến đổi bản chất",
      desc: "Tư bản bất biến (c) và Tư bản khả biến (v) trong thời đại số.",
      slide: 2,
    },
    {
      label: "Việt Nam 2030",
      desc: "Tầm nhìn phát triển nguồn nhân lực chất lượng cao trong CNH-HĐH.",
      slide: 3,
    },
  ];

  return (
    <motion.div
      className="industrial-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at center, var(--background) 0%, #d5c8b2 100%)",
      }}
    >
      {/* Background Decorative Glow */}
      <div
        className="animate-pulse"
        style={{
          position: "absolute",
          top: "10%",
          right: "10%",
          width: "30%",
          height: "30%",
          background: "var(--primary)",
          filter: "blur(120px)",
          opacity: 0.03,
          borderRadius: "50%",
        }}
      />

      <div
        style={{
          zIndex: 10,
          maxWidth: 1200,
          width: "100%",
          textAlign: "center",
        }}
        className="fade-in"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            border: "1px solid var(--primary)",
            padding: "6px 20px",
            display: "inline-block",
            marginBottom: 32,
            background: "rgba(165, 28, 48, 0.05)",
            boxShadow: "0 0 20px rgba(165, 28, 48, 0.1)",
            borderRadius: "2px",
          }}
        >
          <span
            style={{
              color: "var(--primary)",
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Dự án nghiên cứu triết học số
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontSize: "clamp(42px, 6vw, 72px)",
            color: "var(--primary)",
            marginBottom: 40,
            textTransform: "uppercase",
            lineHeight: 0.9,
            fontWeight: 900,
            fontFamily: "var(--font-slab)",
          }}
        >
          Giác Ngộ <span className="text-glow">Số</span>
          <br />
          <span
            style={{
              color: "var(--foreground)",
              fontSize: "0.45em",
              letterSpacing: 4,
              fontWeight: 700,
            }}
          >
            Bản chất giá trị trong kỷ nguyên AI
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            width: 80,
            height: 6,
            background: "var(--primary)",
            margin: "0 auto 48px",
            boxShadow: "0 0 15px var(--primary)",
          }}
        />

        {/* Marx Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            maxWidth: 800,
            margin: "0 auto 60px",
            position: "relative",
            padding: "32px",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--foreground)",
              fontSize: "clamp(18px, 2.5vw, 24px)",
              lineHeight: 1.6,
              fontWeight: 500,
              opacity: 0.9,
            }}
          >
            "Tư bản là lao động đã chết, nó chỉ sống lại như một con quỷ hút máu
            bằng cách hút lao động sống, và nó càng sống mạnh khi nó càng hút
            được nhiều lao động sống hơn."
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: "900",
              marginTop: 24,
              color: "var(--primary)",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            — Karl Marx, Bộ Tư Bản (Quyển I)
          </div>
        </motion.div>

        {/* Section Title: Game Modules */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          style={{
            textAlign: "left",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 16,
            opacity: 0.8,
          }}
        >
          <span
            style={{
              color: "var(--primary)",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            Truy cập nhanh học liệu
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </motion.div>

        {/* Game Navigation Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
            marginBottom: 60,
            textAlign: "left",
          }}
        >
          {gameEntries.map((item, i) => (
            <motion.div
              key={i}
              onClick={() => onNavigate("intro_slides", item.slide)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="glass-industrial"
              style={{
                padding: "24px",
                borderLeft: "4px solid var(--primary)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--secondary)";
                e.currentTarget.style.background = "rgba(165, 28, 48, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.background = "var(--glass-bg)";
              }}
            >
              <div
                style={{
                  color: "var(--primary)",
                  fontSize: 14,
                  fontWeight: 900,
                  marginBottom: 12,
                  fontFamily: "var(--font-slab)",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 18 }}>✦</span> {item.label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "var(--foreground)",
                  fontFamily: "var(--font-serif)",
                  fontWeight: 500,
                  opacity: 0.85,
                }}
              >
                {item.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Project Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
            textAlign: "left",
            opacity: 0.8,
          }}
        >
          {[
            {
              tag: "MỤC TIÊU",
              content:
                "Làm sáng tỏ sự biến đổi của phạm trù lao động trước sự trỗi dậy của trí tuệ nhân tạo.",
            },
            {
              tag: "PHƯƠNG PHÁP",
              content:
                "Sử dụng phương pháp duy vật biện chứng để phân tích quan hệ sản xuất số.",
            },
            {
              tag: "KẾT QUẢ",
              content:
                "Khẳng định vai trò không thể thay thế của con người trong việc tạo ra giá trị thặng dư.",
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}
            >
              <div
                style={{
                  color: "var(--primary)",
                  fontSize: 11,
                  fontWeight: 900,
                  marginBottom: 8,
                }}
              >
                {item.tag}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.8 }}>
                {item.content}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            marginTop: 60,
            opacity: 0.5,
            fontSize: 11,
            fontWeight: "900",
            letterSpacing: 2,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{ height: 1, width: 30, background: "var(--foreground)" }}
          />
          MLN122 · BÀI TẬP LỚN CHƯƠNG 6 · NHÓM SÁNG TẠO SỐ
          <div
            style={{ height: 1, width: 30, background: "var(--foreground)" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── App ──
export default function App() {
  const [activeTab, setActiveTab] = useState<"home" | "game">("home");
  const [globalPhase, setGlobalPhase] = useState<Phase>("landing");
  const [globalSlideIndex, setGlobalSlideIndex] = useState(0);
  const [character, setCharacter] = useState<Character | null>(null);

  const handleNavigate = (p: Phase, s?: number) => {
    setActiveTab("game");
    setGlobalPhase(p);
    if (s !== undefined) setGlobalSlideIndex(s);
  };

  const handleHome = () => {
    setActiveTab("home");
    setCharacter(null);
    setGlobalPhase("landing");
    setGlobalSlideIndex(0);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        paddingTop: "64px",
      }}
    >
      {/* Global Navbar */}
      <FloatingNavbar
        currentPhase={globalPhase}
        currentSlide={globalSlideIndex}
        onNavigate={handleNavigate}
        onHome={handleHome}
        isStarted={activeTab === "game"}
        character={character}
      />

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .fade-in{animation:fadeIn 1s ease forwards}
        
        .industrial-card {
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: 4px 4px 0 var(--border);
          transition: all 0.2s;
        }
        .industrial-card:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 var(--border);
          border-color: var(--primary);
        }
        
        .btn-primary {
          background: var(--primary);
          color: white;
          border: 1px solid var(--border);
          box-shadow: 4px 4px 0 var(--border);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          transform: translate(-1px, -1px);
          box-shadow: 5px 5px 0 var(--border);
        }

        ::-webkit-scrollbar{width:8px}
        ::-webkit-scrollbar-track{background: var(--background)}
        ::-webkit-scrollbar-thumb{background: var(--border)}
      `}</style>

      <AnimatePresence mode="wait">
        {activeTab === "home" ? (
          <HomeScreen key="home" onNavigate={handleNavigate} />
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <RPGGame
              onExit={handleHome}
              externalPhase={globalPhase}
              setExternalPhase={setGlobalPhase}
              externalSlideIndex={globalSlideIndex}
              setExternalSlideIndex={setGlobalSlideIndex}
              character={character}
              setCharacter={setCharacter}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
