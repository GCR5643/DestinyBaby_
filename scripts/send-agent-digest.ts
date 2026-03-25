/**
 * 에이전트 발견사항 다이제스트 이메일 발송 스크립트
 *
 * 매일 오후 5시에 실행되어, 사용자 인풋이 필요한 findings를 수집하여 이메일로 전송합니다.
 *
 * 사용법: npx ts-node scripts/send-agent-digest.ts
 *
 * 환경변수 필요:
 *   GMAIL_APP_PASSWORD - Gmail 앱 비밀번호 (Google 계정 → 보안 → 2단계 인증 → 앱 비밀번호)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(PROJECT_ROOT, '.omc', 'agents');
const RECIPIENT = 'geonchan@gmail.com';

const AGENT_LABELS: Record<string, string> = {
  'product-manager': '기획자',
  'designer': '디자이너',
  'qa': 'QA',
  'backend': '백엔드',
  'frontend': '프론트엔드',
  'ux-expert': 'UX 전문가',
  'saju-expert': '사주 전문가',
  'mystery-shopper': '미스터리 쇼퍼',
  'security-expert': '보안 전문가',
  'performance-expert': '성능 전문가',
  'seo-growth': 'SEO/그로스',
  'data-analyst': '데이터 분석가',
  'content-writer': '콘텐츠/카피라이터',
};

interface AgentFindings {
  agentId: string;
  label: string;
  content: string;
  hasActionItems: boolean;
  criticalCount: number;
  highCount: number;
}

function readFindings(): AgentFindings[] {
  const results: AgentFindings[] = [];

  for (const [agentId, label] of Object.entries(AGENT_LABELS)) {
    const findingsPath = path.join(AGENTS_DIR, agentId, 'findings.md');
    if (!fs.existsSync(findingsPath)) continue;

    const content = fs.readFileSync(findingsPath, 'utf-8');

    // 초기 상태(실행된 적 없음)면 스킵
    if (content.includes('아직 실행된 적 없습니다')) continue;
    if (content.trim().length < 50) continue;

    const criticalCount = (content.match(/\[critical\]/gi) || []).length;
    const highCount = (content.match(/\[high\]/gi) || []).length;
    const hasActionItems = criticalCount > 0 || highCount > 0 ||
      content.includes('권장사항') || content.includes('Recommendation');

    results.push({ agentId, label, content, hasActionItems, criticalCount, highCount });
  }

  return results;
}

function buildEmailHtml(findings: AgentFindings[]): string {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const actionRequired = findings.filter(f => f.hasActionItems);
  const totalCritical = findings.reduce((sum, f) => sum + f.criticalCount, 0);
  const totalHigh = findings.reduce((sum, f) => sum + f.highCount, 0);

  let html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Pretendard', -apple-system, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; color: #333;">
  <div style="background: linear-gradient(135deg, #3182F6, #6C5CE7); padding: 24px; border-radius: 16px; color: white; margin-bottom: 24px;">
    <h1 style="margin: 0 0 8px 0; font-size: 22px;">🔮 운명의 아이 — 에이전트 다이제스트</h1>
    <p style="margin: 0; opacity: 0.9; font-size: 14px;">${today}</p>
  </div>

  <div style="background: #f8f9fa; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
    <h3 style="margin: 0 0 12px 0; font-size: 16px;">📊 요약</h3>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr>
        <td style="padding: 6px 0;">실행된 에이전트</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold;">${findings.length}개</td>
      </tr>
      <tr>
        <td style="padding: 6px 0;">🔴 Critical 발견</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: ${totalCritical > 0 ? '#e74c3c' : '#27ae60'};">${totalCritical}건</td>
      </tr>
      <tr>
        <td style="padding: 6px 0;">🟠 High 발견</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold; color: ${totalHigh > 0 ? '#f39c12' : '#27ae60'};">${totalHigh}건</td>
      </tr>
      <tr>
        <td style="padding: 6px 0;">⚡ 사용자 확인 필요</td>
        <td style="padding: 6px 0; text-align: right; font-weight: bold;">${actionRequired.length}건</td>
      </tr>
    </table>
  </div>`;

  if (actionRequired.length === 0) {
    html += `
  <div style="background: #e8f8f5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 16px;">✅ 오늘은 사용자 확인이 필요한 항목이 없습니다.</p>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #666;">에이전트들이 순조롭게 동작하고 있습니다.</p>
  </div>`;
  }

  // 에이전트별 상세 findings
  for (const finding of findings) {
    const statusColor = finding.criticalCount > 0 ? '#e74c3c' :
      finding.highCount > 0 ? '#f39c12' : '#27ae60';
    const statusEmoji = finding.criticalCount > 0 ? '🔴' :
      finding.highCount > 0 ? '🟠' : '🟢';

    html += `
  <div style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 16px; margin-bottom: 16px; border-left: 4px solid ${statusColor};">
    <h3 style="margin: 0 0 8px 0; font-size: 15px;">
      ${statusEmoji} ${finding.label} <span style="font-weight: normal; color: #888; font-size: 12px;">(${finding.agentId})</span>
    </h3>
    <pre style="background: #f5f5f5; padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.5; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(finding.content.slice(0, 2000))}${finding.content.length > 2000 ? '\n\n... (전체 내용은 .omc/agents/' + finding.agentId + '/findings.md 참조)' : ''}</pre>
  </div>`;
  }

  html += `
  <div style="text-align: center; padding: 16px; color: #999; font-size: 12px;">
    <p>이 이메일은 운명의 아이 자가발전 에이전트 시스템이 자동 발송합니다.</p>
    <p>전체 findings: <code>.omc/agents/</code> | 백로그: <code>.omc/agents/backlog.md</code></p>
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendEmail(html: string, findings: AgentFindings[]) {
  const appPassword = process.env.GMAIL_APP_PASSWORD;

  if (!appPassword) {
    console.log('⚠️  GMAIL_APP_PASSWORD 환경변수가 설정되지 않았습니다.');
    console.log('   Gmail 앱 비밀번호를 .env.local에 추가하세요:');
    console.log('   GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
    console.log('');
    console.log('📋 다이제스트 내용을 콘솔에 출력합니다:');
    console.log('─'.repeat(60));
    for (const f of findings) {
      console.log(`\n[${f.label}] Critical: ${f.criticalCount}, High: ${f.highCount}`);
      console.log(f.content.slice(0, 500));
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: RECIPIENT,
      pass: appPassword,
    },
  });

  const totalCritical = findings.reduce((sum, f) => sum + f.criticalCount, 0);
  const totalHigh = findings.reduce((sum, f) => sum + f.highCount, 0);
  const subjectPrefix = totalCritical > 0 ? '🔴' : totalHigh > 0 ? '🟠' : '🟢';
  const today = new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

  await transporter.sendMail({
    from: `"운명의 아이 에이전트" <${RECIPIENT}>`,
    to: RECIPIENT,
    subject: `${subjectPrefix} 에이전트 다이제스트 (${today}) — Critical ${totalCritical}, High ${totalHigh}`,
    html,
  });

  console.log(`✅ 다이제스트 이메일 발송 완료 → ${RECIPIENT}`);
}

async function main() {
  console.log('📬 에이전트 다이제스트 수집 중...');

  const findings = readFindings();

  if (findings.length === 0) {
    console.log('ℹ️  아직 실행된 에이전트가 없습니다. 스킵합니다.');
    return;
  }

  console.log(`📊 ${findings.length}개 에이전트 findings 수집 완료`);

  const html = buildEmailHtml(findings);
  await sendEmail(html, findings);
}

main().catch(console.error);
