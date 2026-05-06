// src/components/vote/VoteCard.jsx
import { useState } from "react";
import { T } from "../../styles/theme";
import { timeAgo, timeLeft, rateA } from "../../utils/helpers";
import blueGhost from "../../assets/ghosts/Blue1.png";
import redGhost from "../../assets/ghosts/Red1.png";
import yellowGhost from "../../assets/ghosts/yellow1.png";

const CARD_CORNER_BITS = [
  { x: 0, y: 7, size: 2, opacity: 0.92, glow: 7 },
  { x: 0, y: 10, size: 2, opacity: 0.78, glow: 5 },
  { x: 0, y: 14, size: 2, opacity: 0.56, glow: 4 },
  { x: 0, y: 20, size: 1, opacity: 0.34, glow: 2 },
  { x: 0, y: 29, size: 1, opacity: 0.16, glow: 1 },
  { x: 2, y: 6, size: 2, opacity: 1, glow: 8 },
  { x: 5, y: 6, size: 2, opacity: 0.84, glow: 6 },
  { x: 9, y: 6, size: 2, opacity: 0.62, glow: 4 },
  { x: 15, y: 6, size: 1, opacity: 0.4, glow: 2 },
  { x: 24, y: 6, size: 1, opacity: 0.18, glow: 1 },
  { x: 2, y: 8, size: 1, opacity: 0.58, glow: 3 },
  { x: 6, y: 10, size: 1, opacity: 0.28, glow: 1 },
];
const GHOST_ICONS = [
  { src: blueGhost, glow: "rgba(0,210,255,0.7)" },
  { src: redGhost, glow: "rgba(255,42,83,0.7)" },
  { src: yellowGhost, glow: "rgba(255,231,92,0.72)" },
];
const OCTAGON = "polygon(22% 0, 78% 0, 100% 22%, 100% 78%, 78% 100%, 22% 100%, 0 78%, 0 22%)";

function VoteCardCorner({ corner, side }) {
  const isRight = side === "right";
  const color = isRight ? "255,43,214" : "0,255,234";
  const hot = isRight ? "255,154,238" : "224,254,255";
  const transform = [
    isRight ? "scaleX(-1)" : "",
    corner.includes("bottom") ? "scaleY(-1)" : "",
  ].filter(Boolean).join(" ");

  return (
    <div
      style={{
        position: "absolute",
        width: 40,
        height: 32,
        top: corner.includes("top") ? 0 : undefined,
        bottom: corner.includes("bottom") ? 1 : undefined,
        left: isRight ? undefined : 4,
        right: isRight ? 4 : undefined,
        transform,
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      {CARD_CORNER_BITS.map((bit) => (
        <i
          key={`${bit.x}-${bit.y}`}
          style={{
            position: "absolute",
            display: "block",
            left: bit.x,
            top: bit.y,
            width: bit.size,
            height: bit.size,
            opacity: bit.opacity,
            background: bit.opacity > 0.82 ? `rgba(${hot},1)` : `rgba(${color},0.92)`,
            boxShadow: `0 0 ${bit.glow}px rgba(${hot},${Math.min(bit.opacity + 0.14, 1)})`,
          }}
        />
      ))}
    </div>
  );
}

export function VoteCard({ vote, onClick, userEmail }) {
  const [hov, setHov] = useState(false);
  const [now] = useState(() => Date.now());

  // [로직] 내가 이 투표에 참여했는지 확인
  const joined = vote.participants.some(p => p.email === userEmail);
  
  // [로직] 투표가 현재 활성 상태인지 확인 (상태가 active이고 만료 시간이 현재보다 미래여야 함)
  const active = vote.status === "active" && vote.expiresAt > now;
  
  // [유틸] A진영의 득표율 계산
  const ra = rateA(vote);
  const ghostIcon = GHOST_ICONS[vote.id % GHOST_ICONS.length];

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? "linear-gradient(145deg, rgba(48,11,98,0.9), rgba(14,0,38,0.94))"
          : "linear-gradient(145deg, rgba(28,5,66,0.84), rgba(8,0,31,0.9))",
        border: `2px solid ${hov ? T.danger : T.border}`,
        borderRadius: 8,
        padding: "11px 14px 10px",
        margin: "0 8px 12px",
        cursor: "pointer",
        transition: "all .12s steps(2, end)",
        transform: hov ? "translate(-2px, -2px)" : undefined,
        boxShadow: hov
          ? `4px 4px 0 #000, 0 0 16px rgba(255,43,214,0.52), inset 0 0 24px rgba(0,255,234,0.08), inset 0 -18px 26px rgba(255,43,214,0.13)`
          : "0 0 10px rgba(123,61,255,0.32), inset 0 0 20px rgba(0,255,234,0.07), inset 0 -18px 24px rgba(255,43,214,0.1)",
        position: "relative",
        overflow: "hidden",
        backdropFilter: "blur(2px)"
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.1, background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.42) 0px, rgba(255,255,255,0.42) 1px, transparent 1px, transparent 5px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 34%), linear-gradient(90deg, rgba(0,255,234,0.1), transparent 44%, rgba(255,43,214,0.1))", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 0, left: 12, right: 12, height: 1, background: "linear-gradient(90deg, transparent, rgba(224,254,255,0.72), rgba(255,154,238,0.54), transparent)", boxShadow: "0 0 8px rgba(180,255,255,0.42)", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 4, border: "1px solid rgba(224,254,255,0.08)", borderRadius: 5, pointerEvents: "none", zIndex: 1 }} />
      <VoteCardCorner corner="top-left" side="left" />
      <VoteCardCorner corner="bottom-left" side="left" />
      <VoteCardCorner corner="top-right" side="right" />
      <VoteCardCorner corner="bottom-right" side="right" />
      <div style={{ position: "absolute", inset: 6, border: `1px dashed rgba(255,43,214,0.14)`, borderRadius: 5, pointerEvents: "none", zIndex: 1 }} />

      {/* 상단: 제목과 상태 배지 */}
      <div style={{ display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", gap: 10, marginBottom: 8, position: "relative", zIndex: 2 }}>
        <div style={{
          width: 38, height: 38,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: T.border,
          boxShadow: `0 0 10px rgba(123,61,255,0.48), 0 0 8px ${ghostIcon.glow}`,
          clipPath: OCTAGON,
          position: "relative",
        }}>
          <span
            style={{
              position: "absolute",
              inset: 3,
              background: "linear-gradient(135deg, rgba(23,6,58,0.94), rgba(5,0,23,0.98))",
              clipPath: OCTAGON,
            }}
          />
          <img
            src={ghostIcon.src}
            alt=""
            aria-hidden="true"
            style={{
              position: "relative",
              width: 29,
              height: 29,
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: `drop-shadow(2px 2px 0 #000) drop-shadow(0 0 7px ${ghostIcon.glow})`,
              userSelect: "none",
            }}
          />
        </div>
        <div style={{ fontSize: 15, fontWeight: 900, lineHeight: 1.3, color: T.text, textShadow: "2px 2px 0 rgba(0,0,0,0.65)" }}>
          {vote.title}
        </div>
        <div style={{
          padding: "3px 8px", borderRadius: 3, fontSize: 10, fontWeight: 900,
          background: active ? "rgba(54,255,77,0.08)" : T.card2,
          color: active ? T.accent : T.muted,
          border: `2px solid ${active ? T.accent : T.border}`,
          whiteSpace: "nowrap", flexShrink: 0
        }}>
          {active ? "진행중" : "종료"}
        </div>
      </div>

      {/* 중간: 진영 요약 박스 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "-1px 6px 8px 52px", position: "relative", zIndex: 2 }}>
        <div style={{
          padding: "8px 12px", borderRadius: 2, fontSize: 13, fontWeight: 900,
          textAlign: "center", background: "rgba(0,255,234,0.08)", color: T.primary,
          border: `2px solid ${T.primary}`, boxShadow: "inset 0 0 14px rgba(0,255,234,0.16)"
        }}>
          A. {vote.optA}
        </div>
        <div style={{
          padding: "8px 12px", borderRadius: 2, fontSize: 13, fontWeight: 900,
          textAlign: "center", background: "rgba(255,43,214,0.08)", color: T.danger,
          border: `2px solid ${T.danger}`, boxShadow: "inset 0 0 14px rgba(255,43,214,0.18)"
        }}>
          B. {vote.optB}
        </div>
      </div>

      {/* 참여했거나 종료된 투표라면 득표율 게이지 표시 */}
      {(joined || vote.status === "closed") && (
        <div style={{ marginBottom: 7, position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.text2, marginBottom: 3 }}>
            <span style={{ color: T.primary }}>{ra}%</span>
            <span style={{ color: T.danger, marginLeft: "auto" }}>{100 - ra}%</span>
          </div>
          <div style={{ height: 9, background: T.bg2, borderRadius: T.radiusSm, overflow: "hidden", border: `3px solid ${T.border}` }}>
            <div style={{ 
              height: "100%", width: `${ra}%`, 
              background: T.primary, 
              borderRadius: T.radiusSm, transition: "width .8s steps(8, end)" 
            }} />
          </div>
        </div>
      )}

      {/* 하단: 참여자 수, 시간, 참여 여부 정보 */}
      <div style={{ display: "flex", gap: 13, fontSize: 12, color: T.text2, flexWrap: "wrap", alignItems: "center", fontWeight: 800, marginLeft: 52, lineHeight: 1, position: "relative", zIndex: 2 }}>
        <span><span style={{ color: T.primary }}>♙ {(vote.votesA + vote.votesB).toLocaleString()}</span>명</span>
        {active && <span><span style={{ color: T.primary }}>◷</span> {timeLeft(vote.expiresAt)}</span>}
        <span><span style={{ color: T.primary }}>●</span> {timeAgo(vote.createdAt)}</span>
        {joined && <span style={{ color: T.primary, fontWeight: 700 }}>✓ 참여함</span>}
      </div>
    </div>
  );
}
