/**
 * The four short, high-traffic guide fields — airport name, city, country,
 * and the one-paragraph summary — in all four locales.
 *
 * Kept apart from lib/airportGuides.ts on purpose: /booking renders only
 * these (through AirportGuideCards), so importing them from a client
 * component must not drag the ~30KB-per-locale guide bodies into the
 * browser bundle. lib/airportGuides.ts composes the full guide from this
 * file plus the bodies, so nothing here is duplicated over there.
 */
import { DEFAULT_LOCALE, isLocale, type Locale } from "../i18n/locales";

export type AirportBrief = {
  iata: string;
  name: string;
  city: string;
  country: string;
  summary: string;
};

type BriefFields = Omit<AirportBrief, "iata">;

const DEFAULT_BRIEF: Record<Locale, (iata: string) => BriefFields> = {
  en: (iata) => ({
    name: `${iata} Airport`,
    city: "",
    country: "",
    summary:
      "Practical rules of thumb: follow official airport signage, prefer official taxi ranks or app pricing before you get in the car, and check the airport website for the latest bus or train maps.",
  }),
  ko: (iata) => ({
    name: `${iata} 공항`,
    city: "",
    country: "",
    summary:
      "기본만 지키면 됩니다. 공항 공식 안내판을 따라가고, 차에 타기 전에 공식 택시 승강장이나 앱 요금을 먼저 확인하고, 버스·기차 노선은 공항 홈페이지에서 최신 정보를 보세요.",
  }),
  ja: (iata) => ({
    name: `${iata} 空港`,
    city: "",
    country: "",
    summary:
      "基本を押さえておけば大丈夫です。空港の公式案内表示に従い、車に乗る前に公式タクシー乗り場かアプリの料金を確認し、バスや鉄道の路線は空港の公式サイトで最新情報を確かめてください。",
  }),
  zh: (iata) => ({
    name: `${iata} 机场`,
    city: "",
    country: "",
    summary:
      "记住几条基本原则就够了：跟着机场官方指示牌走，上车前先确认官方出租车候车点或叫车软件的报价，公交和轨道交通的线路以机场官网的最新信息为准。",
  }),
};

const BRIEFS: Record<string, Record<Locale, BriefFields>> = {
  ICN: {
    en: { name: "Incheon International Airport", city: "Seoul", country: "South Korea", summary: "Main gateway to Seoul with clear signage in Korean and English. AREX trains and airport buses connect to the city; taxis use meter or flat fares from official ranks." },
    ko: { name: "인천국제공항", city: "서울", country: "대한민국", summary: "서울로 들어가는 관문이고, 안내판이 한국어·영어로 잘 되어 있습니다. 공항철도와 공항버스로 시내까지 이어지고, 택시는 공식 승강장에서 미터기나 정액 요금으로 탑니다." },
    ja: { name: "仁川国際空港", city: "ソウル", country: "韓国", summary: "ソウルへの玄関口で、案内表示は韓国語と英語で分かりやすく整備されています。空港鉄道（AREX）と空港バスが市内とつながり、タクシーは公式乗り場からメーターまたは定額運賃で利用できます。" },
    zh: { name: "仁川国际机场", city: "首尔", country: "韩国", summary: "进出首尔的主要门户，韩英双语指示牌清晰。机场铁路（AREX）和机场巴士直达市区，出租车在官方候车点按计价器或固定价计费。" },
  },
  NRT: {
    en: { name: "Narita International Airport", city: "Tokyo", country: "Japan", summary: "Major Tokyo gateway. Narita Express (N’EX), Keisei Skyliner, and airport buses compete with taxis at different price/speed tradeoffs." },
    ko: { name: "나리타국제공항", city: "도쿄", country: "일본", summary: "도쿄의 주요 관문입니다. 나리타 익스프레스(N’EX), 게이세이 스카이라이너, 공항버스, 택시가 각각 가격과 속도의 균형이 다릅니다." },
    ja: { name: "成田国際空港", city: "東京", country: "日本", summary: "東京の主要な玄関口です。成田エクスプレス（N’EX）、京成スカイライナー、空港バス、タクシーがそれぞれ料金と所要時間のバランスで選べます。" },
    zh: { name: "成田国际机场", city: "东京", country: "日本", summary: "东京的主要门户。成田特快（N’EX）、京成 Skyliner、机场巴士和出租车各有不同的价格与时间取舍。" },
  },
  HND: {
    en: { name: "Haneda Airport", city: "Tokyo", country: "Japan", summary: "Closer to central Tokyo than Narita; strong rail links (Tokyo Monorail, Keikyu) and taxi ranks by terminal." },
    ko: { name: "하네다공항", city: "도쿄", country: "일본", summary: "나리타보다 도쿄 도심에 가깝습니다. 도쿄 모노레일과 게이큐선 등 철도 연결이 좋고, 터미널마다 택시 승강장이 있습니다." },
    ja: { name: "羽田空港", city: "東京", country: "日本", summary: "成田より都心に近い空港です。東京モノレールと京急線の鉄道アクセスが充実しており、タクシー乗り場も各ターミナルにあります。" },
    zh: { name: "羽田机场", city: "东京", country: "日本", summary: "比成田更靠近东京市中心。东京单轨电车和京急线的轨道交通衔接良好，各航站楼都设有出租车候车点。" },
  },
  JFK: {
    en: { name: "John F. Kennedy International Airport", city: "New York", country: "USA", summary: "Large multi-terminal airport; AirTrain connects terminals and links to NYC subway and LIRR at Jamaica or Howard Beach." },
    ko: { name: "존 F. 케네디 국제공항", city: "뉴욕", country: "미국", summary: "터미널이 여러 개인 큰 공항입니다. 에어트레인이 터미널을 연결하고, 자메이카역이나 하워드비치역에서 뉴욕 지하철과 LIRR로 갈아탑니다." },
    ja: { name: "ジョン・F・ケネディ国際空港", city: "ニューヨーク", country: "アメリカ", summary: "ターミナルが複数ある大規模空港です。エアトレインが各ターミナルを結び、ジャマイカ駅またはハワードビーチ駅でニューヨーク地下鉄・LIRR に乗り換えられます。" },
    zh: { name: "约翰·肯尼迪国际机场", city: "纽约", country: "美国", summary: "航站楼众多的大型机场。AirTrain 连接各航站楼，并在牙买加站或霍华德海滩站换乘纽约地铁和长岛铁路（LIRR）。" },
  },
  LHR: {
    en: { name: "Heathrow Airport", city: "London", country: "UK", summary: "Heathrow Express and Elizabeth Line offer fast central London links; black cabs and licensed minicabs use regulated pricing." },
    ko: { name: "히스로공항", city: "런던", country: "영국", summary: "히스로 익스프레스와 엘리자베스 라인으로 런던 도심까지 빠르게 갈 수 있습니다. 블랙캡과 정식 미니캡은 규제 요금으로 운행합니다." },
    ja: { name: "ヒースロー空港", city: "ロンドン", country: "イギリス", summary: "ヒースロー・エクスプレスとエリザベス線でロンドン中心部へ短時間で移動できます。ブラックキャブと認可ミニキャブは規制された料金体系です。" },
    zh: { name: "希思罗机场", city: "伦敦", country: "英国", summary: "希思罗快线和伊丽莎白线可快速直达伦敦市中心。黑色出租车和持牌 minicab 均按受监管的价格计费。" },
  },
  SIN: {
    en: { name: "Singapore Changi Airport", city: "Singapore", country: "Singapore", summary: "Consistently rated one of the world's best airports; Jewel Changi connects landside to Terminals 1, 2, and 3." },
    ko: { name: "싱가포르 창이공항", city: "싱가포르", country: "싱가포르", summary: "세계 최고 수준으로 꾸준히 꼽히는 공항입니다. 주얼 창이가 일반구역에서 1·2·3터미널을 이어 줍니다." },
    ja: { name: "シンガポール・チャンギ空港", city: "シンガポール", country: "シンガポール", summary: "世界最高水準と評価され続けている空港です。ジュエル・チャンギが一般エリア側で第1・第2・第3ターミナルをつないでいます。" },
    zh: { name: "新加坡樟宜机场", city: "新加坡", country: "新加坡", summary: "长期位居全球最佳机场之列。星耀樟宜在非管制区连通 1、2、3 号航站楼。" },
  },
  AMS: {
    en: { name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "Netherlands", summary: "A single-terminal airport — everything is under one roof, organized into three departure halls (1, 2, 3) rather than separate terminal buildings." },
    ko: { name: "암스테르담 스히폴공항", city: "암스테르담", country: "네덜란드", summary: "터미널이 하나뿐인 공항입니다. 건물이 따로 나뉘어 있지 않고, 한 지붕 아래에서 출발 홀 1·2·3으로만 구분됩니다." },
    ja: { name: "アムステルダム・スキポール空港", city: "アムステルダム", country: "オランダ", summary: "ターミナルが一つだけの空港です。建物が分かれておらず、同じ屋根の下で出発ホール 1・2・3 に分かれているだけです。" },
    zh: { name: "阿姆斯特丹史基浦机场", city: "阿姆斯特丹", country: "荷兰", summary: "只有一座航站楼的机场。所有设施都在同一屋檐下，只按 1、2、3 号出发大厅划分，而不是分成独立的航站楼。" },
  },
  HKG: {
    en: { name: "Hong Kong International Airport", city: "Hong Kong", country: "Hong Kong", summary: "Terminal 1 is Y-shaped and one of the world's largest enclosed spaces; an Automated People Mover (APM) connects distant gate areas." },
    ko: { name: "홍콩국제공항", city: "홍콩", country: "홍콩", summary: "1터미널은 Y자 구조로, 실내 공간 기준 세계에서 가장 큰 건물 중 하나입니다. 멀리 떨어진 게이트 구역은 자동 셔틀(APM)로 이동합니다." },
    ja: { name: "香港国際空港", city: "香港", country: "香港", summary: "第1ターミナルは Y 字型で、屋内空間としては世界最大級です。離れた搭乗ゲートへは自動シャトル（APM）で移動します。" },
    zh: { name: "香港国际机场", city: "香港", country: "中国香港", summary: "1 号客运大楼呈 Y 字形，是全球最大的室内空间之一。较远的登机区之间由旅客捷运系统（APM）连接。" },
  },
  DXB: {
    en: { name: "Dubai International Airport", city: "Dubai", country: "United Arab Emirates", summary: "One of the world's busiest hubs; Emirates operates from Terminal 3, the world's largest airport terminal by floor area. Terminal 1 serves most other international airlines, Terminal 2 mainly regional/budget carriers." },
    ko: { name: "두바이국제공항", city: "두바이", country: "아랍에미리트", summary: "세계에서 가장 붐비는 허브 중 하나입니다. 에미레이트는 연면적 기준 세계 최대 터미널인 3터미널을 씁니다. 1터미널은 나머지 국제선 대부분, 2터미널은 주로 역내·저비용 항공사가 사용합니다." },
    ja: { name: "ドバイ国際空港", city: "ドバイ", country: "アラブ首長国連邦", summary: "世界有数の混雑するハブ空港です。エミレーツ航空は延床面積で世界最大のターミナルである第3ターミナルを使用します。第1ターミナルはその他の国際線の大半、第2ターミナルは主に近距離・格安航空会社が使います。" },
    zh: { name: "迪拜国际机场", city: "迪拜", country: "阿联酋", summary: "全球最繁忙的枢纽之一。阿联酋航空使用 3 号航站楼——按建筑面积计为全球最大的机场航站楼。1 号航站楼服务其他大部分国际航司，2 号航站楼主要是区域和廉航。" },
  },
  BKK: {
    en: { name: "Suvarnabhumi Airport", city: "Bangkok", country: "Thailand", summary: "Thailand's main international gateway; a single terminal building stacked over multiple levels, with a newer satellite terminal (SAT-1) reached by automated people mover." },
    ko: { name: "수완나품공항", city: "방콕", country: "태국", summary: "태국의 대표 국제공항입니다. 터미널은 한 동이지만 층별로 기능이 나뉘어 있고, 새로 생긴 위성 터미널(SAT-1)은 자동 셔틀로 갑니다." },
    ja: { name: "スワンナプーム国際空港", city: "バンコク", country: "タイ", summary: "タイの主要な国際空港です。ターミナルは1棟ですが機能が階ごとに分かれており、新しいサテライトターミナル（SAT-1）へは自動シャトルで移動します。" },
    zh: { name: "素万那普机场", city: "曼谷", country: "泰国", summary: "泰国主要的国际门户。只有一座航站楼，但功能按楼层划分，较新的卫星厅（SAT-1）需乘坐旅客捷运前往。" },
  },
  IST: {
    en: { name: "Istanbul Airport", city: "Istanbul", country: "Turkey", summary: "A single massive terminal building (one of the largest in the world) with five concourses (A, B, D, F international; G domestic) — no internal train between them, all connected on foot." },
    ko: { name: "이스탄불공항", city: "이스탄불", country: "튀르키예", summary: "세계에서 손꼽히게 큰 단일 터미널로, 콘코스가 다섯 개(A·B·D·F는 국제선, G는 국내선)입니다. 콘코스 사이를 잇는 내부 열차는 없고 전부 걸어서 이동합니다." },
    ja: { name: "イスタンブール空港", city: "イスタンブール", country: "トルコ", summary: "世界最大級の単一ターミナルで、コンコースは5つ（A・B・D・F が国際線、G が国内線）です。コンコース間を結ぶ内部列車はなく、すべて徒歩で移動します。" },
    zh: { name: "伊斯坦布尔机场", city: "伊斯坦布尔", country: "土耳其", summary: "全球规模最大的单体航站楼之一，共五个指廊（A、B、D、F 为国际，G 为国内）。指廊之间没有内部摆渡列车，全部步行连通。" },
  },
  TPE: {
    en: { name: "Taiwan Taoyuan International Airport", city: "Taipei", country: "Taiwan", summary: "Two terminals connected by Skytrain and MRT — Terminal 1 (mainly regional/low-cost carriers) and Terminal 2 (long-haul and premium airlines), both following the same basic floor pattern." },
    ko: { name: "타이완 타오위안 국제공항", city: "타이베이", country: "대만", summary: "터미널 두 곳이 스카이트레인과 공항 MRT로 연결됩니다. 1터미널은 주로 역내·저비용 항공사, 2터미널은 장거리·대형 항공사가 쓰며, 층 구성은 두 곳이 거의 같습니다." },
    ja: { name: "台湾桃園国際空港", city: "台北", country: "台湾", summary: "2つのターミナルがスカイトレインと空港 MRT で結ばれています。第1ターミナルは主に近距離・格安航空会社、第2ターミナルは長距離・大手航空会社が使い、フロア構成はほぼ共通です。" },
    zh: { name: "台湾桃园国际机场", city: "台北", country: "台湾", summary: "两座航站楼由 Skytrain 和机场捷运连接。第一航厦以区域和廉价航空为主，第二航厦以长途和大型航空为主，两者楼层布局基本一致。" },
  },
  SYD: {
    en: { name: "Sydney Kingsford Smith Airport", city: "Sydney", country: "Australia", summary: "Terminal 1 (International) is physically separate from the domestic terminals (T2/T3) and requires a train, shuttle bus, or taxi to transfer between them — walking is not practical." },
    ko: { name: "시드니 킹스포드 스미스 공항", city: "시드니", country: "호주", summary: "국제선인 1터미널이 국내선 터미널(T2·T3)과 완전히 떨어져 있습니다. 오갈 때는 기차나 셔틀버스, 택시를 써야 하고 걸어서 이동하기는 어렵습니다." },
    ja: { name: "シドニー国際空港（キングスフォード・スミス）", city: "シドニー", country: "オーストラリア", summary: "国際線の第1ターミナルは国内線ターミナル（T2・T3）と完全に離れています。移動には鉄道かシャトルバス、タクシーが必要で、徒歩での移動は現実的ではありません。" },
    zh: { name: "悉尼金斯福德·史密斯机场", city: "悉尼", country: "澳大利亚", summary: "国际航站楼（T1）与国内航站楼（T2/T3）完全分开，往返需乘火车、摆渡巴士或出租车，步行并不可行。" },
  },
  FRA: {
    en: { name: "Frankfurt Airport", city: "Frankfurt", country: "Germany", summary: "Two terminals, each split into concourses with their own floor numbering — Terminal 1's concourses (A, B, C, Z) don't share a single 'arrivals is floor X' answer, so check your specific concourse below rather than assuming." },
    ko: { name: "프랑크푸르트공항", city: "프랑크푸르트", country: "독일", summary: "터미널 두 곳이 각각 콘코스로 나뉘고, 콘코스마다 층 번호 체계가 다릅니다. 1터미널의 A·B·C·Z 콘코스는 '도착은 몇 층'이라고 하나로 말할 수 없으니, 아래에서 본인 콘코스를 직접 확인하세요." },
    ja: { name: "フランクフルト空港", city: "フランクフルト", country: "ドイツ", summary: "2つのターミナルがそれぞれコンコースに分かれ、コンコースごとに階の番号体系が異なります。第1ターミナルの A・B・C・Z は「到着は何階」と一言で言えないため、下で自分のコンコースを確認してください。" },
    zh: { name: "法兰克福机场", city: "法兰克福", country: "德国", summary: "两座航站楼各自分为若干指廊，每个指廊的楼层编号并不统一。1 号航站楼的 A、B、C、Z 指廊无法用一句“到达在几层”概括，请在下方查看你所在的具体指廊。" },
  },
  MUC: {
    en: { name: "Munich Airport", city: "Munich", country: "Germany", summary: "Terminal 1 is split into six largely-independent modules (A–F) that don't share one floor scheme — some handle both arrivals and departures, one (E) is arrivals-only, one (F) is a separate high-security building. Terminal 2 is simpler and mainly serves Lufthansa/Star Alliance." },
    ko: { name: "뮌헨공항", city: "뮌헨", country: "독일", summary: "1터미널은 사실상 독립된 모듈 여섯 개(A~F)로 나뉘고 층 구성이 제각각입니다. 출발과 도착을 함께 처리하는 곳도 있고, E는 도착 전용, F는 보안 등급이 높은 별도 건물입니다. 2터미널은 구조가 단순하고 주로 루프트한자·스타얼라이언스가 씁니다." },
    ja: { name: "ミュンヘン空港", city: "ミュンヘン", country: "ドイツ", summary: "第1ターミナルは事実上独立した6つのモジュール（A〜F）に分かれ、階の構成もそれぞれ異なります。出発と到着を同じ階で扱うモジュールもあれば、E は到着専用、F はセキュリティレベルの高い別棟です。第2ターミナルは構造が単純で、主にルフトハンザとスターアライアンスが使います。" },
    zh: { name: "慕尼黑机场", city: "慕尼黑", country: "德国", summary: "1 号航站楼分为六个相对独立的模块（A–F），楼层安排各不相同：有的模块出发到达同层，E 只办到达，F 是安保等级更高的独立建筑。2 号航站楼结构简单，主要供汉莎和星空联盟使用。" },
  },
  CDG: {
    en: { name: "Paris Charles de Gaulle Airport", city: "Paris", country: "France", summary: "A genuinely complex airport — Terminal 2 alone splits into seven sub-terminals (2A–2G) with their own layouts, Terminal 1 has an unusual circular design, and Terminal 3 is a single small building. Confirm your specific sub-terminal, not just 'Terminal 2'." },
    ko: { name: "파리 샤를드골공항", city: "파리", country: "프랑스", summary: "실제로 복잡한 공항입니다. 2터미널만 해도 2A~2G 일곱 개로 나뉘고 각각 구조가 다릅니다. 1터미널은 원형 구조라 독특하고, 3터미널은 작은 단일 건물입니다. '2터미널'까지만 보지 말고 세부 번호까지 확인하세요." },
    ja: { name: "パリ・シャルル・ド・ゴール空港", city: "パリ", country: "フランス", summary: "実際に構造が複雑な空港です。第2ターミナルだけで 2A〜2G の7つに分かれ、それぞれ配置が異なります。第1ターミナルは円形の独特な構造、第3ターミナルは小さな単一の建物です。「第2ターミナル」までではなく、枝番まで必ず確認してください。" },
    zh: { name: "巴黎戴高乐机场", city: "巴黎", country: "法国", summary: "确实是一座结构复杂的机场。仅 2 号航站楼就分为 2A–2G 七个子航站楼，各自布局不同；1 号航站楼是少见的环形设计，3 号航站楼则是一栋小型独立建筑。别只看“2 号航站楼”，一定要确认具体子编号。" },
  },
  LAX: {
    en: { name: "Los Angeles International Airport", city: "Los Angeles", country: "United States", summary: "A U-shaped airport — 9 terminals (1–8 plus Tom Bradley International, 'Terminal B') around a two-level central roadway. The upper/lower split is consistent across all terminals except TBIT, which has its own multi-level scheme." },
    ko: { name: "로스앤젤레스 국제공항", city: "로스앤젤레스", country: "미국", summary: "U자 형태로, 2층 구조의 중앙 도로를 따라 터미널 아홉 개(1~8번과 톰 브래들리 국제선 터미널 'B')가 늘어서 있습니다. 위층 출발·아래층 도착 구조가 모든 터미널에 똑같이 적용되지만, TBIT만 자체 층 체계를 씁니다." },
    ja: { name: "ロサンゼルス国際空港", city: "ロサンゼルス", country: "アメリカ", summary: "U 字型の空港で、2層構造の中央道路に沿って9つのターミナル（1〜8 とトム・ブラッドリー国際線ターミナル「B」）が並びます。上階が出発・下階が到着という構成は全ターミナル共通ですが、TBIT だけは独自の階構成です。" },
    zh: { name: "洛杉矶国际机场", city: "洛杉矶", country: "美国", summary: "呈 U 字形，九座航站楼（1–8 号加汤姆·布莱德利国际航站楼“B”）环绕双层中央车道。上层出发、下层到达的划分在各航站楼一致，只有 TBIT 使用自己的楼层体系。" },
  },
  ORD: {
    en: { name: "Chicago O'Hare International Airport", city: "Chicago", country: "United States", summary: "Terminals 1, 2, and 3 (domestic) are physically connected by walkways and share the same simple upper/lower pattern. Terminal 5 (international) is about a mile away with no walkway — a free Airport Transit System (ATS) train is required to reach it." },
    ko: { name: "시카고 오헤어 국제공항", city: "시카고", country: "미국", summary: "국내선인 1·2·3터미널은 통로로 연결되어 있고 위층 출발·아래층 도착으로 구조가 단순합니다. 국제선 5터미널은 1.5km쯤 떨어져 있고 도보 통로가 없어, 무료 공항 순환열차(ATS)를 타야 합니다." },
    ja: { name: "シカゴ・オヘア国際空港", city: "シカゴ", country: "アメリカ", summary: "国内線の第1・2・3ターミナルは通路でつながっており、上階が出発・下階が到着とシンプルです。国際線の第5ターミナルは約1.5km離れていて徒歩通路がなく、無料の空港連絡列車（ATS）で移動します。" },
    zh: { name: "芝加哥奥黑尔国际机场", city: "芝加哥", country: "美国", summary: "国内航站楼 1、2、3 由连廊相通，均为上层出发、下层到达的简单结构。国际航站楼 5 号距离约 1.5 公里且没有步行通道，须乘坐免费的机场捷运（ATS）前往。" },
  },
  MAD: {
    en: { name: "Adolfo Suárez Madrid–Barajas Airport", city: "Madrid", country: "Spain", summary: "Terminals 1, 2, and 3 are grouped together (walkable, no immigration/customs between them) — Terminal 4 and its satellite T4S are a separate complex, connected only by a free shuttle bus or underground train (APM)." },
    ko: { name: "마드리드 바라하스 아돌포 수아레스 공항", city: "마드리드", country: "스페인", summary: "1·2·3터미널은 한데 붙어 있어 걸어서 오갈 수 있고 사이에 출입국 심사도 없습니다. 4터미널과 위성 터미널 T4S는 별도 단지라 무료 셔틀버스나 지하 셔틀(APM)로만 연결됩니다." },
    ja: { name: "マドリード・バラハス空港", city: "マドリード", country: "スペイン", summary: "第1・2・3ターミナルは隣接していて徒歩で移動でき、間に出入国審査もありません。第4ターミナルとサテライトの T4S は別棟で、無料シャトルバスか地下シャトル（APM）でのみつながっています。" },
    zh: { name: "马德里巴拉哈斯机场", city: "马德里", country: "西班牙", summary: "1、2、3 号航站楼连成一片，可步行往来，中间也没有边检。4 号航站楼及其卫星厅 T4S 是独立建筑群，只能靠免费摆渡巴士或地下捷运（APM）连接。" },
  },
  ZRH: {
    en: { name: "Zurich Airport", city: "Zurich", country: "Switzerland", summary: "Effectively a single terminal (the old separate terminals were merged, with one shared security checkpoint), organized as Check-in 1/Arrivals 1 and Check-in 2/Arrivals 2 within the same building, plus a separate Dock E for most international/non-Schengen flights reached by an underground SkyMetro train." },
    ko: { name: "취리히공항", city: "취리히", country: "스위스", summary: "사실상 터미널이 하나입니다. 예전에 나뉘어 있던 터미널이 합쳐지면서 보안검색도 한 곳으로 통합됐고, 같은 건물 안에서 체크인 1/도착 1과 체크인 2/도착 2로만 나뉩니다. 비셴겐 국제선 대부분은 지하 스카이메트로로 가는 별도 건물인 도크 E를 씁니다." },
    ja: { name: "チューリッヒ空港", city: "チューリッヒ", country: "スイス", summary: "実質的にターミナルは1つです。かつて分かれていたターミナルが統合され保安検査も1か所になり、同じ建物内でチェックイン1／到着1とチェックイン2／到着2に分かれるだけです。非シェンゲンの国際線の多くは、地下のスカイメトロで向かう別棟のドック E を使います。" },
    zh: { name: "苏黎世机场", city: "苏黎世", country: "瑞士", summary: "实际上只有一座航站楼。原先分开的航站楼已合并，安检也统一为一处，同一栋楼内只分为值机 1/到达 1 与值机 2/到达 2。大部分非申根国际航班使用独立的 E 指廊，需乘地下 SkyMetro 前往。" },
  },
  PVG: {
    en: { name: "Shanghai Pudong International Airport", city: "Shanghai", country: "China", summary: "Two large terminals (T1, T2) plus satellite concourses S1 and S2 reached by underground people mover — landside transfer between T1 and T2 requires exiting and re-entering (they're not connected pre-security)." },
    ko: { name: "상하이 푸둥 국제공항", city: "상하이", country: "중국", summary: "큰 터미널 두 곳(T1·T2)과 지하 셔틀로 가는 위성 콘코스 S1·S2로 이루어져 있습니다. T1과 T2는 보안구역 안에서 이어지지 않아, 일반구역으로 나갔다가 다시 들어가야 합니다." },
    ja: { name: "上海浦東国際空港", city: "上海", country: "中国", summary: "大型ターミナル2棟（T1・T2）と、地下シャトルで向かうサテライトコンコース S1・S2 で構成されます。T1 と T2 は保安検査エリア内でつながっていないため、一度出て入り直す必要があります。" },
    zh: { name: "上海浦东国际机场", city: "上海", country: "中国", summary: "由两座大型航站楼（T1、T2）以及需乘地下捷运前往的 S1、S2 卫星厅组成。T1 与 T2 在安检区内并不连通，中转需先出到公共区再重新进入。" },
  },
  KUL: {
    en: { name: "Kuala Lumpur International Airport", city: "Kuala Lumpur", country: "Malaysia", summary: "Two separate terminals: KLIA (Terminal 1, full-service airlines) and klia2 (Terminal 2, mainly AirAsia and other budget carriers) — they're a distance apart, connected by a free shuttle bus or the KLIA Ekspres/Transit train." },
    ko: { name: "쿠알라룸푸르 국제공항", city: "쿠알라룸푸르", country: "말레이시아", summary: "터미널이 두 곳으로 완전히 나뉩니다. KLIA(1터미널)는 대형 항공사, klia2(2터미널)는 주로 에어아시아 등 저비용 항공사가 씁니다. 서로 떨어져 있어 무료 셔틀버스나 KLIA 익스프레스·트랜싯 열차로 오갑니다." },
    ja: { name: "クアラルンプール国際空港", city: "クアラルンプール", country: "マレーシア", summary: "ターミナルは完全に2つに分かれています。KLIA（第1ターミナル）はフルサービス航空会社、klia2（第2ターミナル）は主にエアアジアなどの格安航空会社が使用します。距離が離れており、無料シャトルバスか KLIA エクスプレス／トランジットで移動します。" },
    zh: { name: "吉隆坡国际机场", city: "吉隆坡", country: "马来西亚", summary: "两座完全独立的航站楼：KLIA（第一航站楼，全服务航司）与 klia2（第二航站楼，以亚航等廉航为主）。两者相距较远，靠免费摆渡巴士或 KLIA Ekspres/Transit 列车连接。" },
  },
  GRU: {
    en: { name: "São Paulo/Guarulhos International Airport", city: "São Paulo", country: "Brazil", summary: "Three terminals: Terminal 3 handles most international long-haul flights, Terminal 2 handles most domestic and regional South American flights, Terminal 1 (Azul only) is smallest and physically separate. T2 and T3 are connected by a walkway; T1 requires a shuttle bus." },
    ko: { name: "상파울루 구아룰류스 국제공항", city: "상파울루", country: "브라질", summary: "터미널이 세 곳입니다. 3터미널은 장거리 국제선 대부분, 2터미널은 국내선과 남미 역내 노선 대부분, 1터미널은 아줄 전용으로 가장 작고 따로 떨어져 있습니다. T2와 T3는 통로로 이어지고, T1은 셔틀버스로 가야 합니다." },
    ja: { name: "サンパウロ・グアルーリョス国際空港", city: "サンパウロ", country: "ブラジル", summary: "ターミナルは3つです。第3ターミナルが長距離国際線の大半、第2ターミナルが国内線と南米域内路線の大半を扱い、第1ターミナル（アズール専用）は最も小さく離れた場所にあります。T2 と T3 は通路でつながり、T1 へはシャトルバスが必要です。" },
    zh: { name: "圣保罗瓜鲁柳斯国际机场", city: "圣保罗", country: "巴西", summary: "共三座航站楼：3 号航站楼承担大部分长途国际航班，2 号航站楼承担大部分国内和南美区域航班，1 号航站楼（仅蓝色航空）最小且位置独立。T2 与 T3 由连廊相通，前往 T1 需乘摆渡巴士。" },
  },
};

export function getAirportBrief(iata: string, locale?: string): AirportBrief {
  const code = iata.trim().toUpperCase();
  const loc: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const fields = BRIEFS[code]?.[loc] ?? DEFAULT_BRIEF[loc](code);
  return { iata: code, ...fields };
}

/** IATA codes with a curated brief — the same set lib/airportGuides.ts curates. */
export function getBriefedAirportCodes(): string[] {
  return Object.keys(BRIEFS);
}

/**
 * Like getAirportBrief, but null for airports we have NOT hand-curated,
 * instead of the generic "ICN 공항" placeholder.
 *
 * Callers that display an airport from the 7,917-entry dataset must use this:
 * the placeholder is fine as a page-level fallback (the guide route always
 * renders *something*), but in the search autocomplete it would overwrite a
 * real name like "Hartsfield Jackson Atlanta International Airport" with an
 * invented one — exactly the §2-1 breach I5-4 set out to avoid.
 */
export function getCuratedBrief(iata: string, locale?: string): AirportBrief | null {
  const code = iata.trim().toUpperCase();
  if (!BRIEFS[code]) return null;
  return getAirportBrief(code, locale);
}
