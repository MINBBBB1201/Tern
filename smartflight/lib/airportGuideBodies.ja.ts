import type { AirportGuideBody } from "./airportGuides";

/** Japanese guide bodies. Names/summaries live in lib/airportBrief.ts. */
export const DEFAULT_BODY_JA: AirportGuideBody = {
  terminals: ["利用ターミナルは変更されることがあります。空港の公式サイトでご確認ください。"],
  beforeYouFly: [
    "国際線は2時間前の到着が目安です。繁忙期に空港が推奨している場合は3時間みておきましょう。",
    "Wi-Fi が不安定なこともあるので、都市と空港の地図はオフライン保存しておくと安心です。",
  ],
  afterYouLand: [
    "現金が必要なら少額だけ引き出せば十分です。カードで済む都市がほとんどです。",
    "配車アプリや鉄道アプリは、空港の公式 Wi-Fi かモバイル回線で開いてください。偽のログイン画面を避けられます。",
  ],
  transit: {
    taxi: {
      title: "タクシー",
      bullets: [
        "公式タクシー乗り場か正規の待機列を使い、手荷物受取所で声をかけてくる運転手は避けてください。",
        "乗車前に、メーターを使うか、アプリや定額運賃が掲示と一致しているかを確認しましょう。",
        "深夜はナンバープレートを撮っておき、信頼できる相手に現在地を共有しておくと安心です。",
      ],
      avoidScams: [
        "配車アプリの2〜3倍の額を「定額」として提示してくるケース。",
        "メーターを断る、あるいは正規乗り場が「閉まっている」と言う運転手。",
        "到着通路で強引に勧めてくる非公式の「空港送迎」カウンター。",
      ],
    },
    bus: {
      title: "バス",
      bullets: [
        "空港バスは到着階の外にある表示された乗り場から出発します。車体の路線番号を確認してください。",
        "きっぷは公式の券売機・カウンター、または空港サイトからリンクされたアプリで購入しましょう。",
      ],
      avoidScams: ["きっぷは券売機か公式カウンターでのみ購入し、「割引券」を売る人には応じないでください。"],
    },
    rail: {
      title: "鉄道 / 地下鉄",
      bullets: [
        "「Train」「Rail」「Metro」の表示に従ってください。タクシー乗り場とは別の建物にあることが多いです。",
        "到着が遅い場合は終電を確認しましょう。深夜は鉄道の代わりに空港バスが走ることもあります。",
      ],
      avoidScams: ["不要なシャトルのパッケージを勧めてくる偽の案内ブース。"],
    },
  },
  accessibility: {
    summary:
      "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。実際の対応は空港が行いますが、申し込みは航空会社経由で受け付けられます。主要な国際空港の多くは、車いすの無料貸し出し、多目的トイレ、保安検査からゲートまでの係員による付き添いを用意しています。",
    services: [
      { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。多くの空港では、当日利用できる貸し出し用車いすも案内カウンターに用意されています。" },
      { label: "多目的トイレ", detail: "ほとんどのターミナル内の各所にあります。係員に尋ねるか、ターミナルマップでご確認ください。" },
      { label: "補助犬の同伴", detail: "基本的に受け入れられていますが、出発前に航空会社と到着国の書類要件を確認してください。" },
    ],
    officialLinks: [],
  },
};

export const BODIES_JA: Record<string, AirportGuideBody> = {
  ICN: {
    terminals: ["第1旅客ターミナル", "第2旅客ターミナル"],
    beforeYouFly: [
      "利用航空会社が T1 か T2 かを確認してください。ターミナルを移った会社があります。",
      "保安検査は余裕をもって。繁忙期は出入国審査の列が長くなります。",
    ],
    afterYouLand: [
      "空港鉄道（AREX）の直通・各駅停車がソウル駅までつながっています。手荷物受取後、案内表示に従ってください。",
      "空港リムジンバスが到着階の外から、ソウル各地へ運行しています。",
    ],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: [
          "到着階の外にある公式タクシー乗り場をご利用ください。一般・模範・大型で列が分かれています。",
          "国際タクシーは主要エリアまで定額に近い運賃が設定されています。掲示された運賃表で確認してください。",
          "カカオTなどの配車アプリも問題なく使えます。空港が指定する配車エリアがあれば、そこで手配しましょう。",
        ],
        avoidScams: ["到着ロビー内で声をかけてくる非公式の勧誘は無視し、公式乗り場か使い慣れたアプリだけを利用してください。"],
        officialLinks: [{ label: "仁川国際空港公社 旅客案内", href: "https://www.airport.kr/" }],
      },
      bus: {
        title: "空港バス",
        bullets: [
          "リムジンバスが江南・明洞・弘大などの主要拠点へ運行しています。きっぷは出口付近のカウンターで購入します。",
          "各乗り場の電光掲示板に路線番号と待ち時間が表示されます。",
        ],
        avoidScams: [],
      },
      rail: {
        title: "空港鉄道 / 地下鉄",
        bullets: [
          "直通列車はソウル駅まで速く、各駅停車は弘大入口など途中駅にすべて停まります。",
          "宿泊先に合わせて、ソウル駅か弘大入口でソウル地下鉄に乗り換えてください。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "世界でもっともバリアフリーが整った空港のひとつとされています。電動・パワーアシスト車いすまで無料で貸し出し、交通弱者向けの優先レーンがあり、長期駐車場とターミナル間は電気自動車で無料送迎しています。",
      services: [
        { label: "車いすの貸し出し", detail: "第1ターミナル3階、7番・8番出口の外で手動・電動車いすを無料で借りられます。各所のヘルプ電話は最寄りの案内カウンターに直接つながります。" },
        { label: "交通弱者向け優先レーン", detail: "航空会社のチェックインカウンターで対象かどうかを確認し、優先カードを受け取ってから専用の保安検査レーンをご利用ください。" },
        { label: "電気自動車での送迎", detail: "車いす利用者は、長期駐車場とターミナル間を電気自動車で無料移動できます。" },
      ],
      officialLinks: [{ label: "仁川空港 交通弱者向けサービス", href: "https://www.airport.kr/ap_en/1478/subview.do" }],
    },
    transitTips: [
      "両ターミナルとも保安検査エリア内に無料シャワーがあります（タオル・アメニティは持参）。有料のトランジットラウンジのシャワー（T1 は25・29番ゲート付近、T2 は231・268番ゲート付近）にはタオル、シャンプー、ボディソープが付いています。",
      "第1・第2ターミナルのトランジットホテルなら、入国審査を受けずに日中の客室を利用できます。長い乗り継ぎに便利です。",
      "複数のラウンジが、エコノミー利用でも当日パスやプライオリティ・パス／ドラゴンパスの会員資格で入れます。",
    ],
  },
  NRT: {
    terminals: ["第1ターミナル", "第2ターミナル", "第3ターミナル"],
    beforeYouFly: ["第3ターミナルは主に LCC が利用します。ターミナル間の徒歩距離とシャトルバスを事前に確認してください。"],
    afterYouLand: [
      "N’EX は JR、スカイライナーは京成と券売機が別です。床の案内表示に従ってください。",
      "市内に着いたあとは、Suica や PASMO などの IC カードが電車にもバスにも便利です。",
    ],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: [
          "主要エリア向けの定額タクシーがあります。並ぶ前に公式タクシー案内カウンターで確認しましょう。",
          "東京のタクシーはメーター制で、高速道路料金が別途加算されます。不安なら乗車前に確認してください。",
        ],
        avoidScams: ["手荷物受取所の中で客引きをする運転手は避けてください。"],
      },
      bus: {
        title: "空港バス",
        bullets: ["リムジンバスが主要ホテルや駅へ運行しています。荷物が多いときはいちばん楽な選択になることが多いです。"],
        avoidScams: [],
      },
      rail: {
        title: "鉄道",
        bullets: [
          "N’EX は JR 線で東京駅・新宿方面へ向かいます。",
          "スカイライナーは上野・日暮里行きで、東京東部へ行くなら速いです。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "各ターミナルの案内カウンターで車いすを無料で貸し出しており、ターミナル各所のヘルプインターホンから24時間サポート係員を呼べます。",
      services: [
        { label: "車いすの貸し出し", detail: "どのターミナルでも案内カウンターで無料で借りられ、使い終えたら最寄りのカウンターに返却できます。" },
        { label: "24時間対応インターホン", detail: "ターミナル各所のインターホンが係員に直接つながり、チェックインカウンターまで案内してくれます。" },
        { label: "タクシー乗り場でのサポート", detail: "車いすをご利用の場合はタクシー乗り場の係員にお声がけください。乗車を手伝ってくれます。" },
      ],
      officialLinks: [{ label: "成田空港 — お手伝いが必要なお客さまへ", href: "https://www.narita-airport.jp/en/bf/" }],
    },
    transitTips: [
      "第1・第2ターミナルの保安検査エリア内に有料のシャワーとデイルームがあります。タオル・シャンプー・ドライヤー付きで、無料のシャワーはありません。",
      "JAL や ANA など一部の航空会社は、自社の国際線乗り継ぎ客にシャワーを無料または割引で提供しています。支払う前に航空会社に確認してみてください。",
      "ラウンジは会員資格だけでなく、前払いの当日パスでも利用でき、エコノミー利用でも入れます。",
    ],
  },
  HND: {
    terminals: ["第1ターミナル", "第2ターミナル", "第3ターミナル"],
    beforeYouFly: ["羽田は動線が密です。国内線から国際線への乗り継ぎは時間を多めにみておきましょう。"],
    afterYouLand: ["京急線と東京モノレールでは行き先が異なります。宿泊先のエリアに合わせて選んでください。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["各ターミナルに公式タクシー乗り場があり、成田より都心までの距離が短くて済みます。"],
        avoidScams: [],
      },
      bus: {
        title: "バス",
        bullets: ["電車の乗り換えを避けたい場合は、空港バスが主要ターミナルを結んでいます。"],
        avoidScams: [],
      },
      rail: {
        title: "鉄道",
        bullets: [
          "東京モノレールで浜松町へ行き、JR 山手線に乗り換えます。",
          "京急線は品川・横浜方面へつながっています。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "3つのターミナルすべてで各階にエレベーターがあり、段差なく移動できます。「ケアフィッター」の研修を受けた係員が特別サポートを行い、静かな「カームダウン・クールダウン」スペースや、見えない障がいのための ひまわりストラップ も無料で用意されています。",
      services: [
        { label: "特別サポートの予約", detail: "オンラインで事前予約するか、+81-3-5757-8111 にお電話ください。ケアフィッターの係員がチェックイン・保安検査・搭乗をサポートします。" },
        { label: "ひまわりストラップ（見えない障がい）", detail: "インフォメーションカウンターで無料で受け取れ、サポートが必要かもしれないことを係員に知らせる目印になります。" },
        { label: "カームダウン・クールダウンスペース", detail: "感覚的な刺激がつらいときや落ち着きたいときのための静かなスペースです。現在の場所は空港マップでご確認ください。" },
      ],
      officialLinks: [
        { label: "羽田空港 — 特別なサポートが必要なお客さまへ", href: "https://tokyo-haneda.com/en/service/barrier-free_information/index.html" },
        { label: "羽田空港 — 特別サポートのご予約", href: "https://tokyo-haneda.com/en/service/facilities/assist.html" },
      ],
    },
    transitTips: [
      "ロイヤルパークホテル東京羽田トランジットは、第3ターミナルの保安検査エリア内（出国後）にあるホテルで、入国審査を受けずにシャワー付きの日中客室を利用できます。",
      "ホテルとは別に、ターミナル内に共用のシャワールームもあります。",
      "乗り継ぎのしやすい主要空港として知られています。国際線が単一ターミナルにまとまっており、乗り継ぎ時間は概ね余裕をもって使えます。",
    ],
  },
  JFK: {
    terminals: ["第1・4・5・7・8ターミナル（航空会社により異なる）"],
    beforeYouFly: ["エアトレインはターミナル間の移動は無料で、地下鉄・LIRR へ出るときに運賃がかかります。"],
    afterYouLand: ["イエローキャブ乗り場には係員がいます。配車サービスはターミネルごとに指定の乗車エリアがあります。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: [
          "制服を着た係員がいるイエローキャブ乗り場をご利用ください。JFK からマンハッタンまでは定額運賃です。",
          "配車サービスは空港の案内表示に従って指定乗車エリアへ向かい、客引きは無視してください。",
        ],
        avoidScams: ["ターミナル内で、公式の待機列から離れた場所で乗車を勧めてくる人物。"],
      },
      bus: {
        title: "バス",
        bullets: ["MTA バスが周辺地域を結んでいますが、多くの旅行者はエアトレインと地下鉄・LIRR を使います。"],
        avoidScams: [],
      },
      rail: {
        title: "エアトレイン + 鉄道",
        bullets: [
          "エアトレインでジャマイカ駅へ向かい、LIRR または地下鉄 E・J・Z 線に乗り換えます。",
          "エアトレインでハワードビーチ駅へ向かい、地下鉄 A 線に乗り換えます。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "車いすや移動のサポートは空港ではなく航空会社を通じて（できれば48〜72時間前に）申し込む必要があります。トイレ、エアトレイン、補助犬用リリーフエリアはいずれもバリアフリーです。ただし、特に混雑時間帯は車いすサポートの待ち時間が長いという利用者の声が多いため、時間には余裕をもってください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込み、到着後チェックインカウンターで再確認してください。利用者の報告では、混雑時に1時間を超えることもあります。" },
        { label: "TSA Cares", detail: "保安検査の通過にサポートが必要な場合は、TSA Cares のフォームを事前に提出してください。" },
        { label: "補助犬用リリーフエリア（SARA）", detail: "全ターミナルの保安検査の前後に、屋内・屋外のリリーフエリアがあります。" },
      ],
      officialLinks: [{ label: "JFK 空港 バリアフリーサービス", href: "https://www.jfkairport.com/explore-jfk/accessibility-services" }],
    },
    transitTips: [
      "無料のシャワーはありません。シャワーはラウンジ（第4・5・8ターミナル）か、Minute Suites（第4ターミナル、B39ゲート付近）などの有料施設のみです。",
      "第5ターミナルの TWA ホテルではシャワー付きの日中客室を利用でき、他のターミナルからはエアトレインで行けます。",
      "JFK は保安検査前のエリアがターミナル同士でつながっていません。日中客室やラウンジは、同じターミナルにあるか、乗り継ぎ時間内にエアトレインで行ける場合にだけ現実的です。",
    ],
  },
  LHR: {
    terminals: ["第2・3・4・5ターミナル"],
    beforeYouFly: [],
    afterYouLand: ["地下鉄、エリザベス線、ヒースロー・エクスプレス、セントラルバスステーションの案内表示に従ってください。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: [
          "各ターミナルの外に公式ブラックキャブ乗り場があり、規制された運賃表に基づくメーター制です。",
          "事前予約の車は必ず認可事業者を使い、路上で声をかけてくる人には絶対についていかないでください。",
        ],
        avoidScams: ["到着ロビーで水増しした定額運賃を提示してくる無認可の運転手。"],
      },
      bus: {
        title: "長距離バス",
        bullets: ["ナショナル・エクスプレスなどの長距離バスがセントラルバスステーションから出発します。"],
        avoidScams: [],
      },
      rail: {
        title: "鉄道",
        bullets: [
          "エリザベス線は速さと運賃のバランスがよく、ロンドン中心部へ向かうのに使いやすいです。",
          "ヒースロー・エクスプレスはパディントンまで最速です。",
          "ピカデリー線は安価ですが、停車駅が多く時間がかかります。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "各ターミナルに、紫の制服を着た「ヒースロー・ヘルパー」が常駐するアシスタンスエリアがあり、見えない障がいのための ひまわりストラップ を無料で配布しています。エレベーターが各所にあり、エスカレーターは車いすや重い荷物には向きません。ロンドンの認可ブラックキャブは、法律で車いす対応が義務づけられています。",
      services: [
        { label: "サポートの事前予約", detail: "出発の48時間前までに航空会社へお伝えください。ヒースローのアシスタンスチームが各ターミナルの指定エリアでお迎えします。" },
        { label: "ひまわりストラップ", detail: "見えない障がいのための無料の目印で、サポートが必要かもしれないことを係員に知らせます。アシスタンスエリアで受け取れます。" },
        { label: "ヘルプポイント", detail: "駐車場、乗降場所、交通機関の各所にあります。ボタンを押すとアシスタンスチームに直接つながり、+44 (0)20 8757 2700 への電話でも対応しています。" },
      ],
      officialLinks: [
        { label: "ヒースロー — サポートとバリアフリー", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility" },
        { label: "ヒースロー — 出発時のサポート案内", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/assistance-departure-guide" },
        { label: "ヒースロー — ターミナル内でのサポート", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/help-in-the-terminal" },
      ],
    },
    transitTips: [
      "YOTEL（第4ターミナル）と Aerotel（第3ターミナル）は、シャワー付きの日中用スリープポッドを約4時間単位で予約でき、保安検査エリア内なので英国の入国審査は不要です。",
      "プラザ・プレミアム・ラウンジ（第2・第4ターミナル）では、客室を取らずにシャワーだけ利用できます。",
      "通路でつながるホテル（T5 のソフィテル、T4 のヒルトン）は一般エリア側にあるため、乗り継ぎ中に行くには英国の入国審査を受ける必要があります。",
    ],
  },
  SIN: {
    terminals: ["第1・2・3・4ターミナル"],
    beforeYouFly: [],
    afterYouLand: ["到着階はどのターミナルも1階です。入国審査、手荷物受取、税関はすべてこの階で行われます。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["各ターミナルの到着階に公式タクシー乗り場があります。客引きではなく、表示された待機列をご利用ください。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["路線バスと空港シャトルが全ターミナルを回ります。現在の路線はチャンギ空港の公式サイトでご確認ください。"], avoidScams: [] },
      rail: { title: "鉄道（MRT）", bullets: ["MRT 空港線が第2・第3ターミナルとシンガポール中心部を結んでいます。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。チャンギは車いすの貸し出しやバリアフリー設備が充実しており、主要空港のなかでも移動しやすい空港とされています。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込むと、地上係員がゲートでお迎えします。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "チャンギ空港 — 特別サポート", href: "https://www.changiairport.com/en/at-changi/special-assistance.html" }],
    },
    floorGuide: [
      { floor: "1階", label: "全ターミナルの到着 — 入国審査、手荷物受取、税関" },
      { floor: "2階", label: "第1・第2ターミナル出発 — チェックイン、保安検査" },
      { floor: "2/3階", label: "第3ターミナル出発 — チェックイン、保安検査" },
    ],
  },
  AMS: {
    terminals: ["単一ターミナル、出発ホール 1〜3"],
    beforeYouFly: [],
    afterYouLand: ["到着後の動線はすべて中央の公共エリア、スキポール・プラザにつながります。鉄道・タクシー・バスはいずれもここから利用します。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["公式タクシー乗り場はスキポール・プラザを出てすぐのところにあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["近郊バスと長距離バスは、スキポール・プラザ外のバスステーションから出発します。"], avoidScams: [] },
      rail: { title: "鉄道", bullets: ["駅はターミナルの真下にあり、アムステルダム中央駅方面への列車が頻繁に出ています。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。スキポールはターミナルが1つで歩く距離も短め（H・M ピアを除く）なので、比較的移動しやすい空港です。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "ターミナル内の各所にあります。" },
      ],
      officialLinks: [{ label: "スキポール — サポートサービス", href: "https://www.schiphol.nl/en/assistance/" }],
    },
    floorGuide: [
      { floor: "地上階", label: "到着、手荷物受取、スキポール・プラザ、駅への連絡口" },
      { floor: "1階", label: "チェックインと出発（ホール1・2・3）" },
      { floor: "2階", label: "保安検査、ラウンジ、レストラン、ゲート" },
      { floor: "3階", label: "パノラマテラス" },
    ],
  },
  HKG: {
    terminals: ["第1ターミナル", "第2ターミナル"],
    beforeYouFly: [],
    afterYouLand: ["到着手続き（入国審査・手荷物受取・税関）は第1ターミナルの5階で行われます。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["到着ホールの外に公式タクシー乗り場があります。表示された待機列を探してください。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["空港バスがターミナル外から香港島・九龍・新界方面へ運行しています。"], avoidScams: [] },
      rail: { title: "鉄道（エアポート・エクスプレス）", bullets: ["エアポート・エクスプレスは10〜12分間隔で運行し、香港駅まで約24分です。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。香港国際空港は多目的トイレ、車いす用通路、点字案内が全域に整備されています。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "香港国際空港 — バリアフリー案内", href: "https://www.hongkongairport.com/en/passenger-guide/airport-facilities-services/special-needs-access" }],
    },
    floorGuide: [
      { floor: "5階", label: "到着 — 入国審査、手荷物受取、税関" },
      { floor: "6階", label: "保安検査と出発ゲート、ショップ、ラウンジ" },
      { floor: "7階", label: "チェックインホール — 航空会社カウンター、自動チェックイン機" },
    ],
  },
  DXB: {
    terminals: ["第1ターミナル", "第2ターミナル", "第3ターミナル（エミレーツ航空）"],
    beforeYouFly: [],
    afterYouLand: ["空港へ向かう前にターミナルを確認してください。エミレーツ航空は第3ターミナル、その他の国際線の多くは第1ターミナルです。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["RTA 認可タクシーが到着階の外で24時間営業しています。公式乗り場をご利用ください。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["RTA のバス路線が空港とデイラ、バール・ドバイを結んでいます。"], avoidScams: [] },
      rail: { title: "メトロ", bullets: ["ドバイメトロ・レッドラインが第1ターミナルと第3ターミナルに直接停車します。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "ドバイ空港 — 特別サポート", href: "https://dubaiairports.ae/information/special-assistance" }],
    },
    floorGuide: [
      { floor: "1階", label: "第3ターミナル到着 — 入国審査、手荷物受取" },
      { floor: "3階", label: "第3ターミナル出発 — チェックイン、保安検査" },
      { floor: "4階", label: "第3ターミナルの補助的な到着エリア" },
    ],
  },
  BKK: {
    terminals: ["メインターミナル", "サテライトターミナル SAT-1"],
    beforeYouFly: [],
    afterYouLand: ["到着手続き（入国審査・手荷物受取・税関）は2階で行われます。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["公式の公共タクシー待機列は1階です。到着ホールで声をかけてくる客引きではなく、発券機をご利用ください。"],
        avoidScams: ["ターミナル内で到着客に直接近づいてくる非公式の運転手。特にメーター運賃を大きく上回る定額を提示してくる場合。"],
      },
      bus: { title: "バス", bullets: ["空港バスと都市間バスは1階から出発します。"], avoidScams: [] },
      rail: { title: "鉄道（エアポート・レール・リンク）", bullets: ["市中心部へつながるパヤタイ行き ARL は、到着階の1つ下の地下（B階）から出発します。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "ターミナル内の各所にあります。" },
      ],
      officialLinks: [{ label: "スワンナプーム空港 — 旅客案内", href: "https://suvarnabhumi.airportthai.co.th/service/airport-guide" }],
    },
    floorGuide: [
      { floor: "1階", label: "バスロビー、公共タクシー待機列" },
      { floor: "2階", label: "到着 — 入国審査、手荷物受取、税関" },
      { floor: "3階", label: "レストラン、ショップ、航空会社ラウンジ" },
      { floor: "4階", label: "出発 — チェックイン、保安検査、出国審査" },
      { floor: "地下B階", label: "エアポート・レール・リンク（ARL）ホーム" },
    ],
  },
  IST: {
    terminals: ["単一ターミナル、コンコース A/B/D/F/G"],
    beforeYouFly: [],
    afterYouLand: ["到着ゲートは1階です。入国審査・手荷物受取・税関は地上階に降りて行います。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["主要なタクシー乗り場は国内線・国際線の出口の外にあります。オレンジ（最も安い）、ターコイズ、ブラック（最も高い）のタクシーがあります。"],
        avoidScams: [],
      },
      bus: { title: "バス", bullets: ["バスは交通フロア（地下2階）から出発します。"], avoidScams: [] },
      rail: { title: "メトロ", bullets: ["M11 線がガイレッテペまでつながり、そこからイスタンブールのメトロ網全体へ乗り継げます。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。階が変わる場所にはすべてエレベーターとスロープがあり、点字ブロックと多目的トイレも各階に整備されています。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "すべての階にあります。" },
      ],
      officialLinks: [{ label: "イスタンブール空港 — iGA Cares（バリアフリー）", href: "https://www.istairport.com/en/flights/airport-guides/iga-cares-accessibility/" }],
    },
    floorGuide: [
      { floor: "地上階", label: "到着 — 入国審査、手荷物受取、税関" },
      { floor: "1階", label: "到着ゲート" },
      { floor: "2階", label: "出発 — チェックイン、保安検査、搭乗ゲート" },
      { floor: "地下2階", label: "バスターミナル、一部の乗降エリア" },
    ],
  },
  TPE: {
    terminals: ["第1ターミナル", "第2ターミナル"],
    beforeYouFly: [],
    afterYouLand: ["到着と手荷物受取は、両ターミナルとも1階です。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["両ターミナルの指定乗り場で24時間タクシーを利用できます。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["台北行きの空港バスが各ターミナルの到着階から出発します。"], avoidScams: [] },
      rail: { title: "空港 MRT", bullets: ["第2ターミナルは地下2階、第1ターミナルは地下1階を経由して乗車します。台北中心部まで最も速い手段です。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "桃園空港 — 旅客案内", href: "https://www.taoyuan-airport.com/" }],
    },
    floorGuide: [
      { floor: "1階", label: "到着 — 入国審査、手荷物受取、税関（両ターミナル共通）" },
      { floor: "2階", label: "到着コンコースと乗り継ぎ" },
      { floor: "3階", label: "出発 — チェックイン、保安検査（両ターミナル共通）" },
      { floor: "地下1・2階", label: "空港 MRT ホーム" },
    ],
  },
  SYD: {
    terminals: ["第1ターミナル（国際線）", "第2ターミナル（国内線）", "第3ターミナル（国内線、カンタス）"],
    beforeYouFly: [],
    afterYouLand: ["到着手続き（入国審査・手荷物受取・税関）は第1ターミナルの1階で行われます。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["タクシー乗り場は第1ターミナルの到着階、建物の外にあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["無料の T-Bus シャトルが一般エリア側で全ターミナルを結んでいます。"], avoidScams: [] },
      rail: { title: "鉄道（エアポートリンク）", bullets: ["エアポートリンクで第1ターミナルから国内線ターミナルまで約2分、さらにシドニー中心部へ向かえます。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "ターミナル内の各所にあります。" },
      ],
      officialLinks: [{ label: "シドニー空港 — サポートサービス", href: "https://www.sydneyairport.com.au/assistance" }],
    },
    floorGuide: [
      { floor: "1階", label: "第1ターミナル到着 — 入国審査、手荷物受取、税関" },
      { floor: "2階", label: "第1ターミナル出発 — A〜K チェックインカウンター、保安検査" },
      { floor: "3階", label: "航空会社オフィス、ラウンジ" },
    ],
  },
  FRA: {
    terminals: ["第1ターミナル（コンコース A・B・C・Z）", "第2ターミナル（コンコース D・E）"],
    beforeYouFly: [],
    afterYouLand: ["階はコンコースによって異なります。空港全体で到着階が1つだと考えず、下のターミナル構成をご確認ください。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["タクシー乗り場は第1・第2ターミナルの到着階、出口付近にあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["フランクフルト行きの空港バスは、第2ターミナル到着ホール前の乗り場から出発します。"], avoidScams: [] },
      rail: { title: "鉄道", bullets: ["第1ターミナルには近郊線（S-Bahn）駅と長距離線（ICE/IC）駅の両方が直結しています。第2ターミナルからは、無料のスカイライン（SkyLine）で第1ターミナルへ移動する必要があります。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "フランクフルト空港 — 特別サポート", href: "https://www.frankfurt-airport.com/en/travel-planning/special-needs.html" }],
    },
    floorGuide: [
      { floor: "T1 コンコース B、1階", label: "到着 — 手荷物受取、税関" },
      { floor: "T1 コンコース B、2階", label: "出発 — チェックイン、ラウンジ" },
      { floor: "T1 コンコース B、3階", label: "出国審査、優先保安検査レーン" },
      { floor: "T1 コンコース A、2階", label: "シェンゲン出発" },
      { floor: "T1 コンコース Z、3階", label: "非シェンゲン出発（コンコース A の真上、同じピア）" },
      { floor: "T2 コンコース D/E、2階", label: "到着 — 手荷物受取、税関" },
      { floor: "T2 コンコース D/E、3階", label: "出発 — チェックイン、保安検査" },
    ],
  },
  MUC: {
    terminals: ["第1ターミナル（モジュール A〜F）", "第2ターミナル（ゲート G・H + サテライトゲート K・L）"],
    beforeYouFly: [],
    afterYouLand: ["第1ターミナルはモジュールごと、それ以外はターミナルごとに階と手続きが異なります。下のターミナル構成をご確認ください。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["タクシー乗り場は両ターミナルの到着階、建物前の車道沿いにあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["中央駅行きのルフトハンザ空港バスが、第1ターミナル（到着 A）、ミュンヘン・エアポート・センター、第2ターミナルの到着階から出発します。"], avoidScams: [] },
      rail: { title: "鉄道（S-Bahn）", bullets: ["S1・S8 の近郊列車が、ミュンヘン・エアポート・センター駅から10分間隔で市中心部へ運行しています。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "ミュンヘン空港のモビリティサービスが無料でサポートします。航空会社を通じて48時間前までにお申し込みください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "ミュンヘン空港 — バリアフリーの旅", href: "https://www.munich-airport.com/accessible-travel-260945" }],
    },
    floorGuide: [
      { floor: "T1 モジュール A〜D、04階", label: "到着と出発（これらのモジュールでは同じ階で扱います）" },
      { floor: "T1 モジュール B/C", label: "非シェンゲン到着 — 手荷物受取の前に入国審査" },
      { floor: "T1 モジュール E", label: "到着専用" },
      { floor: "T2 04階（ゲート G）", label: "シェンゲン出発、シェンゲン到着の手荷物受取" },
      { floor: "T2 05階（ゲート H）", label: "非シェンゲン出発" },
    ],
  },
  CDG: {
    terminals: ["第1ターミナル", "第2ターミナル（2A〜2G）", "第3ターミナル"],
    beforeYouFly: [],
    afterYouLand: ["2E か 2C かといった枝番によって構造が変わります。下のターミナル構成をご確認ください。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["タクシー乗り場は各ターミナルの到着階にあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["ロワシーバスと RATP の350・351番がパリ中心部へ、無料の CDGVAL シャトルが第1・2・3ターミナルを結びます。"], avoidScams: [] },
      rail: {
        title: "鉄道（RER B / TGV）",
        bullets: [
          "パリ中心部行きの RER B は第2ターミナルと第3ターミナル／ロワシーポールの2か所に駅があります。よくある間違いなので、正しい駅かどうか確認してください。",
          "TGV 高速列車は第2ターミナルの地下にある駅から出発します。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "パリ空港 — 身体の不自由な方へのサポート", href: "https://www.parisaeroport.fr/en/passengers/flight-preparation/specific-assistance/people-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "T1", label: "円形の独特な構造 — CDGVAL シャトルは下層に到着し、出発のチェックイン・保安検査はその上層、到着は最上階です" },
      { floor: "T2A/2B/2C/2D、1階", label: "到着" },
      { floor: "T2C/2D、2階", label: "出発 — 搭乗ゲート" },
      { floor: "T2E/2F", label: "本館に出発階（チェックイン・保安検査）と別の到着階（手荷物受取）があり、2E の L・M ホールのゲートはシャトル列車が必要です" },
      { floor: "T3", label: "小さな単一の建物 — 階ではなく方向で分かれ、北側が到着、南側が出発（A・B ホール）です" },
    ],
  },
  LAX: {
    terminals: ["第1〜8ターミナル", "トム・ブラッドリー国際線ターミナル（B ターミナル）"],
    beforeYouFly: [],
    afterYouLand: ["到着と手荷物受取は、どのターミナルも下階です。TBIT のみ1階を使います。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["タクシーは第1ターミナル近くの専用乗り場 LAX-it でのみ乗車でき、各ターミナルの下階から無料シャトルで向かいます。降車はタクシーも配車サービスも、上階の出発階の車道で直接できます。"],
        avoidScams: [],
      },
      bus: { title: "バス", bullets: ["ユニオン駅とバンナイズ行きの FlyAway 直行バスが上階の出発階から出発します。"], avoidScams: [] },
      rail: { title: "メトロ / ライトレール", bullets: ["無料シャトルで LAX/メトロ・トランジットセンターへ行くと、ロサンゼルス・メトロの鉄道・バス路線に乗り継げます。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "LAX — バリアフリー案内", href: "https://www.flylax.com/lax-accessibility" }],
    },
    floorGuide: [
      { floor: "第1〜8ターミナル 上階", label: "出発 — チェックイン、車道での乗降" },
      { floor: "第1〜8ターミナル 下階", label: "到着 — 手荷物受取、お迎え" },
      { floor: "TBIT（B ターミナル）1階", label: "手荷物受取、税関" },
      { floor: "TBIT（B ターミナル）3階", label: "チェックイン" },
      { floor: "TBIT（B ターミナル）4階", label: "保安検査、出発" },
    ],
  },
  ORD: {
    terminals: ["第1ターミナル", "第2ターミナル", "第3ターミナル", "第5ターミナル（国際線）"],
    beforeYouFly: [],
    afterYouLand: ["国際線の到着はほぼ必ず第5ターミナルです。乗り継ぐ国内線が別のターミナルから出発する場合も同じなので、到着・出発の両方のターミナルを確認してください。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["タクシーは各ターミナルの下階、到着階の車道で利用できます。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["Pace の広域バスが、ATS で行けるマルチモーダル施設から出発します。"], avoidScams: [] },
      rail: { title: "鉄道（CTA ブルーライン）", bullets: ["シカゴ中心部行きのブルーラインは、第1・2・3ターミナルの地下通路から直接、第5ターミナルからは ATS 経由で乗車できます。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "シカゴ航空局 — バリアフリー案内", href: "https://www.flychicago.com/ohare/ServicesAmenities/accessibility/Pages/default.aspx" }],
    },
    floorGuide: [
      { floor: "第1・2・3ターミナル 上階", label: "出発 — チェックイン、保安検査" },
      { floor: "第1・2・3ターミナル 下階", label: "到着 — 手荷物受取、地上交通" },
      { floor: "第5ターミナル 下階", label: "到着、手荷物受取、ATS 駅、地上交通" },
      { floor: "第5ターミナル 2階", label: "チェックイン、出発" },
    ],
  },
  MAD: {
    terminals: ["第1ターミナル", "第2ターミナル", "第3ターミナル", "第4ターミナル", "第4サテライトターミナル（T4S）"],
    beforeYouFly: [],
    afterYouLand: ["利用する便が T1・T2・T3 か、T4・T4S かを確認してください。徒歩圏内ではなく、シャトルでの移動が必要です。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["公式タクシー乗り場は各ターミナルの到着階の車道沿いにあります。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["マドリード中心部行きのエアポート・エクスプレスが24時間運行し、T1・T2・T4 に停車します。"], avoidScams: [] },
      rail: { title: "鉄道（メトロ）", bullets: ["メトロ8号線が T1・T2・T3（Aeropuerto T1-T2-T3 駅）と T4（Aeropuerto T4 駅）をマドリード中心部と結んでいます。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "Aena — バリアフリー支援サービス", href: "https://www.aena.es/en/passengers/travellers/passengers-with-medical-needs/barrier-free-assistance-service.html" }],
    },
    floorGuide: [
      { floor: "T1 地上階", label: "到着 — 手荷物受取" },
      { floor: "T1 1階", label: "出発 — チェックイン" },
      { floor: "T4 0階", label: "到着 — 手荷物受取、税関" },
      { floor: "T4 2階", label: "出発 — チェックイン" },
      { floor: "T4S 地上階", label: "到着" },
      { floor: "T4S 1階", label: "出発、ショップ、飲食" },
      { floor: "T4S 地下", label: "T4 行き APM（自動シャトル）" },
    ],
  },
  ZRH: {
    terminals: ["本館（チェックイン／到着 1 & 2）", "ドック E（非シェンゲン、スカイメトロ利用）"],
    beforeYouFly: [],
    afterYouLand: ["案内表示はターミナル番号ではなく「到着1」「到着2」と表示されます。搭乗券や運航情報でどちらか確認してください。"],
    transit: {
      taxi: { title: "タクシー", bullets: ["公式タクシーは到着ホール1・2の内側の車道で拾えます。"], avoidScams: [] },
      bus: { title: "バス", bullets: ["市内バスと都市間バス（Flixbus を含む）が、エアポートセンター外の0階に停車します。"], avoidScams: [] },
      rail: { title: "鉄道（SBB）", bullets: ["チューリッヒ中央駅まで直通で約10〜12分、エアポートセンター地下の駅からおよそ6〜12分間隔で出発します。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "ターミナル内の各所にあります。" },
      ],
      officialLinks: [{ label: "チューリッヒ空港 — 移動に配慮が必要な方へ", href: "https://www.flughafen-zuerich.ch/en/passengers/fly/assistance/travelling-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "0階", label: "地上交通（トラム・バス）、到着1インフォメーションセンター" },
      { floor: "1階", label: "チェックイン1・2、到着1・2、A/B/D ゲート" },
      { floor: "2階", label: "追加ゲート、ショップ、空港サービス" },
      { floor: "ドック E（スカイメトロ）", label: "非シェンゲン国際線の出発・到着 — 別棟" },
    ],
  },
  PVG: {
    terminals: ["第1ターミナル", "第2ターミナル", "サテライト S1", "サテライト S2"],
    beforeYouFly: [],
    afterYouLand: ["空港へ向かう前に T1 か T2 かを確認してください。離れており、一般エリア側でつながっていません。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["到着ホール外の公式乗り場でメータータクシーを利用できます。リニアが「故障している」と近づいてくる人は無視してください。高額なタクシーへ誘導する既知の手口です。"],
        avoidScams: ["リニア駅付近で「故障」「悪天候で運休」と言って高額なタクシーへ誘導する客引き。リニアは毎日運行しています。"],
      },
      bus: { title: "バス", bullets: ["市内行きの空港シャトルバスが24時間運行しています。"], avoidScams: [] },
      rail: {
        title: "鉄道（メトロ / リニア）",
        bullets: [
          "メトロ2号線が上海中心部へつながっています（人民広場方面は広蘭路駅で乗り換え）。",
          "上海リニアで龍陽路駅（メトロ2号線）まで約8分。駅は T1 と T2 の間、2階の連絡通路上にあります。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "上海空港 — 第1ターミナル案内", href: "https://www.shanghai-airport.com/terminal-1.php" }],
    },
    floorGuide: [
      { floor: "1階", label: "手荷物受取、地上交通（タクシー・バス・メトロ）" },
      { floor: "2階", label: "到着ホール、乗り継ぎ、リニア駅（T1・T2 間の連絡通路上）" },
      { floor: "3階", label: "出発 — チェックイン、保安検査" },
    ],
  },
  KUL: {
    terminals: ["KLIA（第1ターミナル）", "klia2（第2ターミナル）"],
    beforeYouFly: [],
    afterYouLand: ["利用する便が KLIA か klia2 かを確認してください。混同する人が多く、徒歩圏内ではありません。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["到着エリアのカウンターで前払いのクーポンタクシーを利用できます。運転手と直接交渉せず、カウンターで行き先を伝えて支払ってください。"],
        avoidScams: [],
      },
      bus: { title: "バス", bullets: ["両ターミナルから複数のバス会社が KL セントラル駅へ運行しています。"], avoidScams: [] },
      rail: { title: "鉄道（KLIA エクスプレス / トランジット）", bullets: ["KL セントラル行きのノンストップ KLIA エクスプレスと各駅停車の KLIA トランジットが、両ターミナルの地下1階から出発します。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "両ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "マレーシア空港公社 — KLIA 第1ターミナルマップ", href: "https://airports.malaysiaairports.com.my/en/klia1/map" }],
    },
    floorGuide: [
      { floor: "KLIA（T1）5階", label: "出発 — チェックイン（A〜M の6ブロック、216カウンター）" },
      { floor: "KLIA（T1）3階", label: "到着 — 手荷物受取、入国審査、税関" },
      { floor: "KLIA（T1）1階", label: "KLIA エクスプレス／トランジット駅" },
      { floor: "klia2（T2）3階", label: "出発 — チェックイン、保安検査" },
    ],
  },
  GRU: {
    terminals: ["第1ターミナル（アズール、国内線）", "第2ターミナル（国内線＋南米域内国際線）", "第3ターミナル（長距離国際線）"],
    beforeYouFly: [],
    afterYouLand: ["国際線から国内線へ乗り継ぐ場合は、入国審査と税関を通り、手荷物を受け取ってから再度チェックインが必要です。特に第3ターミナルから第1・第2ターミナルへ移る場合は時間に余裕をもってください。"],
    transit: {
      taxi: {
        title: "タクシー",
        bullets: ["公式タクシーは第2・第3ターミナルの地上階にブースがあります。運転手に直接支払わず、ブースで精算してください。"],
        avoidScams: ["ターミナル内で乗客に近づいてくる非公式の運転手。必ず公式ブースのみをご利用ください。"],
      },
      bus: { title: "バス", bullets: ["パウリスタ大通り、チエテ、バーラ・フンダ行きの空港バスが各ターミナルの到着階から出発します。"], avoidScams: [] },
      rail: { title: "鉄道（CPTM 13号線）", bullets: ["最も安価ですが、サンパウロ中心部へ行くには乗り換えが必要です。"], avoidScams: [] },
    },
    accessibility: {
      summary: "車いすや移動のサポートが必要な場合は、出発の48時間前までに航空会社へご連絡ください。",
      services: [
        { label: "車いすのサポート", detail: "航空会社を通じて事前に申し込んでください。" },
        { label: "多目的トイレ", detail: "全ターミナルの各所にあります。" },
      ],
      officialLinks: [{ label: "GRU 空港 — ターミナル案内", href: "https://www.gru.com.br/en/institutional/sobre-gru-airport/terminals" }],
    },
    floorGuide: [
      { floor: "全ターミナル 地上1階", label: "到着 — 手荷物受取、税関（T1・T2・T3 共通）" },
      { floor: "第2ターミナル 2階", label: "出発 — チェックイン、保安検査。第3ターミナルへの連絡通路もこの階です" },
      { floor: "第3ターミナル 3階", label: "出発 — チェックイン、保安検査" },
    ],
  },
};
