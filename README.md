# infinite-slide-carousel

GSAP 기반 무한 슬라이드 캐러셀 라이브러리

## 특징

- ✨ GSAP를 활용한 부드러운 애니메이션
- 🔄 무한 루프 슬라이드 (좌/우 방향 선택 가능)
- 🖱️ 마우스/터치 드래그 지원
- 📱 반응형 디자인
- 🎨 CSS 커스터마이징 가능
- 📦 TypeScript 타입 정의 포함
- ⚡ 경량화 (Peer Dependency: GSAP만 필요)

## 설치

### NPM으로 설치

```bash
npm install infinite-slide-carousel gsap
# or
pnpm add infinite-slide-carousel gsap
# or
yarn add infinite-slide-carousel gsap
```

### CDN으로 사용

NPM으로 빌드 도구 없이 바로 사용할 수 있습니다.

#### unpkg 사용 (UMD)

```html
<!-- CSS (라이브러리 제공) -->
<link rel="stylesheet" href="https://unpkg.com/infinite-slide-carousel@latest/dist/lib/infinite-slide-carousel.css">

<!-- GSAP (필수 의존성) -->
<script src="https://unpkg.com/gsap@3/dist/gsap.min.js"></script>

<!-- Carousel 라이브러리 -->
<script src="https://unpkg.com/infinite-slide-carousel@latest/dist/lib/gsap-slide-carousel.umd.js"></script>

<!-- HTML 구조 -->
<div class="gsap-carousel-container">
  <div class="gsap-carousel-slide" style="width: 300px; height: 200px; background: #f0f0f0;">Slide 1</div>
  <div class="gsap-carousel-slide" style="width: 300px; height: 200px; background: #e0e0e0;">Slide 2</div>
  <div class="gsap-carousel-slide" style="width: 300px; height: 200px; background: #d0d0d0;">Slide 3</div>
</div>

<script>
  // 전역 변수 GsapSlideCarousel.default로 접근
  const carousel = GsapSlideCarousel.default.create({
    container: '.gsap-carousel-container',
    autoSlideSpeed: 100,
    slideSpace: 20
  });
</script>
```

#### jsDelivr 사용

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/infinite-slide-carousel@latest/dist/lib/infinite-slide-carousel.css">
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/infinite-slide-carousel@latest/dist/lib/gsap-slide-carousel.umd.js"></script>
```

#### ESM 모듈 사용 (모던 브라우저)

**방법 1: Import Map 사용 (권장)**

Import Map을 사용하면 bare import(`"gsap"`)를 CDN URL로 매핑할 수 있습니다.

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/infinite-slide-carousel@latest/dist/lib/infinite-slide-carousel.css">
  
  <!-- Import Map: bare import를 CDN URL로 매핑 -->
  <script type="importmap">
  {
    "imports": {
      "gsap": "https://cdn.jsdelivr.net/npm/gsap@3/+esm"
    }
  }
  </script>
</head>
<body>
  <div class="gsap-carousel-container">
    <div class="gsap-carousel-slide" style="width: 300px; height: 200px;">Slide 1</div>
    <div class="gsap-carousel-slide" style="width: 300px; height: 200px;">Slide 2</div>
    <div class="gsap-carousel-slide" style="width: 300px; height: 200px;">Slide 3</div>
  </div>

  <script type="module">
    // gsap-slide-carousel.es.js 내부의 'import gsap from "gsap"'가 자동으로 해결됨
    import GsapSlideCarousel from 'https://unpkg.com/infinite-slide-carousel@latest/dist/lib/gsap-slide-carousel.es.js';
    
    const carousel = GsapSlideCarousel.create({
      container: '.gsap-carousel-container',
      autoSlideSpeed: 80,
      slideSpace: 20
    });
  </script>
</body>
</html>
```

**Import Map 브라우저 지원:**
- ✅ Chrome 89+ (2021년 3월)
- ✅ Edge 89+ (2021년 3월)
- ✅ Safari 16.4+ (2023년 3월)
- ✅ Firefox 108+ (2022년 12월)

**방법 2: 명시적 import (Import Map 미지원 브라우저)**

```html
<link rel="stylesheet" href="https://unpkg.com/infinite-slide-carousel@latest/dist/lib/infinite-slide-carousel.css">

<script type="module">
  // GSAP를 먼저 import하여 전역으로 등록
  import gsap from 'https://unpkg.com/gsap@3/dist/gsap.min.js';
  window.gsap = gsap;  // 전역 등록
  
  // 이제 carousel import
  import GsapSlideCarousel from 'https://unpkg.com/infinite-slide-carousel@latest/dist/lib/gsap-slide-carousel.es.js';
  
  const carousel = GsapSlideCarousel.create({
    container: '.gsap-carousel-container',
    autoSlideSpeed: 100
  });
</script>
```

**📌 Import Map이란?**

Import Map은 JavaScript 모듈의 import 경로를 매핑하는 웹 표준입니다:
- Bare import (`"gsap"`) → 실제 URL로 변환
- Node.js의 `package.json` `exports` 필드와 유사한 역할
- 번들러 없이 브라우저에서 직접 ESM 사용 가능

#### 특정 버전 사용 (권장)

프로덕션에서는 `@latest` 대신 특정 버전을 명시하는 것을 권장합니다:

```html
<script src="https://unpkg.com/infinite-slide-carousel@1.0.0/dist/lib/gsap-slide-carousel.umd.js"></script>
```

## 사용법

### 기본 사용 (CSS 포함)

```typescript
import GsapSlideCarousel from 'infinite-slide-carousel';
import 'infinite-slide-carousel/styles';  // 기본 CSS 스타일

// 컨테이너 선택자로 초기화
const carousel = GsapSlideCarousel.create({
  container: '.gsap-carousel-container',
  autoSlideSpeed: 100,
  direction: 'left'
});

// 또는 Element 직접 전달
const element = document.getElementById('my-carousel');
const carousel2 = GsapSlideCarousel.create({
  container: element,
  autoSlideSpeed: 50,
  direction: 'right'
});
```

### HTML 구조

#### 방법 1: 라이브러리 CSS 사용 (권장)

```html
<!-- 라이브러리가 제공하는 기본 CSS 사용 -->
<div class="gsap-carousel-container">
  <div class="gsap-carousel-slide">Slide 1</div>
  <div class="gsap-carousel-slide">Slide 2</div>
  <div class="gsap-carousel-slide">Slide 3</div>
</div>

<style>
  /* 슬라이드 크기와 스타일만 커스터마이징 */
  .gsap-carousel-container {
    height: 200px;  /* 컨테이너 높이 */
  }
  
  .gsap-carousel-slide {
    width: 300px;   /* 슬라이드 너비 (필수) */
    height: 200px;  /* 슬라이드 높이 */
    background: #f0f0f0;
    border-radius: 8px;
  }
</style>
```

#### 방법 2: CSS 없이 사용

라이브러리 CSS를 사용하지 않는 경우, 다음 CSS를 직접 작성해야 합니다:

```html
<div class="my-carousel">
  <div class="my-slide">Slide 1</div>
  <div class="my-slide">Slide 2</div>
  <div class="my-slide">Slide 3</div>
</div>

<style>
  /* 필수 CSS */
  .my-carousel {
    position: relative;      /* 필수 */
    overflow: hidden;        /* 필수 */
    width: 100%;
    height: 200px;
    cursor: grab;
  }
  
  .my-carousel:active {
    cursor: grabbing;
  }
  
  .my-slide {
    position: absolute;      /* 필수 */
    top: 0;                  /* 필수 */
    left: 0;                 /* 필수 */
    width: 300px;            /* 필수 - 고정 너비 지정 */
    height: 200px;
    background: #f0f0f0;
    border-radius: 8px;
    will-change: transform;  /* 성능 최적화 */
    user-select: none;       /* 드래그 시 텍스트 선택 방지 */
  }
</style>

<script>
  const carousel = GsapSlideCarousel.create({
    container: '.my-carousel',
    classNames: {
      container: 'my-carousel',  /* 커스텀 클래스명 */
      slide: 'my-slide'          /* 커스텀 클래스명 */
    },
    slideSpace: 20,
    autoSlideSpeed: 80
  });
</script>
```

**⚠️ 중요 사항:**
1. **슬라이드 너비**: 반드시 고정 `width` 값 지정 (예: `300px`, `width: 50vw`)
   - ❌ `min-width`, `max-width`만 사용 시 갭 계산 오류
   - ❌ `width: 100%` 또는 `auto` 사용 불가
2. **컨테이너**: `position: relative`, `overflow: hidden` 필수
3. **슬라이드**: `position: absolute`, `top: 0`, `left: 0` 필수

### 옵션

```typescript
interface CarouselOptions {
  /** 컨테이너 HTMLElement 또는 CSS 셀렉터 (필수) */
  container: HTMLElement | string;
  
  /** 슬라이드 방향 (기본값: 'left') */
  direction?: 'left' | 'right';
  
  /** 자동 슬라이드 속도 (픽셀/초, 기본값: 30) */
  autoSlideSpeed?: number;
  
  /** 슬라이드 간 간격 (픽셀, 기본값: 16) */
  slideSpace?: number;
  
  /** 드래그 기능 활성화 여부 (기본값: true) */
  enableDrag?: boolean;
  
  /** 마우스 호버 시 일시정지 여부 (기본값: true) */
  pauseOnHover?: boolean;
  
  /** 탭 숨김 시 일시정지 여부 (기본값: true) */
  pauseOnHidden?: boolean;
  
  /** 커스텀 클래스명 */
  classNames?: {
    container?: string;
    slide?: string;
  };
  
  /** 콜백 함수들 */
  onExpose?: (index: number, slide: HTMLElement) => void;
  onClick?: (index: number, slide: HTMLElement, event: Event) => void;
  onReady?: () => void;
}
```

### API 메서드

#### 정적 메서드

```typescript
// 캐러셀 생성 및 초기화
const carousel = GsapSlideCarousel.create({
  container: '.gsap-carousel-container',
  autoSlideSpeed: 100,
  direction: 'left'
});
```

#### 인스턴스 메서드

```typescript
// 재생
carousel.play();

// 일시정지
carousel.pause();

// 속도 변경
carousel.setSpeed(50);

// 일시정지 상태 확인
const paused = carousel.isPaused();

// 현재 보이는 슬라이드 인덱스 가져오기
const visible = carousel.getVisibleSlides();

// 정리 (메모리 해제)
carousel.destroy();
```

### CSS 커스터마이징

라이브러리는 CSS Custom Properties를 제공합니다:

```css
.gsap-carousel-container {
  --carousel-slide-gap: 20px; /* 슬라이드 간격 */
}
```

페이드 효과 추가:

```html
<div class="my-carousel fade-edges">
  <!-- ... -->
</div>
```

## 예제

### 왼쪽 방향 슬라이드

```typescript
const carousel = GsapSlideCarousel.create({
  container: '.carousel-container',
  direction: 'left',
  autoSlideSpeed: 100,
  slideSpace: 20,
  pauseOnHover: true,
  enableDrag: true
});
```

### 오른쪽 방향 슬라이드

```typescript
const carousel = GsapSlideCarousel.create({
  container: '.carousel-container',
  direction: 'right',
  autoSlideSpeed: 100,
  slideSpace: 20,
  pauseOnHover: true,
  enableDrag: true
});
```

### 이벤트 콜백

```typescript
const carousel = GsapSlideCarousel.create({
  container: '.carousel-container',
  autoSlideSpeed: 80,
  slideSpace: 30,
  onExpose: (index, slide) => {
    console.log(`Slide ${index} is now visible`);
  },
  onClick: (index, slide, event) => {
    console.log(`Clicked on slide ${index}`);
  },
  onReady: () => {
    console.log('Carousel ready!');
  }
});
```

### 커스텀 클래스명

```typescript
const carousel = GsapSlideCarousel.create({
  container: '.product-slider',
  classNames: {
    container: 'custom-container',
    slide: 'custom-slide'
  }
});
```

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## 개발 & 빌드

```bash
# 개발 서버 실행
pnpm dev

# 라이브러리 빌드
pnpm build

# TypeScript 타입 체크
pnpm lint
```

## 라이센스

MIT License - 자유롭게 사용, 수정, 배포할 수 있습니다.

## 개발자

YoonSuhyeok

## 저장소

[GitHub: gsap-slide](https://github.com/YoonSuhyeok/gsap-slide)
