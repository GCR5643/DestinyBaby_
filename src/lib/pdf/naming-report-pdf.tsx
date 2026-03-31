import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { NamingReport, Element } from '@/types';

// Register Korean font
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLTq8H4hfeE.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuozd7Tq8H4hfeE.ttf',
      fontWeight: 700,
    },
  ],
});

// Colors
const C = {
  primary: '#3182F6',
  primaryLight: '#E8F3FF',
  bg: '#FAFBFC',
  text: '#191F28',
  textSecondary: '#6B7684',
  border: '#E5E8EB',
  white: '#FFFFFF',
  scoreBg: '#F2F4F6',
  accent: '#FF6B6B',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansKR',
    backgroundColor: C.bg,
    paddingHorizontal: 40,
    paddingVertical: 36,
    fontSize: 10,
    color: C.text,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: 9,
    color: C.primary,
    fontWeight: 700,
  },
  headerPage: {
    fontSize: 8,
    color: C.textSecondary,
  },
  // Cover
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBrand: {
    fontSize: 12,
    color: C.primary,
    fontWeight: 700,
    marginBottom: 40,
    letterSpacing: 2,
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: C.text,
    marginBottom: 16,
  },
  coverName: {
    fontSize: 42,
    fontWeight: 700,
    color: C.primary,
    marginBottom: 8,
  },
  coverHanja: {
    fontSize: 24,
    color: C.textSecondary,
    marginBottom: 40,
  },
  coverSubtitle: {
    fontSize: 12,
    color: C.textSecondary,
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 10,
    color: C.textSecondary,
  },
  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: C.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 20,
  },
  // Score cards
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreCard: {
    width: '23%',
    backgroundColor: C.white,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 700,
    color: C.primary,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 9,
    color: C.textSecondary,
    textAlign: 'center',
  },
  // Table
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableHeader: {
    backgroundColor: C.primaryLight,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
  },
  tableHeaderText: {
    fontWeight: 700,
    fontSize: 10,
    color: C.primary,
  },
  tableCell: {
    fontSize: 10,
    color: C.text,
  },
  tableCellName: {
    width: '30%',
  },
  tableCellValue: {
    width: '25%',
    textAlign: 'center',
  },
  tableCellDesc: {
    width: '45%',
  },
  // Cards
  card: {
    backgroundColor: C.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  hanjaChar: {
    fontSize: 32,
    fontWeight: 700,
    color: C.primary,
    textAlign: 'center',
    width: 56,
  },
  hanjaKorean: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    width: 56,
    marginTop: 2,
  },
  meaningText: {
    fontSize: 10,
    color: C.text,
    lineHeight: 1.6,
    flex: 1,
  },
  // Box
  infoBox: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  infoBoxLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: C.primary,
    marginBottom: 6,
  },
  infoBoxText: {
    fontSize: 10,
    color: C.text,
    lineHeight: 1.6,
  },
  // Recommendation grid
  recGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  recCard: {
    width: '48%',
    backgroundColor: C.white,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  recLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: C.primary,
    marginBottom: 8,
  },
  recValue: {
    fontSize: 11,
    fontWeight: 700,
    color: C.text,
    marginBottom: 4,
  },
  recDesc: {
    fontSize: 9,
    color: C.textSecondary,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  footerText: {
    fontSize: 8,
    color: C.textSecondary,
  },
  // Overall comment
  commentBox: {
    backgroundColor: C.primaryLight,
    borderRadius: 8,
    padding: 24,
    borderLeftWidth: 4,
    borderLeftColor: C.primary,
  },
  commentText: {
    fontSize: 11,
    color: C.text,
    lineHeight: 1.8,
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: C.scoreBg,
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 8,
    color: C.textSecondary,
    lineHeight: 1.6,
    textAlign: 'center',
  },
  // Score bar
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: C.scoreBg,
    borderRadius: 4,
    marginRight: 8,
  },
  scoreBarFill: {
    height: 8,
    backgroundColor: C.primary,
    borderRadius: 4,
  },
  scoreBarValue: {
    fontSize: 12,
    fontWeight: 700,
    color: C.primary,
    width: 30,
    textAlign: 'right',
  },
  // Elements
  elementTag: {
    backgroundColor: C.primaryLight,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  elementTagText: {
    fontSize: 9,
    color: C.primary,
    fontWeight: 700,
  },
});

const ELEMENT_LABELS: Record<string, string> = {
  water: '수(水)',
  wood: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
};

const STROKE_LABELS: Record<string, string> = {
  totalStrokes: '총획수',
  heavenGrade: '천격',
  humanGrade: '인격',
  earthGrade: '지격',
  outerGrade: '외격',
  totalGrade: '총격',
};

const STROKE_DESCRIPTIONS: Record<string, string> = {
  totalStrokes: '이름 전체 획수의 합',
  heavenGrade: '성의 획수 + 1 (선천운)',
  humanGrade: '성의 마지막 글자 + 이름 첫 글자 (주운)',
  earthGrade: '이름 글자 획수의 합 (초년운)',
  outerGrade: '천격 + 지격 - 인격 (대인관계)',
  totalGrade: '천격 + 인격 + 지격 (총운)',
};

const ELEMENT_RECOMMENDATIONS: Record<string, {
  colors: string;
  colorDesc: string;
  nature: string;
  natureDesc: string;
  travel: string;
  travelDesc: string;
  season: string;
  seasonDesc: string;
}> = {
  water: {
    colors: '네이비, 인디고, 청록, 딥블루',
    colorDesc: '물의 기운을 담은 깊고 차분한 색감',
    nature: '바다, 강, 호수',
    natureDesc: '물가 가까이서 에너지를 충전해요',
    travel: '제주도 해변, 동해 바다, 노르웨이 피오르드',
    travelDesc: '물의 기운이 풍부한 곳에서 크게 성장해요',
    season: '겨울',
    seasonDesc: '고요하고 깊은 겨울 에너지와 잘 맞아요',
  },
  wood: {
    colors: '초록, 민트, 연두, 올리브',
    colorDesc: '생명력 넘치는 자연의 초록 계열',
    nature: '숲, 공원, 정원',
    natureDesc: '나무와 풀 가까이서 맑은 기운을 얻어요',
    travel: '제주 숲길, 뉴질랜드, 캐나다 록키',
    travelDesc: '울창한 숲과 자연이 있는 곳이 최고예요',
    season: '봄',
    seasonDesc: '새싹이 돋는 봄에 가장 빛나요',
  },
  fire: {
    colors: '레드, 오렌지, 코랄, 버건디',
    colorDesc: '열정과 활력을 북돋는 따뜻한 색감',
    nature: '햇살, 양지, 고원',
    natureDesc: '햇볕이 잘 드는 밝은 공간에서 에너지가 솟아요',
    travel: '스페인 바르셀로나, 그리스 산토리니, 제주 오름',
    travelDesc: '햇살 가득한 남유럽과 지중해가 잘 맞아요',
    season: '여름',
    seasonDesc: '뜨거운 여름이 에너지를 가장 높여줘요',
  },
  earth: {
    colors: '베이지, 카키, 갈색, 테라코타',
    colorDesc: '안정감과 포근함을 주는 대지의 색',
    nature: '산, 들판, 고원',
    natureDesc: '넓은 대지와 산에서 든든한 기운을 얻어요',
    travel: '경주, 전주 한옥마을, 스위스 알프스',
    travelDesc: '유서 깊은 땅과 웅장한 산이 잘 맞아요',
    season: '환절기 (봄끝/여름끝)',
    seasonDesc: '계절이 바뀌는 사이 특별한 기운이 생겨요',
  },
  metal: {
    colors: '화이트, 실버, 라이트그레이, 골드',
    colorDesc: '깔끔하고 세련된 메탈릭/무채색 계열',
    nature: '바위산, 고산, 도심',
    natureDesc: '높은 곳에서 맑은 공기와 함께 에너지를 얻어요',
    travel: '일본 교토, 스위스 융프라우, 아이슬란드',
    travelDesc: '서늘하고 깨끗한 북쪽 나라가 잘 맞아요',
    season: '가을',
    seasonDesc: '선선한 가을 하늘 아래서 가장 빛나요',
  },
};

function PageHeader({ title, pageNum }: { title: string; pageNum: number }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerPage}>{pageNum} / 8</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>운명의 아이 | destiny-baby.com</Text>
      <Text style={styles.footerText}>사주 기반 AI 작명 분석</Text>
    </View>
  );
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ fontSize: 10, color: C.textSecondary, marginBottom: 4 }}>{label}</Text>
      <View style={styles.scoreBarContainer}>
        <View style={styles.scoreBarBg}>
          <View style={[styles.scoreBarFill, { width: `${score}%` }]} />
        </View>
        <Text style={styles.scoreBarValue}>{score}</Text>
      </View>
    </View>
  );
}

interface NamingReportPDFProps {
  report: NamingReport;
  generatedDate?: string;
}

export function NamingReportPDF({ report, generatedDate }: NamingReportPDFProps) {
  const dateStr = generatedDate || new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mainElement = (report.yinYangFiveElements.elements[0] ?? 'water') as string;
  const elemRec = ELEMENT_RECOMMENDATIONS[mainElement] ?? ELEMENT_RECOMMENDATIONS.water;

  return (
    <Document>
      {/* Page 1 - Cover */}
      <Page size="A4" style={[styles.page, { paddingVertical: 0 }]}>
        <View style={styles.coverContainer}>
          <Text style={styles.coverBrand}>운명의 아이</Text>
          <Text style={styles.coverTitle}>작명 보고서</Text>
          <Text style={styles.coverName}>{report.name}</Text>
          <Text style={styles.coverHanja}>{report.hanja}</Text>
          <Text style={styles.coverSubtitle}>사주 기반 AI 작명 분석</Text>
          <Text style={styles.coverDate}>{dateStr}</Text>
        </View>
        <PageFooter />
      </Page>

      {/* Page 2 - 종합 점수 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="종합 점수" pageNum={2} />
        <Text style={styles.sectionTitle}>종합 점수</Text>
        <Text style={styles.sectionSubtitle}>
          사주 분석을 기반으로 산출된 이름의 종합 적합도입니다.
        </Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{report.sajuFitScore}</Text>
            <Text style={styles.scoreLabel}>사주 적합도</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{report.parentCompatibility.mom}</Text>
            <Text style={styles.scoreLabel}>엄마 궁합</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{report.parentCompatibility.dad}</Text>
            <Text style={styles.scoreLabel}>아빠 궁합</Text>
          </View>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreValue}>{report.parentCompatibility.combined}</Text>
            <Text style={styles.scoreLabel}>종합 궁합</Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <ScoreBar score={report.sajuFitScore} label="사주 적합도" />
          <ScoreBar score={report.parentCompatibility.mom} label="엄마 궁합" />
          <ScoreBar score={report.parentCompatibility.dad} label="아빠 궁합" />
          <ScoreBar score={report.parentCompatibility.combined} label="종합 궁합" />
        </View>
        <PageFooter />
      </Page>

      {/* Page 3 - 수리 오행 (획수 분석) */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="수리 오행 (획수 분석)" pageNum={3} />
        <Text style={styles.sectionTitle}>수리 오행 (획수 분석)</Text>
        <Text style={styles.sectionSubtitle}>
          이름의 획수를 통해 살펴본 수리 운세입니다.
        </Text>

        {/* Table header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableHeaderText, styles.tableCellName]}>구분</Text>
          <Text style={[styles.tableHeaderText, styles.tableCellValue]}>값</Text>
          <Text style={[styles.tableHeaderText, styles.tableCellDesc]}>설명</Text>
        </View>

        {/* Table rows */}
        {(Object.entries(STROKE_LABELS) as [string, string][]).map(([key, label]) => (
          <View key={key} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableCellName, { fontWeight: 700 }]}>{label}</Text>
            <Text style={[styles.tableCell, styles.tableCellValue]}>
              {report.strokeAnalysis[key as keyof typeof report.strokeAnalysis]}
            </Text>
            <Text style={[styles.tableCell, styles.tableCellDesc, { color: C.textSecondary }]}>
              {STROKE_DESCRIPTIONS[key]}
            </Text>
          </View>
        ))}

        {/* Luck score */}
        <View style={[styles.card, { marginTop: 20 }]}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            운세 점수
          </Text>
          <ScoreBar score={report.strokeAnalysis.luckScore} label="" />
          <Text style={{ fontSize: 9, color: C.textSecondary, marginTop: 4 }}>
            획수 분석을 종합한 운세 적합도 점수입니다.
          </Text>
        </View>
        <PageFooter />
      </Page>

      {/* Page 4 - 사주 원국 해석 + 용신 분석 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="사주 원국 해석" pageNum={4} />
        {report.sajuNarrative ? (
          <>
            <Text style={styles.sectionTitle}>사주 원국 해석</Text>
            <Text style={styles.sectionSubtitle}>
              태어난 순간의 천지 기운으로 읽는 아이의 타고난 기질
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>{report.sajuNarrative}</Text>
            </View>
            {report.yongshinAnalysis && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 14 }]}>용신(用神) 분석</Text>
                <View style={styles.card}>
                  <Text style={styles.meaningText}>{report.yongshinAnalysis}</Text>
                </View>
              </>
            )}
            {report.nameEnergyStory && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 20, fontSize: 14 }]}>이름이 사주를 완성하는 원리</Text>
                <View style={styles.commentBox}>
                  <Text style={styles.commentText}>{report.nameEnergyStory}</Text>
                </View>
              </>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>이름 한자 풀이</Text>
            <Text style={styles.sectionSubtitle}>
              각 글자에 담긴 의미와 한자를 풀이합니다.
            </Text>
            {report.meaningBreakdown.map((item, i) => (
              <View key={i} style={styles.card}>
                <View style={styles.cardRow}>
                  <View>
                    <Text style={styles.hanjaChar}>{item.hanja}</Text>
                    <Text style={styles.hanjaKorean}>{item.char}</Text>
                  </View>
                  <Text style={styles.meaningText}>{item.meaning}</Text>
                </View>
              </View>
            ))}
          </>
        )}
        <PageFooter />
      </Page>

      {/* Page 5 - 한자 심층 분석 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="한자 심층 분석" pageNum={5} />
        <Text style={styles.sectionTitle}>한자 심층 분석</Text>
        <Text style={styles.sectionSubtitle}>
          각 글자의 의미, 유래, 문화적 배경을 살펴봅니다.
        </Text>

        {(report.characterDeepDive ?? report.meaningBreakdown).map((item, i) => {
          const deep = report.characterDeepDive?.[i];
          return (
            <View key={i} style={[styles.card, { marginBottom: 14 }]}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.hanjaChar}>{item.hanja}</Text>
                  <Text style={styles.hanjaKorean}>{item.char}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meaningText}>{item.meaning}</Text>
                  {deep && 'etymology' in deep && (
                    <>
                      <Text style={[styles.infoBoxLabel, { marginTop: 8 }]}>한자의 유래</Text>
                      <Text style={[styles.meaningText, { color: C.textSecondary }]}>{deep.etymology}</Text>
                      <Text style={[styles.infoBoxLabel, { marginTop: 8 }]}>문화적 의미</Text>
                      <Text style={[styles.meaningText, { color: C.textSecondary }]}>{deep.culturalNote}</Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        <PageFooter />
      </Page>

      {/* Page 6 - 음양오행 분석 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="음양오행 분석" pageNum={6} />
        <Text style={styles.sectionTitle}>음양오행 분석</Text>
        <Text style={styles.sectionSubtitle}>
          이름에 담긴 오행의 균형과 조화를 분석합니다.
        </Text>

        <View style={styles.card}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 10 }}>
            오행 구성
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
            {report.yinYangFiveElements.elements.map((el, i) => (
              <View key={i} style={styles.elementTag}>
                <Text style={styles.elementTagText}>
                  {ELEMENT_LABELS[el] || el}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>균형 상태</Text>
          <Text style={styles.infoBoxText}>{report.yinYangFiveElements.balance}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>추천 사항</Text>
          <Text style={styles.infoBoxText}>{report.yinYangFiveElements.recommendation}</Text>
        </View>
        <PageFooter />
      </Page>

      {/* Page 7 - 발음 분석 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="발음 분석" pageNum={7} />
        <Text style={styles.sectionTitle}>발음 분석</Text>
        <Text style={styles.sectionSubtitle}>
          이름의 음운 조화와 발음 편의성을 분석합니다.
        </Text>

        <View style={styles.card}>
          <ScoreBar score={report.pronunciationAnalysis.harmony} label="발음 조화 점수" />
        </View>

        <View style={styles.card}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 8 }}>
            초성 구성
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {report.pronunciationAnalysis.initialConsonants.map((c, i) => (
              <View key={i} style={[styles.elementTag, { backgroundColor: C.scoreBg }]}>
                <Text style={[styles.elementTagText, { color: C.text }]}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoBoxLabel}>발음 분석 소견</Text>
          <Text style={styles.infoBoxText}>{report.pronunciationAnalysis.comment}</Text>
        </View>
        <PageFooter />
      </Page>

      {/* Page 8 - 오행 인생 추천 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="오행 인생 추천" pageNum={8} />
        <Text style={styles.sectionTitle}>오행 인생 추천</Text>
        <Text style={styles.sectionSubtitle}>
          주요 오행({ELEMENT_LABELS[mainElement] || mainElement})을 기반으로 한 인생 추천입니다.
        </Text>

        <View style={styles.recGrid}>
          <View style={styles.recCard}>
            <Text style={styles.recLabel}>행운의 색깔</Text>
            <Text style={styles.recValue}>{elemRec.colors}</Text>
            <Text style={styles.recDesc}>{elemRec.colorDesc}</Text>
          </View>
          <View style={styles.recCard}>
            <Text style={styles.recLabel}>자연과의 친구</Text>
            <Text style={styles.recValue}>{elemRec.nature}</Text>
            <Text style={styles.recDesc}>{elemRec.natureDesc}</Text>
          </View>
          <View style={styles.recCard}>
            <Text style={styles.recLabel}>여행지 추천</Text>
            <Text style={styles.recValue}>{elemRec.travel}</Text>
            <Text style={styles.recDesc}>{elemRec.travelDesc}</Text>
          </View>
          <View style={styles.recCard}>
            <Text style={styles.recLabel}>행운의 계절</Text>
            <Text style={styles.recValue}>{elemRec.season}</Text>
            <Text style={styles.recDesc}>{elemRec.seasonDesc}</Text>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* Page - 부모 궁합 상세 + 축복 편지 */}
      {(report.parentCompatibilityNarrative || report.blessingLetter) && (
        <Page size="A4" style={styles.page}>
          <PageHeader title="부모 궁합 & 축복 편지" pageNum={9} />
          {report.parentCompatibilityNarrative && (
            <>
              <Text style={styles.sectionTitle}>부모-아이 궁합 상세 해석</Text>
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 }}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreValue, { fontSize: 22 }]}>{report.parentCompatibility.mom}</Text>
                    <Text style={styles.scoreLabel}>엄마 궁합</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreValue, { fontSize: 22 }]}>{report.parentCompatibility.dad}</Text>
                    <Text style={styles.scoreLabel}>아빠 궁합</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreValue, { fontSize: 22 }]}>{report.parentCompatibility.combined}</Text>
                    <Text style={styles.scoreLabel}>종합</Text>
                  </View>
                </View>
                <Text style={[styles.meaningText, { lineHeight: 1.8 }]}>{report.parentCompatibilityNarrative}</Text>
              </View>
            </>
          )}
          {report.blessingLetter && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{report.name}에게 보내는 축복 편지</Text>
              <View style={styles.commentBox}>
                <Text style={[styles.commentText, { lineHeight: 2 }]}>{report.blessingLetter}</Text>
              </View>
            </>
          )}
          <PageFooter />
        </Page>
      )}

      {/* Page - 종합 소견 */}
      <Page size="A4" style={styles.page}>
        <PageHeader title="종합 소견" pageNum={report.parentCompatibilityNarrative || report.blessingLetter ? 10 : 9} />
        <Text style={styles.sectionTitle}>종합 소견</Text>
        <Text style={styles.sectionSubtitle}>
          사주, 획수, 음양오행, 발음을 종합한 최종 소견입니다.
        </Text>

        <View style={styles.commentBox}>
          <Text style={styles.commentText}>{report.overallComment}</Text>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            본 보고서는 AI 기반 사주 분석을 참고하여 작성되었으며,
            작명의 최종 결정은 부모님의 판단에 따릅니다.
            전통 작명학과 현대 데이터 분석을 결합한 참고 자료로 활용해 주세요.
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 8, fontWeight: 700 }]}>
            운명의 아이 | destiny-baby.com
          </Text>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
