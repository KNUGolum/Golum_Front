// src/context/ToastContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { useState, useCallback, createContext, useContext } from "react";
import { T } from "../styles/theme";

// 다른 컴포넌트에서 알림 기능을 쓸 수 있게 '통로(Context)'를 만듭니다.
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // 알림을 띄우는 함수입니다. msg(내용)와 type(색상 종류)을 받습니다.
  const toast = useCallback((msg, type = "info") => {
    const id = `${Date.now()}`;
    setToasts(p => [...p, { id, msg, type }]);
    
    // 3초 뒤에 자동으로 사라지게 만듭니다.
    setTimeout(() => {
      setToasts(p => p.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // 각 타입별로 어떤 테마 색상을 쓸지 정합니다.
  const clr = {
    success: T.primary,
    error: T.danger,
    info: T.accent,
    gold: T.gold
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* 알림창이 뜰 위치와 스타일입니다. */}
      <div style={{
        position: "fixed", top: 70, right: 16, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: T.card2, border: `3px solid ${clr[t.type]}`,
            color: clr[t.type], borderRadius: T.radiusSm, padding: "10px 16px",
            fontSize: 13, maxWidth: 260, boxShadow: T.pixelShadow,
            animation: "slideIn .3s ease" // 이 애니메이션은 App.jsx에서 정의할 예정입니다.
          }}>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
