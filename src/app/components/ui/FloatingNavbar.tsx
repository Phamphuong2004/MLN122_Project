import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phase, Character } from "../rpg/RPGGame";

// ── Types ──
interface NavItem {
  label: string;
  phase: string;
  slideIndex?: number;
  icon: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface FloatingNavbarProps {
  currentPhase: Phase;
  currentSlide: number;
  onNavigate: (phase: Phase, slideIndex?: number) => void;
  onHome: () => void;
  isStarted: boolean;
  character?: Character | null;
}

// ── Navigation Data ──
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Hệ thống",
    items: [{ label: "Trang chủ", phase: "home", icon: "🏠" }],
  },
  {
    label: "Cơ sở lý luận",
    items: [
      { label: "Bản chất", phase: "intro_slides", slideIndex: 0, icon: "📜" },
      { label: "Giá trị", phase: "intro_slides", slideIndex: 1, icon: "💎" },
      { label: "Thặng dư", phase: "intro_slides", slideIndex: 2, icon: "📈" },
      { label: "Việt Nam", phase: "intro_slides", slideIndex: 3, icon: "🇻🇳" },
    ],
  },
  {
    label: "Phụ lục",
    items: [{ label: "AI Usage", phase: "ai_usage", icon: "⚙️" }],
  },
  {
    label: "Mô phỏng",
    items: [{ label: "Trò chơi", phase: "landing", icon: "🎮" }],
  },
];

export default function FloatingNavbar({
  currentPhase,
  currentSlide,
  onNavigate,
  onHome,
  isStarted,
  character,
}: FloatingNavbarProps) {
  // Game-related phases should all trigger 'Trò chơi' as active
  const isGamePhase = (p: string) =>
    ["landing", "scene", "battle", "management", "feedback", "create"].includes(
      p,
    );

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "64px",
        background: "rgba(12, 12, 14, 0.9)",
        backdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        zIndex: 2000,
        fontFamily: "var(--font-sans, Inter, system-ui, sans-serif)",
      }}
    >
      {/* ── Brand Section ── */}
      <div
        onClick={onHome}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer",
          minWidth: "200px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            borderRadius: "4px",
            boxShadow: "0 0 15px rgba(165, 28, 48, 0.4)",
            transform: "rotate(-5deg)",
          }}
        >
          ☭
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              color: "#fff",
              fontWeight: "800",
              fontSize: "15px",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              fontFamily: "var(--font-slab, Arvo, serif)",
            }}
          >
            Giác Ngộ Số
          </span>
          <span
            style={{
              color: "var(--primary)",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "1px",
              opacity: 0.8,
            }}
          >
            DIALECTICAL AI RPG
          </span>
        </div>
      </div>

      {/* ── Navigation Hub ── */}
      <nav
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "40px",
        }}
      >
        {NAV_GROUPS.map((group, gIdx) => (
          <div
            key={gIdx}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.2)",
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: "1px",
                whiteSpace: "nowrap",
              }}
            >
              {group.label}
            </span>
            <div
              style={{
                display: "flex",
                gap: "4px",
                background: "rgba(255,255,255,0.03)",
                padding: "4px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.05)",
                position: "relative",
              }}
            >
              {group.items.map((item, i) => {
                const isItemHome = item.phase === "home";
                const isItemGame = isGamePhase(item.phase);
                const isActive = isItemHome
                  ? !isStarted
                  : isStarted &&
                    ((isItemGame && isGamePhase(currentPhase)) ||
                      (!isItemGame &&
                        !isItemHome &&
                        currentPhase === item.phase &&
                        (item.slideIndex === undefined ||
                          currentSlide === item.slideIndex)));

                return (
                  <button
                    key={`${gIdx}-${i}`}
                    onClick={() => {
                      if (isItemHome) onHome();
                      else onNavigate(item.phase as Phase, item.slideIndex);
                    }}
                    style={{
                      position: "relative",
                      padding: "8px 16px",
                      border: "none",
                      background: "transparent",
                      color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: "12px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      borderRadius: "6px",
                      zIndex: 1,
                    }}
                  >
                    <span>{item.icon}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>

                    {isActive && (
                      <motion.div
                        layoutId="nav-highlight"
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(165, 28, 48, 0.9)",
                          borderRadius: "6px",
                          zIndex: -1,
                          boxShadow: "0 4px 12px rgba(165, 28, 48, 0.3)",
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Status Dashboard ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: "240px",
          justifyContent: "flex-end",
        }}
      >
        {character ? (
          <div
            style={{
              display: "flex",
              gap: "12px",
              background: "rgba(255,255,255,0.04)",
              padding: "6px 14px",
              borderRadius: "100px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <StatItem
              icon="💰"
              value={character.stats.wealth}
              label="Vốn"
              color="var(--secondary)"
            />
            <StatItem
              icon="🧠"
              value={character.stats.knowledge}
              label="Lý luận"
              color="#4caf50"
            />
            <StatItem
              icon="✊"
              value={character.stats.willpower}
              label="Ý chí"
              color="#f44336"
            />
          </div>
        ) : (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
              fontWeight: "700",
              textTransform: "uppercase",
            }}
          >
            Chưa khởi tạo hồ sơ
          </div>
        )}

        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "all 0.2s",
            fontSize: "18px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
          }
        >
          ⚙️
        </div>
      </div>

      {/* ── Bottom Neon Accent ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent 0%, var(--primary) 50%, transparent 100%)",
          opacity: 0.4,
        }}
      />
    </header>
  );
}

function StatItem({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: "6px" }}
      title={label}
    >
      <span style={{ fontSize: "14px" }}>{icon}</span>
      <span style={{ fontWeight: "800", color: "#fff", fontSize: "13px" }}>
        {value}
      </span>
    </div>
  );
}
