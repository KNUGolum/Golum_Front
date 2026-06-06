// src/components/layout/NavBar.jsx
import { useEffect, useRef, useState } from "react";
import { authApi } from "../../api/auth";
import { titlesApi } from "../../api/titles";
import { T } from "../../styles/theme";
import { Button } from "../common/Button";
import golumLogo from "../../assets/golum.png";
import { useToast } from "../../context/ToastContext";

export function NavBar({ user, nav, logout, onNicknameChanged, titleRefreshKey }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [savingNickname, setSavingNickname] = useState(false);
  const [equippedTitle, setEquippedTitle] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setEditingNickname(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let alive = true;
    titlesApi.inventory()
      .then((data) => {
        if (!alive) return;
        setEquippedTitle((data.titles || []).find((title) => title.isEquipped) || null);
      })
      .catch(() => {
        if (alive) setEquippedTitle(null);
      });
    return () => {
      alive = false;
    };
  }, [titleRefreshKey]);

  const displayName = equippedTitle ? `[${equippedTitle.name}]${user.nickname}` : user.nickname;

  async function saveNickname() {
    const nextNickname = nickname.trim();
    if (!nextNickname) {
      toast("닉네임을 입력해주세요.", "error");
      return;
    }
    if (nextNickname === user.nickname) {
      setEditingNickname(false);
      return;
    }

    setSavingNickname(true);
    try {
      await authApi.updateNickname(nextNickname);
      await onNicknameChanged?.();
      setEditingNickname(false);
      toast("닉네임을 변경했습니다.", "success");
    } catch (error) {
      toast(error.message || "닉네임 변경에 실패했습니다.", "error");
    } finally {
      setSavingNickname(false);
    }
  }

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(10,0,32,0.96)",
      borderBottom: `3px solid ${T.danger}`,
      padding: "0 24px",
      minHeight: 58,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      boxShadow: "0 0 18px rgba(255,43,214,0.44)",
    }}>
      <span
        onClick={() => nav("home")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: T.font,
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: 2,
          color: T.gold,
          textShadow: `2px 2px 0 ${T.danger}, -2px -2px 0 ${T.primary}`,
          cursor: "pointer",
          flexShrink: 0,
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
            filter: "drop-shadow(2px 2px 0 #000)",
          }}
        />
        GOLUM
      </span>

      <div ref={ref} style={{ display: "flex", alignItems: "center", gap: 12, position: "relative", justifyContent: "flex-end" }}>
        <div style={{
          background: T.bg2,
          border: `3px solid ${T.gold}`,
          color: T.gold,
          height: 36,
          minWidth: 114,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 12px",
          borderRadius: 2,
          fontSize: 13,
          fontWeight: 900,
          boxShadow: "3px 3px 0 #000",
        }}>
          C {user.credits.toLocaleString()}
        </div>

        <Button sm v="primary" onClick={() => nav("create")} style={{ height: 36, padding: "0 16px" }}>+ 투표 생성</Button>

        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            minHeight: 36,
            maxWidth: 260,
            borderRadius: 2,
            background: T.gold,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 13,
            color: "#000",
            cursor: "pointer",
            border: `3px solid ${T.primary}`,
            boxShadow: "3px 3px 0 #000",
            padding: "0 12px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: T.font,
          }}
          title={displayName}
        >
          {displayName}
        </button>

        {open && (
          <div style={{
            position: "absolute",
            top: 44,
            right: 0,
            background: T.card2,
            border: `3px solid ${T.border}`,
            borderRadius: T.radius,
            minWidth: 220,
            boxShadow: T.pixelShadow,
            overflow: "hidden",
          }}>
            <div style={{ padding: "10px 16px", fontSize: 13, color: T.text2, borderBottom: `1px solid ${T.border}` }}>
              {displayName}
            </div>

            {editingNickname ? (
              <div style={{ padding: 12, borderBottom: `1px solid ${T.border}` }}>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") saveNickname();
                    if (event.key === "Escape") setEditingNickname(false);
                  }}
                  autoFocus
                  style={{
                    width: "100%",
                    height: 34,
                    background: "rgba(5,0,23,0.76)",
                    border: `2px solid ${T.primary}`,
                    color: T.text,
                    padding: "0 8px",
                    fontSize: 12,
                    outline: "none",
                    marginBottom: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button sm v="primary" full disabled={savingNickname} onClick={saveNickname}>
                    {savingNickname ? "저장중" : "저장"}
                  </Button>
                  <Button sm v="outline" disabled={savingNickname} onClick={() => setEditingNickname(false)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setNickname(user.nickname);
                  setEditingNickname(true);
                }}
                style={{ padding: "10px 16px", fontSize: 13, color: T.text, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
              >
                닉네임 변경
              </div>
            )}

            <div
              onClick={() => { nav("titles"); setOpen(false); setEditingNickname(false); }}
              style={{ padding: "10px 16px", fontSize: 13, color: T.gold, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
            >
              칭호 상점
            </div>
            <div
              onClick={() => { nav("logs"); setOpen(false); setEditingNickname(false); }}
              style={{ padding: "10px 16px", fontSize: 13, color: T.primary, cursor: "pointer", borderBottom: `1px solid ${T.border}` }}
            >
              활동 로그
            </div>
            <div
              onClick={() => { logout(); setOpen(false); }}
              style={{ padding: "10px 16px", fontSize: 13, color: T.danger, cursor: "pointer" }}
            >
              로그아웃
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
