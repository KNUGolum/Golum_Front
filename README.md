# GOLUM Front

8비트 아케이드 스타일의 실시간 투표/배팅 프론트엔드 프로젝트입니다.

GOLUM은 투표 생성, 투표 참여, 배팅, 크레딧 보상 흐름을 보여주는 프론트엔드 프로토타입입니다. 현재는 백엔드 서버 없이 `mockData` 기반으로 동작합니다.

## 주요 화면

- 로그인 / 회원가입
- 투표 목록
- 투표 상세 및 참여
- 배팅
- 투표 생성

## 주요 특징

- 8비트 아케이드 HUD 스타일 UI
- 네온 cyan/pink 진영 구도
- 고정 포털 배경과 좌우 전투 캐릭터 배치
- 팩맨 스타일 로그인 애니메이션
- 투표 참여 후 크레딧 보상
- 배팅 참여 후 크레딧 보상
- 토스트 알림
- 픽셀 아이콘, 네온 코너, 유리 패널 효과

## 기술 스택

- React 19
- Vite 8
- JavaScript / JSX
- ESLint
- Tailwind CSS Vite 플러그인

현재 UI 대부분은 CSS 파일보다 인라인 스타일과 `src/styles/theme.js`의 테마 토큰을 중심으로 구성되어 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버 실행 후 터미널에 출력되는 주소로 접속하면 됩니다. 일반적으로 다음 주소를 사용합니다.

```text
http://localhost:5173
```

## 데모 계정

```text
이메일: demo@example.com
비밀번호: Demo1234!
```

회원가입 화면에서 새 계정을 만들 수도 있습니다. 단, 현재는 mock 데이터 기반이므로 새로고침/세션 상황에 따라 데이터가 영구 저장되지는 않습니다.

## 스크립트

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 검사
npm run preview   # 빌드 결과 미리보기
```

## 프로젝트 구조

```text
Golum_Front/
├── .gitignore                    # Git 제외 파일 설정
├── AGENTS.md                     # 프로젝트 작업 규칙 및 상세 구조 문서
├── README.md                     # 프로젝트 소개 문서
├── TODO.md                       # UI/기능 작업 메모
├── eslint.config.js              # ESLint 설정
├── index.html                    # Vite HTML 진입점
├── package-lock.json             # npm 의존성 잠금 파일
├── package.json                  # 프로젝트 메타 정보 및 npm scripts
├── structure.md                  # 현재 디렉토리 구조 참고 문서
├── vite.config.js                # Vite 설정
│
├── public/                       # 정적 공개 파일
│
├── src/                          # 프론트엔드 소스 코드
│   ├── App.jsx                   # 앱 전역 상태, 페이지 전환, 전역 배경
│   ├── main.jsx                  # React 렌더링 진입점
│   │
│   ├── assets/                   # 앱에서 번들링되는 이미지/픽셀 자산
│   │   ├── ghosts/               # 팩맨 유령 프레임 및 투표 카드 아이콘
│   │   └── photo/                # 메인 배경 좌우 전투 캐릭터 이미지
│   │
│   ├── components/               # 재사용 컴포넌트
│   │   ├── common/               # 공통 UI: 패널, 버튼, 입력 필드
│   │   ├── layout/               # 레이아웃: 네비게이션, 전역 배경 캐릭터
│   │   └── vote/                 # 투표 카드 컴포넌트
│   │
│   ├── context/                  # React Context
│   │   └── ToastContext.jsx      # 토스트 알림 Provider 및 hook
│   │
│   ├── data/                     # 로컬 목 데이터
│   │   └── mockData.js           # 목 유저/투표 데이터
│   │
│   ├── pages/                    # 화면 단위 컴포넌트
│   │   ├── AuthPage.jsx          # 로그인/회원가입 및 팩맨 애니메이션
│   │   ├── BettingPage.jsx       # 배팅 화면
│   │   ├── CreateVotePage.jsx    # 투표 생성 화면
│   │   ├── HomePage.jsx          # 투표 목록, 검색, 필터
│   │   └── VoteDetailPage.jsx    # 투표 상세 및 참여
│   │
│   ├── styles/                   # 테마 토큰
│   │   └── theme.js              # 색상, 반경 등 공통 스타일 값
│   │
│   └── utils/                    # 유틸 함수
│       └── helpers.js            # 시간 표시, 비율 계산, fake delay
│
└── photo/                        # 루트 작업용 원본 캐릭터 이미지
                                    # 실제 앱에서는 src/assets/photo/ 사용
```

## 데이터 흐름

현재 실제 API 호출은 없습니다.

데이터는 `src/data/mockData.js`의 다음 목 데이터를 사용합니다.

- `MOCK_USERS`
- `MOCK_VOTES`

투표 참여와 배팅 참여는 새 객체를 만들어 부모 상태를 갱신하는 방식으로 처리합니다. 투표 생성은 데모 구조상 `MOCK_VOTES`에 새 투표를 추가합니다.

## UI 참고사항

- 로그인 이후 화면은 `Background.png`를 고정 크기 포털 배경으로 사용합니다.
- 로그인 화면은 전역 포털 배경을 사용하지 않고 자체 체크 패턴 배경을 사용합니다.
- 좌우 전투 캐릭터는 `BattleBackgroundCharacters.jsx`에서 전역으로 렌더링합니다.
- 투표 카드 아이콘은 `src/assets/ghosts/`의 유령 이미지를 사용합니다.
- 검색창 아이콘은 CSS 도형이 아니라 `src/assets/search.png`를 사용합니다.
- 주요 패널은 `ArcadePanel.jsx`를 기준으로 8비트 유리 HUD 느낌을 유지합니다.

## 개발 참고사항

- 라우팅은 `react-router-dom`이 아니라 `App.jsx`의 `page` 상태로 처리합니다.
- 앱에서 사용하는 이미지는 `src/assets/` 아래에 있어야 Vite 번들에 포함됩니다.
- `node_modules/`, `dist/`는 커밋하지 않습니다.
