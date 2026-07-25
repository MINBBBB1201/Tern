import type { AirportGuideBody } from "./airportGuides";

/** Simplified-Chinese guide bodies. Names/summaries live in lib/airportBrief.ts. */
export const DEFAULT_BODY_ZH: AirportGuideBody = {
  terminals: ["航司使用的航站楼可能调整，请以机场官网为准。"],
  beforeYouFly: [
    "国际航班建议提前 2 小时到达；旺季机场有提示时按 3 小时预留。",
    "把城市和机场的地图离线保存好，Wi-Fi 不一定稳定。",
  ],
  afterYouLand: [
    "需要现金就取一点点即可，多数城市刷卡都很方便。",
    "打车和轨道交通的 App 请在机场官方 Wi-Fi 或移动数据下打开，避免误入假热点页面。",
  ],
  transit: {
    taxi: {
      title: "出租车",
      bullets: [
        "走官方出租车候车点或正规排队区，别理会在行李提取处主动搭话的司机。",
        "上车前确认是否打表，或 App/一口价是否与公示牌一致。",
        "深夜用车先拍下车牌，并把实时位置分享给信得过的人。",
      ],
      avoidScams: [
        "开出叫车软件同路线 2–3 倍的所谓“一口价”。",
        "拒绝打表，或声称官方候车点“已关闭”的司机。",
        "在到达通道里强行推销的非官方“机场接送”柜台。",
      ],
    },
    bus: {
      title: "巴士",
      bullets: [
        "机场巴士通常在到达层外的标识站台发车，请核对车身上的线路号。",
        "只在官方售票机、售票柜台或机场官网链接的 App 购票。",
      ],
      avoidScams: ["车票只在售票机或官方柜台购买，不要理会兜售“折扣票”的人。"],
    },
    rail: {
      title: "火车 / 地铁",
      bullets: [
        "跟着“Train”“Rail”或“Metro”标识走，通常和出租车区不在同一栋楼。",
        "如果落地较晚，先查末班车时间；有些城市午夜后由机场巴士替代轨道交通。",
      ],
      avoidScams: ["推销不必要摆渡套票的假咨询台。"],
    },
  },
  accessibility: {
    summary:
      "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。现场服务由机场提供，但申请要通过航司提交。多数大型国际机场提供免费轮椅借用、无障碍卫生间，以及过安检直到登机口的人员陪同。",
    services: [
      { label: "轮椅协助", detail: "请通过航空公司提前申请。多数机场的问询柜台也备有可现场借用的轮椅。" },
      { label: "无障碍卫生间", detail: "多数航站楼各处都有，可询问工作人员或查看航站楼地图。" },
      { label: "服务犬同行", detail: "一般都可以，但出行前请确认航司和目的地国家的证明文件要求。" },
    ],
    officialLinks: [],
  },
};

export const BODIES_ZH: Record<string, AirportGuideBody> = {
  ICN: {
    terminals: ["第一航站楼", "第二航站楼"],
    beforeYouFly: [
      "先确认你的航司在 T1 还是 T2，有几家航司调整过航站楼。",
      "安检要留出余量，旺季边检排队会明显变长。",
    ],
    afterYouLand: [
      "机场铁路（AREX）的直达和普通列车都通到首尔站，取完行李后跟着指示牌走即可。",
      "机场大巴在到达层外发车，覆盖首尔各主要区域。",
    ],
    transit: {
      taxi: {
        title: "出租车",
        bullets: [
          "请走到达层外的官方出租车候车点，按普通、模范、大型车分开排队。",
          "国际出租车到主要城区有接近一口价的收费，可在公示价目表上核对。",
          "Kakao T 等叫车软件很好用，机场若设有指定上车区，就在那里叫车。",
        ],
        avoidScams: ["无视入境大厅里主动招揽的非官方拉客，只用官方候车点或你熟悉的 App。"],
        officialLinks: [{ label: "仁川国际机场公社 旅客指南", href: "https://www.airport.kr/" }],
      },
      bus: {
        title: "机场巴士",
        bullets: [
          "豪华巴士开往江南、明洞、弘大等主要区域，可在出口附近的售票处买票。",
          "每个站台的电子屏都会显示线路号和等候时间。",
        ],
        avoidScams: [],
      },
      rail: {
        title: "机场铁路 / 地铁",
        bullets: [
          "直达列车到首尔站更快，普通列车站站停，含弘大入口等站。",
          "根据住处选择在首尔站或弘大入口换乘首尔地铁。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "一直被评为全球无障碍做得最好的机场之一。电动和助力轮椅都可免费借用，设有行动不便旅客专用优先通道，长期停车场与航站楼之间还有免费电动车接送。",
      services: [
        { label: "轮椅借用", detail: "在第一航站楼 3 层 7 号、8 号出口外可免费借用手动或电动轮椅。各处的求助电话直通最近的问询柜台。" },
        { label: "行动不便旅客优先通道", detail: "在航司值机柜台确认是否符合条件并领取优先卡，然后走专用安检通道。" },
        { label: "电动车接送", detail: "轮椅旅客可在长期停车场与航站楼之间免费乘坐电动车。" },
      ],
      officialLinks: [{ label: "仁川机场 无障碍服务", href: "https://www.airport.kr/ap_en/1478/subview.do" }],
    },
    transitTips: [
      "两座航站楼的安检区内都有免费淋浴间（毛巾和洗漱用品需自备）。收费的中转休息室淋浴（T1 在 25/29 号登机口附近，T2 在 231/268 号附近）含毛巾、洗发水和沐浴露。",
      "第一、第二航站楼的中转酒店可以不入境就使用日间房，长时间中转很实用。",
      "多家休息室即使是经济舱旅客也接受当日通行证或 Priority Pass、龙腾会籍。",
    ],
  },
  NRT: {
    terminals: ["第一航站楼", "第二航站楼", "第三航站楼"],
    beforeYouFly: ["第三航站楼以廉航为主，请先确认航站楼之间的步行距离和摆渡巴士。"],
    afterYouLand: [
      "N’EX 属 JR、Skyliner 属京成，售票机不同，跟着地面导引标识走。",
      "到市区后，Suica、PASMO 等 IC 卡坐电车和公交都方便。",
    ],
    transit: {
      taxi: {
        title: "出租车",
        bullets: [
          "主要区域有固定价出租车，排队前先到官方出租车咨询台问一下。",
          "东京出租车按表计费，高速费通常另计，不确定就先问清楚。",
        ],
        avoidScams: ["避开在行李提取处内部拉客的司机。"],
      },
      bus: {
        title: "机场巴士",
        bullets: ["利木津巴士开往主要酒店和车站，行李多时往往是最省事的选择。"],
        avoidScams: [],
      },
      rail: {
        title: "轨道交通",
        bullets: [
          "N’EX 走 JR 线，开往东京站、新宿方向。",
          "Skyliner 开往上野、日暮里，去东京东部更快。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "各航站楼问询柜台均可免费借用轮椅，航站楼各处的求助对讲机可 24 小时呼叫协助人员。",
      services: [
        { label: "轮椅借用", detail: "任一航站楼的问询柜台都可免费借用，用完就近归还即可。" },
        { label: "24 小时求助对讲机", detail: "航站楼各处的对讲机直通工作人员，可陪同你到值机柜台。" },
        { label: "出租车候车点协助", detail: "使用轮椅时可告知候车点工作人员，他们会协助你上车。" },
      ],
      officialLinks: [{ label: "成田机场 — 需要协助的旅客", href: "https://www.narita-airport.jp/en/bf/" }],
    },
    transitTips: [
      "第一、第二航站楼的安检区内设有收费淋浴间和日间休息室，含毛巾、洗发水和吹风机；没有免费淋浴。",
      "日航、全日空等部分航司会为自家国际中转旅客提供免费或折扣淋浴，付费前先问问航司。",
      "休息室除了会籍，也接受预付的当日通行证，经济舱旅客同样可以进。",
    ],
  },
  HND: {
    terminals: ["第一航站楼", "第二航站楼", "第三航站楼"],
    beforeYouFly: ["羽田流线紧凑，国内转国际时请多留出时间。"],
    afterYouLand: ["京急线和东京单轨电车通往的区域不同，按住处所在区域选择。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["各航站楼都有官方出租车候车点，到东京市中心比成田近得多。"],
        avoidScams: [],
      },
      bus: {
        title: "巴士",
        bullets: ["不想换乘电车的话，机场巴士连接各主要枢纽。"],
        avoidScams: [],
      },
      rail: {
        title: "轨道交通",
        bullets: [
          "东京单轨电车到滨松町，换乘 JR 山手线。",
          "京急线通往品川和横滨方向。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "三座航站楼各层都有电梯，可全程无台阶通行。经过“Care-Fitter”培训的工作人员提供特别协助，另设安静的“Calm Down, Cool Down”空间，并免费发放用于隐性障碍的向日葵挂绳。",
      services: [
        { label: "特别协助预约", detail: "可在线提前预约或致电 +81-3-5757-8111，Care-Fitter 工作人员会协助值机、安检和登机。" },
        { label: "向日葵挂绳（隐性障碍）", detail: "在问询柜台免费领取，向工作人员示意你可能需要额外帮助。" },
        { label: "Calm Down, Cool Down 空间", detail: "为感官负荷过重或需要平复情绪的旅客准备的安静区域，具体位置请查看机场地图。" },
      ],
      officialLinks: [
        { label: "羽田机场 — 需要特别协助的旅客", href: "https://tokyo-haneda.com/en/service/barrier-free_information/index.html" },
        { label: "羽田机场 — 特别协助预约", href: "https://tokyo-haneda.com/en/service/facilities/assist.html" },
      ],
    },
    transitTips: [
      "Royal Park Hotel Tokyo Haneda Transit 是位于第三航站楼安检区内（出境之后）的机场内酒店，可以不入境就使用带淋浴的日间房。",
      "除酒店外，航站楼内还有独立的公共淋浴间。",
      "羽田是公认中转效率较高的大型机场，国际航班集中在单一航站楼，中转时间通常比较宽裕。",
    ],
  },
  JFK: {
    terminals: ["1、4、5、7、8 号航站楼（按航司确认）"],
    beforeYouFly: ["AirTrain 在航站楼之间免费，出站换地铁或 LIRR 时才收费。"],
    afterYouLand: ["黄色出租车候车点有调度员，网约车在各航站楼有指定上车区。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: [
          "请走有制服调度员的黄色出租车候车点，JFK 到曼哈顿执行固定价。",
          "网约车请按机场指示牌前往指定上车区，别理会拉客的人。",
        ],
        avoidScams: ["在航站楼内、脱离官方排队区主动招揽载客的人。"],
      },
      bus: {
        title: "巴士",
        bullets: ["MTA 公交可到周边区域，但多数旅客还是选 AirTrain 加地铁或 LIRR。"],
        avoidScams: [],
      },
      rail: {
        title: "AirTrain + 轨道交通",
        bullets: [
          "乘 AirTrain 到牙买加站，换 LIRR 或地铁 E/J/Z 线。",
          "乘 AirTrain 到霍华德海滩站，换地铁 A 线。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "轮椅和行动协助需通过航空公司申请（最好提前 48–72 小时），而不是找机场。卫生间、AirTrain 和服务犬如厕区均为无障碍。但不少旅客反映高峰时段轮椅服务等候较久，请预留充足时间。",
      services: [
        { label: "轮椅服务", detail: "请通过航司提前申请，抵达后在值机柜台再确认一次。据旅客反馈，高峰时等候可能超过一小时。" },
        { label: "TSA Cares", detail: "如需协助通过安检，请提前提交 TSA Cares 申请表。" },
        { label: "服务犬如厕区（SARA）", detail: "所有航站楼在安检前后都设有室内和室外如厕区。" },
      ],
      officialLinks: [{ label: "JFK 机场无障碍服务", href: "https://www.jfkairport.com/explore-jfk/accessibility-services" }],
    },
    transitTips: [
      "没有免费淋浴。只能通过休息室（4、5、8 号航站楼）或 Minute Suites（4 号航站楼 B39 登机口附近）等付费设施使用。",
      "5 号航站楼的 TWA 酒店提供带淋浴的日间房，其他航站楼可乘 AirTrain 前往。",
      "JFK 各航站楼在安检前并不互通。日间房或休息室只有在你所在的航站楼，或能在中转时间内乘 AirTrain 到达时才现实。",
    ],
  },
  LHR: {
    terminals: ["2、3、4、5 号航站楼"],
    beforeYouFly: [],
    afterYouLand: ["跟着地铁、伊丽莎白线、希思罗快线或中央巴士站的指示牌走。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: [
          "每座航站楼外都有官方黑色出租车候车点，按受监管的价目表打表计费。",
          "预约用车必须找持牌运营商，绝不要跟街头拉客的人走。",
        ],
        avoidScams: ["在到达大厅报出虚高一口价的无牌司机。"],
      },
      bus: {
        title: "长途客车 / 巴士",
        bullets: ["National Express 等长途客车在中央巴士站发车。"],
        avoidScams: [],
      },
      rail: {
        title: "轨道交通",
        bullets: [
          "伊丽莎白线在速度和票价之间比较均衡，去伦敦市中心很好用。",
          "希思罗快线到帕丁顿最快。",
          "皮卡迪利线便宜但站多、耗时长。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary:
        "每座航站楼都设有由身穿紫色制服的“Heathrow Helpers”驻守的协助区，并免费发放用于隐性障碍的向日葵挂绳。各处都有电梯，自动扶梯不适合轮椅或大件行李。伦敦持牌黑色出租车依法均可供轮椅使用。",
      services: [
        { label: "提前预约协助", detail: "请在出发前至少 48 小时告知航空公司，希思罗协助团队会在各航站楼的指定区域接您。" },
        { label: "向日葵挂绳", detail: "面向隐性障碍免费提供，向工作人员示意你可能需要额外帮助，可在协助区领取。" },
        { label: "求助点", detail: "遍布停车场、上下客区和交通站点，按下按钮可直接联系协助团队，也可拨打 +44 (0)20 8757 2700。" },
      ],
      officialLinks: [
        { label: "希思罗 — 协助与无障碍", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility" },
        { label: "希思罗 — 出发协助指南", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/assistance-departure-guide" },
        { label: "希思罗 — 航站楼内求助", href: "https://www.heathrow.com/at-the-airport/assistance-and-accessibility/help-in-the-terminal" },
      ],
    },
    transitTips: [
      "YOTEL（4 号航站楼）和 Aerotel（3 号航站楼）提供带独立淋浴的日间睡眠舱，可按约 4 小时为单位预订，位于安检区内，无需办理英国入境。",
      "Plaza Premium 休息室（2 号和 4 号航站楼）可单独购买淋浴，不必订整间房。",
      "由连廊相通的酒店（T5 索菲特、T4 希尔顿）在公共区一侧，中转旅客要去必须先办理英国入境。",
    ],
  },
  SIN: {
    terminals: ["1、2、3、4 号航站楼"],
    beforeYouFly: [],
    afterYouLand: ["各航站楼的到达层都是 1 层，边检、行李提取和海关都在这一层。"],
    transit: {
      taxi: { title: "出租车", bullets: ["每座航站楼的到达层外都有官方出租车候车点，请走标识排队区，不要跟拉客的人走。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["公交和机场摆渡覆盖所有航站楼，现行线路请查樟宜机场官网。"], avoidScams: [] },
      rail: { title: "轨道交通（MRT）", bullets: ["地铁机场线连接 2 号、3 号航站楼与新加坡市中心。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。樟宜的轮椅借用和无障碍设施完善，在大型机场里属于比较好走的一座。",
      services: [
        { label: "轮椅协助", detail: "通过航空公司提前申请，地服人员会在登机口迎接。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "樟宜机场 — 特别协助", href: "https://www.changiairport.com/en/at-changi/special-assistance.html" }],
    },
    floorGuide: [
      { floor: "1 层", label: "所有航站楼到达 — 边检、行李提取、海关" },
      { floor: "2 层", label: "1 号、2 号航站楼出发 — 值机、安检" },
      { floor: "2/3 层", label: "3 号航站楼出发 — 值机、安检" },
    ],
  },
  AMS: {
    terminals: ["单一航站楼，出发大厅 1–3"],
    beforeYouFly: [],
    afterYouLand: ["所有到达动线都通向中央公共区域史基浦广场，火车、出租车和巴士都从这里出发。"],
    transit: {
      taxi: { title: "出租车", bullets: ["官方出租车候车点就在史基浦广场外。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["区域和长途巴士在史基浦广场外的巴士站发车。"], avoidScams: [] },
      rail: { title: "轨道交通", bullets: ["火车站就在航站楼正下方，往阿姆斯特丹中央站方向班次密集。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。史基浦只有一座航站楼，步行距离也偏短（H、M 指廊除外），相对好走。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "航站楼各处都有。" },
      ],
      officialLinks: [{ label: "史基浦 — 协助服务", href: "https://www.schiphol.nl/en/assistance/" }],
    },
    floorGuide: [
      { floor: "地面层", label: "到达、行李提取、史基浦广场、通往火车站" },
      { floor: "1 层", label: "值机与出发（1、2、3 号大厅）" },
      { floor: "2 层", label: "安检、休息室、餐厅、登机口" },
      { floor: "3 层", label: "全景露台" },
    ],
  },
  HKG: {
    terminals: ["一号客运大楼", "二号客运大楼"],
    beforeYouFly: [],
    afterYouLand: ["到达手续（边检、行李提取、海关）在一号客运大楼 5 层办理。"],
    transit: {
      taxi: { title: "出租车", bullets: ["到达大厅外设有官方的士站，请找标识排队区。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["机场巴士从客运大楼外发车，通往港岛、九龙和新界。"], avoidScams: [] },
      rail: { title: "轨道交通（机场快线）", bullets: ["机场快线每 10–12 分钟一班，约 24 分钟到香港站。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。香港国际机场全域配备无障碍洗手间、轮椅通道和盲文标识。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "两座客运大楼各处都有。" },
      ],
      officialLinks: [{ label: "香港国际机场 — 特殊需要设施", href: "https://www.hongkongairport.com/en/passenger-guide/airport-facilities-services/special-needs-access" }],
    },
    floorGuide: [
      { floor: "5 层", label: "到达 — 边检、行李提取、海关" },
      { floor: "6 层", label: "安检与出发登机口、商店、休息室" },
      { floor: "7 层", label: "值机大厅 — 航司柜台、自助值机机" },
    ],
  },
  DXB: {
    terminals: ["1 号航站楼", "2 号航站楼", "3 号航站楼（阿联酋航空）"],
    beforeYouFly: [],
    afterYouLand: ["出发去机场前先确认航站楼：阿联酋航空在 3 号，其他国际航司大多在 1 号。"],
    transit: {
      taxi: { title: "出租车", bullets: ["RTA 持牌出租车在到达层外 24 小时运营，请走官方候车点。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["RTA 公交线路连接机场与德拉和布尔迪拜。"], avoidScams: [] },
      rail: { title: "地铁", bullets: ["迪拜地铁红线直接停靠 1 号和 3 号航站楼。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "迪拜机场 — 特别协助", href: "https://dubaiairports.ae/information/special-assistance" }],
    },
    floorGuide: [
      { floor: "1 层", label: "3 号航站楼到达 — 边检、行李提取" },
      { floor: "3 层", label: "3 号航站楼出发 — 值机、安检" },
      { floor: "4 层", label: "3 号航站楼辅助到达区" },
    ],
  },
  BKK: {
    terminals: ["主航站楼", "卫星厅 SAT-1"],
    beforeYouFly: [],
    afterYouLand: ["到达手续（边检、行李提取、海关）在 2 层办理。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["官方公共出租车排队区在 1 层，请使用取号机，不要理会在到达大厅主动搭话的拉客者。"],
        avoidScams: ["在航站楼内直接接近到达旅客的非官方司机，尤其是报出远高于打表价的一口价时。"],
      },
      bus: { title: "巴士", bullets: ["机场巴士和城际客车在 1 层发车。"], avoidScams: [] },
      rail: { title: "轨道交通（机场快轨）", bullets: ["通往市中心的帕亚泰方向 ARL 在到达层下一层的地下（B 层）发车。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "航站楼各处都有。" },
      ],
      officialLinks: [{ label: "素万那普机场 — 旅客指南", href: "https://suvarnabhumi.airportthai.co.th/service/airport-guide" }],
    },
    floorGuide: [
      { floor: "1 层", label: "巴士大厅、公共出租车排队区" },
      { floor: "2 层", label: "到达 — 边检、行李提取、海关" },
      { floor: "3 层", label: "餐厅、商店、航司休息室" },
      { floor: "4 层", label: "出发 — 值机、安检、边检" },
      { floor: "地下 B 层", label: "机场快轨（ARL）站台" },
    ],
  },
  IST: {
    terminals: ["单一航站楼，指廊 A/B/D/F/G"],
    beforeYouFly: [],
    afterYouLand: ["到达登机口在 1 层，下到地面层办理边检、行李提取和海关。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["主要出租车候车点在国内和国际出口外，有橙色（最便宜）、青绿色和黑色（最贵）三种。"],
        avoidScams: [],
      },
      bus: { title: "巴士", bullets: ["巴士在交通层（地下 2 层）发车。"], avoidScams: [] },
      rail: { title: "地铁", bullets: ["M11 线通往加雷泰佩，可在此换乘伊斯坦布尔地铁全网。"], avoidScams: [] },
    },
    accessibility: {
      summary:
        "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。所有换层处都设有电梯和坡道，各层还配有盲道和无障碍卫生间。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "每层都有。" },
      ],
      officialLinks: [{ label: "伊斯坦布尔机场 — iGA Cares（无障碍）", href: "https://www.istairport.com/en/flights/airport-guides/iga-cares-accessibility/" }],
    },
    floorGuide: [
      { floor: "地面层", label: "到达 — 边检、行李提取、海关" },
      { floor: "1 层", label: "到达登机口" },
      { floor: "2 层", label: "出发 — 值机、安检、登机口" },
      { floor: "地下 2 层", label: "巴士站、部分上下客区" },
    ],
  },
  TPE: {
    terminals: ["第一航厦", "第二航厦"],
    beforeYouFly: [],
    afterYouLand: ["两座航厦的到达和行李提取都在 1 楼。"],
    transit: {
      taxi: { title: "出租车", bullets: ["两座航厦的指定候车点均可 24 小时乘车。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["往台北的机场巴士在各航厦的到达层发车。"], avoidScams: [] },
      rail: { title: "机场捷运", bullets: ["第二航厦在 B2 上车，第一航厦经 B1 进站，是到台北市区最快的方式。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "两座航厦各处都有。" },
      ],
      officialLinks: [{ label: "桃园机场 — 旅客指南", href: "https://www.taoyuan-airport.com/" }],
    },
    floorGuide: [
      { floor: "1 楼", label: "到达 — 边检、行李提取、海关（两座航厦相同）" },
      { floor: "2 楼", label: "到达指廊与中转" },
      { floor: "3 楼", label: "出发 — 值机、安检（两座航厦相同）" },
      { floor: "B1/B2", label: "机场捷运站台" },
    ],
  },
  SYD: {
    terminals: ["1 号航站楼（国际）", "2 号航站楼（国内）", "3 号航站楼（国内，澳航）"],
    beforeYouFly: [],
    afterYouLand: ["到达手续（边检、行李提取、海关）在 1 号航站楼 1 层办理。"],
    transit: {
      taxi: { title: "出租车", bullets: ["出租车候车点在 1 号航站楼到达层的室外。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["免费 T-Bus 摆渡在公共区连接所有航站楼。"], avoidScams: [] },
      rail: { title: "轨道交通（Airport Link）", bullets: ["Airport Link 列车从 1 号航站楼到国内航站楼约 2 分钟，可继续开往悉尼市中心。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "航站楼各处都有。" },
      ],
      officialLinks: [{ label: "悉尼机场 — 协助服务", href: "https://www.sydneyairport.com.au/assistance" }],
    },
    floorGuide: [
      { floor: "1 层", label: "1 号航站楼到达 — 边检、行李提取、海关" },
      { floor: "2 层", label: "1 号航站楼出发 — A–K 值机柜台、安检" },
      { floor: "3 层", label: "航司办公室、休息室" },
    ],
  },
  FRA: {
    terminals: ["1 号航站楼（指廊 A、B、C、Z）", "2 号航站楼（指廊 D、E）"],
    beforeYouFly: [],
    afterYouLand: ["楼层随指廊而变。别默认全机场只有一个到达层，请看下方的航站楼结构。"],
    transit: {
      taxi: { title: "出租车", bullets: ["出租车候车点在 1 号和 2 号航站楼到达层的出口附近。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["往法兰克福市区的机场巴士在 2 号航站楼到达大厅前的站台发车。"], avoidScams: [] },
      rail: { title: "轨道交通", bullets: ["1 号航站楼直连市郊线（S-Bahn）车站和长途（ICE/IC）车站。从 2 号航站楼需先乘免费 SkyLine 列车到 1 号航站楼才能进站。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "两座航站楼各处都有。" },
      ],
      officialLinks: [{ label: "法兰克福机场 — 特殊需求服务", href: "https://www.frankfurt-airport.com/en/travel-planning/special-needs.html" }],
    },
    floorGuide: [
      { floor: "T1 指廊 B，1 层", label: "到达 — 行李提取、海关" },
      { floor: "T1 指廊 B，2 层", label: "出发 — 值机、休息室" },
      { floor: "T1 指廊 B，3 层", label: "边检、优先安检通道" },
      { floor: "T1 指廊 A，2 层", label: "申根出发" },
      { floor: "T1 指廊 Z，3 层", label: "非申根出发（就在指廊 A 正上方，同一条指廊）" },
      { floor: "T2 指廊 D/E，2 层", label: "到达 — 行李提取、海关" },
      { floor: "T2 指廊 D/E，3 层", label: "出发 — 值机、安检" },
    ],
  },
  MUC: {
    terminals: ["1 号航站楼（模块 A–F）", "2 号航站楼（登机口 G、H + 卫星厅 K、L）"],
    beforeYouFly: [],
    afterYouLand: ["1 号航站楼按模块、其他按航站楼决定楼层和流程，请看下方的航站楼结构。"],
    transit: {
      taxi: { title: "出租车", bullets: ["出租车候车点在两座航站楼到达层的路边。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["前往中央车站的汉莎机场巴士从 1 号航站楼（到达 A 区）、慕尼黑机场中心和 2 号航站楼到达层发车。"], avoidScams: [] },
      rail: { title: "轨道交通（S-Bahn）", bullets: ["S1 和 S8 市郊列车从慕尼黑机场中心站每 10 分钟一班开往市区。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "慕尼黑机场的 Mobility Service 免费提供协助，请通过航司提前至少 48 小时申请。" },
        { label: "无障碍卫生间", detail: "两座航站楼各处都有。" },
      ],
      officialLinks: [{ label: "慕尼黑机场 — 无障碍出行", href: "https://www.munich-airport.com/accessible-travel-260945" }],
    },
    floorGuide: [
      { floor: "T1 模块 A–D，04 层", label: "到达与出发（这些模块在同一层办理）" },
      { floor: "T1 模块 B/C", label: "非申根到达 — 先过边检再提行李" },
      { floor: "T1 模块 E", label: "仅到达" },
      { floor: "T2，04 层（登机口 G）", label: "申根出发；申根到达行李提取" },
      { floor: "T2，05 层（登机口 H）", label: "非申根出发" },
    ],
  },
  CDG: {
    terminals: ["1 号航站楼", "2 号航站楼（2A–2G）", "3 号航站楼"],
    beforeYouFly: [],
    afterYouLand: ["是 2E 还是 2C，结构完全不同，请看下方的航站楼结构。"],
    transit: {
      taxi: { title: "出租车", bullets: ["各航站楼的到达层都设有出租车候车点。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["Roissybus 和 RATP 350/351 路通往巴黎市中心，免费 CDGVAL 摆渡连接 1、2、3 号航站楼。"], avoidScams: [] },
      rail: {
        title: "轨道交通（RER B / TGV）",
        bullets: [
          "开往巴黎市中心的 RER B 在 2 号航站楼和 3 号航站楼/Roissypôle 各有一站，很容易搞混，务必确认是哪一站。",
          "TGV 高铁从 2 号航站楼下方的车站发车。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "巴黎机场 — 行动不便旅客服务", href: "https://www.parisaeroport.fr/en/passengers/flight-preparation/specific-assistance/people-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "T1", label: "少见的环形结构 — CDGVAL 摆渡停靠下层，出发值机和安检在上面几层，到达在顶层" },
      { floor: "T2A/2B/2C/2D，1 层", label: "到达" },
      { floor: "T2C/2D，2 层", label: "出发 — 登机口" },
      { floor: "T2E/2F", label: "主楼设有出发层（值机、安检）和独立的到达层（行李提取）；2E 的 L/M 大厅登机口需乘摆渡列车" },
      { floor: "T3", label: "一栋小型独立建筑 — 不按楼层而按方位划分，北侧到达、南侧出发（A/B 大厅）" },
    ],
  },
  LAX: {
    terminals: ["1–8 号航站楼", "汤姆·布莱德利国际航站楼（B 航站楼）"],
    beforeYouFly: [],
    afterYouLand: ["各航站楼的到达和行李提取都在下层，只有 TBIT 使用 1 层。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["出租车只能在 1 号航站楼附近的专用上车场 LAX-it 乘坐，从各航站楼下层乘免费摆渡前往。下车则可直接在上层出发层路边完成，出租车和网约车都一样。"],
        avoidScams: [],
      },
      bus: { title: "巴士", bullets: ["开往联合车站和 Van Nuys 的 FlyAway 直达巴士在上层出发层发车。"], avoidScams: [] },
      rail: { title: "地铁 / 轻轨", bullets: ["乘免费摆渡到 LAX/Metro 交通中心，即可换乘洛杉矶地铁的轨道和公交线路。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "LAX — 无障碍服务", href: "https://www.flylax.com/lax-accessibility" }],
    },
    floorGuide: [
      { floor: "1–8 号航站楼 上层", label: "出发 — 值机、路边落客" },
      { floor: "1–8 号航站楼 下层", label: "到达 — 行李提取、接机" },
      { floor: "TBIT（B 航站楼）1 层", label: "行李提取、海关" },
      { floor: "TBIT（B 航站楼）3 层", label: "值机" },
      { floor: "TBIT（B 航站楼）4 层", label: "安检、出发" },
    ],
  },
  ORD: {
    terminals: ["1 号航站楼", "2 号航站楼", "3 号航站楼", "5 号航站楼（国际）"],
    beforeYouFly: [],
    afterYouLand: ["国际航班几乎都到 5 号航站楼，即使你接下来的国内航班从别的航站楼出发也一样，所以到达和出发的航站楼都要确认。"],
    transit: {
      taxi: { title: "出租车", bullets: ["各航站楼下层到达层的路边都可乘出租车。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["Pace 区域巴士在多式联运中心发车，可乘 ATS 前往。"], avoidScams: [] },
      rail: { title: "轨道交通（CTA 蓝线）", bullets: ["开往芝加哥市区的蓝线可从 1/2/3 号航站楼的地下通道直接进站，5 号航站楼则需先乘 ATS。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "芝加哥航空局 — 无障碍服务", href: "https://www.flychicago.com/ohare/ServicesAmenities/accessibility/Pages/default.aspx" }],
    },
    floorGuide: [
      { floor: "1/2/3 号航站楼 上层", label: "出发 — 值机、安检" },
      { floor: "1/2/3 号航站楼 下层", label: "到达 — 行李提取、地面交通" },
      { floor: "5 号航站楼 下层", label: "到达、行李提取、ATS 车站、地面交通" },
      { floor: "5 号航站楼 2 层", label: "值机、出发" },
    ],
  },
  MAD: {
    terminals: ["1 号航站楼", "2 号航站楼", "3 号航站楼", "4 号航站楼", "4 号卫星厅（T4S）"],
    beforeYouFly: [],
    afterYouLand: ["先确认航班用的是 T1/T2/T3 还是 T4/T4S，两边不在步行距离内，需要坐摆渡。"],
    transit: {
      taxi: { title: "出租车", bullets: ["官方出租车候车点在各航站楼到达层的路边。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["开往马德里市中心的机场快线巴士 24 小时运营，停靠 T1、T2 和 T4。"], avoidScams: [] },
      rail: { title: "轨道交通（地铁）", bullets: ["地铁 8 号线连接 T1/T2/T3（Aeropuerto T1-T2-T3 站）和 T4（Aeropuerto T4 站）与马德里市中心。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "Aena — 无障碍协助服务", href: "https://www.aena.es/en/passengers/travellers/passengers-with-medical-needs/barrier-free-assistance-service.html" }],
    },
    floorGuide: [
      { floor: "T1 地面层", label: "到达 — 行李提取" },
      { floor: "T1 1 层", label: "出发 — 值机" },
      { floor: "T4 0 层", label: "到达 — 行李提取、海关" },
      { floor: "T4 2 层", label: "出发 — 值机" },
      { floor: "T4S 地面层", label: "到达" },
      { floor: "T4S 1 层", label: "出发、商店、餐饮" },
      { floor: "T4S 地下", label: "通往 T4 的 APM 旅客捷运" },
    ],
  },
  ZRH: {
    terminals: ["主楼（值机／到达 1 和 2）", "E 指廊（非申根，乘 SkyMetro）"],
    beforeYouFly: [],
    afterYouLand: ["指示牌写的是“到达 1”或“到达 2”，而不是航站楼编号，请对照登机牌或航班信息确认。"],
    transit: {
      taxi: { title: "出租车", bullets: ["官方出租车可在 1 号、2 号到达大厅内侧的路边叫到。"], avoidScams: [] },
      bus: { title: "巴士", bullets: ["市内和城际巴士（含 Flixbus）停靠机场中心外的 0 层。"], avoidScams: [] },
      rail: { title: "轨道交通（SBB）", bullets: ["直达苏黎世中央车站约 10–12 分钟，在机场中心下方的车站每 6–12 分钟一班。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "航站楼各处都有。" },
      ],
      officialLinks: [{ label: "苏黎世机场 — 行动不便旅客出行", href: "https://www.flughafen-zuerich.ch/en/passengers/fly/assistance/travelling-with-reduced-mobility" }],
    },
    floorGuide: [
      { floor: "0 层", label: "地面交通（有轨电车、巴士）、到达 1 问询中心" },
      { floor: "1 层", label: "值机 1 和 2、到达 1 和 2、A/B/D 登机口" },
      { floor: "2 层", label: "其余登机口、商店、机场服务" },
      { floor: "E 指廊（乘 SkyMetro）", label: "非申根国际出发/到达 — 独立建筑" },
    ],
  },
  PVG: {
    terminals: ["1 号航站楼", "2 号航站楼", "S1 卫星厅", "S2 卫星厅"],
    beforeYouFly: [],
    afterYouLand: ["出发去机场前先确认是 T1 还是 T2，两者相距较远，公共区也不互通。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["到达大厅外的官方候车点可乘打表出租车。有人上前说磁悬浮“坏了”一律不要理会，这是把你引向高价出租车的常见套路。"],
        avoidScams: ["磁悬浮车站附近声称“故障”或“因天气停运”、想把你引向高价出租车的拉客者。磁悬浮每天正常运营。"],
      },
      bus: { title: "巴士", bullets: ["进城的机场大巴 24 小时运营。"], avoidScams: [] },
      rail: {
        title: "轨道交通（地铁 / 磁悬浮）",
        bullets: [
          "地铁 2 号线通往上海市区（往人民广场方向需在广兰路站换乘）。",
          "上海磁悬浮到龙阳路站（地铁 2 号线）约 8 分钟，车站在 T1 与 T2 之间 2 层的连廊上。",
        ],
        avoidScams: [],
      },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "两座航站楼各处都有。" },
      ],
      officialLinks: [{ label: "上海机场 — 1 号航站楼指南", href: "https://www.shanghai-airport.com/terminal-1.php" }],
    },
    floorGuide: [
      { floor: "1 层", label: "行李提取、地面交通（出租车、巴士、地铁）" },
      { floor: "2 层", label: "到达大厅、中转、磁悬浮车站（T1/T2 之间的连廊上）" },
      { floor: "3 层", label: "出发 — 值机、安检" },
    ],
  },
  KUL: {
    terminals: ["KLIA（1 号航站楼）", "klia2（2 号航站楼）"],
    beforeYouFly: [],
    afterYouLand: ["先确认航班用的是 KLIA 还是 klia2，很多人会搞混，而且两者不在步行距离内。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["到达区柜台提供预付券出租车，在柜台报目的地并付款即可，不要和司机当场谈价。"],
        avoidScams: [],
      },
      bus: { title: "巴士", bullets: ["两座航站楼都有多家巴士公司开往 KL Sentral 车站。"], avoidScams: [] },
      rail: { title: "轨道交通（KLIA Ekspres / Transit）", bullets: ["直达的 KLIA Ekspres 和站站停的 KLIA Transit 从两座航站楼的地下 1 层开往 KL Sentral。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "两座航站楼各处都有。" },
      ],
      officialLinks: [{ label: "马来西亚机场公司 — KLIA 1 号航站楼地图", href: "https://airports.malaysiaairports.com.my/en/klia1/map" }],
    },
    floorGuide: [
      { floor: "KLIA（T1）5 层", label: "出发 — 值机（A–M 共 6 组岛台、216 个柜台）" },
      { floor: "KLIA（T1）3 层", label: "到达 — 行李提取、边检、海关" },
      { floor: "KLIA（T1）1 层", label: "KLIA Ekspres/Transit 车站" },
      { floor: "klia2（T2）3 层", label: "出发 — 值机、安检" },
    ],
  },
  GRU: {
    terminals: ["1 号航站楼（蓝色航空，国内）", "2 号航站楼（国内＋南美区域国际）", "3 号航站楼（长途国际）"],
    beforeYouFly: [],
    afterYouLand: ["国际转国内需要先过边检和海关、提取行李再重新值机，请留足时间，尤其是从 3 号航站楼换到 1 号或 2 号时。"],
    transit: {
      taxi: {
        title: "出租车",
        bullets: ["官方出租车在 2 号和 3 号航站楼的地面层设有柜台，请在柜台付款，不要直接付给司机。"],
        avoidScams: ["在航站楼里主动接近旅客的非官方司机，请只用官方柜台。"],
      },
      bus: { title: "巴士", bullets: ["开往保利斯塔大道、蒂耶特和巴拉丰达的机场巴士在各航站楼到达层发车。"], avoidScams: [] },
      rail: { title: "轨道交通（CPTM 13 号线）", bullets: ["最便宜的选择，但去圣保罗市中心需要换乘。"], avoidScams: [] },
    },
    accessibility: {
      summary: "需要轮椅或行动协助，请在出发前至少 48 小时联系航空公司。",
      services: [
        { label: "轮椅协助", detail: "请通过航空公司提前申请。" },
        { label: "无障碍卫生间", detail: "所有航站楼各处都有。" },
      ],
      officialLinks: [{ label: "GRU 机场 — 航站楼指南", href: "https://www.gru.com.br/en/institutional/sobre-gru-airport/terminals" }],
    },
    floorGuide: [
      { floor: "各航站楼 地面 1 层", label: "到达 — 行李提取、海关（T1/T2/T3 一致）" },
      { floor: "2 号航站楼 2 层", label: "出发 — 值机、安检；通往 3 号航站楼的连廊也在这一层" },
      { floor: "3 号航站楼 3 层", label: "出发 — 值机、安检" },
    ],
  },
};
