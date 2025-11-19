import gsap from "gsap";
import type {
  CarouselOptions,
  IGsapSlideCarousel,
  ExposureCallback,
  ClickCallback,
  ReadyCallback
} from "./carousel-types";

/**
 * GSAP 기반 무한 슬라이드 캐러셀 라이브러리
 * 
 * @example
 * ```typescript
 * import GsapSlideCarousel from '@gsap-slide-carousel/carousel';
 * import '@gsap-slide-carousel/carousel/styles';
 * 
 * // 방법 1: containerSelector로 자동 초기화 (여러 개 있으면 모두 초기화)
 * const result = GsapSlideCarousel.create({
 *   containerSelector: '.gsap-carousel-container',
 *   autoSlideSpeed: 100,
 *   direction: 'left' // 'left' 또는 'right'
 * });
 * // result는 단일 인스턴스 또는 배열
 * 
 * // 방법 2: 단일 요소만 초기화 (multiple: false)
 * const carousel = GsapSlideCarousel.create({
 *   containerSelector: '.gsap-carousel-container',
 *   multiple: false,
 *   autoSlideSpeed: 100
 * });
 * 
 * // 방법 3: Element 직접 전달
 * const carousel2 = GsapSlideCarousel.create({
 *   container: document.getElementById('my-carousel'),
 *   autoSlideSpeed: 100
 * });
 * 
 * // 방법 4: 모든 캐러셀 명시적 초기화
 * const carousels = GsapSlideCarousel.initAll('.gsap-carousel-container', {
 *   autoSlideSpeed: 100,
 *   pauseOnHover: true
 * });
 * ```
 */
class GsapSlideCarousel implements IGsapSlideCarousel {
  // DOM 요소
  private slidesContainer: HTMLElement;
  private slides: HTMLElement[] = [];
  
  // 설정
  private direction: 'left' | 'right';
  private autoSlideSpeed: number;
  private slideSpace: number;
  private enableDrag: boolean;
  private pauseOnHover: boolean;
  private pauseOnHidden: boolean;
  
  // 클래스명
  private classNames = {
    container: 'gsap-carousel-container',
    slide: 'gsap-carousel-slide'
  };
  
  // 콜백
  private onExpose?: ExposureCallback;
  private onClick?: ClickCallback;
  private onReady?: ReadyCallback;
  
  // 애니메이션 상태
  private animation: gsap.core.Tween | null = null;
  private isPausedState = false;
  
  // 드래그 상태
  private isDragging = false;
  private isTouchDragging = false;
  private dragStartX = 0;
  private startProgress = 0;
  private hasDragged = false; // 실제로 드래그했는지 여부
  
  // 슬라이드 정보
  private stride = 0;  // 슬라이드 하나의 너비 + gap
  private totalSlides = 0;
  private totalDistance = 0;  // stride * totalSlides
  
  // 노출 추적
  private lastExposedIndexes: number[] = [];

  /**
   * GsapSlideCarousel 생성자 (내부용)
   * @param container 컨테이너 요소
   * @param options 캐러셀 옵션
   */
  private constructor(
    container: HTMLElement,
    options: CarouselOptions = {}
  ) {
    this.slidesContainer = container;
    
    // 옵션 설정
    this.direction = options.direction ?? 'left';
    this.autoSlideSpeed = options.autoSlideSpeed ?? 30;
    this.slideSpace = options.slideSpace ?? 16;
    this.enableDrag = options.enableDrag ?? true;
    this.pauseOnHover = options.pauseOnHover ?? true;
    this.pauseOnHidden = options.pauseOnHidden ?? true;
    
    // 커스텀 클래스명 병합
    if (options.classNames) {
      this.classNames = { ...this.classNames, ...options.classNames };
    }
    
    // 콜백 설정
    this.onExpose = options.onExpose;
    this.onClick = options.onClick;
    this.onReady = options.onReady;
    
    // 초기화
    this.init();
  }

  // ===== Private Methods =====

  private init() {
    this.waitForImagesLoaded(this.slidesContainer, () => {
      this.initializeCarousel();
      this.addEventListeners();
      this.onReady?.();
    });
  }

  private initializeCarousel() {
    // 슬라이드 검색
    this.slides = Array.from(
      this.slidesContainer.querySelectorAll(`.${this.classNames.slide}`)
    ) as HTMLElement[];

    if (this.slides.length === 0) {
      console.warn('GsapSlideCarousel: No slides found');
      return;
    }

    this.calculateDimensions();
    this.setupSlidePositions();
    this.setupSlideClickEvents();
    this.startContinuousAutoSlide();
    this.reportExposure();
  }

  // origin.ts 패턴: 각 슬라이드의 초기 위치 설정 및 stride 계산
  private calculateDimensions() {
    this.totalSlides = this.slides.length;
    
    // 화면을 채우기 위한 최소 슬라이드 수 확인
    const containerWidth = this.slidesContainer.offsetWidth || window.innerWidth;
    
    // 첫 번째 슬라이드로 stride 계산
    const firstSlide = this.slides[0];
    const slideWidth = firstSlide.offsetWidth;
    this.stride = slideWidth + this.slideSpace;
    
    // 슬라이드가 부족하면 복제
    const minSlides = Math.ceil(containerWidth / this.stride) + 2;
    if (this.totalSlides < minSlides) {
      const neededCopies = Math.ceil(minSlides / this.totalSlides) - 1;
      const originalSlides = [...this.slides];
      
      for (let copy = 0; copy < neededCopies; copy++) {
        originalSlides.forEach(slide => {
          const clone = slide.cloneNode(true) as HTMLElement;
          this.slidesContainer.appendChild(clone);
          this.slides.push(clone);
        });
      }
      
      this.totalSlides = this.slides.length;
    }
    
    this.totalDistance = this.stride * this.totalSlides;
    const maxHeight = Math.max(...this.slides.map(slide => slide.offsetHeight));
    this.slidesContainer.style.height = `${maxHeight}px`;
  }

  // origin.ts 패턴: gsap.set으로 각 슬라이드의 초기 x 위치 설정
  private setupSlidePositions() {
    // 오른쪽 방향일 때는 슬라이드를 왼쪽(음수)에서 시작하여 화면 왼쪽 여백 방지
    const offset = this.direction === 'right' ? -this.totalDistance : 0;
    
    // 각 슬라이드를 개별 위치 설정
    gsap.set(this.slides, {
      x: (i) => offset + i * this.stride
    });
  }

  // origin.ts 패턴: modifiers에서 사용할 wrap 함수
  private wrapX(x: number): number {
    const xNum = parseFloat(x as any);
    
    // 왼쪽으로 이동 시: 박스가 왼쪽으로 완전히 벗어나면 오른쪽으로 wrapping
    if (xNum < -this.stride) {
      return (xNum % this.totalDistance + this.totalDistance) % this.totalDistance;
    }
    
    // 오른쪽으로 이동 시: 박스가 오른쪽으로 완전히 벗어나면 왼쪽으로 wrapping
    if (xNum > this.totalDistance - this.stride) {
      return xNum % this.totalDistance;
    }
    
    return xNum;
  }

  // origin.ts 패턴: 각 슬라이드를 개별 애니메이션, modifiers로 자동 wrap
  private startContinuousAutoSlide() {
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }

    if (this.totalDistance <= 0) {
      console.warn("GsapSlideCarousel: totalDistance is not valid");
      return;
    }

    const duration = this.totalDistance / this.autoSlideSpeed;
    const directionMultiplier = this.direction === 'left' ? -1 : 1;
    const movement = directionMultiplier * this.totalDistance;

    // origin.ts 패턴: 각 슬라이드를 개별 애니메이션
    this.animation = gsap.to(this.slides, {
      duration: duration,
      ease: "none",
      x: `${movement < 0 ? '-' : '+'}=${Math.abs(this.totalDistance)}`,
      modifiers: {
        x: gsap.utils.unitize(x => this.wrapX(x))
      },
      repeat: -1,
      onUpdate: () => this.reportExposure()
    });

    if (this.isPausedState) {
      this.animation.pause();
    }
  }

  private setupSlideClickEvents() {
    this.slides.forEach((slide, index) => {
      slide.removeEventListener('click', this.handleSlideClick);
      slide.addEventListener('click', this.handleSlideClick);
      slide.dataset.slideIndex = index.toString();
    });
  }

  private handleSlideClick = (e: Event) => {
    // 드래그한 경우 클릭 이벤트 무시
    if (this.hasDragged) {
      this.hasDragged = false;
      return;
    }
    if (this.isDragging || this.isTouchDragging) {
      return;
    }
    const slide = e.currentTarget as HTMLElement;
    const index = parseInt(slide.dataset.slideIndex || '0', 10);
    if (this.onClick) {
      this.onClick(index, slide, e);
    }
    this.pause();
  };

  private reportExposure() {
    const containerRect = this.slidesContainer.getBoundingClientRect();
    const visibleSlides: number[] = [];
    
    this.slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const visibilityThreshold = slideRect.width * 0.5;
      const leftOverlap = Math.max(
        0,
        Math.min(containerRect.right, slideRect.right) - 
        Math.max(containerRect.left, slideRect.left)
      );
      
      if (leftOverlap >= visibilityThreshold) {
        visibleSlides.push(index);
      }
    });
    
    const uniqueVisibleSlides = [...new Set(visibleSlides)];
    const newlyExposedSlides = uniqueVisibleSlides.filter(
      idx => !this.lastExposedIndexes.includes(idx)
    );

    if (newlyExposedSlides.length > 0 && this.onExpose) {
      newlyExposedSlides.forEach(idx => {
        this.onExpose!(idx, this.slides[idx]);
      });
      this.lastExposedIndexes = [...this.lastExposedIndexes, ...newlyExposedSlides];
    }
  }

  private waitForImagesLoaded(container: HTMLElement, callback: () => void) {
    const images = Array.from(container.querySelectorAll('img'));
    let loaded = 0;
    
    if (images.length === 0) {
      callback();
      return;
    }
    
    images.forEach(img => {
      if (img.complete) {
        loaded++;
        if (loaded === images.length) callback();
      } else {
        img.addEventListener('load', () => {
          loaded++;
          if (loaded === images.length) callback();
        });
        img.addEventListener('error', () => {
          loaded++;
          if (loaded === images.length) callback();
        });
      }
    });
  }

  private throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  private throttledResize = this.throttle(() => {
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }
    this.calculateDimensions();
    this.setupSlidePositions();
    this.startContinuousAutoSlide();
    this.reportExposure();
  }, 200);

  private addEventListeners() {
    // 드래그 이벤트
    if (this.enableDrag) {
      // origin.ts 패턴: 마우스 드래그는 progress로 제어
      this.slidesContainer.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.isDragging = true;
        this.hasDragged = false;
        this.dragStartX = e.clientX;
        this.startProgress = this.animation?.progress() ?? 0;
        this.animation?.pause();
        this.slidesContainer.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.animation) return;
        const deltaX = e.clientX - this.dragStartX;
        
        // 5px 이상 이동하면 드래그로 간주
        if (Math.abs(deltaX) > 5) {
          this.hasDragged = true;
        }
        
        // direction에 따라 드래그 반응 조정
        // left: 왼쪽으로 흐름, 오른쪽 드래그 시 역행 (progress 감소)
        // right: 오른쪽으로 흐름, 오른쪽 드래그 시 순행 (progress 증가)
        const directionMultiplier = this.direction === 'left' ? -1 : 1;
        const progressChange = (deltaX / this.totalDistance) * directionMultiplier;
        let newProgress = this.startProgress + progressChange;
        newProgress = ((newProgress % 1) + 1) % 1;
        this.animation.progress(newProgress);
      });

      window.addEventListener('mouseup', () => {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.slidesContainer.style.cursor = "";
        document.body.style.userSelect = "";
        this.animation?.play();
      });

      // origin.ts 패턴: 터치 드래그도 progress로 제어
      this.slidesContainer.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        this.isTouchDragging = true;
        this.dragStartX = e.touches[0].clientX;
        this.startProgress = this.animation?.progress() ?? 0;
        this.animation?.pause();
      }, { passive: true });

      window.addEventListener('touchmove', (e: TouchEvent) => {
        if (!this.isTouchDragging || e.touches.length !== 1 || !this.animation) return;
        const deltaX = e.touches[0].clientX - this.dragStartX;
        // direction에 따라 드래그 반응 조정
        const directionMultiplier = this.direction === 'left' ? -1 : 1;
        const progressChange = (deltaX / this.totalDistance) * directionMultiplier;
        let newProgress = this.startProgress + progressChange;
        newProgress = ((newProgress % 1) + 1) % 1;
        this.animation.progress(newProgress);
      }, { passive: true });

      window.addEventListener('touchend', () => this.handleTouchEndOrCancel());
      window.addEventListener('touchcancel', () => this.handleTouchEndOrCancel());
    }

    // Hover 일시정지
    if (this.pauseOnHover) {
      this.slidesContainer.addEventListener('mouseenter', () => {
        if (!this.isDragging && !this.isTouchDragging) {
          this.pause();
        }
      });
      
      this.slidesContainer.addEventListener('mouseleave', () => {
        if (this.isDragging) {
          this.isDragging = false;
          this.slidesContainer.style.cursor = "";
          document.body.style.userSelect = "";
          this.animation?.play();
        } else if (this.isPausedState) {
          this.play();
        }
      });
    }

    // 탭 숨김 시 일시정지
    if (this.pauseOnHidden) {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.play();
        }
      });
    }

    // 리사이즈
    window.addEventListener('resize', this.throttledResize);
  }

  private handleTouchEndOrCancel() {
    if (!this.isTouchDragging) return;
    this.isTouchDragging = false;
    this.animation?.play();
  }

  // ===== Static Methods =====

  /**
   * 캐러셀 생성 팩토리 메서드
   * containerSelector로 여러 요소를 찾으면 자동으로 모두 초기화합니다.
   * @param options 캐러셀 옵션
   * @returns 단일 인스턴스 또는 인스턴스 배열
   * 
   * @example
   * ```typescript
   * // 단일 캐러셀
   * const carousel = GsapSlideCarousel.create({
   *   containerSelector: '#my-carousel',
   *   autoSlideSpeed: 100
   * });
   * 
   * // 여러 캐러셀 자동 초기화 (containerSelector로 여러 개 찾으면 모두 초기화)
   * const carousels = GsapSlideCarousel.create({
   *   containerSelector: '.gsap-carousel-container',
   *   autoSlideSpeed: 100
   * });
   * ```
   */
  public static create(options: CarouselOptions = {}): GsapSlideCarousel | GsapSlideCarousel[] {
    const multiple = options.multiple ?? true;
    let containers: HTMLElement[] = [];
    
    // container 처리
    if (options.container) {
      if (typeof options.container === 'string') {
        if (multiple) {
          containers = Array.from(document.querySelectorAll<HTMLElement>(options.container));
        } else {
          const el = document.querySelector<HTMLElement>(options.container);
          if (el) containers = [el];
        }
      } else {
        containers = [options.container];
      }
    } else if (options.containerSelector) {
      // 하위 호환성
      if (multiple) {
        containers = Array.from(document.querySelectorAll<HTMLElement>(options.containerSelector));
      } else {
        const el = document.querySelector<HTMLElement>(options.containerSelector);
        if (el) containers = [el];
      }
    } else {
      // 기본값
      if (multiple) {
        containers = Array.from(document.querySelectorAll<HTMLElement>('.gsap-carousel-container'));
      } else {
        const el = document.querySelector<HTMLElement>('.gsap-carousel-container');
        if (el) containers = [el];
      }
    }
    
    if (containers.length === 0) {
      throw new Error('Container element(s) not found');
    }
    
    const instances: GsapSlideCarousel[] = [];
    
    for (const container of containers) {
      try {
        const instance = new GsapSlideCarousel(container, options);
        instances.push(instance);
      } catch (error) {
        console.error('Failed to initialize carousel for container:', container, error);
      }
    }
    
    if (instances.length === 0) {
      throw new Error('Failed to initialize any carousel');
    }
    
    // 하나만 찾았으면 단일 인스턴스 반환, 여러 개면 배열 반환
    return instances.length === 1 ? instances[0] : instances;
  }

  /**
   * 페이지의 모든 캐러셀을 자동으로 초기화합니다.
   * @param selector 캐러셀 컨테이너를 찾을 선택자 (기본값: '.gsap-carousel-container')
   * @param defaultOptions 모든 캐러셀에 적용할 기본 옵션
   * @returns 생성된 캐러셀 인스턴스 배열
   * 
   * @example
   * ```typescript
   * // HTML에 여러 캐러셀이 있을 때
   * // <div class="gsap-carousel-container">...</div>
   * // <div class="gsap-carousel-container">...</div>
   * 
   * // 모든 캐러셀을 한번에 초기화
   * const carousels = GsapSlideCarousel.initAll();
   * 
   * // 커스텀 옵션으로 초기화
   * const carousels = GsapSlideCarousel.initAll('.gsap-carousel-container', {
   *   autoSlideSpeed: 100,
   *   pauseOnHover: true
   * });
   * ```
   */
  public static initAll(
    selector: string = '.gsap-carousel-container',
    defaultOptions: Omit<CarouselOptions, 'container' | 'containerSelector'> = {}
  ): GsapSlideCarousel[] {
    const result = GsapSlideCarousel.create({
      ...defaultOptions,
      containerSelector: selector,
      multiple: true
    });
    
    return Array.isArray(result) ? result : [result];
  }

  // ===== Public Methods =====

  public play(): void {
    this.isPausedState = false;
    if (this.animation) {
      this.animation.resume();
    } else {
      this.startContinuousAutoSlide();
    }
  }

  public pause(): void {
    this.isPausedState = true;
    if (this.animation) {
      this.animation.pause();
    }
  }

  public setSpeed(speed: number): void {
    if (speed <= 0) {
      console.warn('Speed must be greater than 0');
      return;
    }
    this.autoSlideSpeed = speed;
    if (this.animation && !this.isPausedState) {
      this.startContinuousAutoSlide();
    }
  }

  public goToSlide(index: number, _animated: boolean = true): void {
    if (index < 0 || index >= this.slides.length) {
      console.warn('Invalid slide index');
      return;
    }
    
    // TODO: 구현 필요
    console.warn('goToSlide not yet implemented');
  }

  public isPaused(): boolean {
    return this.isPausedState;
  }

  public getVisibleSlides(): number[] {
    const containerRect = this.slidesContainer.getBoundingClientRect();
    const visibleSlides: number[] = [];
    
    this.slides.forEach((slide, index) => {
      const slideRect = slide.getBoundingClientRect();
      const visibilityThreshold = slideRect.width * 0.5;
      const leftOverlap = Math.max(
        0,
        Math.min(containerRect.right, slideRect.right) - 
        Math.max(containerRect.left, slideRect.left)
      );
      
      if (leftOverlap >= visibilityThreshold) {
        visibleSlides.push(index);
      }
    });
    
    return [...new Set(visibleSlides)];
  }

  public destroy(): void {
    // 애니메이션 정지
    if (this.animation) {
      this.animation.kill();
      this.animation = null;
    }
    
    // 상태 초기화
    this.lastExposedIndexes = [];
    this.slides = [];
  }
}

export default GsapSlideCarousel;
