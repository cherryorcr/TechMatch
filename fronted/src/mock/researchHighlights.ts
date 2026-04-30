export interface ResearchHighlight {
  application: string;
  detail: string;
  domain: string;
  id: string;
  maturity: string;
  organization: string;
  source: string;
  summary: string;
  tags: string[];
  title: string;
  type: '企业能力' | '科技成果' | '可转化成果' | '专利';
}

export const researchHighlights: ResearchHighlight[] = [
  {
    id: 'sinolight-ternary-precursor-equipment',
    title: '锂离子电池三元前驱体生产成套装备系统工程化技术',
    organization: '中轻科技',
    source: '中轻科技技术成果资料',
    type: '科技成果',
    domain: '新能源电池',
    tags: ['三元前驱体', '大型反应釜', '工程总承包'],
    summary: '集成双管并流反应控制、大型反应釜和厂房环境成套控制，支撑三元前驱体产线连续化与智能化。',
    detail:
      '技术面向超高镍、NCM811、NCA 等高镍三元前驱体万吨级产线及中低镍产线柔性生产，解决传统间歇法工艺控制难、批次产品不稳定和生产效率低等问题。三元前驱体产品可达到 GB/T 26300-2020 要求，振实密度 1.60-2.50g/cm³，比表面积 3-25m³/g，D50 4.0-14.0μm，吨产品电耗≤2000kWh。',
    application: '适合锂电新材料企业建设、扩建高镍三元前驱体产线，或采购大型反应釜装备、配料反应系统集成与工程总承包服务。',
    maturity: '专利号 ZL201911296074.3；中国海诚 王治安 15974160492',
  },
  {
    id: 'sinolight-nickel-cobalt-crystallization',
    title: '电池级硫酸镍、硫酸钴连续结晶产业化技术',
    organization: '中轻科技',
    source: '中轻科技技术成果资料',
    type: '科技成果',
    domain: '新能源电池',
    tags: ['连续结晶', 'MVR蒸发', '电池级硫酸盐'],
    summary: '采用 MVR 强制循环蒸发浓缩和改进 DTB 式结晶器，形成镍钴硫酸盐连续结晶成套装备。',
    detail:
      '技术结合硫酸镍、硫酸钴物料特性，实现蒸发和连续冷却结晶一体化。每吨产品蒸汽耗量≤0.35t，电耗降低 30%，运行成本节省 25%；产品 D50 可稳定在 1.2-1.8mm，主含量≥22.2%，磁性异物≤3ppb，单线产能提升 40%，占地节省 35%。',
    application: '适合锂电新材料企业建设电池级硫酸镍、硫酸钴原料产线，或开展正极材料提取相关咨询、设计、总承包和成套装备导入。',
    maturity: '专利号 ZL201510637001.1；中国海诚 朱利民 15802603326',
  },
  {
    id: 'sinolight-lithium-battery-recycling',
    title: '动力锂电池资源回收综合利用技术',
    organization: '中轻科技',
    source: '中轻科技技术成果资料',
    type: '科技成果',
    domain: '动力电池回收',
    tags: ['碳化提锂', '镍钴锰回收', '高盐废水处理'],
    summary: '围绕黑粉还原焙烧、碳化提锂、萃取反洗和污水处理工艺包，回收碳酸锂及镍钴锰材料。',
    detail:
      '技术通过黑粉还原焙烧、碳化提锂、过滤、除杂、蒸发浓缩、沉淀和水洗等工艺回收电池级碳酸锂，纯度≥99.5%；同时通过萃取和反洗实现镍钴锰金属材料回收，硫酸锰纯度≥99.8%、锰回收率≥95.7%，硫酸钴纯度≥97.5%、钴回收率≥92.1%，硫酸镍纯度≥98.2%、镍回收率≥95.8%。',
    application: '适合动力电池回收企业新建、扩建、技术改造项目，覆盖工艺咨询、工程设计、总承包和资源化利用方案评估。',
    maturity: '专利号 ZL202322920733.4、ZL202422347117.9；中国海诚 赵常红 13798176650',
  },
  {
    id: 'qdu-bone-scaffold',
    title: '定向多功能骨修复支架',
    organization: '青岛大学',
    source: '青岛大学高价值专利汇编',
    type: '专利',
    domain: '生物医用材料',
    tags: ['骨修复', '再生医学', '支架材料'],
    summary: '通过结构仿生、元素掺杂和界面改性，面向骨缺损修复提供骨-血管协同再生材料方案。',
    detail:
      '该专利采用拉扯-折叠法制备定向多功能骨修复支架，体外和体内实验显示其在骨组织再生、血管生成和细胞定向迁移方面具备优势，可缓解传统骨再生材料制备复杂、生物活性不足和成骨效率低等问题。',
    application: '适合骨缺损修复、组织工程材料、医用植入材料企业做联合开发或转化评估。',
    maturity: '专利号 CN202510677966.7',
  },
  {
    id: 'qdu-co2-catalyst',
    title: '光热协同催化 CO2 环加成材料',
    organization: '青岛大学',
    source: '青岛大学高价值专利汇编',
    type: '专利',
    domain: '绿色催化',
    tags: ['CO2利用', '光热催化', '低碳化工'],
    summary: '复合半导体催化材料可在温和条件下促进 CO2 环加成反应，降低过程能耗。',
    detail:
      '项目以碱金属高结晶氮化碳和氰胺金属化合物构建异质复合材料，制备过程简单、成本较低、具备放大制备潜力，适合切入二氧化碳资源化利用与绿色化工场景。',
    application: '可面向环碳酸酯合成、低碳化工工艺升级和企业绿色制造验证。',
    maturity: '专利号 CN202410702173.1',
  },
  {
    id: 'qdu-filter-media',
    title: '高效低阻 3D 微球复合空气过滤材料',
    organization: '青岛大学',
    source: '青岛大学高价值专利汇编',
    type: '专利',
    domain: '功能过滤材料',
    tags: ['空气过滤', '微纳纤维', '绿色制造'],
    summary: '通过串珠结构兼顾高过滤效率和低气阻，面向防护、净化和工业过滤应用。',
    detail:
      '该技术使用溶液喷射纺丝形成 3D 微球复合过滤材料，工艺简单、安全性高、纤维直径可调，可提升过滤性能与过滤效率，同时保持较低阻力。',
    application: '适配口罩滤材、空净滤材、工业粉尘过滤和高通量空气净化部件。',
    maturity: '专利号 CN202410857758.0',
  },
  {
    id: 'qdu-ionic-skin',
    title: '极端环境自粘附离子皮肤',
    organization: '青岛大学',
    source: '青岛大学高价值专利汇编',
    type: '专利',
    domain: '柔性传感',
    tags: ['电子皮肤', '极端环境', '可穿戴'],
    summary: '复合离子皮肤兼具抗撕裂、耐疲劳、防水和宽温稳定性，可做柔性传感界面。',
    detail:
      '材料具备应变硬化、抗撕裂和耐疲劳断裂特性，并可在高温、低温、真空和潮湿环境中保持稳定。其自适应粘附能力使其适合复杂表面贴附与长周期监测。',
    application: '可用于机器人触觉、应变监测、温度感知、自供电传感和可穿戴设备。',
    maturity: '专利号 CN202411809740.X',
  },
  {
    id: 'qdu-desalination-hydrogel',
    title: '太阳能海水淡化复合水凝胶纤维',
    organization: '青岛大学',
    source: '青岛大学高价值专利汇编',
    type: '专利',
    domain: '水处理与海水淡化',
    tags: ['海水淡化', '水凝胶', '太阳能蒸发'],
    summary: '复合水凝胶纤维强调高蒸发速率、耐盐耐久性和连续水传输能力。',
    detail:
      '材料直径约 0.5-1.1 mm，膨胀比可达 700%-900%，饱和含水量约 85%-95%，用于界面蒸发时兼顾力学韧性和水传输效率，具备规模化生产导向。',
    application: '适合分布式海水淡化、苦咸水处理、应急净水和岛礁淡水保障场景。',
    maturity: '专利号 CN202510207203.6',
  },
  {
    id: 'qdu-industrial-defect',
    title: '工业产品残损检测',
    organization: '青岛大学',
    source: '青岛大学可转化成果汇编',
    type: '可转化成果',
    domain: '工业视觉',
    tags: ['机器视觉', 'AI质检', '智能制造'],
    summary: '利用工业相机和自研 AI 算法识别划痕、凹陷、裂纹等缺陷，提升产线质量控制效率。',
    detail:
      '系统可实时分析图像数据并反馈生产线，实现残损产品自动分拣和质量控制。资料中提到其已应用于布匹残损检测生产线，并可扩展至汽车零部件、3C 精密元件、金属加工、新能源电池和医疗器械等场景。',
    application: '适合制造企业导入在线质检、缺陷分级、工艺追溯和质量预测能力。',
    maturity: '已具备产线应用案例',
  },
  {
    id: 'qdu-medical-image-ai',
    title: '医学影像 AI 智能诊断平台',
    organization: '青岛大学',
    source: '青岛大学可转化成果汇编',
    type: '可转化成果',
    domain: '智慧医疗',
    tags: ['医学影像', 'AI诊断', '多模态数据'],
    summary: '围绕脊柱、心血管、肿瘤、神经等疾病构建影像处理通用模型和垂直场景模型。',
    detail:
      '平台整合影像、病理、生理等多源数据，通过机器学习、深度学习和大模型技术提升医学影像分析效率与准确性，面向精准医疗和个体化治疗方案制定。',
    application: '适合医院影像科、基层辅助诊疗、区域医疗协同和医疗 AI 产品化验证。',
    maturity: '面向临床应用转化',
  },
  {
    id: 'qdu-electro-optic-ceramic',
    title: '透明电光陶瓷及高速电光开关',
    organization: '青岛大学',
    source: '青岛大学可转化成果汇编',
    type: '可转化成果',
    domain: '光电子材料',
    tags: ['透明陶瓷', '电光开关', '光通信'],
    summary: '高性能 PMN-PT 透明电光陶瓷可制备电光开关、电光调制器等高速光电子器件。',
    detail:
      '成果围绕透明铁电陶瓷材料与器件原型，已实现亚纳秒级激光开关、激光偏振态连续调控以及图像和音频自由空间传输，资料中指出其透光率、半波电压、电光系数等指标具备国内领先、国际先进基础。',
    application: '可对接 5G/6G 光通信、数据中心高速光模块、车载激光雷达和量子通信节点。',
    maturity: '原型器件验证',
  },
  {
    id: 'qdu-embodied-robot',
    title: '具身作业机器人感知-决策-控制框架',
    organization: '青岛大学',
    source: '青岛大学可转化成果汇编',
    type: '可转化成果',
    domain: '机器人与智能装备',
    tags: ['具身智能', '多机器人协同', '强化学习'],
    summary: '面向高端装备制造和高可靠作业，构建机器人自主感知、智能决策与协同控制能力。',
    detail:
      '团队聚焦复杂环境下机器人理解不足、自主作业能力欠缺和多机器人协同效率低等问题，结合多模态感知、多尺度关联建模、强化/模仿学习和群体协同推理，已在纺织生产、生物样本管理、无人化工厂等场景验证。',
    application: '适合低门槛部署的工业移动作业、无人化工厂、样本仓储和柔性生产场景。',
    maturity: '典型场景应用验证',
  },
  {
    id: 'xjtu-sound-vibration-temp',
    title: '声振温一体化监测诊断系统',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '智能运维',
    tags: ['状态监测', '故障诊断', '工业设备'],
    summary: '把声音、振动、冲击脉冲、温度和倾角集成到一套设备监测诊断系统中。',
    detail:
      '系统由有线/无线声振温一体传感器、采集网关和 Web 端构成，并可适配云平台和手机端小程序。其异音分析和健康因子指标算法用于旋转设备早中晚期故障监测。',
    application: '适用于风电、石化、冶金、水泥、煤炭等连续生产设备的预测性维护。',
    maturity: '技术成熟度：产业化',
  },
  {
    id: 'xjtu-video-vibration',
    title: '基于视频的全场高精度振动测试系统',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '结构健康监测',
    tags: ['非接触测量', '视频运动放大', '结构监测'],
    summary: '通过视频数据提取结构微弱振动，实现高空间分辨率、无标记的三维振动测试。',
    detail:
      '该成果可获得振动位移、速度、加速度、固有频率、主振型和结构应变等参数。资料中提到位移精度已达微米级，振动频率与激光测振误差小于 1%，应变测量误差小于 2%。',
    application: '适用于航天航空、风电叶片、核电管路、能源动力和土木结构健康监测。',
    maturity: '技术成熟度：工程样机',
  },
  {
    id: 'xjtu-mobile-mri',
    title: '移动式磁共振成像诊疗设备',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '医疗装备',
    tags: ['MRI', '移动诊疗', '低场成像'],
    summary: '低场、小型化、可移动 MRI 设备面向床边、基层和应急场景的快速成像需求。',
    detail:
      '项目围绕磁体阵列、低场非均匀磁场下图像重建算法和低频射频技术进行突破，以永磁体和共轭梯度重建算法提升移动 MRI 的成像能力。',
    application: '适合急危重头颈神经系统检查、社区诊所、灾区救援和基层医疗补充。',
    maturity: '技术成熟度：原理样机',
  },
  {
    id: 'xjtu-shaft-testing',
    title: '复杂轴类工件自动化测试设备',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '精密检测',
    tags: ['轴类检测', '机器视觉', '自动化测量'],
    summary: '面向复杂回转轴类零件，实现多特征、跨尺度、无人干预的自动化检测。',
    detail:
      '设备测量范围可达直径 120 mm、长度 1300 mm，对 1 m 左右复杂轴类可在 15 分钟内完成径向尺寸、轴向尺寸、粗糙度、跳动、倒角、圆柱度等十余类 200 多项特征检测，重复性精度最高 0.2 um。',
    application: '适用于航发轴承、汽车轴承、工业机器人、轮船、发电装备等高端轴类零件质检。',
    maturity: '技术成熟度：工程样机',
  },
  {
    id: 'xjtu-remote-sensing-model',
    title: '宏星遥感图像解译大模型',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '遥感 AI',
    tags: ['遥感解译', '大模型', '目标检测'],
    summary: '面向卫星和无人机遥感图像，提供自动解译、变化分析和特定目标检测能力。',
    detail:
      '模型可对道路、建筑、绿地、河流、农田、森林等区域做像素级分割，并对同一区域不同时间的图斑变化进行分析，用于土地违规使用、环境破坏、灾害范围与损失估计等工作。',
    application: '可对接国土资源、农业林业、水利环保、城市规划、灾害防治和国防安全场景。',
    maturity: '技术成熟度：原理样机',
  },
  {
    id: 'xjtu-itof-lidar',
    title: '全固态 iToF 阵列激光雷达微系统',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '智能传感',
    tags: ['激光雷达', 'iToF', '工业视觉'],
    summary: '无机械运动部件的固态测距微系统，强调可靠性、稳定性和寿命。',
    detail:
      '系统基于间接飞行时间原理，使用激光器、接收芯片和计算电路获取距离信息。其自主光电探测器件可提升调制对比度并降低测距误差，非线性自校准 ADC 电路用于降低前照工艺下的非线性误差。',
    application: '适用于人脸识别、辅助导航、工业视觉、智能机器人和自动驾驶感知。',
    maturity: '技术成熟度：工程样机',
  },
  {
    id: 'xjtu-compressed-air-storage',
    title: '水-气共容高效压缩空气储能系统',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '新型储能',
    tags: ['压缩空气储能', '削峰填谷', '新能源消纳'],
    summary: '提出无水坝抽水蓄能模型，融合压缩空气储能和抽水蓄能优势，实现梯级能量利用。',
    detail:
      '系统结构简单、储能规模可大可小、初期投资少、绿色无污染且受地理环境制约较小。资料中提到已建成 1000 kW 工程演示验证电站，并在无燃料或热量补充条件下实现较高电-电转换效率。',
    application: '适合风电、光伏电站储能，核电和电网调峰，以及可再生能源并网消纳。',
    maturity: '技术成熟度：产业化',
  },
  {
    id: 'xjtu-smart-spindle',
    title: '工业机器人高精高效加工智能主轴',
    organization: '西安交通大学',
    source: '西安交通大学科技成果推广项目手册（2026年）',
    type: '科技成果',
    domain: '高端装备制造',
    tags: ['工业机器人', '智能主轴', '复杂零件加工'],
    summary: '为工业机器人配套高刚性轻量化主轴，解决大型复杂零件高精高效加工难题。',
    detail:
      '智能主轴转速达 20000 r/min，径向和轴向跳动小于 3 um，具备多传感信息感知、加工状态在线监测、异常辨识、自诊断和振动主动控制等模块，可用于铣削、钻削和磨削。',
    application: '面向航天舱体、飞机蒙皮、舰船螺旋桨叶片等大型复杂零件的柔性加工。',
    maturity: '技术成熟度：原理样机',
  },
  {
    id: 'sugon-advanced-computing',
    title: '先进计算与智算基础设施能力',
    organization: '中科曙光',
    source: '中科曙光公司简介（商业版）',
    type: '企业能力',
    domain: '先进计算',
    tags: ['高性能计算', '智算中心', '算力底座'],
    summary: '围绕高端计算机、人工智能服务器、存储、云计算和算力服务形成基础设施组合。',
    detail:
      '资料显示中科曙光在先进计算、智能计算等领域具备技术积累和市场份额，产品与能力覆盖核心部件、基础设施和平台服务，可支撑科研教育、政府政务、能源智造、互联网和金融等行业。',
    application: '适合作为高校科研算力、制造业数字化、AI 训练推理和区域算力中心建设的供给侧能力。',
    maturity: '企业能力画像',
  },
  {
    id: 'sugon-green-data-center',
    title: '液冷绿色数据中心与一体化交付',
    organization: '中科曙光',
    source: '中科曙光公司简介（商业版）',
    type: '企业能力',
    domain: '绿色计算',
    tags: ['液冷', 'PUE', '数据中心'],
    summary: '液冷部署、绿色计算和数据中心建设运营能力可支撑低能耗算力基础设施。',
    detail:
      '资料中提到其数据中心基础设施产品和液冷技术，PUE 可低至 1.04，整体节能超过 30%，并提供从规划、建设到运营的一体化全周期服务。',
    application: '适用于城市云中心、先进计算中心、智算中心和一体化大数据中心建设。',
    maturity: '企业能力画像',
  },
  {
    id: 'sugon-computing-ecosystem',
    title: '城市云中心与算力服务生态',
    organization: '中科曙光',
    source: '中科曙光公司简介（商业版）',
    type: '企业能力',
    domain: '算力服务',
    tags: ['城市云', '算力运营', '生态运营'],
    summary: '以城市云中心、5A 级智算中心和先进计算中心为载体，提供算力、数据、生态和产业运营。',
    detail:
      '资料提到其城市云中心已在多个城市落地，智算中心覆盖长沙、合肥、宁波、青岛等行业标杆案例，平台服务面向科学计算、人工智能、工业计算、政务云和行业服务持续扩展。',
    application: '适合对接地方新基建、科研教育算力服务、产业数字化平台和政企云能力建设。',
    maturity: '企业能力画像',
  },
];

export function getFeaturedResearchHighlights(limit = 8) {
  const pinned = [
    ...researchHighlights.filter((highlight) => highlight.organization === '中轻科技'),
    ...researchHighlights.filter((highlight) => highlight.organization === '中科曙光').slice(0, 1),
  ].slice(0, limit);
  const pinnedIds = new Set(pinned.map((highlight) => highlight.id));
  const pool = researchHighlights.filter((highlight) => !pinnedIds.has(highlight.id));

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return [...pinned, ...pool].slice(0, limit);
}
