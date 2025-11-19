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

```bash
npm install infinite-slide-carousel gsap
# or
pnpm add infinite-slide-carousel gsap
# or
yarn add infinite-slide-carousel gsap
```

## 사용법

### 기본 사용

```typescript
import GsapSlideCarousel from 'infinite-slide-carousel';
import 'infinite-slide-carousel/styles';

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

```html
<div class="gsap-carousel-container">
  <div class="gsap-carousel-slide">Slide 1</div>
  <div class="gsap-carousel-slide">Slide 2</div>
  <div class="gsap-carousel-slide">Slide 3</div>
</div>
```

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
