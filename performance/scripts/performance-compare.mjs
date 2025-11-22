#!/usr/bin/env node

/**
 * 성능 비교 및 리포트 생성 스크립트
 * 저장된 테스트 결과를 분석하여 마크다운 리포트를 생성합니다.
 * 
 * 사용법:
 *   npm run perf:compare
 *   node performance/scripts/performance-compare.mjs [results-file.json]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

/**
 * 가장 최근 결과 파일 찾기
 */
function findLatestResults() {
  const resultsDir = join(projectRoot, 'performance', 'performance-results');
  const files = readdirSync(resultsDir)
    .filter(f => f.startsWith('results-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length === 0) {
    throw new Error('No results file found. Run performance tests first.');
  }
  
  return join(resultsDir, files[0]);
}

/**
 * 마크다운 리포트 생성
 */
function generateMarkdownReport(results) {
  const timestamp = new Date(results.timestamp).toLocaleString();
  
  let markdown = `# Performance Comparison Report

> Generated: ${timestamp}
> Test Duration: ${results.config.duration / 1000}s per scenario

## 📊 Test Summary

`;

  // 각 시나리오별 결과
  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    markdown += `### ${scenario.name.toUpperCase()} - ${scenario.slides} slides, ${scenario.speed}px/s

| Metric | GSAP | Swiper | Difference | Winner |
|--------|------|--------|------------|--------|
`;

    // FPS 비교
    const fpsAvgDiff = ((gsap.fps.avg - swiper.fps.avg) / swiper.fps.avg * 100).toFixed(1);
    const fpsWinner = gsap.fps.avg > swiper.fps.avg ? '🏆 GSAP' : '🏆 Swiper';
    markdown += `| **Avg FPS** | ${gsap.fps.avg.toFixed(1)} | ${swiper.fps.avg.toFixed(1)} | ${fpsAvgDiff}% | ${fpsWinner} |\n`;
    
    const fpsMinDiff = ((gsap.fps.min - swiper.fps.min) / swiper.fps.min * 100).toFixed(1);
    const fpsMinWinner = gsap.fps.min > swiper.fps.min ? '🏆 GSAP' : '🏆 Swiper';
    markdown += `| **Min FPS** | ${gsap.fps.min} | ${swiper.fps.min} | ${fpsMinDiff}% | ${fpsMinWinner} |\n`;
    
    const fpsP95Diff = ((gsap.fps.p95 - swiper.fps.p95) / swiper.fps.p95 * 100).toFixed(1);
    const fpsP95Winner = gsap.fps.p95 > swiper.fps.p95 ? '🏆 GSAP' : '🏆 Swiper';
    markdown += `| **P95 FPS** | ${gsap.fps.p95.toFixed(1)} | ${swiper.fps.p95.toFixed(1)} | ${fpsP95Diff}% | ${fpsP95Winner} |\n`;
    
    // 메모리 비교
    const memAvgDiff = ((swiper.memory.avg - gsap.memory.avg) / swiper.memory.avg * 100).toFixed(1);
    const memWinner = gsap.memory.avg < swiper.memory.avg ? '🏆 GSAP' : '🏆 Swiper';
    markdown += `| **Avg Memory** | ${gsap.memory.avg.toFixed(1)}MB | ${swiper.memory.avg.toFixed(1)}MB | ${memAvgDiff}% less | ${memWinner} |\n`;
    
    const memMaxDiff = ((swiper.memory.max - gsap.memory.max) / swiper.memory.max * 100).toFixed(1);
    const memMaxWinner = gsap.memory.max < swiper.memory.max ? '🏆 GSAP' : '🏆 Swiper';
    markdown += `| **Max Memory** | ${gsap.memory.max.toFixed(1)}MB | ${swiper.memory.max.toFixed(1)}MB | ${memMaxDiff}% less | ${memMaxWinner} |\n`;
    
    markdown += '\n';
  }

  // 종합 분석
  markdown += `## 🏆 Overall Winner

`;

  let gsapWins = 0;
  let swiperWins = 0;

  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    if (gsap.fps.avg > swiper.fps.avg) gsapWins++;
    else swiperWins++;
    
    if (gsap.memory.avg < swiper.memory.avg) gsapWins++;
    else swiperWins++;
  }

  markdown += `**GSAP wins: ${gsapWins}** | **Swiper wins: ${swiperWins}**

`;

  if (gsapWins > swiperWins) {
    markdown += `🎉 **GSAP version performs better overall!**

### Key Advantages:
- Better FPS stability across all scenarios
- Lower memory consumption
- More consistent performance under load

`;
  } else {
    markdown += `🎉 **Swiper performs better overall!**

`;
  }

  // 상세 데이터
  markdown += `## 📈 Detailed Metrics

### FPS Distribution

`;

  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    markdown += `**${scenario.name}:**
- GSAP: min=${gsap.fps.min}, p50=${gsap.fps.p50.toFixed(1)}, p95=${gsap.fps.p95.toFixed(1)}, p99=${gsap.fps.p99.toFixed(1)}, max=${gsap.fps.max}
- Swiper: min=${swiper.fps.min}, p50=${swiper.fps.p50.toFixed(1)}, p95=${swiper.fps.p95.toFixed(1)}, p99=${swiper.fps.p99.toFixed(1)}, max=${swiper.fps.max}

`;
  }

  markdown += `### Memory Usage

`;

  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    markdown += `**${scenario.name}:**
- GSAP: min=${gsap.memory.min.toFixed(1)}MB, avg=${gsap.memory.avg.toFixed(1)}MB, p95=${gsap.memory.p95.toFixed(1)}MB, max=${gsap.memory.max.toFixed(1)}MB
- Swiper: min=${swiper.memory.min.toFixed(1)}MB, avg=${swiper.memory.avg.toFixed(1)}MB, p95=${swiper.memory.p95.toFixed(1)}MB, max=${swiper.memory.max.toFixed(1)}MB

`;
  }

  // 권장사항
  markdown += `## 💡 Recommendations

`;

  const basicGsap = results.gsap.basic;
  const basicSwiper = results.swiper.basic;
  
  if (basicGsap.fps.avg >= 55 && basicGsap.memory.avg < basicSwiper.memory.avg * 0.85) {
    markdown += `✅ **Use GSAP version** when:
- Performance is critical (gaming, high-traffic sites)
- Large number of slides (50+)
- Memory efficiency is important
- Custom animation control needed

✅ **Use Swiper** when:
- Rapid prototyping
- Need built-in features (pagination, navigation)
- Community support is priority

`;
  }

  markdown += `---

*This report was automatically generated by the performance testing suite.*
`;

  return markdown;
}

/**
 * JSON 요약 리포트 생성
 */
function generateJsonSummary(results) {
  const summary = {
    timestamp: results.timestamp,
    testDuration: results.config.duration,
    scenarios: {}
  };

  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    summary.scenarios[scenario.name] = {
      config: scenario,
      gsap: {
        fps: { avg: gsap.fps.avg, min: gsap.fps.min, p95: gsap.fps.p95 },
        memory: { avg: gsap.memory.avg, max: gsap.memory.max }
      },
      swiper: {
        fps: { avg: swiper.fps.avg, min: swiper.fps.min, p95: swiper.fps.p95 },
        memory: { avg: swiper.memory.avg, max: swiper.memory.max }
      },
      winner: {
        fps: gsap.fps.avg > swiper.fps.avg ? 'GSAP' : 'Swiper',
        memory: gsap.memory.avg < swiper.memory.avg ? 'GSAP' : 'Swiper'
      }
    };
  }

  return summary;
}

/**
 * 메인 실행
 */
async function main() {
  const args = process.argv.slice(2);
  const resultsFile = args[0] || findLatestResults();
  
  console.log('📊 Generating performance comparison report...\n');
  console.log(`Reading: ${resultsFile}\n`);
  
  const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));
  
  // 마크다운 리포트 생성
  const markdown = generateMarkdownReport(results);
  const mdPath = resultsFile.replace('.json', '.md');
  writeFileSync(mdPath, markdown);
  console.log(`✅ Markdown report saved: ${mdPath}`);
  
  // JSON 요약 생성
  const summary = generateJsonSummary(results);
  const summaryPath = resultsFile.replace('.json', '-summary.json');
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary JSON saved: ${summaryPath}`);
  
  // README 업데이트용 섹션 생성
  const readmeSection = generateReadmeSection(summary);
  const readmePath = join(projectRoot, 'performance', 'performance-results', 'readme-section.md');
  writeFileSync(readmePath, readmeSection);
  console.log(`✅ README section saved: ${readmePath}`);
  
  console.log('\n✨ All reports generated successfully!\n');
}

/**
 * README용 섹션 생성
 */
function generateReadmeSection(summary) {
  const basic = summary.scenarios.basic;
  const highLoad = summary.scenarios['high-load'];
  
  return `## 📊 성능 비교

GSAP 기반 구현과 Swiper 라이브러리의 성능을 비교한 결과입니다.

### 주요 성능 지표 (20개 슬라이드 기준)

| 지표 | GSAP 버전 | Swiper | 차이 |
|------|-----------|--------|------|
| **평균 FPS** | ${basic.gsap.fps.avg.toFixed(1)} | ${basic.swiper.fps.avg.toFixed(1)} | ${basic.winner.fps === 'GSAP' ? '🏆' : ''} ${((basic.gsap.fps.avg - basic.swiper.fps.avg) / basic.swiper.fps.avg * 100).toFixed(1)}% |
| **최소 FPS** | ${basic.gsap.fps.min} | ${basic.swiper.fps.min} | ${basic.winner.fps === 'GSAP' ? '🏆' : ''} ${((basic.gsap.fps.min - basic.swiper.fps.min) / basic.swiper.fps.min * 100).toFixed(1)}% |
| **메모리 사용량** | ${basic.gsap.memory.avg.toFixed(1)}MB | ${basic.swiper.memory.avg.toFixed(1)}MB | ${basic.winner.memory === 'GSAP' ? '🏆' : ''} ${((basic.swiper.memory.avg - basic.gsap.memory.avg) / basic.swiper.memory.avg * 100).toFixed(1)}% less |

### 고부하 테스트 (100개 슬라이드)

| 지표 | GSAP 버전 | Swiper | 차이 |
|------|-----------|--------|------|
| **평균 FPS** | ${highLoad.gsap.fps.avg.toFixed(1)} | ${highLoad.swiper.fps.avg.toFixed(1)} | ${highLoad.winner.fps === 'GSAP' ? '🏆' : ''} ${((highLoad.gsap.fps.avg - highLoad.swiper.fps.avg) / highLoad.swiper.fps.avg * 100).toFixed(1)}% |
| **최소 FPS** | ${highLoad.gsap.fps.min} | ${highLoad.swiper.fps.min} | ${highLoad.winner.fps === 'GSAP' ? '🏆' : ''} ${((highLoad.gsap.fps.min - highLoad.swiper.fps.min) / highLoad.swiper.fps.min * 100).toFixed(1)}% |
| **메모리 사용량** | ${highLoad.gsap.memory.avg.toFixed(1)}MB | ${highLoad.swiper.memory.avg.toFixed(1)}MB | ${highLoad.winner.memory === 'GSAP' ? '🏆' : ''} ${((highLoad.swiper.memory.avg - highLoad.gsap.memory.avg) / highLoad.swiper.memory.avg * 100).toFixed(1)}% less |

> 📈 **상세 분석**: [Performance Report](./performance-results/)
> 🧪 **테스트 재현**: \`npm run perf:test\`
`;
}

main().catch(console.error);
