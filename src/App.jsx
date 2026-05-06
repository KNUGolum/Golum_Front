// src/App.jsx
import { useState } from "react";
import { T } from "./styles/theme";
import { ToastProvider } from "./context/ToastContext";
import { MOCK_VOTES } from "./data/mockData";
import backgroundImage from "./assets/Background.png";

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
  // --- 전역 상태 관리 ---
  const [page, setPage] = useState("auth");    // 현재 보여줄 페이지 관리
  const [user, setUser] = useState(null);      // 로그인한 유저 정보
  const [votes, setVotes] = useState([...MOCK_VOTES]); // 전체 투표 목록
  const [vid, setVid] = useState(null);        // 현재 상세 보기 중인 투표 ID

  // [로직] 데이터 새로고침 및 동기화
  function refresh(nextUser, nextVote) {
    if (nextUser) setUser(nextUser);
    if (nextVote) {
      const voteIndex = MOCK_VOTES.findIndex(v => v.id === nextVote.id);
      if (voteIndex >= 0) MOCK_VOTES[voteIndex] = nextVote;
    }
    setVotes([...MOCK_VOTES]); // 실제로는 여기서 다시 API 요청을 보냄
  }

  // [로직] 페이지 이동 함수 (nav)
  function nav(p, voteId) {
    if (voteId !== undefined) setVid(voteId);
    setPage(p);
    window.scrollTo(0, 0); // 페이지 이동 시 최상단으로 스크롤
  }

  // 현재 선택된 투표 데이터 찾기
  const currentVote = votes.find(v => v.id === vid) || null;

  return (
    <ToastProvider>
      {/* 전역 스타일 설정 (Reset 및 애니메이션) */}
      <style>{`
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
          <AuthPage onLogin={u => { setUser(u); nav("home"); }} />
        ) : (
          // 2. 인증된 유저에게는 네비게이션 바와 각 페이지 표시
          user && (
            <>
              <NavBar user={user} nav={nav} logout={() => { setUser(null); setPage("auth"); }} />
              
              <main style={{ minHeight: "calc(100vh - 56px)" }}>
                {page === "home" && (
                  <HomePage votes={votes} user={user} nav={nav} />
                )}
                
                {page === "detail" && currentVote && (
                  <VoteDetailPage 
                    vote={currentVote} 
                    user={user} 
                    onVoted={(nextVote, nextUser) => refresh(nextUser, nextVote)} 
                    onBetSkip={(nextVote) => refresh(null, nextVote)}
                    nav={nav} 
                  />
                )}
                
                {page === "bet" && currentVote && (
                  <BettingPage 
                    vote={currentVote} 
                    user={user} 
                    onBet={(nextVote, nextUser) => { refresh(nextUser, nextVote); nav("detail", currentVote.id); }} 
                    onBack={() => nav("detail", currentVote.id)}
                    onSkip={(nextVote) => { refresh(null, nextVote); nav("detail", currentVote.id); }} 
                  />
                )}
                
                {page === "create" && (
                  <CreateVotePage 
                    user={user} 
                    onCreated={v => { refresh(); nav("detail", v.id); }} 
                    nav={nav} 
                  />
                )}
              </main>
            </>
          )
        )}
      </div>
    </ToastProvider>
  );
}
