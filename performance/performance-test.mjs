#!/usr/bin/env node

/**
 * 자동화된 성능 테스트 스크립트
 * Playwright를 사용하여 GSAP 및 Swiper 버전의 성능을 측정합니다.
 * 
 * 사용법:
 *   npm run perf:test
 *   node scripts/performance-test.mjs
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = __dirname;

// 테스트 설정
const TEST_CONFIG = {
  duration: 30000, // 30초 테스트
  warmupDuration: 5000, // 5초 워밍업
  scenarios: [
    { name: 'basic', slides: 20, transitionDuration: 2000 },
    { name: 'high-load', slides: 100, transitionDuration: 2000 },
    { name: 'high-speed', slides: 20, transitionDuration: 500 }
  ]
};

/**
 * 페이지의 성능 메트릭 수집
 */
async function collectMetrics(page, duration) {
  const metrics = {
    fps: [],
    memory: [],
    layoutDuration: [],
    scriptDuration: [],
    timestamp: new Date().toISOString()
  };

  const startTime = Date.now();
  
  while (Date.now() - startTime < duration) {
    // Performance metrics 수집
    const perfMetrics = await page.evaluate(() => {
      return {
        memory: performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null,
        timing: performance.timing,
        navigationStart: performance.timing.navigationStart
      };
    });

    if (perfMetrics.memory) {
      metrics.memory.push(perfMetrics.memory.usedJSHeapSize / 1048576); // MB
    }

    // FPS 측정 (requestAnimationFrame 기반)
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frames++;
          const elapsed = performance.now() - startTime;
          
          if (elapsed >= 1000) {
            resolve(Math.round(frames / (elapsed / 1000)));
          } else {
            requestAnimationFrame(countFrame);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });

    metrics.fps.push(fps);

    // 100ms 대기
    await page.waitForTimeout(100);
  }

  return metrics;
}

/**
 * 성능 메트릭 분석
 */
function analyzeMetrics(metrics) {
  const analysis = {
    fps: {
      avg: average(metrics.fps),
      min: Math.min(...metrics.fps),
      max: Math.max(...metrics.fps),
      p50: percentile(metrics.fps, 50),
      p95: percentile(metrics.fps, 95),
      p99: percentile(metrics.fps, 99)
    },
    memory: {
      avg: average(metrics.memory),
      min: Math.min(...metrics.memory),
      max: Math.max(...metrics.memory),
      p50: percentile(metrics.memory, 50),
      p95: percentile(metrics.memory, 95)
    },
    timestamp: metrics.timestamp
  };

  return analysis;
}

function average(arr) {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function percentile(arr, p) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((sorted.length * p) / 100) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Chrome DevTools Protocol을 사용한 상세 성능 측정
 */
async function measureWithCDP(page, duration) {
  const client = await page.context().newCDPSession(page);
  
  // Performance 모니터링 활성화
  await client.send('Performance.enable');
  await client.send('Overlay.setShowFPSCounter', { show: true });

  const metrics = [];
  const startTime = Date.now();

  while (Date.now() - startTime < duration) {
    const perfMetrics = await client.send('Performance.getMetrics');
    metrics.push({
      timestamp: Date.now(),
      metrics: perfMetrics.metrics
    });
    await page.waitForTimeout(100);
  }

  await client.send('Performance.disable');
  
  return metrics;
}

/**
 * 단일 버전 테스트
 */
async function testVersion(browser, version, scenario) {
  console.log(`\n🧪 Testing ${version} - ${scenario.name}...`);
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 페이지 로드
    const htmlFile = version === 'gsap' 
      ? 'gsap-version.html' 
      : 'swiper-version.html';
    
    const url = `file://${join(projectRoot, htmlFile)}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // 초기화 대기
    await page.waitForTimeout(2000);
    
    // 시나리오 설정
    if (scenario.slides > 20) {
      const clickCount = Math.ceil((scenario.slides - 20) / 10);
      for (let i = 0; i < clickCount; i++) {
        await page.click('button:has-text("Add 10 Slides")');
        await page.waitForTimeout(500);
      }
    }
    
    if (scenario.transitionDuration !== 2000) {
      // transitionDuration이 작을수록 빠름 (500ms = 4배 빠름)
      const speedMultiplier = 2000 / scenario.transitionDuration;
      const clickCount = Math.log2(speedMultiplier);
      for (let i = 0; i < Math.abs(clickCount); i++) {
        const button = clickCount > 0 ? 'Speed Up' : 'Speed Down';
        await page.click(`button:has-text("${button}")`);
        await page.waitForTimeout(300);
      }
    }
    
    // 워밍업
    console.log('  ⏳ Warming up...');
    await page.waitForTimeout(TEST_CONFIG.warmupDuration);
    
    // 메트릭 수집
    console.log('  📊 Collecting metrics...');
    const metrics = await collectMetrics(page, TEST_CONFIG.duration);
    
    // CDP 메트릭 수집
    console.log('  🔍 Collecting CDP metrics...');
    const cdpMetrics = await measureWithCDP(page, 5000);
    
    // 분석
    const analysis = analyzeMetrics(metrics);
    analysis.cdp = cdpMetrics;
    analysis.version = version;
    analysis.scenario = scenario;
    
    console.log(`  ✅ Complete - Avg FPS: ${analysis.fps.avg.toFixed(2)}, Memory: ${analysis.memory.avg.toFixed(2)}MB`);
    
    return analysis;
    
  } finally {
    await context.close();
  }
}

/**
 * 모든 테스트 실행
 */
async function runAllTests() {
  console.log('🚀 Starting automated performance tests...\n');
  console.log(`Test Duration: ${TEST_CONFIG.duration / 1000}s per scenario`);
  console.log(`Scenarios: ${TEST_CONFIG.scenarios.length}`);
  console.log(`Versions: GSAP, Swiper\n`);
  
  const browser = await chromium.launch({
    headless: false, // 시각적 확인 위해 false
    args: [
      '--enable-precise-memory-info',
      '--enable-gpu-benchmarking',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  const results = {
    gsap: {},
    swiper: {},
    timestamp: new Date().toISOString(),
    config: TEST_CONFIG
  };
  
  try {
    // 각 시나리오별로 테스트
    for (const scenario of TEST_CONFIG.scenarios) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Scenario: ${scenario.name} (${scenario.slides} slides, ${scenario.transitionDuration}ms/slide)`);
      console.log('='.repeat(60));
      
      // GSAP 테스트
      results.gsap[scenario.name] = await testVersion(browser, 'gsap', scenario);
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Swiper 테스트
      results.swiper[scenario.name] = await testVersion(browser, 'swiper', scenario);
    }
    
    // 결과 저장
    const outputDir = join(projectRoot, 'performance-results');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputPath = join(outputDir, `results-${timestamp}.json`);
    
    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    console.log(`\n📄 Results saved to: ${outputPath}\n`);
    
    // 요약 출력
    printSummary(results);
    
  } finally {
    await browser.close();
  }
  
  return results;
}

/**
 * 결과 요약 출력
 */
function printSummary(results) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Performance Summary');
  console.log('='.repeat(60) + '\n');
  
  for (const scenario of TEST_CONFIG.scenarios) {
    const gsapResult = results.gsap[scenario.name];
    const swiperResult = results.swiper[scenario.name];
    
    console.log(`\n${scenario.name.toUpperCase()} (${scenario.slides} slides, ${scenario.transitionDuration}ms/slide)`);
    console.log('-'.repeat(60));
    
    console.log('\nFPS:');
    console.log(`  GSAP:   avg=${gsapResult.fps.avg.toFixed(1)} min=${gsapResult.fps.min} p95=${gsapResult.fps.p95.toFixed(1)}`);
    console.log(`  Swiper: avg=${swiperResult.fps.avg.toFixed(1)} min=${swiperResult.fps.min} p95=${swiperResult.fps.p95.toFixed(1)}`);
    
    const fpsDiff = ((gsapResult.fps.avg - swiperResult.fps.avg) / swiperResult.fps.avg * 100).toFixed(1);
    console.log(`  Winner: ${fpsDiff > 0 ? '🏆 GSAP' : '🏆 Swiper'} (${Math.abs(fpsDiff)}% ${fpsDiff > 0 ? 'faster' : 'slower'})`);
    
    console.log('\nMemory:');
    console.log(`  GSAP:   avg=${gsapResult.memory.avg.toFixed(1)}MB max=${gsapResult.memory.max.toFixed(1)}MB`);
    console.log(`  Swiper: avg=${swiperResult.memory.avg.toFixed(1)}MB max=${swiperResult.memory.max.toFixed(1)}MB`);
    
    const memDiff = ((swiperResult.memory.avg - gsapResult.memory.avg) / swiperResult.memory.avg * 100).toFixed(1);
    console.log(`  Winner: ${memDiff > 0 ? '🏆 GSAP' : '🏆 Swiper'} (${Math.abs(memDiff)}% ${memDiff > 0 ? 'less' : 'more'})`);
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
}

// 실행
runAllTests().catch(console.error);
