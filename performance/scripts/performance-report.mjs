#!/usr/bin/env node

/**
 * 성능 리포트 HTML 생성 스크립트
 * 저장된 테스트 결과를 시각적인 HTML 리포트로 변환합니다.
 * 
 * 사용법:
 *   npm run perf:report
 *   node performance/scripts/performance-report.mjs [results-file.json]
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
 * HTML 리포트 생성
 */
function generateHtmlReport(results) {
  const timestamp = new Date(results.timestamp).toLocaleString();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 40px 20px;
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
        }

        .header h1 {
            font-size: 48px;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #00d4ff 0%, #ff6b6b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .metadata {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 40px;
        }

        .metadata-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .metadata-row:last-child {
            border-bottom: none;
        }

        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 30px;
            margin-bottom: 40px;
        }

        .chart-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }

        .chart-title {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }

        .table-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 40px;
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th {
            background: rgba(255, 255, 255, 0.1);
            font-weight: bold;
        }

        tr:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .winner {
            color: #00ff88;
            font-weight: bold;
        }

        .loser {
            color: #ff6b6b;
        }

        @media print {
            body {
                background: white;
                color: black;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Performance Test Results</h1>
            <p>Automated Performance Analysis</p>
        </div>

        <div class="metadata">
            <div class="metadata-row">
                <span><strong>Test Date:</strong></span>
                <span>${timestamp}</span>
            </div>
            <div class="metadata-row">
                <span><strong>Test Duration:</strong></span>
                <span>${results.config.duration / 1000}s per scenario</span>
            </div>
            <div class="metadata-row">
                <span><strong>Scenarios:</strong></span>
                <span>${results.config.scenarios.length}</span>
            </div>
            <div class="metadata-row">
                <span><strong>Versions:</strong></span>
                <span>GSAP vs Swiper</span>
            </div>
        </div>

        ${generateChartsSection(results)}
        ${generateTablesSection(results)}
    </div>

    <script>
        // Chart.js 설정
        Chart.defaults.color = '#fff';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

        ${generateChartScripts(results)}
    </script>
</body>
</html>`;
}

function generateChartsSection(results) {
  let html = '<div class="chart-grid">';
  
  for (const scenario of results.config.scenarios) {
    html += `
        <div class="chart-container">
            <div class="chart-title">FPS - ${scenario.name}</div>
            <canvas id="fps-${scenario.name}"></canvas>
        </div>
        <div class="chart-container">
            <div class="chart-title">Memory - ${scenario.name}</div>
            <canvas id="memory-${scenario.name}"></canvas>
        </div>
    `;
  }
  
  html += '</div>';
  return html;
}

function generateTablesSection(results) {
  let html = '';
  
  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    html += `
        <div class="table-container">
            <h2>${scenario.name.toUpperCase()} - ${scenario.slides} slides, ${scenario.speed}px/s</h2>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>GSAP</th>
                        <th>Swiper</th>
                        <th>Difference</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Average FPS</strong></td>
                        <td class="${gsap.fps.avg > swiper.fps.avg ? 'winner' : 'loser'}">${gsap.fps.avg.toFixed(2)}</td>
                        <td class="${swiper.fps.avg > gsap.fps.avg ? 'winner' : 'loser'}">${swiper.fps.avg.toFixed(2)}</td>
                        <td>${((gsap.fps.avg - swiper.fps.avg) / swiper.fps.avg * 100).toFixed(1)}%</td>
                        <td>${gsap.fps.avg > swiper.fps.avg ? '🏆 GSAP' : '🏆 Swiper'}</td>
                    </tr>
                    <tr>
                        <td><strong>Min FPS</strong></td>
                        <td class="${gsap.fps.min > swiper.fps.min ? 'winner' : 'loser'}">${gsap.fps.min}</td>
                        <td class="${swiper.fps.min > gsap.fps.min ? 'winner' : 'loser'}">${swiper.fps.min}</td>
                        <td>${((gsap.fps.min - swiper.fps.min) / swiper.fps.min * 100).toFixed(1)}%</td>
                        <td>${gsap.fps.min > swiper.fps.min ? '🏆 GSAP' : '🏆 Swiper'}</td>
                    </tr>
                    <tr>
                        <td><strong>P95 FPS</strong></td>
                        <td class="${gsap.fps.p95 > swiper.fps.p95 ? 'winner' : 'loser'}">${gsap.fps.p95.toFixed(2)}</td>
                        <td class="${swiper.fps.p95 > gsap.fps.p95 ? 'winner' : 'loser'}">${swiper.fps.p95.toFixed(2)}</td>
                        <td>${((gsap.fps.p95 - swiper.fps.p95) / swiper.fps.p95 * 100).toFixed(1)}%</td>
                        <td>${gsap.fps.p95 > swiper.fps.p95 ? '🏆 GSAP' : '🏆 Swiper'}</td>
                    </tr>
                    <tr>
                        <td><strong>Avg Memory</strong></td>
                        <td class="${gsap.memory.avg < swiper.memory.avg ? 'winner' : 'loser'}">${gsap.memory.avg.toFixed(2)}MB</td>
                        <td class="${swiper.memory.avg < gsap.memory.avg ? 'winner' : 'loser'}">${swiper.memory.avg.toFixed(2)}MB</td>
                        <td>${((swiper.memory.avg - gsap.memory.avg) / swiper.memory.avg * 100).toFixed(1)}% less</td>
                        <td>${gsap.memory.avg < swiper.memory.avg ? '🏆 GSAP' : '🏆 Swiper'}</td>
                    </tr>
                    <tr>
                        <td><strong>Max Memory</strong></td>
                        <td class="${gsap.memory.max < swiper.memory.max ? 'winner' : 'loser'}">${gsap.memory.max.toFixed(2)}MB</td>
                        <td class="${swiper.memory.max < gsap.memory.max ? 'winner' : 'loser'}">${swiper.memory.max.toFixed(2)}MB</td>
                        <td>${((swiper.memory.max - gsap.memory.max) / swiper.memory.max * 100).toFixed(1)}% less</td>
                        <td>${gsap.memory.max < swiper.memory.max ? '🏆 GSAP' : '🏆 Swiper'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
  }
  
  return html;
}

function generateChartScripts(results) {
  let scripts = '';
  
  for (const scenario of results.config.scenarios) {
    const gsap = results.gsap[scenario.name];
    const swiper = results.swiper[scenario.name];
    
    // FPS 차트
    scripts += `
        new Chart(document.getElementById('fps-${scenario.name}'), {
            type: 'bar',
            data: {
                labels: ['Avg FPS', 'Min FPS', 'P50 FPS', 'P95 FPS', 'P99 FPS', 'Max FPS'],
                datasets: [{
                    label: 'GSAP',
                    data: [${gsap.fps.avg}, ${gsap.fps.min}, ${gsap.fps.p50}, ${gsap.fps.p95}, ${gsap.fps.p99}, ${gsap.fps.max}],
                    backgroundColor: 'rgba(0, 212, 255, 0.7)',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    borderWidth: 1
                }, {
                    label: 'Swiper',
                    data: [${swiper.fps.avg}, ${swiper.fps.min}, ${swiper.fps.p50}, ${swiper.fps.p95}, ${swiper.fps.p99}, ${swiper.fps.max}],
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 65,
                        ticks: {
                            callback: function(value) {
                                return value + ' FPS';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    `;
    
    // 메모리 차트
    scripts += `
        new Chart(document.getElementById('memory-${scenario.name}'), {
            type: 'bar',
            data: {
                labels: ['Avg Memory', 'Min Memory', 'P50 Memory', 'P95 Memory', 'Max Memory'],
                datasets: [{
                    label: 'GSAP',
                    data: [${gsap.memory.avg}, ${gsap.memory.min}, ${gsap.memory.p50}, ${gsap.memory.p95}, ${gsap.memory.max}],
                    backgroundColor: 'rgba(0, 212, 255, 0.7)',
                    borderColor: 'rgba(0, 212, 255, 1)',
                    borderWidth: 1
                }, {
                    label: 'Swiper',
                    data: [${swiper.memory.avg}, ${swiper.memory.min}, ${swiper.memory.p50}, ${swiper.memory.p95}, ${swiper.memory.max}],
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(1) + ' MB';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                }
            }
        });
    `;
  }
  
  return scripts;
}

/**
 * 메인 실행
 */
async function main() {
  const args = process.argv.slice(2);
  const resultsFile = args[0] || findLatestResults();
  
  console.log('🎨 Generating HTML performance report...\n');
  console.log(`Reading: ${resultsFile}\n`);
  
  const results = JSON.parse(readFileSync(resultsFile, 'utf-8'));
  
  const html = generateHtmlReport(results);
  const htmlPath = resultsFile.replace('.json', '.html');
  writeFileSync(htmlPath, html);
  
  console.log(`✅ HTML report saved: ${htmlPath}`);
  console.log(`\n🌐 Open in browser: file://${htmlPath}\n`);
}

main().catch(console.error);
