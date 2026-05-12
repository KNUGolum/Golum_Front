// src/App.jsx
import { useEffect, useRef, useState } from "react";
import { T } from "./styles/theme";
import { ToastProvider, useToast } from "./context/ToastContext";
import backgroundImage from "./assets/Background.png";
import { authApi } from "./api/auth";
import { betsApi } from "./api/bets";
import { clearTokens, getTokens, getWebSocketUrl } from "./api/client";
import { pollsApi } from "./api/polls";

// 페이지 컴포넌트들 불러오기
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { VoteDetailPage } from "./pages/VoteDetailPage";
import { BettingPage } from "./pages/BettingPage";
import { CreateVotePage } from "./pages/CreateVotePage";

// 레이아웃 컴포넌트 불러오기
import { NavBar } from "./components/layout/NavBar";
import { BattleBackgroundCharacters } from "./components/layout/BattleBackgroundCharacters";

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

function AppContent() {
  // --- 전역 상태 관리 ---
  const [page, setPage] = useState("auth");    // 현재 보여줄 페이지 관리
  const [user, setUser] = useState(null);      // 로그인한 유저 정보
  const [votes, setVotes] = useState([]); // 전체 투표 목록
  const [currentVote, setCurrentVote] = useState(null);
  const [filter, setFilter] = useState("active");
  const [loadingList, setLoadingList] = useState(false);
  const toast = useToast();
  const userRef = useRef(null);
  const filterRef = useRef(filter);
  const currentVoteRef = useRef(null);

  async function refreshMe() {
    const nextUser = await authApi.me();
    setUser(nextUser);
    return nextUser;
  }

  async function loadVotes(nextFilter = filter) {
    setLoadingList(true);
    try {
      const data = await pollsApi.list({ filter: nextFilter });
      setVotes(data.polls);
    } finally {
      setLoadingList(false);
    }
  }

  async function loadVoteDetail(voteId, nextUser = user) {
    if (!nextUser) return null;
    const detail = await pollsApi.detail(voteId, nextUser.email);
    const existingVote = votes.find((v) => v.id === detail.id);
    const stableDetail = {
      ...detail,
      createdAt: detail.createdAt ?? existingVote?.createdAt ?? currentVote?.createdAt,
    };
    setCurrentVote(stableDetail);
    setVotes((prev) => prev.map((v) => (
      v.id === stableDetail.id
        ? { ...v, ...stableDetail, createdAt: stableDetail.createdAt ?? v.createdAt }
        : v
    )));
    return stableDetail;
  }

  // [로직] 페이지 이동 함수 (nav)
  function nav(p, voteId) {
    if (voteId !== undefined) {
      setCurrentVote(votes.find((v) => v.id === voteId) || null);
    }
    setPage(p);
    window.scrollTo(0, 0); // 페이지 이동 시 최상단으로 스크롤
    if ((p === "detail" || p === "bet") && voteId !== undefined) {
      loadVoteDetail(voteId).catch(() => {});
    }
  }

  async function handleLogin(nextUser) {
    setUser(nextUser);
    setPage("home");
    await loadVotes("active");
  }

  function handleLogout() {
    clearTokens();
    setUser(null);
    setVotes([]);
    setCurrentVote(null);
    setPage("auth");
  }

  async function handleFilterChange(nextFilter) {
    setFilter(nextFilter);
    await loadVotes(nextFilter);
  }

  async function handleVoted(choice) {
    await pollsApi.vote(currentVote.id, choice);
    const nextUser = await refreshMe();
    await loadVoteDetail(currentVote.id, nextUser);
    await loadVotes(filter);
  }

  async function handleBet(amount) {
    const selection = currentVote.mySelection;
    if (selection !== "A" && selection !== "B") {
      throw new Error("배팅 선택 정보를 불러오지 못했습니다. 투표 상세를 다시 열어주세요.");
    }
    await betsApi.bet(currentVote.id, {
      optionId: selection,
      amount,
    });
    const nextUser = await refreshMe();
    await loadVoteDetail(currentVote.id, nextUser);
    await loadVotes(filter);
    setPage("detail");
    window.scrollTo(0, 0);
  }

  async function handleCreated(input) {
    const created = await pollsApi.create(input);
    const detail = await pollsApi.detail(created.pollId, user.email);
    setCurrentVote(detail);
    await loadVotes(filter);
    setPage("detail");
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    if (!getTokens()?.accessToken) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshMe()
      .then((nextUser) => {
        setPage("home");
        return pollsApi.list({ filter: "active" }).then((data) => {
          setVotes(data.polls);
          return nextUser;
        });
      })
      .catch(() => {
        clearTokens();
        setUser(null);
        setPage("auth");
      });
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    filterRef.current = filter;
  }, [filter]);

  useEffect(() => {
    currentVoteRef.current = currentVote;
  }, [currentVote]);

  useEffect(() => {
    if (!user?.id) return;

    let socket = null;
    let reconnectTimer = null;
    let closedByCleanup = false;

    const handleRealtimeMessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      if (message.type === "POLL_END") {
        toast(message.message || "투표가 종료되었습니다.", "info");
        loadVotes(filterRef.current).catch(() => {});
        if (currentVoteRef.current?.id === message.pollId) {
          loadVoteDetail(message.pollId).catch(() => {});
        }
      }

      if (message.type === "PAYOUT_COMPLETE") {
        const amount = message.amount ?? 0;
        toast(message.message || `${amount} 크레딧이 정산되었습니다.`, "gold");
        refreshMe().catch(() => {});
        loadVotes(filterRef.current).catch(() => {});
        if (currentVoteRef.current?.id === message.pollId) {
          loadVoteDetail(message.pollId).catch(() => {});
        }
      }
    };

    const connect = () => {
      socket = new WebSocket(getWebSocketUrl(user.id));
      socket.onmessage = handleRealtimeMessage;
      socket.onerror = () => {
        socket?.close();
      };
      socket.onclose = () => {
        if (closedByCleanup) return;
        reconnectTimer = window.setTimeout(connect, 2000);
      };
    };

    connect();

    return () => {
      closedByCleanup = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const intervalId = window.setInterval(async () => {
      try {
        const previousCredits = userRef.current?.credits;
        const nextUser = await authApi.me();
        setUser(nextUser);

        if (
          typeof previousCredits === "number" &&
          nextUser.credits > previousCredits
        ) {
          toast(`정산으로 ${nextUser.credits - previousCredits} 크레딧이 지급되었습니다.`, "gold");
        }

        const data = await pollsApi.list({ filter: filterRef.current });
        setVotes(data.polls);

        const openedVoteId = currentVoteRef.current?.id;
        if (openedVoteId) {
          const detail = await pollsApi.detail(openedVoteId, nextUser.email);
          setCurrentVote((prev) => ({
            ...detail,
            createdAt: detail.createdAt ?? prev?.createdAt,
          }));
        }
      } catch {
        // Keep the app usable if a transient refresh fails.
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [user?.id, toast]);

  return (
    <>
      {/* 전역 스타일 설정 (Reset 및 애니메이션) */}
      <style>{`
        @font-face {
          font-family: "NeoDonggeunmo";
          src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.3/NeoDunggeunmo.woff") format("woff");
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { background: #06030b; }
        body {
          background: #06030b;
          color: ${T.text};
          font-family: ${T.font};
          overflow-x: hidden;
          image-rendering: pixelated;
        }
        .arcade-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background:
            #03030b;
        }
        .arcade-bg-image {
          position: absolute;
          left: 50%;
          top: 0;
          width: 1670px;
          height: 941px;
          transform: translateX(-50%);
          background: url(${backgroundImage}) center top / 1670px 941px no-repeat;
          image-rendering: pixelated;
        }
        body::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9998;
          background:
            repeating-linear-gradient(
              to bottom,
              rgba(255,255,255,0.08) 0,
              rgba(255,255,255,0.08) 1px,
              transparent 1px,
              transparent 5px
            );
          mix-blend-mode: soft-light;
        }
        button, input { font-family: ${T.font}; }
        button, input, nav, main, div, span {
          text-rendering: geometricPrecision;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateX(18px) } to { opacity: 1; transform: translateX(0) } }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 10px; border-radius: 0; background: ${T.danger}; outline: none; border: 2px solid ${T.primary}; box-shadow: 3px 3px 0 #000; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 22px; height: 22px; border-radius: 0; background: ${T.gold}; cursor: pointer; border: 3px solid #000; box-shadow: 3px 3px 0 ${T.danger}; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      {user && (
        <div className="arcade-bg" aria-hidden="true">
          <div className="arcade-bg-image" />
          <BattleBackgroundCharacters />
        </div>
      )}

      <div style={{ minHeight: "100vh", background: "transparent", color: T.text, position: "relative", zIndex: 1 }}>
        {page === "auth" ? (
          // 1. 미인증 유저에게는 로그인 페이지 표시
          <AuthPage onLogin={handleLogin} />
        ) : (
          // 2. 인증된 유저에게는 네비게이션 바와 각 페이지 표시
          user && (
            <>
              <NavBar user={user} nav={nav} logout={handleLogout} />
              
              <main style={{ minHeight: "calc(100vh - 56px)" }}>
                {page === "home" && (
                  <HomePage
                    votes={votes}
                    user={user}
                    nav={nav}
                    filter={filter}
                    onFilterChange={handleFilterChange}
                    loading={loadingList}
                  />
                )}
                
                {page === "detail" && currentVote && (
                  <VoteDetailPage 
                    vote={currentVote} 
                    user={user} 
                    onVoted={handleVoted}
                    onBetSkip={() => handleBet(0)}
                    nav={nav} 
                  />
                )}
                
                {page === "bet" && currentVote && (
                  <BettingPage 
                    vote={currentVote} 
                    user={user} 
                    onBet={handleBet}
                    onBack={() => nav("detail", currentVote.id)}
                    onSkip={() => handleBet(0)}
                  />
                )}
                
                {page === "create" && (
                  <CreateVotePage 
                    user={user} 
                    onCreated={handleCreated}
                    nav={nav} 
                  />
                )}
              </main>
            </>
          )
        )}
      </div>
    </>
  );
}
