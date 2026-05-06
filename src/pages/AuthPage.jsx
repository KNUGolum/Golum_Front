// src/pages/AuthPage.jsx
import { useEffect, useState } from "react";
import { T } from "../styles/theme";
import { Button } from "../components/common/Button";
import { Field } from "../components/common/Field";
import { ArcadePanel } from "../components/common/ArcadePanel";
import { useToast } from "../context/ToastContext";
import { MOCK_USERS } from "../data/mockData";
import { delay } from "../utils/helpers";
import packman1 from "../assets/packman1.png";
import packman2 from "../assets/packman2.png";
import packman3 from "../assets/packman3.png";
import packman4 from "../assets/packman4.png";
import packman5 from "../assets/packman5.png";
import golumLogo from "../assets/golum.png";

const PACKMAN_FRAMES = [packman1, packman2, packman3, packman4, packman5, packman4, packman3, packman2];
const PACKMAN_GLYPHS = {
  G: [
    "..#####.",
    ".######.",
    "##......",
    "##......",
    "##..####",
    "##..####",
    "##....##",
    "##....##",
    ".######.",
    "..#####.",
  ],
  O: [
    ".######.",
    "########",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "########",
    ".######.",
  ],
  L: [
    "##......",
    "##......",
    "##......",
    "##......",
    "##......",
    "##......",
    "##......",
    "##......",
    "########",
    "########",
  ],
  U: [
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "########",
    ".######.",
  ],
  M: [
    "##....##",
    "###..###",
    "########",
    "########",
    "##.##.##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
    "##....##",
  ],
};
const PACKMAN_WORD = "GOLUM";
const PACKMAN_LETTER_GAP = "..";
const PACKMAN_MAP = PACKMAN_GLYPHS.G.map((_, rowIndex) =>
  PACKMAN_WORD.split("").map((letter) => PACKMAN_GLYPHS[letter][rowIndex]).join(PACKMAN_LETTER_GAP)
);
const PACKMAN_COLS = Math.max(...PACKMAN_MAP.map((row) => row.length));
const PACKMAN_ROWS = PACKMAN_MAP.length;
const PACKMAN_TOTAL_STEPS = PACKMAN_MAP.length * PACKMAN_COLS;
const PACKMAN_CELL_SIZE = 14;
const PACKMAN_ROW_SIZE = 13;
const PACKMAN_MAP_WIDTH = PACKMAN_COLS * PACKMAN_CELL_SIZE;
const PACKMAN_MAP_HEIGHT = PACKMAN_ROWS * PACKMAN_ROW_SIZE;
const PACKMAN_TRACK_TOP = "max(40px, calc(50% - 330px))";
const PACKMAN_PELLETS = PACKMAN_MAP.flatMap((row, rowIndex) =>
  row.padEnd(PACKMAN_COLS, ".").split("").flatMap((cell, colIndex) =>
    cell === "#" ? [{ key: `${rowIndex}-${colIndex}`, rowIndex, colIndex }] : []
  )
);
const GHOST_MODULES = import.meta.glob("../assets/ghosts/*.png", { eager: true, import: "default" });
const GHOST_FRAMES = Object.entries(GHOST_MODULES).reduce((frames, [path, src]) => {
  const match = path.match(/\/(Blue|Red|yellow)(\d+)\.png$/);
  if (!match) return frames;
  const [, color, frameNumber] = match;
  frames[color] = frames[color] || [];
  frames[color][Number(frameNumber) - 1] = src;
  return frames;
}, {});
const LOGIN_GHOSTS = [
  { key: "red", frames: GHOST_FRAMES.Red || [], delay: 4, glow: "rgba(255, 42, 83, 0.7)" },
  { key: "blue", frames: GHOST_FRAMES.Blue || [], delay: 6, glow: "rgba(0, 210, 255, 0.72)" },
  { key: "yellow", frames: GHOST_FRAMES.yellow || [], delay: 8, glow: "rgba(255, 231, 92, 0.72)" },
];

function getPackTrackPosition(step) {
  const normalizedStep = ((step % PACKMAN_TOTAL_STEPS) + PACKMAN_TOTAL_STEPS) % PACKMAN_TOTAL_STEPS;
  const row = Math.floor(normalizedStep / PACKMAN_COLS) % PACKMAN_ROWS;
  const col = normalizedStep % PACKMAN_COLS;
  return {
    row,
    col,
    x: ((col + 0.5) / PACKMAN_COLS) * PACKMAN_MAP_WIDTH,
    y: ((row + 0.5) / PACKMAN_ROWS) * PACKMAN_MAP_HEIGHT - 3,
  };
}

function toTrackStyle(position) {
  return {
    left: `calc(50% - ${PACKMAN_MAP_WIDTH / 2}px + ${position.x}px)`,
    top: `calc(${PACKMAN_TRACK_TOP} + ${position.y}px)`,
    transition: position.col === 0 ? "none" : undefined,
  };
}

export function AuthPage({ onLogin }) {
  const toast = useToast();
  const [tab, setTab] = useState("login"); // 'login' 또는 'signup'

  // --- 로그인 관련 상태 ---
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 회원가입 관련 상태 ---
  const [sEm, setSEm] = useState("");
  const [sEmSt, setSEmSt] = useState("none"); // 'none', 'checking', 'ok', 'err'
  const [sEmOk, setSEmOk] = useState(false);

  const [sNk, setSNk] = useState("");
  const [sNkSt, setSNkSt] = useState("none");
  const [sNkOk, setSNkOk] = useState(false);

  const [sPw, setSPw] = useState("");
  const [sPw2, setSPw2] = useState("");
  const [sLoad, setSLoad] = useState(false);
  const [packStep, setPackStep] = useState(0);
  const packPosition = getPackTrackPosition(packStep);
  const packFrame = PACKMAN_FRAMES[packStep % PACKMAN_FRAMES.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPackStep((step) => (step + 1) % PACKMAN_TOTAL_STEPS);
    }, 120);
    return () => window.clearInterval(timer);
  }, []);

  // 비밀번호 유효성: 영문, 숫자, 특수문자 포함 8자 이상
  const pwOk = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(sPw);
  const pwMatch = sPw === sPw2 && sPw.length > 0;

  // [로직] 로그인 처리
  async function handleLogin() {
    if (!em || !pw) {
      toast("이메일과 비밀번호를 입력해주세요.", "error");
      return;
    }
    setLoading(true);
    await delay(); // 서버 통신 흉내
    const user = MOCK_USERS.find((u) => u.email === em && u.password === pw);
    setLoading(false);

    if (!user) {
      toast("이메일 또는 비밀번호가 올바르지 않습니다.", "error");
      return;
    }
    toast(`환영합니다, ${user.nickname}님! 👋`, "success");
    onLogin({ ...user });
  }

  // [로직] 이메일 중복 확인
  async function checkEmail() {
    if (!sEm) return;
    setSEmSt("checking");
    await delay(300);
    if (MOCK_USERS.find((u) => u.email === sEm)) {
      setSEmSt("err");
      setSEmOk(false);
      toast("이미 가입된 이메일입니다.", "error");
    } else {
      setSEmSt("ok");
      setSEmOk(true);
      toast("사용 가능한 이메일입니다.", "success");
    }
  }

  // [로직] 닉네임 중복 확인
  async function checkNickname() {
    if (!sNk) return;
    setSNkSt("checking");
    await delay(300);
    if (MOCK_USERS.find((u) => u.nickname === sNk)) {
      setSNkSt("err");
      setSNkOk(false);
      toast("이미 사용 중인 닉네임입니다.", "error");
    } else {
      setSNkSt("ok");
      setSNkOk(true);
      toast("사용 가능한 닉네임입니다. ✓", "success");
    }
  }

  // [로직] 회원가입 처리
  async function handleSignup() {
    if (!sEmOk || !sNkOk) {
      toast("중복 확인이 완료되지 않은 항목이 있습니다.", "error");
      return;
    }
    if (!pwOk) {
      toast("비밀번호 형식을 확인해주세요.", "error");
      return;
    }
    if (!pwMatch) {
      toast("비밀번호가 일치하지 않습니다.", "error");
      return;
    }
    setSLoad(true);
    await delay();
    const newUser = {
      id: `u${Date.now()}`,
      email: sEm,
      nickname: sNk,
      password: sPw,
      credits: 1000,
      createdAt: Date.now(),
    };
    MOCK_USERS.push(newUser);
    setSLoad(false);
    toast("🎉 가입 완료! 1,000 크레딧이 지급되었습니다.", "gold");
    onLogin({ ...newUser });
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
      background: T.bg,
      backgroundImage: `linear-gradient(45deg, rgba(255,43,214,0.14) 25%, transparent 25%, transparent 75%, rgba(0,255,234,0.12) 75%),linear-gradient(45deg, rgba(54,255,77,0.12) 25%, transparent 25%, transparent 75%, rgba(255,231,92,0.1) 75%)`,
      backgroundSize: "30px 30px",
      backgroundPosition: "0 0, 15px 15px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        .login-packman {
          position: absolute;
          width: 32px;
          height: 32px;
          pointer-events: none;
          image-rendering: pixelated;
          filter: drop-shadow(4px 4px 0 #000) drop-shadow(0 0 14px rgba(255,231,92,0.54));
          z-index: 0;
          transform: translate(-50%, -50%);
          transition: left 115ms linear, top 115ms linear;
          will-change: left, top;
        }
        .login-ghost {
          position: absolute;
          width: 30px;
          height: 30px;
          pointer-events: none;
          image-rendering: pixelated;
          filter: drop-shadow(3px 3px 0 #000) drop-shadow(0 0 12px var(--ghost-glow));
          z-index: 0;
          transform: translate(-50%, -50%);
          transition: left 115ms linear, top 115ms linear;
          will-change: left, top;
        }
        .login-packman img,
        .login-ghost img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .login-pellet-map {
          position: absolute;
          left: 50%;
          top: ${PACKMAN_TRACK_TOP};
          width: var(--pack-map-w);
          height: var(--pack-map-h);
          transform: translateX(-50%);
          pointer-events: none;
          z-index: 0;
          display: grid;
          grid-template-columns: repeat(${PACKMAN_COLS}, 1fr);
          grid-template-rows: repeat(${PACKMAN_ROWS}, 1fr);
          gap: 0;
        }
        .login-pellet {
          width: 7px;
          height: 7px;
          align-self: center;
          justify-self: center;
          background: ${T.gold};
          border-radius: 999px;
          box-shadow: 0 0 8px rgba(255,231,92,0.72), 1px 1px 0 #000;
          opacity: 0.92;
        }
        .login-pellet-eaten {
          opacity: 0;
        }
        @media (max-width: 760px) {
          .login-pellet-map {
            --pack-map-w: 92vw;
            --pack-map-h: 100px;
            top: 14px;
          }
          .login-packman {
            width: 26px;
            height: 26px;
          }
          .login-ghost {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
      <div
        className="login-pellet-map"
        aria-hidden="true"
        style={{
          "--pack-map-w": `${PACKMAN_MAP_WIDTH}px`,
          "--pack-map-h": `${PACKMAN_MAP_HEIGHT}px`,
        }}
      >
        {PACKMAN_PELLETS.map(({ key, rowIndex, colIndex }) => {
          const eaten = rowIndex < packPosition.row || (rowIndex === packPosition.row && colIndex <= packPosition.col);
          return (
            <span
              key={key}
              className={`login-pellet ${eaten ? "login-pellet-eaten" : ""}`}
              style={{ gridColumn: colIndex + 1, gridRow: rowIndex + 1 }}
            />
          );
        })}
      </div>
      {LOGIN_GHOSTS.map((ghost, ghostIndex) => {
        if (!ghost.frames.length) return null;
        const ghostPosition = getPackTrackPosition(packStep - ghost.delay);
        return (
          <div
            key={ghost.key}
            className="login-ghost"
            aria-hidden="true"
            style={{
              "--ghost-glow": ghost.glow,
              ...toTrackStyle(ghostPosition),
            }}
          >
            <img src={ghost.frames[(packStep + ghostIndex * 2) % ghost.frames.length]} alt="" />
          </div>
        );
      })}
      <div
        className="login-packman"
        aria-hidden="true"
        style={toTrackStyle(packPosition)}
      >
        <img src={packFrame} alt="" />
      </div>
      <ArcadePanel style={{ width: "100%", maxWidth: 430, padding: 28, position: "relative", zIndex: 1, marginTop: 120 }} innerStyle={{ padding: "10px 4px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
          <img
            src={golumLogo}
            alt=""
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(3px 3px 0 #000) drop-shadow(0 0 10px rgba(255,231,92,0.28))",
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 900, color: T.gold, letterSpacing: 4, textShadow: `3px 3px 0 ${T.danger}, -3px -3px 0 ${T.primary}` }}>
            GOLUM
          </div>
        </div>
        <p style={{ textAlign: "center", color: T.primary, fontSize: 12, marginBottom: 24, fontWeight: 900 }}>PRESS START - VOTE & BET</p>

        {/* 탭 전환 */}
        <div style={{ display: "flex", background: "rgba(5,0,23,0.76)", border: `2px solid ${T.border}`, borderRadius: 4, padding: 4, marginBottom: 24, boxShadow: "inset 0 0 14px rgba(0,0,0,0.48)" }}>
          {["login", "signup"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 2, border: `2px solid ${tab === t ? T.primary : "transparent"}`,
                background: tab === t ? T.gold : "transparent",
                color: tab === t ? "#050017" : T.text2,
                fontWeight: 900, fontSize: 13, cursor: "pointer", transition: "all .12s steps(2, end)", fontFamily: T.font,
                boxShadow: tab === t ? `0 0 12px rgba(255,231,92,0.35)` : undefined,
              }}
            >
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        {tab === "login" ? (
          <>
            <Field label="이메일" value={em} onChange={setEm} placeholder="your@email.com" type="email" />
            <Field label="비밀번호" value={pw} onChange={setPw} placeholder="비밀번호 입력" type="password" />
            <Button v="primary" full onClick={handleLogin} disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </Button>
            <p style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: T.text2 }}>데모: demo@example.com / Demo1234!</p>
          </>
        ) : (
          <>
            <Field
              label="이메일" value={sEm} onChange={(v) => { setSEm(v); setSEmOk(false); setSEmSt("none"); }}
              type="email" placeholder="your@email.com" ok={sEmSt === "ok"} err={sEmSt === "err"}
              msg={sEmSt === "ok" ? "✓ 사용 가능" : sEmSt === "err" ? "✗ 이미 사용 중" : undefined}
              suffix={<Button sm v="outline" onClick={checkEmail} disabled={!sEm || sEmSt === "checking"}>중복확인</Button>}
            />
            <Field
              label="닉네임" value={sNk} onChange={(v) => { setSNk(v); setSNkOk(false); setSNkSt("none"); }}
              placeholder="닉네임 (10자 이내)" ok={sNkSt === "ok"} err={sNkSt === "err"}
              msg={sNkSt === "ok" ? "✓ 사용 가능" : sNkSt === "err" ? "✗ 이미 사용 중" : undefined}
              suffix={<Button sm v="outline" onClick={checkNickname} disabled={!sNk || sNkSt === "checking"}>중복확인</Button>}
            />
            <Field
              label="비밀번호" value={sPw} onChange={setSPw} type="password" placeholder="영문+숫자+특수문자 8자 이상"
              ok={sPw.length > 0 && pwOk} err={sPw.length > 0 && !pwOk}
              msg={sPw.length > 0 && !pwOk ? "영문, 숫자, 특수문자 포함 8자 이상" : undefined}
            />
            <Field
              label="비밀번호 확인" value={sPw2} onChange={setSPw2} type="password" placeholder="비밀번호 재입력"
              ok={sPw2.length > 0 && pwMatch} err={sPw2.length > 0 && !pwMatch}
              msg={sPw2.length > 0 && !pwMatch ? "비밀번호가 일치하지 않습니다" : sPw2.length > 0 && pwMatch ? "✓ 일치합니다" : undefined}
            />
            <Button v="primary" full onClick={handleSignup} disabled={sLoad}>
              {sLoad ? "가입 중..." : "가입하기 (+1,000 크레딧)"}
            </Button>
          </>
        )}
      </ArcadePanel>
    </div>
  );
}
