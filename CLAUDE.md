# my-blog

마크다운 파일을 읽어 정적 블로그 웹사이트로 보여주는 프로젝트.

## 핵심 원칙

1. **프레임워크 없음** — React/Vue/Next/Astro 등 사용 금지. 순수 HTML, CSS, JavaScript(ES modules)만 사용한다.
2. **빌드 단계 없음** — npm install, 번들러, 트랜스파일러 없이 파일을 그대로 브라우저가 실행한다. 정적 호스팅(GitHub Pages 등)에 그대로 올릴 수 있어야 한다.
3. **읽기 경험 우선** — 블로그의 목적은 글을 읽는 것이다. 애니메이션·장식보다 가독성이 먼저다.
4. **모바일 우선** — 좁은 화면에서 먼저 설계하고 넓은 화면으로 확장한다.

## 디렉터리 구조

```
/
├── index.html          글 목록 페이지
├── post.html           글 상세 페이지 (?slug=... 로 어떤 글인지 결정)
├── css/
│   ├── base.css        리셋, CSS 변수(디자인 토큰), 타이포그래피
│   └── layout.css      페이지 레이아웃, 컴포넌트
├── js/
│   ├── list.js         posts.json 을 읽어 목록 렌더링
│   ├── post.js         해당 .md 를 fetch 해서 본문 렌더링
│   └── markdown.js     마크다운 파싱 래퍼 + 프론트매터 분리
└── posts/
    ├── posts.json      글 메타데이터 인덱스 (수동 관리)
    └── *.md            글 원본
```

## 데이터 흐름

- 글은 `posts/*.md` 파일 하나가 글 하나다. 파일명(확장자 제외)이 곧 **slug**.
- 각 `.md` 파일은 YAML 스타일 프론트매터로 시작한다:

  ```markdown
  ---
  title: 글 제목
  date: 2026-08-29
  tags: [일상, 개발]
  summary: 목록에 보일 한두 줄 요약
  ---

  본문 시작...
  ```

- `posts/posts.json` 은 목록 페이지가 읽는 인덱스다. 브라우저는 디렉터리 목록을 조회할 수 없으므로 이 파일이 필요하다.

  ```json
  [
    { "slug": "hello-world", "title": "첫 글", "date": "2026-08-29", "tags": ["일상"], "summary": "..." }
  ]
  ```

- 목록 페이지: `posts.json` fetch → 날짜 내림차순 정렬 → 카드 렌더링.
- 상세 페이지: `?slug=` 값으로 `posts/<slug>.md` fetch → 프론트매터 분리 → 본문 마크다운을 HTML로 변환 → `<article>` 에 삽입.

## 마크다운 파싱

- CDN에서 `marked` 를 불러 쓴다 (`https://cdn.jsdelivr.net/npm/marked/marked.min.js`). 파서를 직접 구현하지 않는다.
- 변환 결과는 신뢰할 수 없는 입력으로 취급하고 `DOMPurify` 로 정화한 뒤 삽입한다. 정화 없이 `innerHTML` 에 넣지 않는다.
- 코드 블록 하이라이팅이 필요해지면 `highlight.js` 를 CDN으로 추가한다. 그 전까지는 넣지 않는다.
- 지원 문법: 제목, 문단, 굵게/기울임, 링크, 이미지, 목록, 인용, 코드(인라인/블록), 표, 구분선.

## 디자인 가이드

**타이포그래피**
- 본문 폰트 크기 `1.0625rem`(17px) 이상, 행간 `1.7`.
- 본문 최대 너비 `68ch`. 그 이상 늘어나지 않게 한다. 한 줄이 길면 읽기 어렵다.
- 시스템 폰트 스택 사용. 웹폰트는 로딩 비용 때문에 기본적으로 쓰지 않는다.
  `-apple-system, BlinkMacSystemFont, "Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`
- 문단 간격은 여백으로만 준다. 들여쓰기 없음.

**색상**
- 모든 색은 `:root` 의 CSS 변수로 정의한다. 하드코딩된 색상값을 규칙 안에 직접 쓰지 않는다.
- 라이트 모드 기본, `@media (prefers-color-scheme: dark)` 에서 변수만 재정의해 다크 모드를 지원한다.
- 순수 검정(`#000`)/순수 흰색(`#fff`) 대신 살짝 누그러뜨린 값을 쓴다. 본문 대비는 WCAG AA(4.5:1) 이상.
- 강조색(accent)은 링크와 소수의 요소에만 쓴다.

**레이아웃**
- 모바일 기본, 브레이크포인트는 `640px` 과 `960px` 두 개만 쓴다. 그 이상 늘리지 않는다.
- 좌우 여백은 모바일 `1.25rem`, 데스크톱에서는 `max-width` + `margin-inline: auto` 로 중앙 정렬.
- 터치 대상은 최소 44×44px.
- 이미지는 `max-width: 100%; height: auto`. 표와 코드 블록은 각자 `overflow-x: auto` 컨테이너 안에서 가로 스크롤한다. **본문(body)이 가로로 스크롤되면 안 된다.**

**절제할 것**
- 스크롤 애니메이션, 패럴럭스, 로딩 스피너 연출, 그림자 남발 금지.
- 상태 전환에는 `transition` 을 짧게(120~200ms) 쓰되, `prefers-reduced-motion` 을 존중한다.

## 코드 컨벤션

- JS는 ES modules(`<script type="module">`), `const`/`let`, async/await. 세미콜론 사용.
- DOM 생성은 `document.createElement` + `textContent` 를 기본으로 한다. 사용자 입력이나 마크다운 내용을 템플릿 문자열로 `innerHTML` 에 넣지 않는다(정화된 본문 HTML만 예외).
- CSS 클래스는 케밥케이스(`post-card`, `post-meta`). CSS 중첩은 한 단계까지만.
- 파일당 하나의 관심사. 공통 유틸이 생기면 `js/util.js` 로 뺀다.
- 주석은 "왜"만 적는다. 코드를 다시 설명하지 않는다.

## 실행 방법

`file://` 로 열면 fetch가 CORS로 막힌다. 로컬 서버로 연다:

```bash
python -m http.server 8000
# http://localhost:8000
```

## 글 추가 절차

1. `posts/<slug>.md` 생성, 프론트매터 작성.
2. `posts/posts.json` 에 해당 항목 추가.
3. 로컬 서버에서 목록과 상세 페이지 모두 확인.

## 하지 말 것

- 패키지 매니저·번들러·빌드 스크립트 도입
- 프레임워크나 UI 라이브러리 도입 (마크다운 파서/정화 라이브러리는 CDN으로 예외)
- 백엔드, 데이터베이스, 서버 사이드 렌더링
- CSS-in-JS, 인라인 `style` 속성 남용
