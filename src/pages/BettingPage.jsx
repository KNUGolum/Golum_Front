// src/pages/BettingPage.jsx
import { useState } from "react";
import { T } from "../styles/theme";
import { Button } from "../components/common/Button";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { useToast } from "../context/ToastContext";

const MIN_BET_AMOUNT = 1;

export function BettingPage({ vote, user, onBet, onBack, onSkip }) {
  const toast = useToast();
  
  // [데이터 분석] 내 투표 정보 가져오기
  const myP = vote.hasVoted ? { email: user.email, choice: vote.mySelection } : vote.participants.find(p => p.email === user.email);
  
  // [상태 관리] 배팅 금액 (기본값 100)
  const [amt, setAmt] = useState(100);
  const [loading, setLoading] = useState(false);

  // [계산] 배팅 제한 및 수익률 계산
  const MAX = Math.max(user.credits, 0); // 보유 크레딧이 0 미만으로 떨어지는 것 방지
  const QUICK = [50, 100, 300, 500, 1000].filter(a => a <= MAX); // 보유액 내의 퀵 버튼만 표시
  const payout = Math.floor(amt * 1.5); // 승리 시 1.5배 배당
  const canBet = vote.canBet && MAX >= MIN_BET_AMOUNT;
  const clampBet = (value) => Math.max(MIN_BET_AMOUNT, Math.min(MAX, value || MIN_BET_AMOUNT));

  const myLabel = myP?.choice === "A" ? vote.optA : vote.optB;
  const myCol = myP?.choice === "A" ? T.primary : T.danger;

  // [로직] 배팅 실행 함수
  async function doBet() {
    if (!myP) {
      toast("투표 참여 후 배팅할 수 있습니다.", "error");
      return;
    }
    if (amt < MIN_BET_AMOUNT) {
      toast("최소 배팅 금액은 1 C입니다.", "error");
      return;
    }
    if (amt > user.credits) {
      toast("보유 크레딧이 부족합니다.", "error");
      return;
    }

    setLoading(true);
    try {
      await onBet(amt);
      toast("배팅 완료! 참여 보상이 지급되었습니다.", "gold");
    } catch (error) {
      toast(error.message || "배팅에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function skipBetting() {
    if (!myP) {
      toast("투표 참여 후 배팅을 포기할 수 있습니다.", "error");
      return;
    }
    setLoading(true);
    try {
      await onSkip();
      toast("배팅을 포기했습니다. 결과를 확인할 수 있습니다.", "info");
    } catch (error) {
      toast(error.message || "배팅 포기에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px 16px 80px", maxWidth: 600, margin: "0 auto" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 13, marginBottom: 14, fontFamily: T.font }}>
        ← 투표 상세로 돌아가기
      </button>

      <ArcadePanel style={{ marginBottom: 14, borderColor: "rgba(255,231,92,0.82)", boxShadow: "0 0 4px rgba(255,231,92,0.92), 0 0 16px rgba(255,231,92,0.44), 0 0 34px rgba(255,43,214,0.22), inset 0 0 32px rgba(123,61,255,0.3)" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(35,11,82,0.66) 0 45%, rgba(0,0,0,0.26) 45% 56%, rgba(23,6,58,0.58) 56% 100%)",
          borderBottom: `2px solid ${T.gold}`,
          padding: "16px 22px 17px",
          margin: "-2px -2px 18px",
          position: "relative",
          boxShadow: "0 12px 22px rgba(0,0,0,0.18), inset 0 -12px 22px rgba(255,231,92,0.12)",
        }}>
          <div style={{ position: "absolute", left: 0, bottom: -2, width: 88, height: 2, background: T.gold, boxShadow: "0 0 10px rgba(255,231,92,0.55)" }} />
          <div style={{ position: "absolute", right: 0, bottom: -2, width: 88, height: 2, background: T.danger, boxShadow: "0 0 10px rgba(255,43,214,0.55)" }} />
          <div style={{ fontSize: 34, fontWeight: 900, color: T.gold, letterSpacing: 2, textShadow: `3px 3px 0 ${T.danger}, 0 0 12px rgba(255,231,92,0.45)` }}>배팅</div>
          <div style={{ color: T.primary, fontSize: 13, marginTop: 6, fontWeight: 900 }}>BONUS ROUND / 1.5X PAYOUT</div>
        </div>
        {/* 선택 진영 정보 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "12px 14px", border: `2px solid ${myCol}`, borderRadius: 5, background: myP?.choice === "A" ? "rgba(0,255,234,0.08)" : "rgba(255,43,214,0.08)", boxShadow: `inset 0 0 16px ${myP?.choice === "A" ? "rgba(0,255,234,0.13)" : "rgba(255,43,214,0.13)"}` }}>
          <div>
            <div style={{ fontSize: 11, color: T.text2, fontWeight: 900, marginBottom: 3 }}>SELECTED SIDE</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: myCol, textShadow: `0 0 8px ${myP?.choice === "A" ? T.primaryGlow : "rgba(255,43,214,0.62)"}` }}>{myLabel}</div>
            <div style={{ fontSize: 11, color: T.text2, marginTop: 2 }}>{vote.title}</div>
          </div>
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 900, color: T.text2, marginBottom: 8, textTransform: "uppercase" }}>배팅 금액</label>
        
        {/* 금액 입력창 */}
        <div style={{ position: "relative" }}>
          <input 
            type="number" 
            value={amt} 
            min={MIN_BET_AMOUNT} 
            max={Math.max(MAX, MIN_BET_AMOUNT)} 
            onChange={e => setAmt(clampBet(parseInt(e.target.value, 10)))}
            style={{
              width: "100%", background: "rgba(5,0,23,0.76)", border: `2px solid ${T.gold}`,
              borderRadius: 4, padding: "12px 50px 12px 14px",
              color: T.gold, fontSize: 18, fontWeight: 900, outline: "none",
              boxSizing: "border-box", boxShadow: "inset 0 0 16px rgba(255,231,92,0.14), 0 0 10px rgba(255,231,92,0.18)", fontFamily: T.font
            }}
          />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.gold, fontSize: 13, fontWeight: 900 }}>C</span>
        </div>

        {/* 금액 조절 슬라이더 */}
        <input 
          type="range" 
          min={MIN_BET_AMOUNT} 
          max={Math.max(MAX, MIN_BET_AMOUNT)} 
          value={amt} 
          onChange={e => setAmt(clampBet(parseInt(e.target.value, 10)))}
          style={{ width: "100%", margin: "10px 0", accentColor: T.gold }}
        />

        <div style={{ textAlign: "right", fontSize: 11, color: T.text2, marginBottom: 14, fontWeight: 800 }}>
          보유: <span style={{ color: T.gold, fontWeight: 900 }}>{user.credits.toLocaleString()} C</span>
          <span style={{ marginLeft: 8 }}>최소: <span style={{ color: T.gold, fontWeight: 900 }}>{MIN_BET_AMOUNT} C</span></span>
        </div>

        {/* 퀵 버튼 및 전체 배팅 버튼 */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {QUICK.map(a => (
            <div 
              key={a} 
              onClick={() => setAmt(a)} 
              style={{
                padding: "6px 12px", borderRadius: 2, cursor: "pointer", transition: "all .12s steps(2, end)", fontWeight: 900,
                border: `2px solid ${amt === a ? T.gold : T.border}`,
                background: amt === a ? T.gold : "rgba(23,6,58,0.88)", color: amt === a ? "#050017" : T.text2, fontSize: 11,
                boxShadow: amt === a ? "0 0 12px rgba(255,231,92,0.35)" : "inset 0 0 12px rgba(123,61,255,0.2)",
              }}
            >
              {a.toLocaleString()} C
            </div>
          ))}
          {MAX > 0 && (
            <div 
              onClick={() => setAmt(MAX)} 
              style={{
                padding: "6px 12px", borderRadius: 2, cursor: "pointer", transition: "all .12s steps(2, end)", fontWeight: 900,
                border: `2px solid ${amt === MAX ? T.gold : T.border}`,
                background: amt === MAX ? T.gold : "rgba(23,6,58,0.88)", color: amt === MAX ? "#050017" : T.text2, fontSize: 11,
                boxShadow: amt === MAX ? "0 0 12px rgba(255,231,92,0.35)" : "inset 0 0 12px rgba(123,61,255,0.2)",
              }}
            >
              전체
            </div>
          )}
        </div>

        {/* 예상 수익금 카드 */}
        <div style={{ background: "linear-gradient(180deg, rgba(255,231,92,0.12), rgba(255,43,214,0.06))", border: `2px solid ${T.gold}`, borderRadius: 5, padding: 14, marginBottom: 18, textAlign: "center", boxShadow: "inset 0 0 18px rgba(255,231,92,0.12), 0 0 14px rgba(255,231,92,0.16)" }}>
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 3, fontWeight: 900 }}>VICTORY PAYOUT</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: T.gold, textShadow: "0 0 12px rgba(255,231,92,0.45)" }}>+{payout.toLocaleString()} C</div>
          <div style={{ fontSize: 10, color: T.text2, marginTop: 2 }}>(+100 C 배팅 참여 보상 별도 지급)</div>
        </div>

        <Button v="gold" full onClick={doBet} disabled={loading || !canBet || amt < MIN_BET_AMOUNT || amt > user.credits}>
          {loading ? "처리 중..." : `${amt.toLocaleString()} C 배팅하기`}
        </Button>

        <div style={{ marginTop: 10, textAlign: "center" }}>
          <button onClick={skipBetting} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 12, fontFamily: T.font, textDecoration: "underline" }}>
            배팅 포기하기
          </button>
        </div>
      </ArcadePanel>
    </div>
  );
}
