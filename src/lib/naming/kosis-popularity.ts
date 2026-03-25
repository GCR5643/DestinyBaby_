/**
 * 대법원 전자가족관계등록시스템 기반 출생아 이름 통계
 * 최신 데이터: https://baby-name.kr (2024년 기준, 전자가족관계시스템 원본)
 * 누적 데이터: https://github.com/randkid/name (2008-2019 누적)
 */

export interface NameStat {
  name: string;
  count: number;
  rank: number;
  gender: "M" | "F";
}

// 남아 상위 200개
const MALE_TOP_200: NameStat[] = [
  { name: "민준", count: 37037, rank: 1, gender: "M" },
  { name: "서준", count: 32228, rank: 2, gender: "M" },
  { name: "예준", count: 26635, rank: 3, gender: "M" },
  { name: "도윤", count: 25665, rank: 4, gender: "M" },
  { name: "시우", count: 24106, rank: 5, gender: "M" },
  { name: "주원", count: 24029, rank: 6, gender: "M" },
  { name: "지호", count: 22269, rank: 7, gender: "M" },
  { name: "하준", count: 22251, rank: 8, gender: "M" },
  { name: "지후", count: 22146, rank: 9, gender: "M" },
  { name: "준서", count: 21576, rank: 10, gender: "M" },
  { name: "준우", count: 20578, rank: 11, gender: "M" },
  { name: "현우", count: 20403, rank: 12, gender: "M" },
  { name: "지훈", count: 19898, rank: 13, gender: "M" },
  { name: "도현", count: 19394, rank: 14, gender: "M" },
  { name: "건우", count: 19357, rank: 15, gender: "M" },
  { name: "우진", count: 18539, rank: 16, gender: "M" },
  { name: "민재", count: 16097, rank: 17, gender: "M" },
  { name: "현준", count: 16041, rank: 18, gender: "M" },
  { name: "선우", count: 15861, rank: 19, gender: "M" },
  { name: "서진", count: 15622, rank: 20, gender: "M" },
  { name: "연우", count: 14657, rank: 21, gender: "M" },
  { name: "정우", count: 14119, rank: 22, gender: "M" },
  { name: "유준", count: 13958, rank: 23, gender: "M" },
  { name: "승현", count: 13240, rank: 24, gender: "M" },
  { name: "준혁", count: 13151, rank: 25, gender: "M" },
  { name: "승우", count: 13043, rank: 26, gender: "M" },
  { name: "지환", count: 12938, rank: 27, gender: "M" },
  { name: "시윤", count: 12432, rank: 28, gender: "M" },
  { name: "승민", count: 12185, rank: 29, gender: "M" },
  { name: "지우", count: 11770, rank: 30, gender: "M" },
  { name: "유찬", count: 11736, rank: 31, gender: "M" },
  { name: "민성", count: 11578, rank: 32, gender: "M" },
  { name: "은우", count: 11450, rank: 33, gender: "M" },
  { name: "준영", count: 11315, rank: 34, gender: "M" },
  { name: "진우", count: 10878, rank: 35, gender: "M" },
  { name: "시후", count: 10871, rank: 36, gender: "M" },
  { name: "윤우", count: 10752, rank: 37, gender: "M" },
  { name: "지원", count: 10672, rank: 38, gender: "M" },
  { name: "수현", count: 10448, rank: 39, gender: "M" },
  { name: "동현", count: 9229, rank: 40, gender: "M" },
  { name: "재윤", count: 9016, rank: 41, gender: "M" },
  { name: "시현", count: 8885, rank: 42, gender: "M" },
  { name: "민규", count: 8814, rank: 43, gender: "M" },
  { name: "태윤", count: 8712, rank: 44, gender: "M" },
  { name: "재원", count: 8601, rank: 45, gender: "M" },
  { name: "민우", count: 8559, rank: 46, gender: "M" },
  { name: "재민", count: 8460, rank: 47, gender: "M" },
  { name: "한결", count: 8339, rank: 48, gender: "M" },
  { name: "은찬", count: 8331, rank: 49, gender: "M" },
  { name: "시원", count: 8191, rank: 50, gender: "M" },
  { name: "윤호", count: 8167, rank: 51, gender: "M" },
  { name: "민찬", count: 8072, rank: 52, gender: "M" },
  { name: "수호", count: 8045, rank: 53, gender: "M" },
  { name: "성민", count: 7724, rank: 54, gender: "M" },
  { name: "준호", count: 7525, rank: 55, gender: "M" },
  { name: "성현", count: 7519, rank: 56, gender: "M" },
  { name: "승준", count: 7507, rank: 57, gender: "M" },
  { name: "현서", count: 7331, rank: 58, gender: "M" },
  { name: "시온", count: 7279, rank: 59, gender: "M" },
  { name: "재현", count: 7190, rank: 60, gender: "M" },
  { name: "지안", count: 7162, rank: 61, gender: "M" },
  { name: "지성", count: 7018, rank: 62, gender: "M" },
  { name: "태민", count: 7002, rank: 63, gender: "M" },
  { name: "태현", count: 6965, rank: 64, gender: "M" },
  { name: "예성", count: 6946, rank: 65, gender: "M" },
  { name: "민혁", count: 6928, rank: 66, gender: "M" },
  { name: "하율", count: 6900, rank: 67, gender: "M" },
  { name: "민호", count: 6874, rank: 68, gender: "M" },
  { name: "우빈", count: 6851, rank: 69, gender: "M" },
  { name: "이준", count: 6806, rank: 70, gender: "M" },
  { name: "지율", count: 6733, rank: 71, gender: "M" },
  { name: "성준", count: 6722, rank: 72, gender: "M" },
  { name: "지한", count: 6606, rank: 73, gender: "M" },
  { name: "정민", count: 6591, rank: 74, gender: "M" },
  { name: "규민", count: 6521, rank: 75, gender: "M" },
  { name: "윤성", count: 6445, rank: 76, gender: "M" },
  { name: "이안", count: 6391, rank: 77, gender: "M" },
  { name: "지민", count: 6345, rank: 78, gender: "M" },
  { name: "서우", count: 6337, rank: 79, gender: "M" },
  { name: "준", count: 6283, rank: 80, gender: "M" },
  { name: "민석", count: 6252, rank: 81, gender: "M" },
  { name: "은호", count: 6236, rank: 82, gender: "M" },
  { name: "준수", count: 6186, rank: 83, gender: "M" },
  { name: "윤재", count: 6111, rank: 84, gender: "M" },
  { name: "율", count: 6050, rank: 85, gender: "M" },
  { name: "은성", count: 6034, rank: 86, gender: "M" },
  { name: "예찬", count: 6015, rank: 87, gender: "M" },
  { name: "하람", count: 5981, rank: 88, gender: "M" },
  { name: "태양", count: 5903, rank: 89, gender: "M" },
  { name: "준희", count: 5850, rank: 90, gender: "M" },
  { name: "하진", count: 5796, rank: 91, gender: "M" },
  { name: "도훈", count: 5616, rank: 92, gender: "M" },
  { name: "준성", count: 5589, rank: 93, gender: "M" },
  { name: "현수", count: 5504, rank: 94, gender: "M" },
  { name: "승원", count: 5428, rank: 95, gender: "M" },
  { name: "건", count: 5384, rank: 96, gender: "M" },
  { name: "지완", count: 5363, rank: 97, gender: "M" },
  { name: "정현", count: 5358, rank: 98, gender: "M" },
  { name: "강민", count: 5298, rank: 99, gender: "M" },
  { name: "하민", count: 5249, rank: 100, gender: "M" },
  { name: "태준", count: 5191, rank: 101, gender: "M" },
  { name: "승호", count: 5190, rank: 102, gender: "M" },
  { name: "성빈", count: 5090, rank: 103, gender: "M" },
  { name: "민서", count: 5018, rank: 104, gender: "M" },
  { name: "주호", count: 5001, rank: 105, gender: "M" },
  { name: "민수", count: 4849, rank: 106, gender: "M" },
  { name: "우현", count: 4823, rank: 107, gender: "M" },
  { name: "도영", count: 4792, rank: 108, gender: "M" },
  { name: "건희", count: 4776, rank: 109, gender: "M" },
  { name: "주환", count: 4753, rank: 110, gender: "M" },
  { name: "정훈", count: 4744, rank: 111, gender: "M" },
  { name: "원준", count: 4718, rank: 112, gender: "M" },
  { name: "주안", count: 4631, rank: 113, gender: "M" },
  { name: "하랑", count: 4558, rank: 114, gender: "M" },
  { name: "민기", count: 4519, rank: 115, gender: "M" },
  { name: "현민", count: 4511, rank: 116, gender: "M" },
  { name: "우주", count: 4508, rank: 117, gender: "M" },
  { name: "경민", count: 4488, rank: 118, gender: "M" },
  { name: "시훈", count: 4458, rank: 119, gender: "M" },
  { name: "현성", count: 4422, rank: 120, gender: "M" },
  { name: "시율", count: 4402, rank: 121, gender: "M" },
  { name: "주영", count: 4330, rank: 122, gender: "M" },
  { name: "승윤", count: 4326, rank: 123, gender: "M" },
  { name: "동하", count: 4260, rank: 124, gender: "M" },
  { name: "서율", count: 4245, rank: 125, gender: "M" },
  { name: "시완", count: 4245, rank: 126, gender: "M" },
  { name: "다온", count: 4233, rank: 127, gender: "M" },
  { name: "지오", count: 4209, rank: 128, gender: "M" },
  { name: "태훈", count: 4184, rank: 129, gender: "M" },
  { name: "민건", count: 4142, rank: 130, gender: "M" },
  { name: "동건", count: 4137, rank: 131, gender: "M" },
  { name: "재훈", count: 4121, rank: 132, gender: "M" },
  { name: "태영", count: 4092, rank: 133, gender: "M" },
  { name: "호준", count: 4028, rank: 134, gender: "M" },
  { name: "승빈", count: 4004, rank: 135, gender: "M" },
  { name: "재준", count: 3973, rank: 136, gender: "M" },
  { name: "가온", count: 3951, rank: 137, gender: "M" },
  { name: "세현", count: 3919, rank: 138, gender: "M" },
  { name: "태경", count: 3873, rank: 139, gender: "M" },
  { name: "시환", count: 3822, rank: 140, gender: "M" },
  { name: "현진", count: 3818, rank: 141, gender: "M" },
  { name: "재영", count: 3793, rank: 142, gender: "M" },
  { name: "상현", count: 3781, rank: 143, gender: "M" },
  { name: "영준", count: 3757, rank: 144, gender: "M" },
  { name: "도율", count: 3744, rank: 145, gender: "M" },
  { name: "현승", count: 3743, rank: 146, gender: "M" },
  { name: "범준", count: 3742, rank: 147, gender: "M" },
  { name: "승훈", count: 3724, rank: 148, gender: "M" },
  { name: "찬영", count: 3696, rank: 149, gender: "M" },
  { name: "정원", count: 3685, rank: 150, gender: "M" },
  { name: "도원", count: 3651, rank: 151, gender: "M" },
  { name: "성윤", count: 3633, rank: 152, gender: "M" },
  { name: "정후", count: 3631, rank: 153, gender: "M" },
  { name: "주혁", count: 3616, rank: 154, gender: "M" },
  { name: "찬우", count: 3558, rank: 155, gender: "M" },
  { name: "온유", count: 3543, rank: 156, gender: "M" },
  { name: "윤", count: 3536, rank: 157, gender: "M" },
  { name: "성훈", count: 3516, rank: 158, gender: "M" },
  { name: "도경", count: 3515, rank: 159, gender: "M" },
  { name: "현", count: 3508, rank: 160, gender: "M" },
  { name: "우성", count: 3498, rank: 161, gender: "M" },
  { name: "하윤", count: 3493, rank: 162, gender: "M" },
  { name: "서후", count: 3487, rank: 163, gender: "M" },
  { name: "연준", count: 3440, rank: 164, gender: "M" },
  { name: "재하", count: 3440, rank: 165, gender: "M" },
  { name: "동윤", count: 3435, rank: 166, gender: "M" },
  { name: "동욱", count: 3408, rank: 167, gender: "M" },
  { name: "라온", count: 3403, rank: 168, gender: "M" },
  { name: "찬희", count: 3402, rank: 169, gender: "M" },
  { name: "승재", count: 3396, rank: 170, gender: "M" },
  { name: "건호", count: 3383, rank: 171, gender: "M" },
  { name: "수민", count: 3367, rank: 172, gender: "M" },
  { name: "이현", count: 3358, rank: 173, gender: "M" },
  { name: "지혁", count: 3356, rank: 174, gender: "M" },
  { name: "세준", count: 3345, rank: 175, gender: "M" },
  { name: "승찬", count: 3316, rank: 176, gender: "M" },
  { name: "태호", count: 3313, rank: 177, gender: "M" },
  { name: "태율", count: 3246, rank: 178, gender: "M" },
  { name: "현호", count: 3244, rank: 179, gender: "M" },
  { name: "태우", count: 3235, rank: 180, gender: "M" },
  { name: "윤찬", count: 3235, rank: 181, gender: "M" },
  { name: "현빈", count: 3208, rank: 182, gender: "M" },
  { name: "준석", count: 3200, rank: 183, gender: "M" },
  { name: "산", count: 3195, rank: 184, gender: "M" },
  { name: "유건", count: 3195, rank: 185, gender: "M" },
  { name: "재우", count: 3157, rank: 186, gender: "M" },
  { name: "윤후", count: 3149, rank: 187, gender: "M" },
  { name: "형준", count: 3146, rank: 188, gender: "M" },
  { name: "주현", count: 3142, rank: 189, gender: "M" },
  { name: "지운", count: 3104, rank: 190, gender: "M" },
  { name: "재혁", count: 3086, rank: 191, gender: "M" },
  { name: "효준", count: 3062, rank: 192, gender: "M" },
  { name: "찬", count: 3061, rank: 193, gender: "M" },
  { name: "성우", count: 3060, rank: 194, gender: "M" },
  { name: "연호", count: 3022, rank: 195, gender: "M" },
  { name: "동우", count: 3014, rank: 196, gender: "M" },
  { name: "주완", count: 2982, rank: 197, gender: "M" },
  { name: "주한", count: 2979, rank: 198, gender: "M" },
  { name: "수혁", count: 2954, rank: 199, gender: "M" },
  { name: "규빈", count: 2951, rank: 200, gender: "M" },
];

// 여아 상위 200개
const FEMALE_TOP_200: NameStat[] = [
  { name: "서연", count: 34473, rank: 1, gender: "F" },
  { name: "서윤", count: 32728, rank: 2, gender: "F" },
  { name: "지우", count: 28615, rank: 3, gender: "F" },
  { name: "서현", count: 28194, rank: 4, gender: "F" },
  { name: "민서", count: 27259, rank: 5, gender: "F" },
  { name: "하은", count: 25374, rank: 6, gender: "F" },
  { name: "하윤", count: 24051, rank: 7, gender: "F" },
  { name: "윤서", count: 22854, rank: 8, gender: "F" },
  { name: "지민", count: 22194, rank: 9, gender: "F" },
  { name: "지유", count: 21528, rank: 10, gender: "F" },
  { name: "채원", count: 21329, rank: 11, gender: "F" },
  { name: "지윤", count: 20195, rank: 12, gender: "F" },
  { name: "은서", count: 20165, rank: 13, gender: "F" },
  { name: "수아", count: 19401, rank: 14, gender: "F" },
  { name: "다은", count: 19231, rank: 15, gender: "F" },
  { name: "예은", count: 18895, rank: 16, gender: "F" },
  { name: "수빈", count: 18158, rank: 17, gender: "F" },
  { name: "지아", count: 17280, rank: 18, gender: "F" },
  { name: "소율", count: 17073, rank: 19, gender: "F" },
  { name: "예원", count: 16950, rank: 20, gender: "F" },
  { name: "지원", count: 16645, rank: 21, gender: "F" },
  { name: "예린", count: 16554, rank: 22, gender: "F" },
  { name: "소윤", count: 15907, rank: 23, gender: "F" },
  { name: "유진", count: 14739, rank: 24, gender: "F" },
  { name: "시은", count: 14672, rank: 25, gender: "F" },
  { name: "지안", count: 14354, rank: 26, gender: "F" },
  { name: "채은", count: 14004, rank: 27, gender: "F" },
  { name: "하린", count: 13968, rank: 28, gender: "F" },
  { name: "가은", count: 13812, rank: 29, gender: "F" },
  { name: "서영", count: 13633, rank: 30, gender: "F" },
  { name: "윤아", count: 13557, rank: 31, gender: "F" },
  { name: "민지", count: 13484, rank: 32, gender: "F" },
  { name: "예진", count: 13190, rank: 33, gender: "F" },
  { name: "유나", count: 13182, rank: 34, gender: "F" },
  { name: "수민", count: 12908, rank: 35, gender: "F" },
  { name: "수연", count: 12608, rank: 36, gender: "F" },
  { name: "연우", count: 12262, rank: 37, gender: "F" },
  { name: "예서", count: 11620, rank: 38, gender: "F" },
  { name: "예나", count: 11610, rank: 39, gender: "F" },
  { name: "주아", count: 11471, rank: 40, gender: "F" },
  { name: "시연", count: 11461, rank: 41, gender: "F" },
  { name: "서아", count: 11328, rank: 42, gender: "F" },
  { name: "연서", count: 11088, rank: 43, gender: "F" },
  { name: "현서", count: 10541, rank: 44, gender: "F" },
  { name: "다연", count: 10504, rank: 45, gender: "F" },
  { name: "하율", count: 10471, rank: 46, gender: "F" },
  { name: "다인", count: 10440, rank: 47, gender: "F" },
  { name: "아인", count: 10194, rank: 48, gender: "F" },
  { name: "서은", count: 10126, rank: 49, gender: "F" },
  { name: "서진", count: 9913, rank: 50, gender: "F" },
  { name: "유빈", count: 9842, rank: 51, gender: "F" },
  { name: "하연", count: 9752, rank: 52, gender: "F" },
  { name: "수현", count: 9708, rank: 53, gender: "F" },
  { name: "채윤", count: 9695, rank: 54, gender: "F" },
  { name: "유주", count: 9670, rank: 55, gender: "F" },
  { name: "시아", count: 9627, rank: 56, gender: "F" },
  { name: "서율", count: 9539, rank: 57, gender: "F" },
  { name: "지율", count: 9475, rank: 58, gender: "F" },
  { name: "예지", count: 9409, rank: 59, gender: "F" },
  { name: "서우", count: 9391, rank: 60, gender: "F" },
  { name: "나윤", count: 9245, rank: 61, gender: "F" },
  { name: "다현", count: 9109, rank: 62, gender: "F" },
  { name: "아린", count: 9058, rank: 63, gender: "F" },
  { name: "민주", count: 8788, rank: 64, gender: "F" },
  { name: "지은", count: 8678, rank: 65, gender: "F" },
  { name: "나연", count: 8562, rank: 66, gender: "F" },
  { name: "윤지", count: 8508, rank: 67, gender: "F" },
  { name: "소은", count: 8471, rank: 68, gender: "F" },
  { name: "시현", count: 8467, rank: 69, gender: "F" },
  { name: "예빈", count: 8417, rank: 70, gender: "F" },
  { name: "지현", count: 8348, rank: 71, gender: "F" },
  { name: "사랑", count: 8329, rank: 72, gender: "F" },
  { name: "소연", count: 8319, rank: 73, gender: "F" },
  { name: "혜원", count: 7975, rank: 74, gender: "F" },
  { name: "지수", count: 7857, rank: 75, gender: "F" },
  { name: "서하", count: 7847, rank: 76, gender: "F" },
  { name: "은채", count: 7818, rank: 77, gender: "F" },
  { name: "나은", count: 7695, rank: 78, gender: "F" },
  { name: "주하", count: 7679, rank: 79, gender: "F" },
  { name: "승아", count: 7417, rank: 80, gender: "F" },
  { name: "아윤", count: 7363, rank: 81, gender: "F" },
  { name: "서희", count: 7128, rank: 82, gender: "F" },
  { name: "나현", count: 7072, rank: 83, gender: "F" },
  { name: "소민", count: 7040, rank: 84, gender: "F" },
  { name: "민아", count: 7030, rank: 85, gender: "F" },
  { name: "채아", count: 7011, rank: 86, gender: "F" },
  { name: "세은", count: 6941, rank: 87, gender: "F" },
  { name: "채린", count: 6940, rank: 88, gender: "F" },
  { name: "다윤", count: 6925, rank: 89, gender: "F" },
  { name: "하영", count: 6877, rank: 90, gender: "F" },
  { name: "도연", count: 6831, rank: 91, gender: "F" },
  { name: "규리", count: 6789, rank: 92, gender: "F" },
  { name: "아영", count: 6768, rank: 93, gender: "F" },
  { name: "세아", count: 6543, rank: 94, gender: "F" },
  { name: "지연", count: 6523, rank: 95, gender: "F" },
  { name: "예림", count: 6463, rank: 96, gender: "F" },
  { name: "가윤", count: 6408, rank: 97, gender: "F" },
  { name: "태희", count: 6280, rank: 98, gender: "F" },
  { name: "민채", count: 6235, rank: 99, gender: "F" },
  { name: "유정", count: 6175, rank: 100, gender: "F" },
  { name: "주은", count: 6173, rank: 101, gender: "F" },
  { name: "시윤", count: 6080, rank: 102, gender: "F" },
  { name: "다온", count: 6058, rank: 103, gender: "F" },
  { name: "민정", count: 6040, rank: 104, gender: "F" },
  { name: "보민", count: 6040, rank: 105, gender: "F" },
  { name: "소현", count: 6007, rank: 106, gender: "F" },
  { name: "연아", count: 5945, rank: 107, gender: "F" },
  { name: "현지", count: 5929, rank: 108, gender: "F" },
  { name: "수진", count: 5855, rank: 109, gender: "F" },
  { name: "민경", count: 5846, rank: 110, gender: "F" },
  { name: "아현", count: 5838, rank: 111, gender: "F" },
  { name: "정원", count: 5707, rank: 112, gender: "F" },
  { name: "가현", count: 5686, rank: 113, gender: "F" },
  { name: "나경", count: 5665, rank: 114, gender: "F" },
  { name: "은지", count: 5545, rank: 115, gender: "F" },
  { name: "가연", count: 5543, rank: 116, gender: "F" },
  { name: "지효", count: 5433, rank: 117, gender: "F" },
  { name: "세연", count: 5419, rank: 118, gender: "F" },
  { name: "윤하", count: 5401, rank: 119, gender: "F" },
  { name: "가온", count: 5256, rank: 120, gender: "F" },
  { name: "채연", count: 5116, rank: 121, gender: "F" },
  { name: "예슬", count: 5109, rank: 122, gender: "F" },
  { name: "한별", count: 5059, rank: 123, gender: "F" },
  { name: "현아", count: 5035, rank: 124, gender: "F" },
  { name: "라희", count: 4995, rank: 125, gender: "F" },
  { name: "소희", count: 4871, rank: 126, gender: "F" },
  { name: "효주", count: 4849, rank: 127, gender: "F" },
  { name: "유림", count: 4835, rank: 128, gender: "F" },
  { name: "하늘", count: 4813, rank: 129, gender: "F" },
  { name: "채민", count: 4709, rank: 130, gender: "F" },
  { name: "은솔", count: 4643, rank: 131, gender: "F" },
  { name: "가영", count: 4614, rank: 132, gender: "F" },
  { name: "주연", count: 4606, rank: 133, gender: "F" },
  { name: "예주", count: 4522, rank: 134, gender: "F" },
  { name: "혜린", count: 4455, rank: 135, gender: "F" },
  { name: "유리", count: 4417, rank: 136, gender: "F" },
  { name: "봄", count: 4358, rank: 137, gender: "F" },
  { name: "유하", count: 4356, rank: 138, gender: "F" },
  { name: "다희", count: 4307, rank: 139, gender: "F" },
  { name: "하진", count: 4304, rank: 140, gender: "F" },
  { name: "다혜", count: 4294, rank: 141, gender: "F" },
  { name: "태연", count: 4269, rank: 142, gender: "F" },
  { name: "혜인", count: 4261, rank: 143, gender: "F" },
  { name: "지혜", count: 4231, rank: 144, gender: "F" },
  { name: "승연", count: 4226, rank: 145, gender: "F" },
  { name: "하람", count: 4225, rank: 146, gender: "F" },
  { name: "하랑", count: 4213, rank: 147, gender: "F" },
  { name: "재인", count: 4211, rank: 148, gender: "F" },
  { name: "소이", count: 4192, rank: 149, gender: "F" },
  { name: "유민", count: 4190, rank: 150, gender: "F" },
  { name: "은우", count: 4174, rank: 151, gender: "F" },
  { name: "수인", count: 4170, rank: 152, gender: "F" },
  { name: "윤슬", count: 4139, rank: 153, gender: "F" },
  { name: "지영", count: 4134, rank: 154, gender: "F" },
  { name: "수정", count: 4111, rank: 155, gender: "F" },
  { name: "하나", count: 4088, rank: 156, gender: "F" },
  { name: "다솜", count: 4072, rank: 157, gender: "F" },
  { name: "다빈", count: 4058, rank: 158, gender: "F" },
  { name: "채영", count: 4005, rank: 159, gender: "F" },
  { name: "설아", count: 3999, rank: 160, gender: "F" },
  { name: "주원", count: 3997, rank: 161, gender: "F" },
  { name: "은유", count: 3931, rank: 162, gender: "F" },
  { name: "시온", count: 3908, rank: 163, gender: "F" },
  { name: "지후", count: 3906, rank: 164, gender: "F" },
  { name: "고은", count: 3839, rank: 165, gender: "F" },
  { name: "태은", count: 3821, rank: 166, gender: "F" },
  { name: "나영", count: 3762, rank: 167, gender: "F" },
  { name: "소영", count: 3745, rank: 168, gender: "F" },
  { name: "태린", count: 3704, rank: 169, gender: "F" },
  { name: "아라", count: 3685, rank: 170, gender: "F" },
  { name: "수지", count: 3684, rank: 171, gender: "F" },
  { name: "민하", count: 3641, rank: 172, gender: "F" },
  { name: "재이", count: 3571, rank: 173, gender: "F" },
  { name: "은별", count: 3568, rank: 174, gender: "F" },
  { name: "보경", count: 3563, rank: 175, gender: "F" },
  { name: "서인", count: 3545, rank: 176, gender: "F" },
  { name: "다영", count: 3531, rank: 177, gender: "F" },
  { name: "주희", count: 3526, rank: 178, gender: "F" },
  { name: "정민", count: 3521, rank: 179, gender: "F" },
  { name: "채현", count: 3512, rank: 180, gender: "F" },
  { name: "리아", count: 3444, rank: 181, gender: "F" },
  { name: "단아", count: 3407, rank: 182, gender: "F" },
  { name: "효린", count: 3397, rank: 183, gender: "F" },
  { name: "가빈", count: 3373, rank: 184, gender: "F" },
  { name: "예솔", count: 3346, rank: 185, gender: "F" },
  { name: "시우", count: 3345, rank: 186, gender: "F" },
  { name: "정윤", count: 3308, rank: 187, gender: "F" },
  { name: "소정", count: 3307, rank: 188, gender: "F" },
  { name: "세빈", count: 3273, rank: 189, gender: "F" },
  { name: "은재", count: 3236, rank: 190, gender: "F" },
  { name: "한나", count: 3209, rank: 191, gender: "F" },
  { name: "연재", count: 3199, rank: 192, gender: "F" },
  { name: "연주", count: 3152, rank: 193, gender: "F" },
  { name: "서빈", count: 3150, rank: 194, gender: "F" },
  { name: "예담", count: 3146, rank: 195, gender: "F" },
  { name: "아연", count: 3143, rank: 196, gender: "F" },
  { name: "서정", count: 3107, rank: 197, gender: "F" },
  { name: "슬아", count: 3073, rank: 198, gender: "F" },
  { name: "해인", count: 3067, rank: 199, gender: "F" },
  { name: "예인", count: 3064, rank: 200, gender: "F" },
];

// === 2024년 최신 데이터 (대법원 전자가족관계시스템, baby-name.kr 기준) ===

const MALE_TOP_50_2024: NameStat[] = [
  { name: "이준", count: 1593, rank: 1, gender: "M" },
  { name: "하준", count: 1512, rank: 2, gender: "M" },
  { name: "도윤", count: 1492, rank: 3, gender: "M" },
  { name: "은우", count: 1353, rank: 4, gender: "M" },
  { name: "시우", count: 1351, rank: 5, gender: "M" },
  { name: "서준", count: 1324, rank: 6, gender: "M" },
  { name: "선우", count: 1218, rank: 7, gender: "M" },
  { name: "유준", count: 1204, rank: 8, gender: "M" },
  { name: "수호", count: 1156, rank: 9, gender: "M" },
  { name: "도현", count: 1135, rank: 10, gender: "M" },
  { name: "이현", count: 1100, rank: 11, gender: "M" },
  { name: "이안", count: 1086, rank: 12, gender: "M" },
  { name: "지호", count: 1076, rank: 13, gender: "M" },
  { name: "도하", count: 1070, rank: 14, gender: "M" },
  { name: "우주", count: 1050, rank: 15, gender: "M" },
  { name: "태오", count: 1031, rank: 16, gender: "M" },
  { name: "예준", count: 977, rank: 17, gender: "M" },
  { name: "로운", count: 889, rank: 18, gender: "M" },
  { name: "지한", count: 878, rank: 19, gender: "M" },
  { name: "윤우", count: 853, rank: 20, gender: "M" },
  { name: "연우", count: 849, rank: 21, gender: "M" },
  { name: "주원", count: 844, rank: 22, gender: "M" },
  { name: "우진", count: 795, rank: 23, gender: "M" },
  { name: "민준", count: 778, rank: 24, gender: "M" },
  { name: "은호", count: 756, rank: 25, gender: "M" },
  { name: "준우", count: 743, rank: 26, gender: "M" },
  { name: "시윤", count: 738, rank: 27, gender: "M" },
  { name: "도준", count: 684, rank: 28, gender: "M" },
  { name: "이한", count: 682, rank: 29, gender: "M" },
  { name: "이든", count: 630, rank: 30, gender: "M" },
  { name: "지후", count: 613, rank: 31, gender: "M" },
  { name: "태이", count: 606, rank: 32, gender: "M" },
  { name: "유찬", count: 599, rank: 33, gender: "M" },
  { name: "건우", count: 571, rank: 34, gender: "M" },
  { name: "하진", count: 571, rank: 34, gender: "M" },
  { name: "태하", count: 571, rank: 34, gender: "M" },
  { name: "현우", count: 547, rank: 37, gender: "M" },
  { name: "지우", count: 537, rank: 38, gender: "M" },
  { name: "서우", count: 527, rank: 39, gender: "M" },
  { name: "서진", count: 527, rank: 39, gender: "M" },
  { name: "유안", count: 489, rank: 41, gender: "M" },
  { name: "정우", count: 480, rank: 42, gender: "M" },
  { name: "하온", count: 463, rank: 43, gender: "M" },
  { name: "율", count: 438, rank: 44, gender: "M" },
  { name: "다온", count: 438, rank: 44, gender: "M" },
  { name: "이도", count: 434, rank: 46, gender: "M" },
  { name: "지안", count: 424, rank: 47, gender: "M" },
  { name: "하민", count: 423, rank: 48, gender: "M" },
  { name: "준서", count: 423, rank: 48, gender: "M" },
  { name: "도영", count: 413, rank: 50, gender: "M" },
];

const FEMALE_TOP_50_2024: NameStat[] = [
  { name: "이서", count: 1689, rank: 1, gender: "F" },
  { name: "서아", count: 1682, rank: 2, gender: "F" },
  { name: "하린", count: 1320, rank: 3, gender: "F" },
  { name: "지유", count: 1238, rank: 4, gender: "F" },
  { name: "하윤", count: 1224, rank: 5, gender: "F" },
  { name: "아윤", count: 1224, rank: 5, gender: "F" },
  { name: "지안", count: 1194, rank: 7, gender: "F" },
  { name: "지아", count: 1133, rank: 8, gender: "F" },
  { name: "서윤", count: 1121, rank: 9, gender: "F" },
  { name: "아린", count: 1116, rank: 10, gender: "F" },
  { name: "시아", count: 1087, rank: 11, gender: "F" },
  { name: "지우", count: 972, rank: 12, gender: "F" },
  { name: "유주", count: 892, rank: 13, gender: "F" },
  { name: "채아", count: 878, rank: 14, gender: "F" },
  { name: "윤슬", count: 873, rank: 15, gender: "F" },
  { name: "윤서", count: 849, rank: 16, gender: "F" },
  { name: "수아", count: 832, rank: 17, gender: "F" },
  { name: "유나", count: 826, rank: 18, gender: "F" },
  { name: "서하", count: 822, rank: 19, gender: "F" },
  { name: "나은", count: 789, rank: 20, gender: "F" },
  { name: "채이", count: 771, rank: 21, gender: "F" },
  { name: "리아", count: 740, rank: 22, gender: "F" },
  { name: "도아", count: 739, rank: 23, gender: "F" },
  { name: "이나", count: 734, rank: 24, gender: "F" },
  { name: "예나", count: 731, rank: 25, gender: "F" },
  { name: "소이", count: 727, rank: 26, gender: "F" },
  { name: "이솔", count: 700, rank: 27, gender: "F" },
  { name: "하은", count: 697, rank: 28, gender: "F" },
  { name: "유하", count: 670, rank: 29, gender: "F" },
  { name: "태리", count: 653, rank: 30, gender: "F" },
  { name: "서연", count: 646, rank: 31, gender: "F" },
  { name: "예서", count: 631, rank: 32, gender: "F" },
  { name: "재이", count: 607, rank: 33, gender: "F" },
  { name: "하율", count: 605, rank: 34, gender: "F" },
  { name: "이현", count: 574, rank: 35, gender: "F" },
  { name: "로아", count: 574, rank: 35, gender: "F" },
  { name: "채원", count: 571, rank: 37, gender: "F" },
  { name: "예린", count: 562, rank: 38, gender: "F" },
  { name: "세아", count: 559, rank: 39, gender: "F" },
  { name: "다은", count: 524, rank: 40, gender: "F" },
  { name: "소율", count: 522, rank: 41, gender: "F" },
  { name: "서현", count: 518, rank: 42, gender: "F" },
  { name: "채윤", count: 509, rank: 43, gender: "F" },
  { name: "채은", count: 507, rank: 44, gender: "F" },
  { name: "서우", count: 505, rank: 45, gender: "F" },
  { name: "시은", count: 495, rank: 46, gender: "F" },
  { name: "윤아", count: 492, rank: 47, gender: "F" },
  { name: "소윤", count: 483, rank: 48, gender: "F" },
  { name: "은서", count: 483, rank: 48, gender: "F" },
  { name: "다인", count: 471, rank: 50, gender: "F" },
];

// === 통합 데이터 구성 ===
// 최신(2024) 데이터를 우선 사용, 누적 데이터는 보조 참고용
const ALL_2024: NameStat[] = [...MALE_TOP_50_2024, ...FEMALE_TOP_50_2024];
const ALL_POPULAR_NAMES: NameStat[] = [...ALL_2024, ...MALE_TOP_200, ...FEMALE_TOP_200];
const POPULAR_NAME_SET_2024 = new Set(ALL_2024.map(n => n.name));
const POPULAR_NAME_SET = new Set(ALL_POPULAR_NAMES.map(n => n.name));

/**
 * 이름이 인기 이름 목록에 있는지 확인 (2024 데이터 우선)
 * @returns rank (1-50) 또는 null
 */
export function getPopularityRank(name: string, gender?: 'M' | 'F'): number | null {
  // 2024 최신 데이터 우선 확인
  const list2024 = gender === 'M' ? MALE_TOP_50_2024 : gender === 'F' ? FEMALE_TOP_50_2024 : ALL_2024;
  const found2024 = list2024.find(n => n.name === name);
  if (found2024) return found2024.rank;

  // 누적 데이터 fallback
  const listHist = gender === 'M' ? MALE_TOP_200 : gender === 'F' ? FEMALE_TOP_200 : [...MALE_TOP_200, ...FEMALE_TOP_200];
  const foundHist = listHist.find(n => n.name === name);
  return foundHist ? foundHist.rank : null;
}

/**
 * 이름의 유행 점수 (0-100, 높을수록 유행)
 * 2024 기준: 상위 10위: 100점, 상위 20위: 90점, 상위 50위: 80점
 * 누적 기준: 상위 50위: 60점, 상위 100위: 40점, 상위 200위: 20점
 */
export function getPopularityScore(name: string, gender?: 'M' | 'F'): number {
  // 2024 최신 데이터 우선
  const list2024 = gender === 'M' ? MALE_TOP_50_2024 : gender === 'F' ? FEMALE_TOP_50_2024 : ALL_2024;
  const found2024 = list2024.find(n => n.name === name);
  if (found2024) {
    if (found2024.rank <= 10) return 100;
    if (found2024.rank <= 20) return 90;
    return 80;
  }

  // 누적 데이터 fallback (과거 유행이므로 점수 낮게)
  const listHist = gender === 'M' ? MALE_TOP_200 : gender === 'F' ? FEMALE_TOP_200 : [...MALE_TOP_200, ...FEMALE_TOP_200];
  const foundHist = listHist.find(n => n.name === name);
  if (foundHist) {
    if (foundHist.rank <= 50) return 60;
    if (foundHist.rank <= 100) return 40;
    return 20;
  }

  return 0;
}

/**
 * 유행 독립성 점수 (0-100, 높을수록 유행에 휩쓸리지 않는 이름)
 */
export function getTrendIndependenceScore(name: string, gender?: 'M' | 'F'): number {
  return 100 - getPopularityScore(name, gender);
}

/**
 * 인기 이름 목록 반환 (2024 기준, 성별 필터 가능)
 */
export function getPopularNames(gender?: 'M' | 'F', limit = 50): NameStat[] {
  const list = gender === 'M' ? MALE_TOP_50_2024 : gender === 'F' ? FEMALE_TOP_50_2024 : ALL_2024;
  return list.slice(0, limit);
}

/**
 * 이름이 인기 목록에 포함되어 있는지 (빠른 체크)
 */
export function isPopularName(name: string): boolean {
  return POPULAR_NAME_SET.has(name);
}

/**
 * 2024년 최신 인기 이름인지 (빠른 체크)
 */
export function isRecentPopularName(name: string): boolean {
  return POPULAR_NAME_SET_2024.has(name);
}

// 하위 호환: 기존 KOSIS 인터페이스
export interface KosisNameStat {
  name: string;
  count: number;
  rank: number;
  year: number;
}

export async function fetchKosisNameStats(): Promise<KosisNameStat[]> {
  return [...MALE_TOP_50_2024, ...FEMALE_TOP_50_2024].map(n => ({
    name: n.name,
    count: n.count,
    rank: n.rank,
    year: 2024,
  }));
}

export function getNationalTrendPercent(name: string): number {
  // 2024 최신 데이터와 누적 데이터 비교로 트렌드 추정
  const rank2024 = MALE_TOP_50_2024.find(n => n.name === name)?.rank
    ?? FEMALE_TOP_50_2024.find(n => n.name === name)?.rank;
  const rankHist = MALE_TOP_200.find(n => n.name === name)?.rank
    ?? FEMALE_TOP_200.find(n => n.name === name)?.rank;

  if (rank2024 && rankHist) {
    // 순위가 올라갔으면 양수 (인기 상승), 내려갔으면 음수
    return rankHist - rank2024;
  }
  if (rank2024 && !rankHist) return 50; // 신규 인기 이름
  if (!rank2024 && rankHist) return -20; // 인기 하락
  return 0;
}

export { MALE_TOP_200, FEMALE_TOP_200, MALE_TOP_50_2024, FEMALE_TOP_50_2024, ALL_POPULAR_NAMES, POPULAR_NAME_SET };
