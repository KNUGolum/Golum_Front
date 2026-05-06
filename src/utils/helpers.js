// src/utils/helpers.js
export const timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "방금 전";
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
};

export const timeLeft = (exp) => {
  const ms = exp - Date.now();
  if (ms <= 0) return "종료됨";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}시간 ${m}분 남음` : `${m}분 남음`;
};

export const rateA = (v) => {
  const t = v.votesA + v.votesB;
  return t === 0 ? 50 : Math.round((v.votesA / t) * 100);
};

export const betRateA = (v) => {
  const t = v.totalBetA + v.totalBetB;
  return t === 0 ? 50 : Math.round((v.totalBetA / t) * 100);
};

export const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));