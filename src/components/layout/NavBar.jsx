// src/components/layout/NavBar.jsx
import { useState, useEffect, useRef } from "react";
import { T } from "../../styles/theme";
import { Button } from "../common/Button";
import golumLogo from "../../assets/golum.png";

export function NavBar({ user, nav, logout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  // [로직] 드롭다운 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(10,0,32,0.96)",
      borderBottom: `3px solid ${T.danger}`, padding: "0 24px",
      height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: `0 0 18px rgba(255,43,214,0.44)`
    }}>
      {/* 로고: 클릭 시 홈으로 이동 */}
      <span 
        onClick={() => nav("home")} 
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          fontFamily: T.font, fontSize: 24, fontWeight: 900,
          letterSpacing: 2, color: T.gold, textShadow: `2px 2px 0 ${T.danger}, -2px -2px 0 ${T.primary}`, 
          cursor: "pointer"
        }}
      >
        <img
          src={golumLogo}
          alt="Golum logo"
          style={{
            width: 32,
            height: 32,
            objectFit: "contain",
            imageRendering: "pixelated",
            filter: "drop-shadow(2px 2px 0 #000)"
          }}
        />
        GOLUM
      </span>

      <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        {/* 크레딧 표시 */}
        <div style={{
          background: T.bg2, border: `3px solid ${T.gold}`, color: T.gold,
          height: 36, minWidth: 114, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 12px", borderRadius: 2, fontSize: 13, fontWeight: 900,
          boxShadow: "3px 3px 0 #000"
        }}>
          ₩ {user.credits.toLocaleString()} C
        </div>

        {/* 투표 생성 버튼 */}
        <Button sm v="primary" onClick={() => nav("create")} style={{ height: 36, padding: "0 16px" }}>+ 투표 생성</Button>

        {/* 유저 아바타 및 드롭다운 트리거 */}
        <div 
          onClick={() => setOpen(p => !p)} 
          style={{
            width: 36, height: 36, borderRadius: 2, 
            background: T.gold,
            display: "flex", alignItems: "center", justifyContent: "center", 
            fontWeight: 900, fontSize: 13, color: "#000", cursor: "pointer",
            border: `3px solid ${T.primary}`,
            boxShadow: "3px 3px 0 #000"
          }}
        >
          {user.nickname[0].toUpperCase()}
        </div>

        {/* 드롭다운 메뉴 */}
        {open && (
          <div style={{
            position: "absolute", top: 44, right: 0, background: T.card2,
            border: `3px solid ${T.border}`, borderRadius: T.radius,
            minWidth: 150, boxShadow: T.pixelShadow, overflow: "hidden"
          }}>
            <div style={{ 
              padding: "10px 16px", fontSize: 13, color: T.text2, 
              borderBottom: `1px solid ${T.border}` 
            }}>
              👤 {user.nickname}
            </div>
            <div 
              onClick={() => { logout(); setOpen(false); }} 
              style={{ padding: "10px 16px", fontSize: 13, color: T.danger, cursor: "pointer" }}
            >
              🔴 로그아웃
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
