// src/pages/HomePage.jsx
import { useState } from "react";
import { T } from "../styles/theme";
import { VoteCard } from "../components/vote/VoteCard";
import { Button } from "../components/common/Button";
import searchIcon from "../assets/search.png";

const HUD_CORNER_BITS = [
  { x: 0, y: 9, size: 4, opacity: 0.94, glow: 11 },
  { x: 0, y: 13, size: 4, opacity: 0.84, glow: 9 },
  { x: 0, y: 20, size: 3, opacity: 0.68, glow: 6 },
  { x: 0, y: 30, size: 3, opacity: 0.4, glow: 4 },
  { x: 0, y: 43, size: 2, opacity: 0.18, glow: 2 },
  { x: 2, y: 7, size: 4, opacity: 1, glow: 12 },
  { x: 6, y: 7, size: 4, opacity: 0.88, glow: 9 },
  { x: 13, y: 7, size: 3, opacity: 0.74, glow: 7 },
  { x: 22, y: 7, size: 3, opacity: 0.5, glow: 5 },
  { x: 35, y: 7, size: 2, opacity: 0.26, glow: 3 },
  { x: 51, y: 7, size: 2, opacity: 0.14, glow: 1 },
  { x: 2, y: 11, size: 2, opacity: 0.66, glow: 5 },
  { x: 7, y: 12, size: 2, opacity: 0.42, glow: 3 },
  { x: 14, y: 13, size: 2, opacity: 0.28, glow: 2 },
  { x: 4, y: 18, size: 2, opacity: 0.34, glow: 3 },
  { x: 10, y: 20, size: 2, opacity: 0.22, glow: 2 },
  { x: 4, y: 29, size: 2, opacity: 0.14, glow: 1 },
];

export function HomePage({ votes, user, nav, filter, onFilterChange, loading }) {
  const [q, setQ] = useState(""); // 검색어 상태
  const [now] = useState(() => Date.now());
  const [hoveredFilter, setHoveredFilter] = useState(null);

  // [로직] 검색어 및 필터 조건에 따른 투표 목록 필터링
  const list = votes.filter(v => {
    // 1. 검색어 필터링 (제목, 선택지 A, 선택지 B에 검색어가 포함되는지 확인)
    if (q && 
        !v.title.toLowerCase().includes(q.toLowerCase()) && 
        !v.optA.includes(q) && 
        !v.optB.includes(q)
    ) return false;

    return true;
  }).sort((a, b) => b.createdAt - a.createdAt); // 최신순으로 정렬

  // 필터 탭 구성 데이터
  const TABS = [
    { id: "popular", label: "HOT", desc: "인기있는 투표" },
    { id: "active", label: "PLAY", desc: "현재 진행중인 투표" },
    { id: "closed", label: "DONE", desc: "종료된 투표" },
    { id: "mine", label: "MINE", desc: "내가 참여한 투표" }
  ];

  return (
    <>
      <style>{`
        .home-stage {
          position: relative;
          min-height: calc(100vh - 56px);
        }
        .home-content {
          position: relative;
          z-index: 1;
        }
        .hud-corner {
          position: absolute;
          width: 70px;
          height: 56px;
          pointer-events: none;
          z-index: 5;
        }
        .hud-corner-tl {
          top: 6px;
          left: 10px;
        }
        .hud-corner-tr {
          top: 6px;
          right: 10px;
          transform: scaleX(-1);
        }
        .hud-corner-bl {
          bottom: 6px;
          left: 10px;
          transform: scaleY(-1);
        }
        .hud-corner-br {
          bottom: 6px;
          right: 10px;
          transform: scale(-1);
        }
        .hud-bit {
          position: absolute;
          display: block;
          background: rgba(180,255,255,0.95);
          box-shadow: 0 0 4px rgba(180,255,255,0.95);
        }
        .search-glyph {
          position: absolute;
          left: 21px;
          top: 50%;
          width: 21px;
          height: 21px;
          transform: translateY(-50%);
          pointer-events: none;
          opacity: 0.9;
          object-fit: contain;
          image-rendering: pixelated;
          filter: drop-shadow(0 0 5px rgba(0,255,234,0.32));
        }
        .filter-tooltip {
          position: absolute;
          left: 50%;
          bottom: calc(100% + 8px);
          transform: translate(-50%, 4px);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          white-space: nowrap;
          z-index: 20;
          padding: 6px 9px;
          border: 2px solid rgba(224,254,255,0.85);
          background: rgba(5,0,23,0.96);
          color: #f7f2ff;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 3px 3px 0 #000, 0 0 12px rgba(0,255,234,0.28);
          transition: opacity .12s steps(2, end), transform .12s steps(2, end), visibility 0s linear .12s;
        }
        .filter-tab:hover .filter-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
          transition-delay: .55s, .55s, .55s;
        }
      `}</style>
      <div className="home-stage">
        <div className="home-content" style={{ padding: "22px 16px 80px", maxWidth: 680, margin: "0 auto" }}>
          <div style={{
            position: "relative",
            background: "#16062f",
            border: "2px solid rgba(103,232,249,0.8)",
            borderRadius: 18,
            padding: 18,
            boxShadow: `0 0 4px rgba(94,244,255,0.95), 0 0 14px rgba(94,244,255,0.55), 0 0 34px rgba(94,244,255,0.25), inset 0 0 32px rgba(123,61,255,0.3)`,
            overflow: "hidden",
            backdropFilter: "blur(2px)"
          }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.12, background: "repeating-linear-gradient(180deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1px,transparent 1px,transparent 5px)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(95,38,180,0.22),rgba(13,4,32,0.35))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", inset: 3, border: "1px solid rgba(224,254,255,0.1)", borderRadius: 15, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, right: 0, width: 260, height: 130, background: "linear-gradient(135deg, transparent 0 42%, rgba(0,0,0,0.22) 42% 56%, transparent 56%)", pointerEvents: "none" }} />
            {["hud-corner-tl", "hud-corner-tr", "hud-corner-bl", "hud-corner-br"].map((klass) => (
              <div key={klass} className={`hud-corner ${klass}`}>
                {HUD_CORNER_BITS.map((bit) => (
                  <i
                    key={`${bit.x}-${bit.y}`}
                    className="hud-bit"
                    style={{
                      left: bit.x,
                      top: bit.y,
                      width: bit.size,
                      height: bit.size,
                      opacity: bit.opacity,
                      background: bit.opacity > 0.88 ? "rgba(224,254,255,1)" : "rgba(125,246,255,0.92)",
                      boxShadow: `0 0 ${bit.glow}px rgba(180,255,255,${Math.min(bit.opacity + 0.12, 1)})`,
                    }}
                  />
                ))}
              </div>
            ))}
      {/* 대시보드 요약 영역 */}
      <div style={{
        position: "relative",
        background: `linear-gradient(135deg, rgba(35,11,82,0.66) 0 45%, rgba(0,0,0,0.26) 45% 56%, rgba(23,6,58,0.58) 56% 100%)`,
        border: "none",
        borderBottom: `2px solid ${T.border}`,
        borderRadius: 0, padding: "15px 22px 17px", margin: "-2px -2px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: `0 12px 22px rgba(0,0,0,0.18), inset 0 -12px 22px rgba(123,61,255,0.16)`
      }}>
        <div style={{ position: "absolute", left: 0, bottom: -2, width: 88, height: 2, background: T.primary, boxShadow: `0 0 10px ${T.primaryGlow}` }} />
        <div style={{ position: "absolute", right: 0, bottom: -2, width: 88, height: 2, background: T.danger, boxShadow: "0 0 10px rgba(255,43,214,0.55)" }} />
        <div>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.gold, letterSpacing: 2, textShadow: `3px 3px 0 ${T.danger}, 0 0 12px rgba(255,231,92,0.45)` }}>투표 목록</div>
          <div style={{ fontSize: 13, color: T.primary, marginTop: 6, fontWeight: 800 }}>INSERT CREDIT / CHOOSE SIDE</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.gold, textShadow: `0 0 14px ${T.goldDim}` }}>
            {votes.filter(v => v.status === "active" && v.expiresAt > now).length}
          </div>
          <div style={{ fontSize: 12, color: T.text2, fontWeight: 800 }}>진행 중</div>
        </div>
      </div>

      {/* 검색 바 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, position: "relative", padding: "0 8px" }}>
        <img className="search-glyph" src={searchIcon} alt="" aria-hidden="true" />
        <input 
          value={q} 
          onChange={e => setQ(e.target.value)} 
          placeholder="투표 검색..."
          style={{
            flex: 1, height: 40, background: "rgba(5,0,23,0.76)", border: `2px solid ${T.border}`,
            borderRadius: 6, padding: "0 18px 0 48px", color: T.text,
            fontSize: 13, outline: "none", fontFamily: T.font,
            boxShadow: "inset 0 0 14px rgba(0,0,0,0.48), 0 0 8px rgba(123,61,255,0.22)"
          }}
        />
        {q && <Button sm v="ghost" onClick={() => setQ("")}>✕</Button>}
      </div>

      {/* 필터 탭 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", padding: "0 8px" }}>
        {TABS.map(f => {
          const selected = filter === f.id;
          const hovering = hoveredFilter === f.id;
          return (
            <div 
              key={f.id}
              className="filter-tab"
              onClick={() => onFilterChange(f.id)}
              onMouseEnter={() => setHoveredFilter(f.id)}
              onMouseLeave={() => setHoveredFilter(null)}
              style={{
                minWidth: 80, textAlign: "center", position: "relative",
                padding: "8px 15px", borderRadius: 2, fontSize: 13, fontWeight: 900, 
                cursor: "pointer", border: "2px solid", transition: "all .12s steps(2, end)",
                background: selected ? T.gold : hovering ? "rgba(45,14,102,0.98)" : "rgba(15,4,48,0.98)",
                color: selected ? "#050017" : "#f2ecff",
                borderColor: selected ? T.primary : hovering ? "rgba(224,254,255,0.92)" : "rgba(123,61,255,0.95)",
                textShadow: selected ? "none" : "2px 2px 0 #000, 0 0 8px rgba(224,254,255,0.25)",
                transform: hovering && !selected ? "translate(-1px, -1px)" : undefined,
                boxShadow: selected
                  ? `3px 3px 0 #000, 0 0 12px ${T.goldDim}`
                  : hovering
                    ? "4px 4px 0 #000, 0 0 14px rgba(0,255,234,0.28), inset 0 0 14px rgba(123,61,255,0.34)"
                    : "2px 2px 0 #000, inset 0 0 12px rgba(123,61,255,0.26)"
              }}
            >
              {f.label}
              <span className="filter-tooltip">{f.desc}</span>
            </div>
          );
        })}
      </div>

      {/* 투표 목록 리스트 */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}>
          <p style={{ fontSize: 13 }}>불러오는 중...</p>
        </div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🗳️</div>
          <p style={{ fontSize: 13 }}>{q ? "검색 결과가 없습니다." : "해당하는 투표가 없습니다."}</p>
        </div>
      ) : (
        list.map(v => (
          <VoteCard 
            key={v.id} 
            vote={v} 
            userEmail={user.email} 
            onClick={() => nav("detail", v.id)} 
          />
        ))
      )}
          </div>
        </div>
    </div>
    </>
  );
}
