import type { AirportGuideBody } from "./airportGuides";

/** Korean guide bodies. Names/summaries live in lib/airportBrief.ts. */
export const DEFAULT_BODY_KO: AirportGuideBody = {
  terminals: ["항공사별 터미널은 바뀔 수 있으니 공항 홈페이지에서 확인하세요."],
  beforeYouFly: [
    "국제선은 2시간 전 도착이 기본이고, 성수기에 공항이 권고하면 3시간을 잡으세요.",
    "공항과 도시 지도를 오프라인으로 저장해 두세요. 와이파이가 불안정할 수 있습니다.",
  ],
  afterYouLand: [
    "현금이 필요하면 소액만 인출하세요. 카드로 대부분 해결되는 도시가 많습니다.",
    "차량 호출이나 철도 앱은 공항 공식 와이파이나 데이터로만 여세요. 가짜 접속 페이지를 피할 수 있습니다.",
  ],
  transit: {
    taxi: {
      title: "택시",
      bullets: [
        "공식 택시 승강장이나 정식 대기줄을 이용하고, 수하물 찾는 곳에서 먼저 다가오는 기사는 피하세요.",
        "차에 타기 전에 미터기를 쓰는지, 앱·정액 요금이 안내판과 같은지 확인하세요.",
        "늦은 시간에는 번호판을 찍어 두고 믿을 만한 사람에게 실시간 위치를 공유하세요.",
      ],
      avoidScams: [
        "차량 호출 앱 요금의 2~3배를 '정액'이라며 부르는 경우.",
        "미터기를 거부하거나 공식 승강장이 '닫혔다'고 말하는 기사.",
        "도착 통로에서 강하게 권유하는 비공식 '공항 트랜스퍼' 데스크.",
      ],
    },
    bus: {
      title: "버스",
      bullets: [
        "공항버스는 도착층 밖 표시된 승차장에서 출발합니다. 차량에 적힌 노선 번호를 확인하세요.",
        "표는 공식 발권기나 매표소, 공항 홈페이지에 링크된 앱에서 사세요.",
      ],
      avoidScams: ["표는 발권기나 공식 매표소에서만 사고, '할인표'를 파는 사람은 상대하지 마세요."],
    },
    rail: {
      title: "기차 / 지하철",
      bullets: [
        "'Train', 'Rail', 'Metro' 표시를 따라가세요. 택시 승강장과 다른 건물인 경우가 많습니다.",
        "늦게 도착한다면 막차 시간을 확인하세요. 자정 이후에는 공항버스가 열차를 대신하기도 합니다.",
      ],
      avoidScams: ["필요 없는 셔틀 패키지를 권하는 가짜 안내 부스."],
    },
  },
  accessibility: {
    summary:
      "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요. 실제 지원은 공항이 하지만 신청은 항공사를 통해 접수됩니다. 큰 국제공항은 대부분 휠체어 무료 대여, 장애인 화장실, 보안검색과 게이트까지의 직원 동행을 제공합니다.",
    services: [
      { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요. 대부분의 공항은 안내데스크에 현장 대여용 휠체어도 두고 있습니다." },
      { label: "장애인 화장실", detail: "대부분의 터미널 곳곳에 있습니다. 직원에게 묻거나 터미널 지도를 확인하세요." },
      { label: "보조동물 동반", detail: "대체로 허용되지만, 출발 전에 항공사와 도착 국가의 서류 요건을 확인하세요." },
    ],
    officialLinks: [],
  },
};

export const BODIES_KO: Record<string, AirportGuideBody> = {
  ICN: {
    terminals: ["제1여객터미널", "제2여객터미널"],
    beforeYouFly: [
      "이용 항공사가 T1인지 T2인지 확인하세요. 터미널을 옮긴 항공사들이 있습니다.",
      "보안검색은 여유를 두세요. 성수기에는 출입국 심사 줄이 길어집니다.",
    ],
    afterYouLand: [
      "공항철도(AREX) 직통·일반열차가 서울역까지 이어집니다. 수하물을 찾은 뒤 표지판을 따라가세요.",
      "공항 리무진버스가 도착층 밖에서 서울 전역으로 운행합니다.",
    ],
    transit: {
      taxi: {
        title: "택시",
        bullets: [
          "도착층 밖 공식 택시 승강장을 이용하세요. 일반·모범·대형으로 줄이 나뉘어 있습니다.",
          "국제택시는 주요 지역까지 정액에 가까운 요금이 있습니다. 게시된 요금표에서 확인하세요.",
          "카카오T 같은 호출 앱도 잘 됩니다. 공항이 지정한 호출 구역이 있으면 그곳으로 잡으세요.",
        ],
        avoidScams: ["입국장 안에서 권유하는 비공식 호객은 무시하고, 공식 승강장이나 아는 앱만 쓰세요."],
        officialLinks: [{ label: "인천공항공사 여객 안내", href: "https://www.airport.kr/" }],
      },
      bus: {
        title: "공항버스",
        bullets: [
          "리무진버스가 강남·명동·홍대 등 주요 거점으로 운행합니다. 표는 출구 근처 매표소에서 삽니다.",
          "승차장마다 전광판에 노선 번호와 대기 시간이 표시됩니다.",
        ],
        avoidScams: [],
      },
      rail: {
        title: "공항철도 / 지하철",
        bullets: [
          "직통열차는 서울역까지 더 빠르고, 일반열차는 홍대입구 등 중간역에 모두 섭니다.",
          "숙소 위치에 따라 서울역이나 홍대입구에서 서울 지하철로 갈아타세요.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "세계에서 가장 접근성이 좋은 공항으로 꼽힙니다. 전동·파워어시스트 휠체어까지 무료로 빌려주고, 교통약자 전용 우대 통로가 있으며, 장기주차장과 터미널 사이를 전기차로 무료 운행합니다.",
      services: [
        { label: "휠체어 대여", detail: "제1터미널 3층 7번·8번 출구 바깥에서 수동·전동 휠체어를 무료로 빌릴 수 있습니다. 곳곳의 도움 전화기는 가장 가까운 안내데스크로 바로 연결됩니다." },
        { label: "교통약자 우대 통로", detail: "항공사 체크인 카운터에서 대상 여부를 확인하고 우대카드를 받은 뒤 전용 보안검색대를 이용하세요." },
        { label: "전기차 이동 지원", detail: "휠체어 이용객은 장기주차장과 터미널 사이를 전기차로 무료 이동할 수 있습니다." },
      ],
      officialLinks: [{ label: "인천공항 교통약자 서비스", href: "https://www.airport.kr/ap_en/1478/subview.do" }],
    },
    transitTips: [
      "두 터미널 모두 보안구역 안에 무료 샤워실이 있습니다(수건·세면도구는 직접 준비). 유료 환승 라운지 샤워실(T1 25·29번 게이트 인근, T2 231·268번 게이트 인근)은 수건과 샴푸, 바디워시가 포함됩니다.",
      "제1·제2터미널의 환승호텔에서 입국심사 없이 낮 시간 객실을 쓸 수 있습니다. 긴 환승에 유용합니다.",
      "여러 라운지가 일반석 승객에게도 당일 이용권이나 프라이어리티 패스·드래곤패스 멤버십을 받아 줍니다.",
    ],
  },
  NRT: {
    terminals: ["제1터미널", "제2터미널", "제3터미널"],
    beforeYouFly: ["제3터미널은 주로 저비용 항공사가 씁니다. 터미널 간 도보 거리와 셔틀버스를 미리 확인하세요."],
    afterYouLand: [
      "N’EX는 JR, 스카이라이너는 게이세이로 매표소가 다릅니다. 바닥 안내 표시를 따라가세요.",
      "시내에 도착한 뒤에는 스이카·파스모 같은 IC카드가 전철과 시내버스에 두루 편합니다.",
    ],
    transit: {
      taxi: {
        title: "택시",
        bullets: [
          "주요 권역별 정액 택시가 있습니다. 줄 서기 전에 공식 택시 안내 데스크에서 물어보세요.",
          "도쿄 택시는 미터기제이고 고속도로 통행료가 따로 붙습니다. 애매하면 미리 확인하세요.",
        ],
        avoidScams: ["수하물 찾는 곳 안에서 호객하는 기사는 피하세요."],
      },
      bus: {
        title: "공항버스",
        bullets: ["리무진버스가 주요 호텔과 역으로 운행합니다. 짐이 많다면 가장 편한 선택인 경우가 많습니다."],
        avoidScams: [],
      },
      rail: {
        title: "철도",
        bullets: [
          "N’EX는 JR 노선으로 도쿄역·신주쿠 방면까지 갑니다.",
          "스카이라이너는 우에노·닛포리행으로, 도쿄 동쪽으로 갈 때 빠릅니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "모든 터미널 안내 카운터에서 휠체어를 무료로 빌려주고, 터미널 곳곳의 도움 인터폰으로 24시간 지원 직원을 부를 수 있습니다.",
      services: [
        { label: "휠체어 대여", detail: "어느 터미널이든 안내 카운터에서 무료로 빌리고, 다 쓴 뒤 가장 가까운 카운터에 반납하면 됩니다." },
        { label: "24시간 지원 인터폰", detail: "터미널 곳곳의 인터폰이 직원과 바로 연결되며, 체크인 카운터까지 안내해 줍니다." },
        { label: "택시 승강장 지원", detail: "휠체어를 이용한다면 택시 승강장 직원에게 말씀하세요. 승차를 도와줍니다." },
      ],
      officialLinks: [{ label: "나리타공항 — 도움이 필요한 이용객 안내", href: "https://www.narita-airport.jp/en/bf/" }],
    },
    transitTips: [
      "제1·제2터미널 보안구역 안에 유료 샤워실과 데이룸이 있습니다. 수건·샴푸·드라이어가 포함되며, 무료 샤워실은 없습니다.",
      "JAL·ANA 등 일부 항공사는 자사 국제선 환승객에게 샤워 이용을 무료나 할인가로 제공합니다. 결제 전에 항공사에 확인하세요.",
      "라운지는 멤버십뿐 아니라 선불 당일 이용권으로도 들어갈 수 있고, 일반석 승객도 가능합니다.",
    ],
  },
  HND: {
    terminals: ["제1터미널", "제2터미널", "제3터미널"],
    beforeYouFly: ["하네다는 동선이 촘촘합니다. 국내선에서 국제선으로 갈아탈 때는 시간을 넉넉히 잡으세요."],
    afterYouLand: ["게이큐선과 모노레일은 닿는 지역이 다릅니다. 숙소 위치를 보고 고르세요."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["터미널마다 공식 택시 승강장이 있고, 나리타보다 도쿄 도심까지 거리가 짧습니다."],
        avoidScams: [],
      },
      bus: {
        title: "버스",
        bullets: ["전철 환승 없이 가고 싶다면 공항버스가 주요 거점을 연결합니다."],
        avoidScams: [],
      },
      rail: {
        title: "철도",
        bullets: [
          "도쿄 모노레일로 하마마쓰초까지 가서 JR 야마노테선으로 갈아탑니다.",
          "게이큐선은 시나가와와 요코하마 방면으로 이어집니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "세 터미널 모두 층마다 엘리베이터가 있어 계단 없이 이동할 수 있습니다. '케어피터' 교육을 받은 직원이 특별 지원을 제공하고, 조용한 '칼다운·쿨다운' 공간과 비가시적 장애를 위한 해바라기 목걸이도 무료로 준비되어 있습니다.",
      services: [
        { label: "특별 지원 예약", detail: "온라인으로 미리 예약하거나 +81-3-5757-8111로 전화하세요. 케어피터 직원이 체크인·보안검색·탑승을 도와줍니다." },
        { label: "해바라기 목걸이(비가시적 장애)", detail: "안내 카운터에서 무료로 받을 수 있고, 도움이 필요할 수 있다는 신호를 직원에게 전달합니다." },
        { label: "칼다운·쿨다운 공간", detail: "감각 자극이 부담스럽거나 진정이 필요한 이용객을 위한 조용한 공간입니다. 현재 위치는 공항 지도에서 확인하세요." },
      ],
      officialLinks: [
        { label: "하네다공항 — 특별 지원이 필요한 이용객", href: "https://tokyo-haneda.com/en/service/barrier-free_information/index.html" },
        { label: "하네다공항 — 특별 지원 예약", href: "https://tokyo-haneda.com/en/service/facilities/assist.html" },
      ],
    },
    transitTips: [
      "로열파크호텔 도쿄 하네다 트랜짓은 제3터미널 보안구역(출국심사 이후) 안에 있는 호텔로, 입국심사 없이 샤워가 딸린 낮 객실을 쓸 수 있습니다.",
      "호텔과 별개로 터미널 안에 공용 샤워룸도 있습니다.",
      "환승 편의가 좋은 대형 공항으로 꼽힙니다. 국제선이 단일 터미널에 모여 있어 환승 시간이 대체로 넉넉합니다.",
    ],
  },
  JFK: {
    terminals: ["1·4·5·7·8터미널(항공사별 확인)"],
    beforeYouFly: ["에어트레인은 터미널 간 이동은 무료이고, 지하철·LIRR로 나갈 때 요금이 붙습니다."],
    afterYouLand: ["옐로캡 승강장에는 배차 직원이 있고, 차량 호출은 터미널마다 지정된 승차 구역이 있습니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: [
          "제복 입은 배차 직원이 있는 옐로캡 승강장을 이용하세요. JFK에서 맨해튼까지는 정액 요금입니다.",
          "차량 호출은 공항 안내판을 따라 지정 승차 구역으로 가고, 호객은 무시하세요.",
        ],
        avoidScams: ["터미널 안에서 공식 대기줄을 벗어나 태워 주겠다는 사람."],
      },
      bus: {
        title: "버스",
        bullets: ["MTA 버스가 인근 지역을 잇지만, 대부분은 에어트레인과 지하철·LIRR을 씁니다."],
        avoidScams: [],
      },
      rail: {
        title: "에어트레인 + 철도",
        bullets: [
          "에어트레인으로 자메이카역까지 간 뒤 LIRR이나 지하철 E·J·Z선으로 환승합니다.",
          "에어트레인으로 하워드비치역까지 간 뒤 지하철 A선으로 환승합니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "휠체어와 이동 지원은 공항이 아니라 항공사를 통해 신청해야 하며, 48~72시간 전이 좋습니다. 화장실과 에어트레인, 보조동물 배변 구역은 모두 접근 가능합니다. 다만 휠체어 지원 대기가 특히 혼잡 시간대에 길다는 이용객 후기가 많으니 시간을 넉넉히 잡으세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하고, 도착 후 체크인 카운터에서 다시 확인하세요. 이용객 후기에 따르면 혼잡 시간대에는 한 시간을 넘기기도 합니다." },
        { label: "TSA Cares", detail: "보안검색 통과 지원이 필요하면 TSA Cares 신청서를 미리 제출하세요." },
        { label: "보조동물 배변 구역(SARA)", detail: "모든 터미널의 보안검색 전후에 실내·실외 배변 구역이 있습니다." },
      ],
      officialLinks: [{ label: "JFK공항 접근성 서비스", href: "https://www.jfkairport.com/explore-jfk/accessibility-services" }],
    },
    transitTips: [
      "무료 샤워실은 없습니다. 샤워는 라운지(4·5·8터미널)나 미닛스위트(4터미널 B39 게이트 인근) 같은 유료 시설에서만 가능합니다.",
      "5터미널의 TWA 호텔에서 샤워가 딸린 낮 객실을 쓸 수 있고, 다른 터미널에서 에어트레인으로 갈 수 있습니다.",
      "JFK는 보안검색 전 구역이 터미널끼리 이어져 있지 않습니다. 낮 객실이나 라운지는 같은 터미널에 있거나 환승 시간 안에 에어트레인으로 닿을 수 있어야 현실적입니다.",
    ],
  },
  LHR: {
    terminals: ["2·3·4·5터미널"],
    beforeYouFly: [],
    afterYouLand: ["언더그라운드, 엘리자베스 라인, 히스로 익스프레스, 중앙 버스터미널 표지판을 따라가세요."],
    transit: {
      taxi: {
        title: "택시",
        bullets: [
          "터미널마다 공식 블랙캡 승강장이 있고, 규제된 요금표에 따라 미터기로 운행합니다.",
          "사전 예약 차량은 반드시 정식 면허 업체를 쓰고, 길에서 호객하는 사람은 절대 따라가지 마세요.",
        ],
        avoidScams: ["도착장에서 부풀린 정액 요금을 부르는 무면허 기사."],
      },
      bus: {
        title: "코치 / 버스",
        bullets: ["내셔널 익스프레스 등 장거리 코치가 중앙 버스터미널에서 출발합니다."],
        avoidScams: [],
      },
      rail: {
        title: "철도",
        bullets: [
          "엘리자베스 라인은 속도와 요금의 균형이 좋아 런던 도심행으로 무난합니다.",
          "히스로 익스프레스는 패딩턴까지 가장 빠릅니다.",
          "피카딜리 라인은 저렴하지만 정차역이 많아 느립니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "터미널마다 보라색 옷을 입은 '히스로 헬퍼'가 상주하는 지원 구역이 있고, 비가시적 장애를 위한 해바라기 목걸이를 무료로 줍니다. 엘리베이터가 곳곳에 있으며, 에스컬레이터는 휠체어나 무거운 짐에 적합하지 않습니다. 런던의 정식 블랙캡은 법적으로 휠체어 접근이 가능합니다.",
      services: [
        { label: "지원 사전 예약", detail: "출발 48시간 전까지 항공사에 알리면, 히스로 지원팀이 터미널별 지정 구역에서 맞이합니다." },
        { label: "해바라기 목걸이", detail: "비가시적 장애를 위한 무료 표식으로, 도움이 필요할 수 있다는 신호가 됩니다. 지원 구역에서 받을 수 있습니다." },
        { label: "도움 요청 지점", detail: "주차장, 승하차 구역, 교통 시설 곳곳에 있습니다. 버튼을 누르면 지원팀으로 바로 연결되고, +44 (0)20 8757 2700으로 전화해도 됩니다." },
      ],
      officialLinks: [
        { label: "히스로 — 지원 및 접근성", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility" },
        { label: "히스로 — 출발 지원 안내", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/assistance-departure-guide" },
        { label: "히스로 — 터미널 내 도움받기", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/help-in-the-terminal" },
      ],
    },
    transitTips: [
      "요텔(4터미널)과 에어로텔(3터미널)은 샤워가 딸린 낮 이용 수면 캡슐을 4시간 단위로 예약할 수 있고, 보안구역 안이라 영국 입국심사를 받지 않아도 됩니다.",
      "플라자 프리미엄 라운지(2·4터미널)는 객실 예약 없이 샤워만 따로 이용할 수 있습니다.",
      "통로로 이어진 호텔(T5 소피텔, T4 힐튼)은 일반구역에 있어, 환승 중이라면 영국 입국심사를 받아야 갈 수 있습니다.",
    ],
  },
  SIN: {
    terminals: ["1·2·3·4터미널"],
    beforeYouFly: [],
    afterYouLand: ["도착층은 모든 터미널의 1층입니다. 입국심사와 수하물 수취, 세관이 모두 이곳에서 이뤄집니다."],
    transit: {
      taxi: { title: "택시", bullets: ["터미널마다 도착층에 공식 택시 승강장이 있습니다. 호객이 아니라 표시된 대기줄을 이용하세요."], avoidScams: [] },
      bus: { title: "버스", bullets: ["시내버스와 공항 셔틀이 모든 터미널을 지납니다. 현재 노선은 창이공항 홈페이지에서 확인하세요."], avoidScams: [] },
      rail: { title: "철도(MRT)", bullets: ["MRT 공항선이 2·3터미널과 싱가포르 도심을 잇습니다."], avoidScams: [] },
    },
    accessibility: {
      summary:
        "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요. 창이공항은 휠체어 대여와 접근성 시설이 잘 갖춰져 있어 큰 공항 중에서도 이동이 편한 곳으로 꼽힙니다.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하면 지상 직원이 게이트에서 맞이합니다." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "창이공항 — 특별 지원", href: "https://www.changiairport.com/en/at-changi/special-assistance.html" }],
    },
    floorGuide: [
      { floor: "1층", label: "모든 터미널 도착 — 입국심사, 수하물 수취, 세관" },
      { floor: "2층", label: "1·2터미널 출발 — 체크인, 보안검색" },
      { floor: "2/3층", label: "3터미널 출발 — 체크인, 보안검색" },
    ],
  },
  AMS: {
    terminals: ["단일 터미널, 출발 홀 1~3"],
    beforeYouFly: [],
    afterYouLand: ["모든 도착 동선은 중앙 공용 구역인 스히폴 플라자로 이어집니다. 기차·택시·버스 모두 여기서 이용합니다."],
    transit: {
      taxi: { title: "택시", bullets: ["공식 택시 승강장은 스히폴 플라자 바로 밖에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["지역 버스와 장거리 버스가 스히폴 플라자 밖 버스터미널에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도", bullets: ["기차역이 터미널 바로 아래에 있고, 암스테르담 중앙역 방면 열차가 자주 다닙니다."], avoidScams: [] },
    },
    accessibility: {
      summary:
        "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요. 스히폴은 터미널이 하나이고 도보 거리도 짧은 편이라(H·M 피어 제외) 비교적 다니기 쉽습니다.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "스히폴 — 지원 서비스", href: "https://www.schiphol.nl/en/assistance/" }],
    },
    floorGuide: [
      { floor: "지상층", label: "도착, 수하물 수취, 스히폴 플라자, 기차역 연결" },
      { floor: "1층", label: "체크인과 출발(홀 1·2·3)" },
      { floor: "2층", label: "보안검색, 라운지, 식당, 게이트" },
      { floor: "3층", label: "파노라마 테라스" },
    ],
  },
  HKG: {
    terminals: ["제1터미널", "제2터미널"],
    beforeYouFly: [],
    afterYouLand: ["도착 절차(입국심사·수하물 수취·세관)는 제1터미널 5층에서 이뤄집니다."],
    transit: {
      taxi: { title: "택시", bullets: ["도착홀 밖에 공식 택시 승강장이 있습니다. 표시된 대기줄을 찾으세요."], avoidScams: [] },
      bus: { title: "버스", bullets: ["공항버스가 터미널 밖에서 홍콩섬·구룡·신계 방면으로 운행합니다."], avoidScams: [] },
      rail: { title: "철도(에어포트 익스프레스)", bullets: ["에어포트 익스프레스가 10~12분 간격으로 운행하며 홍콩역까지 약 24분 걸립니다."], avoidScams: [] },
    },
    accessibility: {
      summary:
        "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요. 홍콩국제공항은 장애인 화장실, 휠체어 접근로, 점자 안내가 전 구역에 갖춰져 있습니다.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "홍콩국제공항 — 장애인 편의 안내", href: "https://www.hongkongairport.com/en/passenger-guide/airport-facilities-services/special-needs-access" }],
    },
    floorGuide: [
      { floor: "5층", label: "도착 — 입국심사, 수하물 수취, 세관" },
      { floor: "6층", label: "보안검색과 출발 게이트, 상점, 라운지" },
      { floor: "7층", label: "체크인 홀 — 항공사 카운터, 무인 발권기" },
    ],
  },
  DXB: {
    terminals: ["제1터미널", "제2터미널", "제3터미널(에미레이트)"],
    beforeYouFly: [],
    afterYouLand: ["공항으로 출발하기 전에 터미널을 확인하세요. 에미레이트는 3터미널, 다른 국제선 대부분은 1터미널을 씁니다."],
    transit: {
      taxi: { title: "택시", bullets: ["RTA 면허 택시가 도착층 밖에서 24시간 운행합니다. 공식 승강장을 이용하세요."], avoidScams: [] },
      bus: { title: "버스", bullets: ["RTA 버스 노선이 공항과 데이라·부르두바이를 잇습니다."], avoidScams: [] },
      rail: { title: "메트로", bullets: ["두바이 메트로 레드라인이 1터미널과 3터미널에 바로 섭니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "두바이공항 — 특별 지원", href: "https://dubaiairports.ae/information/special-assistance" }],
    },
    floorGuide: [
      { floor: "1층", label: "3터미널 도착 — 입국심사, 수하물 수취" },
      { floor: "3층", label: "3터미널 출발 — 체크인, 보안검색" },
      { floor: "4층", label: "3터미널 보조 도착 구역" },
    ],
  },
  BKK: {
    terminals: ["메인 터미널", "위성 터미널 SAT-1"],
    beforeYouFly: [],
    afterYouLand: ["도착 절차(입국심사·수하물 수취·세관)는 2층에서 이뤄집니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["공식 공용 택시 대기줄은 1층입니다. 도착홀에서 다가오는 호객이 아니라 번호표 발권기를 이용하세요."],
        avoidScams: ["터미널 안에서 도착 승객에게 직접 접근하는 비공식 기사, 특히 미터 요금보다 훨씬 비싼 정액을 부르는 경우."],
      },
      bus: { title: "버스", bullets: ["공항버스와 시외버스가 1층에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도(에어포트 레일링크)", bullets: ["도심으로 이어지는 파야타이행 ARL은 도착층 한 층 아래 지하(B층)에서 출발합니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "수완나품공항 — 여객 안내", href: "https://suvarnabhumi.airportthai.co.th/service/airport-guide" }],
    },
    floorGuide: [
      { floor: "1층", label: "버스 로비, 공용 택시 대기줄" },
      { floor: "2층", label: "도착 — 입국심사, 수하물 수취, 세관" },
      { floor: "3층", label: "식당, 상점, 항공사 라운지" },
      { floor: "4층", label: "출발 — 체크인, 보안검색, 출국심사" },
      { floor: "지하 B층", label: "에어포트 레일링크(ARL) 승강장" },
    ],
  },
  IST: {
    terminals: ["단일 터미널, 콘코스 A/B/D/F/G"],
    beforeYouFly: [],
    afterYouLand: ["도착 게이트는 1층입니다. 입국심사·수하물 수취·세관은 지상층으로 내려가서 진행합니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["주요 택시 승강장은 국내선·국제선 출구 밖에 있습니다. 주황색(가장 저렴), 청록색, 검은색(가장 비쌈) 택시가 있습니다."],
        avoidScams: [],
      },
      bus: { title: "버스", bullets: ["버스는 교통층(지하 2층)에서 출발합니다."], avoidScams: [] },
      rail: { title: "메트로", bullets: ["M11 노선이 가이레테페까지 이어지고, 거기서 이스탄불 메트로 전체 노선망으로 갈아탈 수 있습니다."], avoidScams: [] },
    },
    accessibility: {
      summary:
        "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요. 층이 바뀌는 모든 지점에 엘리베이터와 경사로가 있고, 점자블록과 장애인 화장실도 층마다 갖춰져 있습니다.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 층에 있습니다." },
      ],
      officialLinks: [{ label: "이스탄불공항 — iGA Cares(접근성)", href: "https://www.istairport.com/en/flights/airport-guides/iga-cares-accessibility/" }],
    },
    floorGuide: [
      { floor: "지상층", label: "도착 — 입국심사, 수하물 수취, 세관" },
      { floor: "1층", label: "도착 게이트" },
      { floor: "2층", label: "출발 — 체크인, 보안검색, 탑승 게이트" },
      { floor: "지하 2층", label: "버스터미널, 일부 승하차 구역" },
    ],
  },
  TPE: {
    terminals: ["제1터미널", "제2터미널"],
    beforeYouFly: [],
    afterYouLand: ["도착과 수하물 수취는 두 터미널 모두 1층입니다."],
    transit: {
      taxi: { title: "택시", bullets: ["두 터미널 모두 지정 승강장에서 24시간 택시를 탈 수 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["타이베이행 공항버스가 터미널별 도착층에서 출발합니다."], avoidScams: [] },
      rail: { title: "공항 MRT", bullets: ["2터미널은 지하 2층에서, 1터미널은 지하 1층을 거쳐 승차합니다. 타이베이 도심까지 가장 빠릅니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "타오위안공항 — 여객 안내", href: "https://www.taoyuan-airport.com/" }],
    },
    floorGuide: [
      { floor: "1층", label: "도착 — 입국심사, 수하물 수취, 세관(두 터미널 공통)" },
      { floor: "2층", label: "도착 콘코스와 환승" },
      { floor: "3층", label: "출발 — 체크인, 보안검색(두 터미널 공통)" },
      { floor: "지하 1·2층", label: "공항 MRT 승강장" },
    ],
  },
  SYD: {
    terminals: ["제1터미널(국제선)", "제2터미널(국내선)", "제3터미널(국내선, 콴타스)"],
    beforeYouFly: [],
    afterYouLand: ["도착 절차(입국심사·수하물 수취·세관)는 제1터미널 1층에서 이뤄집니다."],
    transit: {
      taxi: { title: "택시", bullets: ["택시 승강장은 제1터미널 도착층 밖에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["무료 T-Bus 셔틀이 일반구역에서 모든 터미널을 잇습니다."], avoidScams: [] },
      rail: { title: "철도(에어포트 링크)", bullets: ["에어포트 링크 열차로 제1터미널에서 국내선 터미널까지 약 2분, 이어서 시드니 도심까지 갑니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "시드니공항 — 지원 서비스", href: "https://www.sydneyairport.com.au/assistance" }],
    },
    floorGuide: [
      { floor: "1층", label: "제1터미널 도착 — 입국심사, 수하물 수취, 세관" },
      { floor: "2층", label: "제1터미널 출발 — A~K 체크인 카운터, 보안검색" },
      { floor: "3층", label: "항공사 사무실, 라운지" },
    ],
  },
  FRA: {
    terminals: ["제1터미널(콘코스 A·B·C·Z)", "제2터미널(콘코스 D·E)"],
    beforeYouFly: [],
    afterYouLand: ["층은 콘코스에 따라 다릅니다. 공항 전체에 하나의 도착층이 있다고 가정하지 말고 아래 터미널 구조를 확인하세요."],
    transit: {
      taxi: { title: "택시", bullets: ["택시 승강장은 제1·제2터미널 도착층 출구 근처에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["프랑크푸르트행 공항버스가 제2터미널 도착홀 앞 승차장에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도", bullets: ["제1터미널에는 근교선(S-Bahn) 역과 장거리(ICE/IC) 역이 모두 터미널과 바로 연결됩니다. 제2터미널에서는 무료 스카이라인 열차로 제1터미널로 이동해야 역을 이용할 수 있습니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "프랑크푸르트공항 — 특별 지원", href: "https://www.frankfurt-airport.com/en/travel-planning/special-needs.html" }],
    },
    floorGuide: [
      { floor: "T1 콘코스 B, 1층", label: "도착 — 수하물 수취, 세관" },
      { floor: "T1 콘코스 B, 2층", label: "출발 — 체크인, 라운지" },
      { floor: "T1 콘코스 B, 3층", label: "출국심사, 우선 보안검색 통로" },
      { floor: "T1 콘코스 A, 2층", label: "솅겐 출발" },
      { floor: "T1 콘코스 Z, 3층", label: "비솅겐 출발(콘코스 A 바로 위, 같은 피어)" },
      { floor: "T2 콘코스 D/E, 2층", label: "도착 — 수하물 수취, 세관" },
      { floor: "T2 콘코스 D/E, 3층", label: "출발 — 체크인, 보안검색" },
    ],
  },
  MUC: {
    terminals: ["제1터미널(모듈 A~F)", "제2터미널(게이트 G·H + 위성 게이트 K·L)"],
    beforeYouFly: [],
    afterYouLand: ["제1터미널은 모듈에 따라, 그 외에는 터미널에 따라 층과 절차가 다릅니다. 아래 터미널 구조를 확인하세요."],
    transit: {
      taxi: { title: "택시", bullets: ["택시 승강장은 두 터미널 도착층 바깥 차도에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["중앙역행 루프트한자 공항버스가 제1터미널(도착 A구역), 뮌헨 에어포트 센터, 제2터미널 도착층에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도(S-Bahn)", bullets: ["S1·S8 근교선이 뮌헨 에어포트 센터 역에서 10분 간격으로 도심까지 운행합니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "뮌헨공항 모빌리티 서비스가 무료로 도와줍니다. 항공사를 통해 최소 48시간 전에 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "뮌헨공항 — 배리어프리 여행", href: "https://www.munich-airport.com/accessible-travel-260945" }],
    },
    floorGuide: [
      { floor: "T1 모듈 A~D, 04층", label: "도착과 출발(이 모듈들은 같은 층에서 함께 처리)" },
      { floor: "T1 모듈 B/C", label: "비솅겐 도착 — 수하물 수취 전에 출입국 심사" },
      { floor: "T1 모듈 E", label: "도착 전용" },
      { floor: "T2 04층(게이트 G)", label: "솅겐 출발, 솅겐 도착 수하물 수취" },
      { floor: "T2 05층(게이트 H)", label: "비솅겐 출발" },
    ],
  },
  CDG: {
    terminals: ["제1터미널", "제2터미널(2A~2G)", "제3터미널"],
    beforeYouFly: [],
    afterYouLand: ["2E인지 2C인지 같은 세부 터미널에 따라 구조가 달라집니다. 아래 터미널 구조를 확인하세요."],
    transit: {
      taxi: { title: "택시", bullets: ["택시 승강장은 터미널마다 도착층에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["루아시버스와 RATP 350·351번이 파리 도심으로 이어지고, 무료 CDGVAL 셔틀이 1·2·3터미널을 잇습니다."], avoidScams: [] },
      rail: {
        title: "철도(RER B / TGV)",
        bullets: [
          "파리 도심행 RER B는 제2터미널과 제3터미널·루아시폴 두 곳에 역이 있습니다. 자주 헷갈리는 지점이니 맞는 역인지 확인하세요.",
          "TGV 고속열차는 제2터미널 아래 역에서 출발합니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "파리 공항 — 교통약자 지원", href: "https://www.parisaeroport.fr/en/passengers/flight-preparation/specific-assistance/people-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "T1", label: "원형 구조 — CDGVAL 셔틀은 아래층에 도착하고, 출발 체크인·보안검색은 그 위층, 도착은 맨 위층입니다" },
      { floor: "T2A/2B/2C/2D, 1층", label: "도착" },
      { floor: "T2C/2D, 2층", label: "출발 — 탑승 게이트" },
      { floor: "T2E/2F", label: "본관에 출발층(체크인·보안검색)과 별도의 도착층(수하물 수취)이 있고, 2E의 L·M 홀 게이트는 셔틀 열차를 타야 합니다" },
      { floor: "T3", label: "작은 단일 건물 — 층이 아니라 방향으로 나뉘어 북쪽이 도착, 남쪽이 출발(A·B 홀)입니다" },
    ],
  },
  LAX: {
    terminals: ["1~8터미널", "톰 브래들리 국제선 터미널(B터미널)"],
    beforeYouFly: [],
    afterYouLand: ["도착과 수하물 수취는 모든 터미널의 아래층입니다. TBIT만 1층을 씁니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["택시는 1터미널 근처의 전용 승차장 LAX-it에서만 탈 수 있고, 각 터미널 아래층에서 무료 셔틀로 갑니다. 내릴 때는 택시와 차량 호출 모두 위층 출발층 차도에서 바로 하차합니다."],
        avoidScams: [],
      },
      bus: { title: "버스", bullets: ["유니언 스테이션과 밴나이스행 FlyAway 직행버스가 위층 출발층에서 출발합니다."], avoidScams: [] },
      rail: { title: "메트로 / 경전철", bullets: ["무료 셔틀로 LAX/메트로 환승센터까지 가면 로스앤젤레스 메트로 철도와 버스로 갈아탈 수 있습니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "LAX — 접근성 안내", href: "https://www.flylax.com/lax-accessibility" }],
    },
    floorGuide: [
      { floor: "1~8터미널 위층", label: "출발 — 체크인, 차도 승하차" },
      { floor: "1~8터미널 아래층", label: "도착 — 수하물 수취, 픽업" },
      { floor: "TBIT(B터미널) 1층", label: "수하물 수취, 세관" },
      { floor: "TBIT(B터미널) 3층", label: "체크인" },
      { floor: "TBIT(B터미널) 4층", label: "보안검색, 출발" },
    ],
  },
  ORD: {
    terminals: ["제1터미널", "제2터미널", "제3터미널", "제5터미널(국제선)"],
    beforeYouFly: [],
    afterYouLand: ["국제선 도착은 거의 항상 5터미널입니다. 이어지는 국내선이 다른 터미널에서 출발하더라도 마찬가지이니, 도착과 출발 터미널을 모두 확인하세요."],
    transit: {
      taxi: { title: "택시", bullets: ["택시는 터미널마다 아래층 도착 차도에서 탈 수 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["Pace 광역버스가 ATS로 갈 수 있는 복합환승센터에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도(CTA 블루라인)", bullets: ["시카고 도심행 블루라인은 1·2·3터미널의 지하 통로에서 바로 이어지고, 5터미널에서는 ATS로 이동해 탑니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "시카고 항공국 — 접근성 안내", href: "https://www.flychicago.com/ohare/ServicesAmenities/accessibility/Pages/default.aspx" }],
    },
    floorGuide: [
      { floor: "1·2·3터미널 위층", label: "출발 — 체크인, 보안검색" },
      { floor: "1·2·3터미널 아래층", label: "도착 — 수하물 수취, 지상 교통" },
      { floor: "5터미널 아래층", label: "도착, 수하물 수취, ATS 승강장, 지상 교통" },
      { floor: "5터미널 2층", label: "체크인, 출발" },
    ],
  },
  MAD: {
    terminals: ["제1터미널", "제2터미널", "제3터미널", "제4터미널", "제4위성터미널(T4S)"],
    beforeYouFly: [],
    afterYouLand: ["항공편이 T1·T2·T3를 쓰는지 T4·T4S를 쓰는지 확인하세요. 서로 걸어서 갈 거리가 아니라 셔틀을 타야 합니다."],
    transit: {
      taxi: { title: "택시", bullets: ["공식 택시 승강장은 터미널마다 도착층 차도에 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["마드리드 도심행 공항 익스프레스 버스가 24시간 운행하며 T1·T2·T4에 섭니다."], avoidScams: [] },
      rail: { title: "철도(메트로)", bullets: ["메트로 8호선이 T1·T2·T3(Aeropuerto T1-T2-T3역)와 T4(Aeropuerto T4역)를 마드리드 도심과 잇습니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "Aena — 배리어프리 지원 서비스", href: "https://www.aena.es/en/passengers/travellers/passengers-with-medical-needs/barrier-free-assistance-service.html" }],
    },
    floorGuide: [
      { floor: "T1 지상층", label: "도착 — 수하물 수취" },
      { floor: "T1 1층", label: "출발 — 체크인" },
      { floor: "T4 0층", label: "도착 — 수하물 수취, 세관" },
      { floor: "T4 2층", label: "출발 — 체크인" },
      { floor: "T4S 지상층", label: "도착" },
      { floor: "T4S 1층", label: "출발, 상점, 식당" },
      { floor: "T4S 지하", label: "T4행 APM(자동 셔틀)" },
    ],
  },
  ZRH: {
    terminals: ["본관(체크인·도착 1 & 2)", "도크 E(비솅겐, 스카이메트로 이용)"],
    beforeYouFly: [],
    afterYouLand: ["안내판은 터미널 번호가 아니라 '도착 1' 또는 '도착 2'로 표시됩니다. 탑승권이나 운항 정보에서 어느 쪽인지 확인하세요."],
    transit: {
      taxi: { title: "택시", bullets: ["공식 택시는 도착홀 1·2의 실내 쪽 차도에서 잡을 수 있습니다."], avoidScams: [] },
      bus: { title: "버스", bullets: ["시내·시외 버스(플릭스버스 포함)가 에어포트 센터 밖 0층에 섭니다."], avoidScams: [] },
      rail: { title: "철도(SBB)", bullets: ["취리히 중앙역까지 직통으로 약 10~12분 걸리고, 에어포트 센터 아래 역에서 6~12분 간격으로 출발합니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "취리히공항 — 교통약자 여행 안내", href: "https://www.flughafen-zuerich.ch/en/passengers/fly/assistance/travelling-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "0층", label: "지상 교통(트램·버스), 도착 1 안내센터" },
      { floor: "1층", label: "체크인 1·2, 도착 1·2, A/B/D 게이트" },
      { floor: "2층", label: "추가 게이트, 상점, 공항 서비스" },
      { floor: "도크 E(스카이메트로)", label: "비솅겐 국제선 출발·도착 — 별도 건물" },
    ],
  },
  PVG: {
    terminals: ["제1터미널", "제2터미널", "위성 S1", "위성 S2"],
    beforeYouFly: [],
    afterYouLand: ["공항으로 출발하기 전에 T1인지 T2인지 확인하세요. 서로 떨어져 있고 일반구역에서 연결되지 않습니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["도착홀 밖 공식 승강장에서 미터 택시를 탈 수 있습니다. 자기부상열차가 '고장'이라며 다가오는 사람은 무시하세요. 비싼 택시로 유도하는 알려진 수법입니다."],
        avoidScams: ["자기부상열차 역 근처에서 '고장'이나 '기상 때문에 운행 중단'이라며 비싼 택시로 유도하는 호객. 자기부상열차는 매일 운행합니다."],
      },
      bus: { title: "버스", bullets: ["시내행 공항 셔틀버스가 24시간 운행합니다."], avoidScams: [] },
      rail: {
        title: "철도(메트로 / 자기부상)",
        bullets: [
          "메트로 2호선이 상하이 도심과 이어집니다(런민광창 방향은 광란루역에서 환승).",
          "상하이 자기부상열차로 룽양루역(메트로 2호선)까지 약 8분 걸리고, 역은 T1과 T2 사이 2층 통로에 있습니다.",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "상하이공항 — 제1터미널 안내", href: "https://www.shanghai-airport.com/terminal-1.php" }],
    },
    floorGuide: [
      { floor: "1층", label: "수하물 수취, 지상 교통(택시·버스·메트로)" },
      { floor: "2층", label: "도착홀, 환승, 자기부상열차 역(T1·T2 사이 통로)" },
      { floor: "3층", label: "출발 — 체크인, 보안검색" },
    ],
  },
  KUL: {
    terminals: ["KLIA(제1터미널)", "klia2(제2터미널)"],
    beforeYouFly: [],
    afterYouLand: ["항공편이 KLIA인지 klia2인지 확인하세요. 헷갈리는 사람이 많고, 걸어서 갈 거리가 아닙니다."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["도착 구역 카운터에서 선불 쿠폰 택시를 이용할 수 있습니다. 기사와 직접 흥정하지 말고 카운터에 목적지를 말하고 결제하세요."],
        avoidScams: [],
      },
      bus: { title: "버스", bullets: ["두 터미널 모두에서 여러 버스 회사가 KL 센트럴역까지 운행합니다."], avoidScams: [] },
      rail: { title: "철도(KLIA 익스프레스 / 트랜싯)", bullets: ["KL 센트럴행 직통 KLIA 익스프레스와 완행 KLIA 트랜싯이 두 터미널 지하 1층에서 출발합니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "두 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "말레이시아 공항공사 — KLIA 제1터미널 지도", href: "https://airports.malaysiaairports.com.my/en/klia1/map" }],
    },
    floorGuide: [
      { floor: "KLIA(T1) 5층", label: "출발 — 체크인(A~M 6개 구역, 216개 카운터)" },
      { floor: "KLIA(T1) 3층", label: "도착 — 수하물 수취, 입국심사, 세관" },
      { floor: "KLIA(T1) 1층", label: "KLIA 익스프레스·트랜싯 역" },
      { floor: "klia2(T2) 3층", label: "출발 — 체크인, 보안검색" },
    ],
  },
  GRU: {
    terminals: ["제1터미널(아줄, 국내선)", "제2터미널(국내선 + 남미 역내 국제선)", "제3터미널(장거리 국제선)"],
    beforeYouFly: [],
    afterYouLand: ["국제선에서 국내선으로 갈아탄다면 입국심사와 세관을 거쳐 수하물을 찾고 다시 체크인해야 합니다. 특히 3터미널에서 1·2터미널로 옮길 때는 시간을 넉넉히 잡으세요."],
    transit: {
      taxi: {
        title: "택시",
        bullets: ["공식 택시는 2터미널과 3터미널 지상층에 부스가 있습니다. 기사에게 직접 내지 말고 부스에서 결제하세요."],
        avoidScams: ["터미널 안에서 승객에게 다가오는 비공식 기사. 반드시 공식 부스만 이용하세요."],
      },
      bus: { title: "버스", bullets: ["파울리스타 대로, 치에테, 바하 푼다행 공항버스가 터미널별 도착층에서 출발합니다."], avoidScams: [] },
      rail: { title: "철도(CPTM 13호선)", bullets: ["가장 저렴하지만 상파울루 도심까지 가려면 환승해야 합니다."], avoidScams: [] },
    },
    accessibility: {
      summary: "휠체어나 이동 지원이 필요하면 출발 48시간 전까지 항공사에 연락하세요.",
      services: [
        { label: "휠체어 지원", detail: "항공사를 통해 미리 신청하세요." },
        { label: "장애인 화장실", detail: "모든 터미널 곳곳에 있습니다." },
      ],
      officialLinks: [{ label: "GRU 공항 — 터미널 안내", href: "https://www.gru.com.br/en/institutional/sobre-gru-airport/terminals" }],
    },
    floorGuide: [
      { floor: "전 터미널 지상 1층", label: "도착 — 수하물 수취, 세관(T1·T2·T3 공통)" },
      { floor: "제2터미널 2층", label: "출발 — 체크인, 보안검색. 제3터미널로 이어지는 연결 통로도 이 층입니다" },
      { floor: "제3터미널 3층", label: "출발 — 체크인, 보안검색" },
    ],
  },
};
