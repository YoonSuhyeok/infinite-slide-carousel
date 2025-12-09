/**
 * GsapSlideCarousel 라이브러리 타입 정의
 */

/**
 * 슬라이드 노출 시 호출되는 콜백
 * @param idx - 원본 슬라이드 인덱스
 * @param slide - 슬라이드 HTMLElement
 */
export type ExposureCallback = (idx: number, slide: HTMLElement) => void;

/**
 * 슬라이드 클릭 시 호출되는 콜백
 * @param idx - 원본 슬라이드 인덱스
 * @param slide - 슬라이드 HTMLElement
 * @param event - 클릭 이벤트
 */
export type ClickCallback = (idx: number, slide: HTMLElement, event: Event) => void;

/**
 * 캐러셀 초기화 완료 시 호출되는 콜백
 */
export type ReadyCallback = () => void;

/**
 * CSS 클래스명 커스터마이징 옵션
 */
export interface ClassNames {
  /** 외부 컨테이너 클래스 (기본: 'gsap-carousel-container') */
  container?: string;
  
  /** 개별 슬라이드 클래스 (기본: 'gsap-carousel-slide') */
  slide?: string;
}

/**
 * GsapSlideCarousel 생성자 옵션
 */
export interface CarouselOptions {
  // ===== 선택 옵션 =====
  
  /** 캐러셀 컨테이너 HTMLElement 또는 CSS 셀렉터 */
  container?: HTMLElement | string;
  
  /** @deprecated containerSelector 대신 container 사용 권장 */
  containerSelector?: string;
  
  /** containerSelector로 여러 요소를 찾았을 때 모두 초기화할지 여부 (기본값: true) */
  multiple?: boolean;
  
  // ===== 기타 옵션 =====
  
  /** 슬라이드 방향 (기본값: 'left') */
  direction?: 'left' | 'right';
  
  /** 슬라이드 자동 이동 속도 (픽셀/초, 기본값: 30) */
  autoSlideSpeed?: number;
  
  /** 한 슬라이드 전환 시간 (밀리초, 기본값: 3000)
   * autoSlideSpeed와 함께 사용 시 autoSlideSpeed가 우선합니다.
   */
  transitionDuration?: number;
  
  /** 슬라이드 간 간격 (픽셀, 기본값: 16) */
  slideSpace?: number;
  
  /** 슬라이드 자동 복제 및 애니메이션 비활성화 기준 개수 (기본값: 자동 계산)
   * 슬라이드 수가 이 값 이하일 때 복제하지 않고 애니메이션도 멈춥니다.
   * 설정하지 않으면 화면을 채우기 위해 필요한 만큼 자동으로 복제합니다.
   */
  minSlideCount?: number;
  
  /** 드래그 기능 활성화 여부 (기본값: true) */
  enableDrag?: boolean;
  
  /** 마우스 호버 시 일시정지 여부 (기본값: true) */
  pauseOnHover?: boolean;
  
  /** 브라우저 탭 숨김 시 일시정지 여부 (기본값: true) */
  pauseOnHidden?: boolean;
  
  /** 커스텀 클래스명 */
  classNames?: ClassNames;
  
  // ===== 콜백 함수 =====
  
  /** 슬라이드가 화면에 노출될 때 호출 */
  onExpose?: ExposureCallback;
  
  /** 슬라이드 클릭 시 호출 */
  onClick?: ClickCallback;
  
  /** 캐러셀 초기화 완료 시 호출 */
  onReady?: ReadyCallback;
}

/**
 * GsapSlideCarousel 공개 인터페이스
 */
export interface IGsapSlideCarousel {
  /**
   * 애니메이션 재생
   */
  play(): void;
  
  /**
   * 애니메이션 일시정지
   */
  pause(): void;
  
  /**
   * 애니메이션 속도 변경
   * @param duration - 한 슬라이드 전환 시간 (밀리초)
   */
  setSpeed(duration: number): void;
  
  /**
   * 특정 슬라이드로 이동
   * @param index - 원본 슬라이드 인덱스
   * @param animated - 애니메이션 여부 (기본값: true)
   */
  goToSlide(index: number, animated?: boolean): void;
  
  /**
   * 현재 일시정지 상태 확인
   * @returns 일시정지 중이면 true
   */
  isPaused(): boolean;
  
  /**
   * 현재 화면에 보이는 슬라이드 인덱스 가져오기
   * @returns 원본 슬라이드 인덱스 배열
   */
  getVisibleSlides(): number[];
  
  /**
   * 리소스 정리 및 이벤트 리스너 제거
   */
  destroy(): void;
}

/**
 * 캐러셀 생성자 인터페이스 (정적 메서드 포함)
 */
export interface IGsapSlideCarouselConstructor {
  new(options?: CarouselOptions): IGsapSlideCarousel;
  /**
   * 페이지의 모든 캐러셀을 자동으로 초기화합니다.
   * @param selector 캐러셀 컨테이너를 찾을 선택자 (기본값: '.gsap-carousel-container')
   * @param defaultOptions 모든 캐러셀에 적용할 기본 옵션
   * @returns 생성된 캐러셀 인스턴스 배열
   */
  initAll(selector?: string, defaultOptions?: Omit<CarouselOptions, 'container' | 'containerSelector'>): IGsapSlideCarousel[];
}
