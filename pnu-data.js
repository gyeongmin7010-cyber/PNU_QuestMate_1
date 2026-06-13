
const DATA = {
  "meals": [
    {
      "title": "2026.06.13 토요일 공식 식단: 등록된 식단 없음",
      "meta": "금정회관·샛벌회관·학생회관 모두 공식 페이지 기준 등록 메뉴 없음"
    },
    {
      "title": "금정회관 / 학생회관 / 샛벌회관 식단 확인",
      "meta": "식단이 등록되는 평일·운영일에는 메뉴 확인 후 식사 미션으로 연결"
    },
    {
      "title": "식단 미션 예시",
      "meta": "오늘 식단 확인 → 식사 장소 선택 → 만족도·혼잡도 기록"
    }
  ],
  "seats": [
    {
      "title": "새벽벌도서관 학습공간 확인",
      "meta": "대표 학습형 3시간 퀘스트 장소"
    },
    {
      "title": "미리내열람실 좌석현황 확인",
      "meta": "조용한 학습공간 후보"
    },
    {
      "title": "도서관 그룹스터디룸 활용",
      "meta": "팀프로젝트 미션 장소 후보"
    }
  ],
  "notices": [
    {
      "title": "[취업전략과] 2026학년도 1차 진로부트캠프(온라인) 모집 안내",
      "meta": "신청기간 2026.06.11 ~ 2026.06.24"
    },
    {
      "title": "학생지원시스템 공지 확인 미션",
      "meta": "마감일·신청대상·신청방법을 3줄로 정리"
    },
    {
      "title": "비교과 프로그램 공지 확인",
      "meta": "참여 가능 프로그램을 확인하고 캘린더에 저장"
    }
  ],
  "academic": [
    {
      "title": "1학기 기말고사",
      "meta": "2026.06.16 ~ 2026.06.22"
    },
    {
      "title": "1학기 성적입력",
      "meta": "2026.06.16 ~ 2026.06.29"
    },
    {
      "title": "하기휴가 시작",
      "meta": "2026.06.23"
    },
    {
      "title": "여름계절수업 강의시작·종료",
      "meta": "2026.06.25 ~ 2026.07.21"
    },
    {
      "title": "1학기 성적열람 및 정정신청기간",
      "meta": "2026.07.01 ~ 2026.07.07"
    }
  ]
};
exports.handler = async function(event) {
  return {
    statusCode: 200,
    headers: {
      'content-type':'application/json; charset=utf-8',
      'access-control-allow-origin':'*',
      'cache-control':'no-store'
    },
    body: JSON.stringify({version:'v13-clean-final', mode:'ready', fetchedAt:new Date().toISOString(), ...DATA})
  };
};
