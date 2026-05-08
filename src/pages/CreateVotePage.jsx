// src/pages/CreateVotePage.jsx
import { useState } from "react";
import { T } from "../styles/theme";
import { Button } from "../components/common/Button";
import { Field } from "../components/common/Field";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { useToast } from "../context/ToastContext";

export function CreateVotePage({ onCreated, nav }) {
  const toast = useToast();
  
  // [상태 관리] 투표 정보 입력 상태
  const [title, setTitle] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [dur, setDur] = useState(null); // 선택된 시간 (1, 3, 6, 12, 24)
  const [loading, setLoading] = useState(false);

  const DURS = [1, 3, 6, 12, 24]; // 제공할 투표 기간 옵션

  // [로직] 투표 생성 함수
  async function handleCreate() {
    // 1. 필수 입력값 검증
    if (!title.trim() || !optA.trim() || !optB.trim() || !dur) {
      toast("모든 항목을 입력해주세요.", "error");
      return;
    }
    // 2. 중복 선택지 검증
    if (optA.trim() === optB.trim()) {
      toast("두 선택지는 서로 달라야 합니다.", "error");
      return;
    }

    setLoading(true);
    try {
      await onCreated({
        title: title.trim(),
        optionA: optA.trim(),
        optionB: optB.trim(),
        durationHours: dur,
      });
      toast("투표가 성공적으로 생성되었습니다.", "success");
    } catch (error) {
      toast(error.message || "투표 생성에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px 16px 80px", maxWidth: 600, margin: "0 auto" }}>
      <button onClick={() => nav("home")} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 13, marginBottom: 14, fontFamily: T.font }}>
        ← 목록으로
      </button>

      <ArcadePanel>
        <div style={{
          background: `linear-gradient(135deg, rgba(35,11,82,0.66) 0 45%, rgba(0,0,0,0.26) 45% 56%, rgba(23,6,58,0.58) 56% 100%)`,
          borderBottom: `2px solid ${T.border}`,
          padding: "16px 22px 17px",
          margin: "-2px -2px 18px",
          boxShadow: `0 12px 22px rgba(0,0,0,0.18), inset 0 -12px 22px rgba(123,61,255,0.16)`,
          position: "relative",
        }}>
          <div style={{ position: "absolute", left: 0, bottom: -2, width: 88, height: 2, background: T.primary, boxShadow: `0 0 10px ${T.primaryGlow}` }} />
          <div style={{ position: "absolute", right: 0, bottom: -2, width: 88, height: 2, background: T.danger, boxShadow: "0 0 10px rgba(255,43,214,0.55)" }} />
          <div style={{ fontSize: 28, fontWeight: 900, color: T.gold, letterSpacing: 2, textShadow: `3px 3px 0 ${T.danger}, 0 0 12px rgba(255,231,92,0.45)` }}>새 투표 만들기</div>
          <div style={{ fontSize: 12, color: T.primary, marginTop: 5, fontWeight: 800 }}>NEW STAGE / BUILD A MATCH</div>
        </div>
        {/* 주제 입력 */}
        <Field 
          label="투표 주제" 
          value={title} 
          onChange={setTitle} 
          placeholder="예: 짜장면 vs 짬뽕, 여러분의 선택은?" 
        />

        {/* 선택지 입력 영역 */}
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 10, textTransform: "uppercase" }}>선택지</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 18 }}>
          <input 
            value={optA} 
            onChange={e => setOptA(e.target.value)} 
            placeholder="A 진영" 
            style={{
              background: "rgba(0,255,234,0.08)", border: `2px solid ${T.primary}`, 
              borderRadius: 2, padding: "11px 14px", color: T.primary, 
              fontSize: 14, outline: "none", fontFamily: T.font, fontWeight: 900,
              boxShadow: "inset 0 0 14px rgba(0,255,234,0.16)"
            }}
          />
          <span style={{ fontSize: 22, fontWeight: 900, color: T.gold, textAlign: "center", textShadow: `2px 2px 0 ${T.danger}` }}>VS</span>
          <input 
            value={optB} 
            onChange={e => setOptB(e.target.value)} 
            placeholder="B 진영" 
            style={{
              background: "rgba(255,43,214,0.08)", border: `2px solid ${T.danger}`, 
              borderRadius: 2, padding: "11px 14px", color: T.danger, 
              fontSize: 14, outline: "none", fontFamily: T.font, fontWeight: 900,
              boxShadow: "inset 0 0 14px rgba(255,43,214,0.18)"
            }}
          />
        </div>

        {/* 투표 기간 선택 */}
        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.text2, marginBottom: 10, textTransform: "uppercase" }}>투표 가능 시간</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {DURS.map(h => (
            <div 
              key={h} 
              onClick={() => setDur(h)} 
              style={{
              padding: "7px 18px", borderRadius: T.radiusSm, cursor: "pointer", transition: "all .12s steps(2, end)",
                border: `2px solid ${dur === h ? T.primary : T.border}`,
                background: dur === h ? T.gold : T.card2,
                color: dur === h ? "#050017" : T.text2, fontSize: 12, fontWeight: 700,
                boxShadow: dur === h ? "3px 3px 0 #000" : undefined
              }}
            >
              {h}시간
            </div>
          ))}
        </div>

        {/* 실시간 미리보기 섹션 */}
        {(title || optA || optB) && (
          <div style={{ background: "rgba(5,0,23,0.7)", border: `2px solid ${T.border}`, borderRadius: 5, padding: 14, marginBottom: 18, boxShadow: "inset 0 0 18px rgba(123,61,255,0.22)" }}>
            <div style={{ fontSize: 10, color: T.primary, marginBottom: 6, fontWeight: 900 }}>PREVIEW</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{title || "투표 주제를 입력해주세요"}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, padding: "7px 10px", borderRadius: T.radiusSm, textAlign: "center", background: T.primaryDim, color: T.primary, border: `2px solid ${T.primary}`, fontSize: 12, fontWeight: 700 }}>
                A. {optA || "선택지 A"}
              </div>
              <div style={{ flex: 1, padding: "7px 10px", borderRadius: T.radiusSm, textAlign: "center", background: T.dangerDim, color: T.danger, border: `2px solid ${T.danger}`, fontSize: 12, fontWeight: 700 }}>
                B. {optB || "선택지 B"}
              </div>
            </div>
          </div>
        )}

        <Button v="primary" full onClick={handleCreate} disabled={loading}>
          {loading ? "생성 중..." : "✓ 투표 생성하기"}
        </Button>
      </ArcadePanel>
    </div>
  );
}
