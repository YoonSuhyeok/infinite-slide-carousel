# 자동화된 성능 테스트

Playwright를 사용한 자동화된 성능 측정 및 비교 시스템입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install

# Playwright 브라우저 설치
npx playwright install chromium
```

### 2. 프로젝트 빌드

```bash
npm run build
```

### 3. 성능 테스트 실행

```bash
# 자동 성능 테스트 실행 (GSAP vs Swiper)
npm run perf:test

# 결과 비교 및 마크다운 리포트 생성
npm run perf:compare

# HTML 시각화 리포트 생성
npm run perf:report
```

## 📊 테스트 시나리오

### 기본 설정
- **테스트 시간**: 30초 (워밍업 5초 포함)
- **측정 항목**: FPS, 메모리 사용량
- **브라우저**: Chromium (헤드리스 모드 선택 가능)

### 시나리오

1. **Basic (기본)**
   - 슬라이드 개수: 20개
   - 속도: 50px/s
   - 목적: 기본 성능 측정

2. **High Load (고부하)**
   - 슬라이드 개수: 100개
   - 속도: 50px/s
   - 목적: 많은 슬라이드 처리 성능

3. **High Speed (고속)**
   - 슬라이드 개수: 20개
   - 속도: 200px/s (4배속)
   - 목적: 빠른 애니메이션 성능

## 📁 출력 파일

테스트 실행 후 `performance-results/` 디렉토리에 생성됩니다:

```
performance-results/
├── results-[timestamp].json          # 원본 테스트 데이터
├── results-[timestamp].md            # 마크다운 리포트
├── results-[timestamp]-summary.json  # 요약 데이터
├── results-[timestamp].html          # HTML 시각화 리포트
└── readme-section.md                 # README.md 업데이트용 섹션
```

## 🔍 측정 항목

### FPS (Frames Per Second)
- **Average**: 평균 FPS
- **Min**: 최소 FPS (성능 저하 지점)
- **P50/P95/P99**: 백분위수 (안정성 지표)
- **Max**: 최대 FPS

### Memory
- **Average**: 평균 메모리 사용량 (MB)
- **Min/Max**: 최소/최대 메모리 사용량
- **P95**: 95번째 백분위 메모리 사용량

### Chrome DevTools Protocol (CDP)
- 레이아웃 시간
- 스크립트 실행 시간
- 렌더링 메트릭

## 🛠️ 스크립트 설명

### 1. performance-test.mjs
자동화된 성능 테스트 실행

```bash
node scripts/performance-test.mjs
```

**기능:**
- Playwright로 브라우저 제어
- 각 시나리오별 GSAP/Swiper 테스트
- FPS 및 메모리 측정
- CDP를 통한 상세 메트릭 수집
- JSON 결과 저장

**설정 변경:**
```javascript
const TEST_CONFIG = {
  duration: 30000,        // 테스트 시간 (ms)
  warmupDuration: 5000,   // 워밍업 시간 (ms)
  scenarios: [...]        // 시나리오 추가/수정
};
```

### 2. performance-compare.mjs
결과 분석 및 마크다운 리포트 생성

```bash
node scripts/performance-compare.mjs [results-file.json]
```

**기능:**
- 테스트 결과 분석
- 승자 판정 (FPS, 메모리)
- 마크다운 리포트 생성
- JSON 요약 생성
- README.md 섹션 생성

### 3. performance-report.mjs
HTML 시각화 리포트 생성

```bash
node scripts/performance-report.mjs [results-file.json]
```

**기능:**
- Chart.js를 사용한 그래프 생성
- 인터랙티브 테이블
- 브라우저에서 볼 수 있는 HTML
- 인쇄 가능한 레이아웃

## 📈 사용 예시

### 전체 워크플로우

```bash
# 1. 빌드
npm run build

# 2. 테스트 실행
npm run perf:test
# ✅ 결과: performance-results/results-[timestamp].json

# 3. 리포트 생성
npm run perf:compare
# ✅ 마크다운: results-[timestamp].md
# ✅ 요약: results-[timestamp]-summary.json
# ✅ README: readme-section.md

# 4. HTML 리포트
npm run perf:report
# ✅ HTML: results-[timestamp].html
```

### 특정 결과 파일 분석

```bash
# 특정 결과 파일로 리포트 생성
node scripts/performance-compare.mjs performance-results/results-2025-11-22T10-00-00.json
node scripts/performance-report.mjs performance-results/results-2025-11-22T10-00-00.json
```

## 🎯 CI/CD 통합

### GitHub Actions 예시

```yaml
name: Performance Test

on:
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # 매주 일요일

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Install Playwright browsers
        run: npx playwright install chromium
      
      - name: Build project
        run: npm run build
      
      - name: Run performance tests
        run: npm run perf:test
      
      - name: Generate reports
        run: |
          npm run perf:compare
          npm run perf:report
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: performance-results/
```

## 📊 결과 해석

### FPS 기준
- **60 FPS**: 이상적 (매우 부드러움)
- **45-60 FPS**: 양호
- **30-45 FPS**: 눈에 띄는 버벅임
- **< 30 FPS**: 개선 필요

### 메모리 기준
- **증가율**: 지속적으로 증가하면 메모리 누수 의심
- **절대값**: 애플리케이션 규모에 따라 다름
- **비교**: 같은 조건에서 상대 비교가 중요

### 승자 판정
- FPS와 메모리를 종합적으로 평가
- 각 시나리오별 승자 카운트
- 안정성 (P95, P99) 고려

## 🔧 트러블슈팅

### Playwright 브라우저 설치 문제

```bash
# Chromium만 설치
npx playwright install chromium

# 모든 브라우저 설치
npx playwright install
```

### 메모리 측정이 안 되는 경우

Chrome의 `performance.memory`는 보안상 제한될 수 있습니다.
브라우저를 다음 플래그로 실행:

```javascript
const browser = await chromium.launch({
  args: ['--enable-precise-memory-info']
});
```

### 헤드리스 모드로 실행

`performance-test.mjs` 수정:

```javascript
const browser = await chromium.launch({
  headless: true  // false → true
});
```

### 테스트 시간 조정

빠른 테스트를 위해 시간 단축:

```javascript
const TEST_CONFIG = {
  duration: 10000,        // 30초 → 10초
  warmupDuration: 2000,   // 5초 → 2초
};
```

## 💡 팁

### 1. 일관된 환경 유지
- 백그라운드 프로세스 최소화
- 전원 모드를 고성능으로 설정
- 네트워크 활동 최소화

### 2. 여러 번 실행
```bash
# 3회 실행하여 평균값 사용
for i in {1..3}; do npm run perf:test; done
```

### 3. 결과 버전 관리
```bash
# Git에 결과 커밋
git add performance-results/
git commit -m "perf: benchmark results [date]"
```

### 4. 기준선(Baseline) 설정
첫 실행 결과를 기준선으로 저장하고 이후 변경사항 비교

## 📚 참고 자료

- [Playwright Documentation](https://playwright.dev)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [Chart.js Documentation](https://www.chartjs.org)

## 🤝 기여

성능 테스트 개선 아이디어나 버그 리포트는 이슈로 등록해주세요!
