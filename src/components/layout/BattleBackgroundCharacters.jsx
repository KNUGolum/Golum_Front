import { T } from "../../styles/theme";

const photoModules = import.meta.glob("../../assets/photo/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

const photos = Object.entries(photoModules)
  .map(([path, src]) => ({
    src,
    name: path.split("/").pop().normalize("NFC"),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "ko"));

const leftPhotos = photos.filter((photo) => photo.name.includes("왼쪽"));
const rightPhotos = photos.filter((photo) => photo.name.includes("오른쪽"));
const DESIGN_VIEWPORT_WIDTH = 1506;
const DESIGN_VIEWPORT_CENTER = DESIGN_VIEWPORT_WIDTH / 2;
const DEFAULT_PHOTO_POSITIONS = {
  "오른쪽1.png": { x: 1121, y: 165, rotate: 0, width: "330px" },
  "오른쪽2.png": { x: 1094, y: 479, rotate: 1, width: "170px" },
  "오른쪽3.png": { x: 1112, y: 141, rotate: -9, width: "94px" },
  "오른쪽4.png": { x: 1303, y: 50, rotate: 8, width: "120px" },
  "오른쪽5.png": { x: 1084, y: 590, rotate: 0, width: "204px" },
  "오른쪽6.png": { x: 1160, y: 55, rotate: -3, width: "160px" },
  "오른쪽7.png": { x: 1285, y: 547, rotate: 2, width: "165px" },
  "오른쪽8.png": { x: 1310, y: 503, rotate: -1, width: "158px" },
  "왼쪽1.png": { x: 73, y: 158, rotate: 0, width: "330px" },
  "왼쪽2.png": { x: 225, y: 522, rotate: -5, width: "146px" },
  "왼쪽3.png": { x: 271, y: 559, width: "172px" },
  "왼쪽4.png": { x: 230, y: 132, rotate: 14, width: "123px" },
  "왼쪽5.png": { x: 86, y: 74, width: "131px" },
  "왼쪽6.png": { x: 79, y: 569, rotate: -1, width: "133px" },
  "왼쪽7.png": { x: 48, y: 468, rotate: 0, width: "164px" },
  "왼쪽8.png": { x: 223, y: 49, rotate: 7, width: "192px" },
};

const battleFormation = [
  { top: 25, width: "135px", x: 63, z: 7, rotate: -7 },
  { top: 25, width: "150px", x: 220, z: 9, rotate: 5 },
  { top: 50, width: "120px", x: 83, z: 8, rotate: 8 },
  { top: 496, width: "150px", x: 208, z: 10, rotate: -4 },
  { top: 496, width: "125px", x: 77, z: 8, rotate: 6 },
  { top: 545, width: "135px", x: 178, z: 7, rotate: -6 },
  { top: 562, width: "110px", x: 103, z: 6, rotate: 4 },
];

const isGroupPhoto = (photo) => photo.name.includes("1.");
const toCenteredX = (x) => `calc(50vw + ${x - DESIGN_VIEWPORT_CENTER}px)`;

function SidePhotoRail({ side, photos: sidePhotos }) {
  const isLeft = side === "left";
  const groupPhotos = sidePhotos.filter(isGroupPhoto);
  const fighterPhotos = sidePhotos.filter((photo) => !isGroupPhoto(photo));
  const sideGlow = isLeft ? "rgba(2,62,200,0.78)" : "rgba(255,43,214,0.78)";
  const sideAccent = isLeft ? "#023ec8" : T.danger;

  return (
    <div className="battle-bg-characters">
      {groupPhotos.map((photo) => {
        const position = {
          x: isLeft ? 33 : 1143,
          y: 165,
          rotate: 0,
          width: "330px",
          ...DEFAULT_PHOTO_POSITIONS[photo.name],
        };

        return (
          <div
            key={photo.name}
            className="battle-character-float battle-character-float-group"
            style={{
              position: "absolute",
              top: position.y,
              width: position.width,
              maxWidth: "100%",
              left: toCenteredX(position.x),
              zIndex: 4,
              animationDelay: isLeft ? "-0.8s" : "-1.9s",
              animationDuration: isLeft ? "4.8s" : "5.2s",
            }}
          >
            <img
              src={photo.src}
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                display: "block",
                transform: `rotate(${position.rotate ?? 0}deg)`,
                imageRendering: "pixelated",
                filter: `drop-shadow(${isLeft ? 7 : -7}px 7px 0 #000) drop-shadow(0 0 20px ${sideGlow}) drop-shadow(0 0 4px ${sideAccent})`,
                userSelect: "none",
              }}
            />
          </div>
        );
      })}
      {fighterPhotos.map((photo, index) => {
        const layout = battleFormation[index % battleFormation.length];
        const direction = isLeft ? -1 : 1;
        const position = {
          x: isLeft ? layout.x : DESIGN_VIEWPORT_WIDTH - layout.x - parseInt(layout.width, 10),
          y: layout.top,
          rotate: direction * layout.rotate,
          width: layout.width,
          ...DEFAULT_PHOTO_POSITIONS[photo.name],
        };

        return (
          <div
            key={photo.name}
            className="battle-character-float"
            style={{
              position: "absolute",
              top: position.y,
              width: position.width,
              maxWidth: "92%",
              left: toCenteredX(position.x),
              zIndex: layout.z,
              transformOrigin: isLeft ? "right bottom" : "left bottom",
              animationDelay: `${-((index % 7) * 0.37 + (isLeft ? 0.15 : 0.55))}s`,
              animationDuration: `${3.4 + (index % 4) * 0.38}s`,
              "--float-x": `${direction * (2 + (index % 3))}px`,
              "--float-y": `${3 + (index % 4)}px`,
            }}
          >
            <img
              src={photo.src}
              alt=""
              aria-hidden="true"
              style={{
                width: "100%",
                display: "block",
                transform: `rotate(${position.rotate ?? direction * layout.rotate}deg)`,
                imageRendering: "pixelated",
                filter: `drop-shadow(${isLeft ? 6 : -6}px 6px 0 #000) drop-shadow(0 0 18px ${sideGlow}) drop-shadow(0 0 4px ${sideAccent})`,
                transformOrigin: isLeft ? "right bottom" : "left bottom",
                userSelect: "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function BattleBackgroundCharacters() {
  return (
    <>
      <style>{`
        .battle-bg-characters {
          position: fixed;
          top: 64px;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100vw;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }
        .battle-character-float {
          animation-name: battleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
        .battle-character-float-group {
          --float-x: 2px;
          --float-y: 4px;
        }
        @keyframes battleFloat {
          0%, 100% { transform: translate3d(0, 0, 0); }
          33% { transform: translate3d(var(--float-x, 2px), calc(var(--float-y, 4px) * -1), 0); }
          66% { transform: translate3d(calc(var(--float-x, 2px) * -1), var(--float-y, 4px), 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .battle-character-float {
            animation: none;
          }
        }
        @media (max-width: 1180px) {
          .battle-bg-characters { display: none; }
        }
      `}</style>
      <SidePhotoRail side="left" photos={leftPhotos} />
      <SidePhotoRail side="right" photos={rightPhotos} />
    </>
  );
}
