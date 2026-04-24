import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Play } from "lucide-react";

interface GameRulesModalProps {
  gameTitle: string;
  rules: string[];
  onStart: () => void;
  onClose?: () => void;
}

export default function GameRulesModal({
  gameTitle,
  rules,
  onStart,
  onClose,
}: GameRulesModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <BookOpen size={32} style={{ color: "#3b82f6" }} />
          <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
            {gameTitle}
          </h2>
        </div>

        {/* Rules Content */}
        <div style={{ marginBottom: "24px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#374151" }}>
            📋 Luật chơi:
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {rules.map((rule, idx) => (
              <motion.div
                key={idx}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    minWidth: "24px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    borderRadius: "50%",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {idx + 1}
                </span>
                <p style={{ margin: 0, lineHeight: 1.5, color: "#374151" }}>
                  {rule}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: "12px 16px",
                backgroundColor: "#f0f0f0",
                color: "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              Đóng
            </button>
          )}
          <button
            onClick={onStart}
            style={{
              padding: "12px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <Play size={18} />
            Bắt đầu chơi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
