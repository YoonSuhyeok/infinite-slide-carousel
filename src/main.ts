import { gsap } from 'gsap';
import GsapSlideCarousel from './gsap-slide-carousel';
import './carousel.css';

// gsap을 전역에 노출 (디버깅용)
(window as any).gsap = gsap;

const eventLog = document.getElementById('eventLog') as HTMLElement;
const statusEl = document.getElementById('status') as HTMLElement;

function addLog(message: string) {
  const logItem = document.createElement('div');
  logItem.className = 'log-item';
  logItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  eventLog.insertBefore(logItem, eventLog.firstChild);
  
  // 최대 15개 로그만 유지
  while (eventLog.children.length > 15) {
    const lastChild = eventLog.lastChild;
    if (lastChild) eventLog.removeChild(lastChild);
  }
}

function updateStatus(text: string, className: string) {
  statusEl.textContent = text;
  statusEl.className = `status ${className}`;
}

// 캐러셀 초기화
try {
  updateStatus('Initializing...', 'paused');
  addLog('🔧 Starting carousel initialization...');

  // containerSelector로 찾은 모든 요소를 자동으로 초기화
  const result = GsapSlideCarousel.create({
    autoSlideSpeed: 200, // 픽셀/초: 더 빠르게
    direction: 'right',  // 오른쪽으로 슬라이드
    enableDrag: true,
    pauseOnHover: false,
  });
  
  // 단일 인스턴스 또는 배열
  const carousel = Array.isArray(result) ? result[0] : result;
  
  if (Array.isArray(result)) {
    addLog(`🎠 Initialized ${result.length} carousel(s)`);
  }

  // 버튼 이벤트
  const pauseBtn = document.getElementById('pauseBtn') as HTMLButtonElement;
  const playBtn = document.getElementById('playBtn') as HTMLButtonElement;
  const destroyBtn = document.getElementById('destroyBtn') as HTMLButtonElement;

  pauseBtn.addEventListener('click', () => {
    carousel.pause();
    updateStatus('Paused', 'paused');
    addLog('⏸️ Carousel paused');
  });

  playBtn.addEventListener('click', () => {
    carousel.play();
    updateStatus('Playing', 'playing');
    addLog('▶️ Carousel playing');
  });

  destroyBtn.addEventListener('click', () => {
    if (confirm('정말로 캐러셀을 제거하시겠습니까?')) {
      carousel.destroy();
      updateStatus('Destroyed', 'destroyed');
      addLog('🗑️ Carousel destroyed');
      
      // 버튼 비활성화
      pauseBtn.disabled = true;
      playBtn.disabled = true;
      destroyBtn.disabled = true;
    }
  });

  // 전역에 노출 (디버깅용)
  (window as any).carousel = carousel;
  console.log('Carousel instance available as window.carousel');
  
} catch (error) {
  console.error('Failed to initialize carousel:', error);
  addLog(`❌ Error: ${error}`);
  updateStatus('Error', 'destroyed');
}
