// src/components/common/Button.jsx
import { useState } from "react";
import { T } from "../../styles/theme";

export function Button({ children, onClick, v = "outline", sm, full, disabled, style: sx = {} }) {
  const [hov, setHov] = useState(false);
  const canHover = hov && !disabled && v !== "ghost";
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: T.radiusSm, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
    border: `3px solid ${T.border}`, transition: "all .12s steps(2, end)", opacity: disabled ? .4 : 1,
    width: full ? "100%" : undefined, padding: sm ? "7px 14px" : "12px 22px",
    fontSize: sm ? 12 : 14, fontFamily: T.font, textTransform: "uppercase",
    boxShadow: disabled ? "none" : canHover ? "6px 6px 0 #000" : "4px 4px 0 #000",
    transform: canHover ? "translate(-2px, -2px)" : "translate(0, 0)",
    filter: canHover ? "brightness(1.08) saturate(1.18)" : undefined,
    ...sx
  };

  const variants = {
    primary: { background: T.primary, color: "#050017", borderColor: "#F6F0FF", textShadow: "1px 1px 0 rgba(255,255,255,0.35)", boxShadow: canHover ? `6px 6px 0 #000, 0 0 18px ${T.primaryGlow}` : base.boxShadow },
    danger: { background: T.danger, color: "#fff", borderColor: "#F6F0FF", boxShadow: canHover ? "6px 6px 0 #000, 0 0 18px rgba(255,43,214,0.5)" : base.boxShadow },
    outline: { background: T.bg2, border: `3px solid ${T.border}`, color: T.text, boxShadow: canHover ? "6px 6px 0 #000, 0 0 16px rgba(123,61,255,0.44)" : base.boxShadow },
    ghost: { background: "transparent", color: T.text2, borderColor: "transparent", boxShadow: "none" },
    gold: { background: T.gold, color: "#050017", borderColor: "#F6F0FF", boxShadow: canHover ? "6px 6px 0 #000, 0 0 20px rgba(255,231,92,0.56), 0 0 10px rgba(255,43,214,0.34)" : base.boxShadow }
  };

  return (
    <button
      style={{ ...base, ...variants[v] }}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
