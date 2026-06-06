import { useEffect, useMemo, useState } from "react";
import { logsApi } from "../api/logs";
import { pollsApi } from "../api/polls";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { Button } from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import { T } from "../styles/theme";

function formatDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resultStyle(result) {
  if (result === "WIN") return { color: T.accent, label: "승리" };
  if (result === "LOSE") return { color: T.danger, label: "패배" };
  return { color: T.gold, label: "정산 대기" };
}

function optionLabel(poll, optionId) {
  const id = String(optionId);
  if (String(poll?.optionAId) === id) return poll.optA;
  if (String(poll?.optionBId) === id) return poll.optB;
  return "알 수 없는 선택지";
}

function selectedSide(poll, optionId) {
  const id = String(optionId);
  if (String(poll?.optionAId) === id) return "A";
  if (String(poll?.optionBId) === id) return "B";
  return "-";
}

export function ActivityLogsPage({ user, nav }) {
  const toast = useToast();
  const [tab, setTab] = useState("bets");
  const [votes, setVotes] = useState([]);
  const [bets, setBets] = useState([]);
  const [pollsById, setPollsById] = useState({});
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    setLoading(true);
    try {
      const [voteData, betData] = await Promise.all([
        logsApi.votes(),
        logsApi.bets(),
      ]);
      const nextVotes = voteData || [];
      const nextBets = betData || [];
      const pollIds = [...new Set([...nextVotes, ...nextBets].map((item) => item.pollId))];
      const details = await Promise.all(
        pollIds.map((pollId) => (
          pollsApi.detail(pollId, user.email)
            .then((detail) => [pollId, detail])
            .catch(() => [pollId, null])
        ))
      );

      setVotes(nextVotes);
      setBets(nextBets);
      setPollsById(Object.fromEntries(details.filter(([, detail]) => detail)));
    } finally {
      setLoading(false);
    }
  }

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  useEffect(() => {
    loadLogs().catch((error) => toast(error.message || "로그를 불러오지 못했습니다.", "error"));
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  const rows = useMemo(() => {
    const source = tab === "bets" ? bets : votes;
    return [...source].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tab, bets, votes]);

  const visibleBetCount = bets.length;

  return (
    <div style={{ padding: "20px 16px 80px", maxWidth: 760, margin: "0 auto" }}>
      <button onClick={() => nav("home")} style={{ background: "none", border: "none", color: T.text2, cursor: "pointer", fontSize: 13, marginBottom: 14, fontFamily: T.font }}>
        목록으로
      </button>

      <ArcadePanel>
        <div style={{
          background: "linear-gradient(135deg, rgba(35,11,82,0.66) 0 45%, rgba(0,0,0,0.26) 45% 56%, rgba(23,6,58,0.58) 56% 100%)",
          borderBottom: `2px solid ${T.primary}`,
          padding: "16px 22px 17px",
          margin: "-2px -2px 16px",
        }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.gold, textShadow: `3px 3px 0 ${T.danger}` }}>활동 로그</div>
          <div style={{ color: T.primary, fontSize: 13, marginTop: 6, fontWeight: 900 }}>
            배팅 {visibleBetCount}건 / 투표 {votes.length}건
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Button sm v={tab === "bets" ? "gold" : "outline"} onClick={() => setTab("bets")}>배팅 로그</Button>
          <Button sm v={tab === "votes" ? "gold" : "outline"} onClick={() => setTab("votes")}>투표 로그</Button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 36, color: T.text2, fontSize: 13 }}>불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: 36, color: T.muted, fontSize: 13 }}>
            {tab === "bets" ? "배팅 로그가 없습니다." : "투표 로그가 없습니다."}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {rows.map((item) => {
              const poll = pollsById[item.pollId];
              const option = optionLabel(poll, item.optionId);
              const side = selectedSide(poll, item.optionId);
              const result = resultStyle(item.result);
              const skippedBet = tab === "bets" && Number(item.amount || 0) === 0;

              return (
                <div key={`${tab}-${item.id}`} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                  padding: 14,
                  border: `2px solid ${tab === "bets" ? T.gold : T.primary}`,
                  background: "rgba(5,0,23,0.62)",
                  borderRadius: 4,
                  boxShadow: "inset 0 0 14px rgba(123,61,255,0.18)",
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: T.text, fontSize: 15, fontWeight: 900, marginBottom: 6, lineHeight: 1.35 }}>
                      {poll?.title || "투표 정보를 불러오지 못했습니다."}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                      <span style={{ color: side === "A" ? T.primary : T.danger, fontSize: 12, fontWeight: 900 }}>
                        내가 선택한 항목: {side} - {option}
                      </span>
                      {tab === "bets" && (
                        <span style={{ color: skippedBet ? T.text2 : result.color, fontSize: 12, fontWeight: 900 }}>
                          {skippedBet ? "배팅 포기" : result.label}
                        </span>
                      )}
                    </div>
                    <div style={{ color: T.text2, fontSize: 12, fontWeight: 800 }}>
                      {formatDate(item.createdAt)}
                    </div>
                  </div>

                  {tab === "bets" ? (
                    <div style={{ textAlign: "right", color: skippedBet ? T.text2 : T.gold, fontWeight: 900, fontSize: 13 }}>
                      {skippedBet ? "포기" : `${Number(item.amount || 0).toLocaleString()} C`}
                      {!skippedBet && (
                        <div style={{ color: T.accent, fontSize: 11, marginTop: 3 }}>
                          보상 +{Number(item.rewardAmount || 0).toLocaleString()} C
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button sm v="outline" onClick={() => nav("detail", item.pollId)}>보기</Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ArcadePanel>
    </div>
  );
}
