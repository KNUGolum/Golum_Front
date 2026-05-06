const PANEL_CORNER_BITS = [
  { x: 0, y: 9, size: 4, opacity: 0.94, glow: 11 },
  { x: 0, y: 13, size: 4, opacity: 0.84, glow: 9 },
  { x: 0, y: 20, size: 3, opacity: 0.68, glow: 6 },
  { x: 0, y: 30, size: 3, opacity: 0.4, glow: 4 },
  { x: 0, y: 43, size: 2, opacity: 0.18, glow: 2 },
  { x: 2, y: 7, size: 4, opacity: 1, glow: 12 },
  { x: 6, y: 7, size: 4, opacity: 0.88, glow: 9 },
  { x: 13, y: 7, size: 3, opacity: 0.74, glow: 7 },
  { x: 22, y: 7, size: 3, opacity: 0.5, glow: 5 },
  { x: 35, y: 7, size: 2, opacity: 0.26, glow: 3 },
  { x: 51, y: 7, size: 2, opacity: 0.14, glow: 1 },
  { x: 2, y: 11, size: 2, opacity: 0.66, glow: 5 },
  { x: 7, y: 12, size: 2, opacity: 0.42, glow: 3 },
  { x: 14, y: 13, size: 2, opacity: 0.28, glow: 2 },
  { x: 4, y: 18, size: 2, opacity: 0.34, glow: 3 },
  { x: 10, y: 20, size: 2, opacity: 0.22, glow: 2 },
  { x: 4, y: 29, size: 2, opacity: 0.14, glow: 1 },
];

function Corner({ position }) {
  const isRight = position.includes("right");
  const isBottom = position.includes("bottom");

  return (
    <div
      style={{
        position: "absolute",
        width: 70,
        height: 56,
        top: isBottom ? undefined : 6,
        bottom: isBottom ? 6 : undefined,
        left: isRight ? undefined : 10,
        right: isRight ? 10 : undefined,
        transform: `${isRight ? "scaleX(-1)" : ""} ${isBottom ? "scaleY(-1)" : ""}`,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {PANEL_CORNER_BITS.map((bit) => (
        <i
          key={`${bit.x}-${bit.y}`}
          style={{
            position: "absolute",
            display: "block",
            left: bit.x,
            top: bit.y,
            width: bit.size,
            height: bit.size,
            opacity: bit.opacity,
            background: bit.opacity > 0.88 ? "rgba(224,254,255,1)" : "rgba(125,246,255,0.92)",
            boxShadow: `0 0 ${bit.glow}px rgba(180,255,255,${Math.min(bit.opacity + 0.12, 1)})`,
          }}
        />
      ))}
    </div>
  );
}

export function ArcadePanel({ children, style = {}, innerStyle = {} }) {
  return (
    <div
      style={{
        position: "relative",
        background: "#16062f",
        border: "2px solid rgba(103,232,249,0.8)",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 0 4px rgba(94,244,255,0.95), 0 0 14px rgba(94,244,255,0.55), 0 0 34px rgba(94,244,255,0.25), inset 0 0 32px rgba(123,61,255,0.3)",
        overflow: "hidden",
        backdropFilter: "blur(2px)",
        ...style,
      }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: 0.12, background: "repeating-linear-gradient(180deg,rgba(255,255,255,0.45) 0px,rgba(255,255,255,0.45) 1px,transparent 1px,transparent 5px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(95,38,180,0.22),rgba(13,4,32,0.35))", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 3, border: "1px solid rgba(224,254,255,0.1)", borderRadius: 15, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 260, height: 130, background: "linear-gradient(135deg, transparent 0 42%, rgba(0,0,0,0.22) 42% 56%, transparent 56%)", pointerEvents: "none" }} />
      <Corner position="top-left" />
      <Corner position="top-right" />
      <Corner position="bottom-left" />
      <Corner position="bottom-right" />
      <div style={{ position: "relative", zIndex: 2, ...innerStyle }}>{children}</div>
    </div>
  );
}
