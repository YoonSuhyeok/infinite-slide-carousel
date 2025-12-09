import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import GsapSlideCarousel from '../src/gsap-slide-carousel';

describe('GsapSlideCarousel Basic Usage', () => {
  beforeEach(() => {
    // 기본 캐러셀 HTML 구조 생성
    document.body.innerHTML = `
      <div class="gsap-carousel-container">
        <div class="gsap-carousel-slides">
          <div class="gsap-carousel-slide">
            <img src="https://via.placeholder.com/300x200/FF6B6B/fff?text=Slide+1" alt="Slide 1">
          </div>
          <div class="gsap-carousel-slide">
            <img src="https://via.placeholder.com/300x200/4ECDC4/fff?text=Slide+2" alt="Slide 2">
          </div>
          <div class="gsap-carousel-slide">
            <img src="https://via.placeholder.com/300x200/45B7D1/fff?text=Slide+3" alt="Slide 3">
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create a carousel with default options', () => {
    // 가장 간단한 사용법: 컨테이너만 전달
    const container = document.querySelector<HTMLElement>('.gsap-carousel-container')!;
    const carousel = GsapSlideCarousel.create({ container }) as GsapSlideCarousel;

    expect(carousel).toBeDefined();
    expect(carousel.isPaused()).toBe(false);
  });

  it('should create a carousel with custom speed', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      autoSlideSpeed: 50 // 픽셀/초
    }) as GsapSlideCarousel;

    expect(carousel).toBeDefined();
  });

  it('should handle play/pause controls', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container'
    }) as GsapSlideCarousel;

    // 일시정지
    carousel.pause();
    expect(carousel.isPaused()).toBe(true);

    // 재생
    carousel.play();
    expect(carousel.isPaused()).toBe(false);
  });

  it('should handle speed changes', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      autoSlideSpeed: 30
    }) as GsapSlideCarousel;

    // 속도 변경
    carousel.setSpeed(100);
    expect(carousel).toBeDefined();
  });

  it('should trigger onClick callback when slide is clicked', () => {
    const onClickMock = vi.fn();
    
    GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      onClick: onClickMock
    });

    // 슬라이드 클릭 시뮬레이션
    const slide = document.querySelector<HTMLElement>('.gsap-carousel-slide')!;
    slide.click();

    expect(onClickMock).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(HTMLElement),
      expect.any(Event)
    );
  });

  it('should trigger onExpose callback when slides are visible', () => {
    const onExposeMock = vi.fn();
    
    GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      onExpose: onExposeMock
    });

    // 초기 노출 시 콜백 호출됨
    expect(onExposeMock).toHaveBeenCalled();
  });

  it('should trigger onReady callback after initialization', () => {
    const onReadyMock = vi.fn();
    
    GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      onReady: onReadyMock
    });

    // 초기화 완료 후 콜백 호출됨
    expect(onReadyMock).toHaveBeenCalled();
  });

  it('should support right direction movement', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container',
      direction: 'right', // 오른쪽으로 이동
      autoSlideSpeed: 50
    }) as GsapSlideCarousel;

    expect(carousel).toBeDefined();
  });

  it('should get visible slides', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container'
    }) as GsapSlideCarousel;

    const visibleSlides = carousel.getVisibleSlides();
    expect(Array.isArray(visibleSlides)).toBe(true);
    expect(visibleSlides.length).toBeGreaterThan(0);
  });

  it('should destroy carousel cleanly', () => {
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container'
    }) as GsapSlideCarousel;

    carousel.destroy();
    expect(carousel).toBeDefined(); // 인스턴스는 존재하지만 정리됨
  });
});

describe('GsapSlideCarousel Multiple Instances', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="carousel-1">
        <div class="gsap-carousel-slides">
          <div class="gsap-carousel-slide">Slide 1-1</div>
          <div class="gsap-carousel-slide">Slide 1-2</div>
        </div>
      </div>
      <div class="carousel-2">
        <div class="gsap-carousel-slides">
          <div class="gsap-carousel-slide">Slide 2-1</div>
          <div class="gsap-carousel-slide">Slide 2-2</div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should create multiple independent carousels', () => {
    const carousel1 = GsapSlideCarousel.create({
      containerSelector: '.carousel-1',
      autoSlideSpeed: 30
    }) as GsapSlideCarousel;

    const carousel2 = GsapSlideCarousel.create({
      containerSelector: '.carousel-2',
      autoSlideSpeed: 60
    }) as GsapSlideCarousel;

    expect(carousel1).toBeDefined();
    expect(carousel2).toBeDefined();

    // 각각 독립적으로 제어 가능
    carousel1.pause();
    expect(carousel1.isPaused()).toBe(true);
    expect(carousel2.isPaused()).toBe(false);
  });
});

describe('GsapSlideCarousel Quick Start Example', () => {
  it('should work with minimal setup', () => {
    // 📘 가장 간단한 예제
    document.body.innerHTML = `
      <div class="gsap-carousel-container">
        <div class="gsap-carousel-slides">
          <div class="gsap-carousel-slide">🌟 Slide 1</div>
          <div class="gsap-carousel-slide">🎨 Slide 2</div>
          <div class="gsap-carousel-slide">🚀 Slide 3</div>
        </div>
      </div>
    `;

    // 한 줄로 캐러셀 생성!
    const carousel = GsapSlideCarousel.create({
      containerSelector: '.gsap-carousel-container'
    });

    expect(carousel).toBeDefined();
  });
});
