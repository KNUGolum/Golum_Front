// src/pages/VoteDetailPage.jsx
import { useState } from "react";
import { T } from "../styles/theme";
import { Button } from "../components/common/Button";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { useToast } from "../context/ToastContext";
import { timeAgo, timeLeft, rateA, betRateA, delay } from "../utils/helpers";

export function VoteDetailPage({ vote, user, onVoted, nav }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [now] = useState(() => Date.now());
  const [hoverChoice, setHoverChoice] = useState(null);

  // [데이터 분석] 현재 유저의 상태 및 투표 정보 계산
  const myP = vote.participants.find(p => p.email === user.email); // 내 투표 기록
  const myB = vote.bets.find(b => b.email === user.email);         // 내 배팅 기록
  const active = vote.status === "active" && vote.expiresAt > now; // 진행 여부
  const canSee = !!myP || vote.status === "closed";               // 결과 공개 여부
  const creator = vote.creator === user.email;                    // 내가 만든 투표인지 확인

  // [통계 계산]
  const ra = rateA(vote);       // 투표율 (A진영 %)
  const bra = betRateA(vote);   // 배팅 게이지 폭 계산용 비율
  const total = vote.votesA + vote.votesB;
  const totalB = vote.totalBetA + vote.totalBetB;

  // [로직] 투표하기 함수
  async function doVote(choice) {
    if (creator) { toast("자신이 만든 투표에는 참여할 수 없습니다.", "error"); return; }
    if (myP || loading) { toast("이미 참여한 투표입니다.", "error"); return; }
    if (!active) { toast("이미 종료된 투표입니다.", "error"); return; }

    setLoading(true);
    await delay(); // 통신 대기 흉내

    const votedAt = Number(new Date());
    const nextVote = {
      ...vote,
      participants: [...vote.participants, { email: user.email, choice, votedAt }],
      votesA: vote.votesA + (choice === "A" ? 1 : 0),
      votesB: vote.votesB + (choice === "B" ? 1 : 0),
    };
    const nextUser = { ...user, credits: user.credits + 50 };

    setLoading(false);
    toast("✅ 투표 완료! +50 크레딧 지급", "success");
    
    onVoted(nextVote, nextUser); // 부모 컴포넌트 데이터 갱신
    // setTimeout(() => nav("bet", vote.id), 700); // 0.7초 후 배팅 페이지로 이동
  }

  return (
    <div style={{ padding: "20px 16px 80px", maxWidth: 600, margin: "0 auto" }}>
      <button onClick={() => nav("home")} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 13, marginBottom: 14, fontFamily: T.font }}>
        ← 목록으로
      </button>

      {/* 헤더 영역: 제목 및 기본 정보 */}
      <ArcadePanel style={{ marginBottom: 14 }} innerStyle={{ padding: "6px 4px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 9px", borderRadius: 3, fontSize: 10, fontWeight: 900, background: active ? "rgba(54,255,77,0.08)" : T.card2, color: active ? T.accent : T.muted, border: `2px solid ${active ? T.accent : T.border}`, boxShadow: active ? "0 0 10px rgba(54,255,77,0.25)" : undefined }}>
            {active ? "진행중" : "종료"}
          </span>
          {active && <span style={{ fontSize: 12, color: T.text2, fontWeight: 700 }}>{timeLeft(vote.expiresAt)}</span>}
          {creator && <span style={{ padding: "2px 9px", borderRadius: T.radiusSm, fontSize: 10, fontWeight: 700, background: T.gold, color: "#050017", border: `2px solid ${T.primary}` }}>내가 만든 투표</span>}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: T.gold, lineHeight: 1.35, marginBottom: 10, textShadow: `3px 3px 0 ${T.danger}, 0 0 12px rgba(255,231,92,0.45)` }}>{vote.title}</h1>
        <div style={{ display: "flex", gap: 14, fontSize: 12, color: T.text2, flexWrap: "wrap" }}>
          <span><span style={{ color: T.primary }}>♙</span> {total.toLocaleString()}명 참여</span>
          <span><span style={{ color: T.gold }}>C</span> {totalB.toLocaleString()} C 배팅됨</span>
          <span><span style={{ color: T.primary }}>◷</span> {timeAgo(vote.createdAt)}</span>
        </div>
      </ArcadePanel>

      {/* VS 섹션: 투표 선택 영역 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "stretch", marginBottom: 14 }}>
        {[ {ch:"A", opt:vote.optA, col:T.primary, bg:T.primaryDim}, 
           {ch:"B", opt:vote.optB, col:T.danger, bg:T.dangerDim} ].map((item) => {
          const selectable = !myP && active && !creator && !loading;
          const hovering = selectable && hoverChoice === item.ch;
          const glow = item.ch === "A" ? T.primaryGlow : "rgba(255,43,214,0.65)";
          return (
            <div 
              key={item.ch}
              onClick={() => selectable && doVote(item.ch)}
              onMouseEnter={() => selectable && setHoverChoice(item.ch)}
              onMouseLeave={() => setHoverChoice(null)}
              style={{
                padding: "18px 14px", borderRadius: 6, textAlign: "center", transition: "all .12s steps(2, end)",
                border: `2px solid ${item.col}`,
                background: hovering
                  ? (item.ch === "A" ? "rgba(0,255,234,0.2)" : "rgba(255,43,214,0.2)")
                  : myP?.choice === item.ch
                    ? (item.ch === "A" ? "rgba(0,255,234,0.16)" : "rgba(255,43,214,0.16)")
                    : item.bg,
                cursor: selectable ? "pointer" : "default",
                boxShadow: hovering
                  ? `4px 4px 0 #000, 0 0 20px ${glow}, inset 0 0 22px ${item.bg}`
                  : myP?.choice === item.ch
                    ? `0 0 18px ${glow}, inset 0 0 18px ${item.bg}`
                    : `inset 0 0 16px ${item.bg}`,
                transform: hovering ? "translate(-2px, -2px)" : undefined,
                filter: hovering ? "brightness(1.08) saturate(1.18)" : undefined,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div style={{ position: "absolute", inset: 0, opacity: hovering ? 0.14 : 0.08, background: "repeating-linear-gradient(180deg, #fff 0 1px, transparent 1px 5px)", pointerEvents: "none" }} />
              <div style={{ position: "relative", fontSize: 10, color: T.text2, marginBottom: 5, fontWeight: 900 }}>{item.ch} 진영</div>
              <div style={{ position: "relative", fontSize: 16, fontWeight: 900, color: item.col, textShadow: `0 0 8px ${glow}` }}>{item.opt}</div>
              {myP?.choice === item.ch && <div style={{ position: "relative", fontSize: 10, color: item.col, marginTop: 5, fontWeight: 900 }}>✓ 선택됨</div>}
            </div>
          );
        })}
        {/* 가운데 VS 텍스트 (grid 두번째 열) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: T.gold, gridColumn: 2, gridRow: 1, textShadow: `2px 2px 0 ${T.danger}` }}>VS</div>
      </div>

      {/* 안내 문구 및 배팅 유도 버튼 */}
      {!myP && active && !creator && <div style={{ textAlign: "center", fontSize: 12, color: T.primary, marginBottom: 14, padding: "10px", background: "rgba(5,0,23,0.72)", border: `2px solid ${T.primary}`, borderRadius: 4, boxShadow: "inset 0 0 14px rgba(0,255,234,0.12)" }}>진영 선택 시 +50 크레딧 지급</div>}
      {myP && !myB && active && <div style={{ textAlign: "center", marginBottom: 14 }}><Button v="gold" onClick={() => nav("bet", vote.id)}>💰 배팅하러 가기</Button></div>}

      {/* 결과 섹션: 투표 및 배팅 통계 */}
      <ArcadePanel style={{ marginBottom: 14 }} innerStyle={{ padding: "6px 4px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0 }}>REALTIME SCORE</div>
        {canSee ? (
          <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13, fontWeight: 700 }}>
                <span style={{ color: T.primary }}>{vote.optA} {ra}%</span>
                <span style={{ color: T.danger }}>{vote.optB} {100 - ra}%</span>
              </div>
              <div style={{ height: 12, background: T.bg2, borderRadius: T.radiusSm, overflow: "hidden", border: `2px solid ${T.border}` }}>
                <div style={{ height: "100%", width: `${ra}%`, background: T.primary, transition: "width .8s steps(8, end)", borderRadius: T.radiusSm }} />
              </div>
            </div>
            {/* 배팅 현황 */}
              <div style={{ borderTop: `3px solid ${T.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: T.text2, marginBottom: 6, fontWeight: 700 }}>배팅 크레딧 현황</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11, fontWeight: 900 }}>
                <span style={{ color: T.primary }}>{vote.optA} {vote.totalBetA.toLocaleString()} C</span>
                <span style={{ color: T.danger }}>{vote.totalBetB.toLocaleString()} C {vote.optB}</span>
              </div>
              <div style={{ height: 9, background: T.bg2, borderRadius: T.radiusSm, overflow: "hidden", border: `2px solid ${T.border}` }}>
                <div style={{ height: "100%", width: `${bra}%`, background: T.accent, borderRadius: T.radiusSm }} />
              </div>
            </div>
            {/* 최종 승자 표시 (종료된 경우만) */}
            {vote.status === "closed" && vote.winner && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: T.radiusSm, textAlign: "center", background: vote.winner === "draw" ? T.accentDim : T.primaryDim, border: `3px solid ${vote.winner === "draw" ? T.accent : T.primary}` }}>
                <div style={{ fontSize: 10, color: T.text2, marginBottom: 3 }}>🏆 최종 결과</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: vote.winner === "draw" ? T.accent : T.primary }}>
                  {vote.winner === "draw" ? "무승부" : vote.winner === "A" ? `${vote.optA} 승리!` : `${vote.optB} 승리!`}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ background: "rgba(5,0,23,0.68)", border: `2px dashed ${T.border}`, borderRadius: 5, padding: 28, textAlign: "center", color: T.muted }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>LOCK</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>결과 비공개</div>
            <div style={{ fontSize: 11 }}>투표에 참여하면 실시간 결과를 확인할 수 있습니다.</div>
          </div>
        )}
      </ArcadePanel>
    </div>
  );
}
