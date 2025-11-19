/**
 * @gsap-slide-carousel/carousel
 * GSAP 기반 무한 슬라이드 캐러셀 라이브러리
 * 
 * @example
 * ```typescript
 * import GsapSlideCarousel from '@gsap-slide-carousel/carousel';
 * import '@gsap-slide-carousel/carousel/styles';
 * 
 * const carousel = new GsapSlideCarousel({
 *   containerSelector: '.my-carousel',
 *   innerSelector: '.slides-inner',
 *   autoSlideSpeed: 30,
 *   onExpose: (idx, slide) => console.log('Slide exposed:', idx)
 * });
 * ```
 */

import './carousel.css';

export { default } from './gsap-slide-carousel';
export { default as GsapSlideCarousel } from './gsap-slide-carousel';
export type {
  CarouselOptions,
  IGsapSlideCarousel,
  ExposureCallback,
  ClickCallback,
  ReadyCallback,
  ClassNames
} from './carousel-types';
