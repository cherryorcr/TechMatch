import type {
  ChatMessage,
  ChatSession,
  ContextualRecommendationState,
  HomeModeConfig,
  HomeModeId,
  MatchOptions,
  RecommendationBundle,
  RecommendationItem,
  SessionRecord,
  SuggestionCard,
} from '../types/chat';

export type {
  ChatMessage,
  ChatSession,
  ContextualRecommendationState,
  HomeModeConfig,
  HomeModeId,
  MatchOptions,
  RecommendationBundle,
  RecommendationItem,
  SessionRecord,
  SuggestionCard,
} from '../types/chat';

export const defaultHomeMode: HomeModeId = 'internal-industry';
export const defaultMatchOptions: MatchOptions = {
  paperCount: 5,
  showReasoning: false,
};
export const paperCountOptions = [5, 10, 20, 30];

type SignalGroup = {
  label: string;
  aliases: string[];
};

const modeSignals: Record<HomeModeId, SignalGroup[]> = {
  'internal-industry': [
    { label: '固态电池', aliases: ['固态电池', '储能', '电池', '锂电'] },
    { label: '工业机器人感知', aliases: ['机器人', '感知', '视觉', '机械臂', '传感'] },
    { label: '绿色催化', aliases: ['催化', '化工', '绿色化学', '反应'] },
    { label: '先进材料', aliases: ['材料', '薄膜', '复合', '高分子'] },
    { label: '专利转化', aliases: ['专利', '转化', '中试', '落地'] },
  ],
  'external-expert': [
    { label: '具身智能', aliases: ['具身', '机器人', '感知', '智能体'] },
    { label: '柔性电子', aliases: ['柔性电子', '可穿戴', '柔性', '电子皮肤'] },
    { label: '材料计算', aliases: ['材料', '计算', '生成', '筛选'] },
    { label: '专利运营', aliases: ['专利', '许可', '运营', '转让'] },
    { label: '产业合作', aliases: ['企业', '合作', '场景', '联合研发'] },
  ],
  academic: [
    { label: '新能源材料', aliases: ['新能源', '储能', '电池', '材料'] },
    { label: '高分子材料', aliases: ['高分子', '聚合物', '功能材料'] },
    { label: '生物制造', aliases: ['生物制造', '合成生物', '发酵', '生物'] },
    { label: '机器人与智能制造', aliases: ['机器人', '智能制造', '自动化', '装备'] },
    { label: '重点实验室', aliases: ['实验室', '平台', '重点实验室', '工程中心'] },
  ],
  'deep-search': [
    { label: '需求拆解', aliases: ['需求', '问题', '目标', '场景', '指标'] },
    { label: '论文检索', aliases: ['论文', '文献', 'paper', 'article', '综述'] },
    { label: '研究脉络', aliases: ['路线', '脉络', '方法', '进展', '趋势'] },
    { label: '实验指标', aliases: ['实验', '数据集', 'benchmark', '性能', '对比'] },
    { label: '总结报告', aliases: ['总结', '报告', '归纳', '摘要', '结论'] },
  ],
  'tech-recommendation': [
    { label: '需求追问', aliases: ['需求', '约束', '边界', '预算', '周期'] },
    { label: '技术方案', aliases: ['方案', '架构', '技术路线', '路线图', '实施'] },
    { label: '选型评估', aliases: ['选型', '框架', '平台', '模型', '工具'] },
    { label: '落地路径', aliases: ['落地', '部署', '试点', '集成', '交付'] },
    { label: '风险控制', aliases: ['风险', '成本', '安全', '合规', '维护'] },
  ],
};

const defaultSignals: Record<HomeModeId, string[]> = {
  'internal-industry': ['固态电池', '工业机器人感知', '专利转化'],
  'external-expert': ['具身智能', '产业合作', '专利运营'],
  academic: ['新能源材料', '重点实验室', '机器人与智能制造'],
  'deep-search': ['需求拆解', '论文检索', '研究脉络'],
  'tech-recommendation': ['需求追问', '技术方案', '选型评估'],
};

const nextQuestionMap: Record<HomeModeId, string[]> = {
  'internal-industry': [
    '你更关注论文、专利，还是两者联合筛选？',
    '是否有行业、年份、成熟度或地域限制？',
    '最终要输出清单、合作对象，还是技术路线建议？',
  ],
  'external-expert': [
    '你的论文或专利目前处于什么成熟阶段？',
    '更希望匹配企业需求、合作场景，还是落地路径？',
    '是否有目标行业或不希望进入的应用场景？',
  ],
  academic: [
    '你最关注机构的优势学科、代表成果还是团队平台？',
    '是否限定某个领域，例如新能源、材料或机器人？',
    '最终希望看到概览、成果清单，还是机构画像？',
  ],
  'deep-search': [
    '这个需求最核心的研究问题、应用场景和评价指标分别是什么？',
    '论文总结更关注方法路线、实验结果、产业启发，还是研究空白？',
    '是否限定年份、学科方向、期刊会议级别或中英文来源？',
  ],
  'tech-recommendation': [
    '当前需求的业务目标、使用对象和必须满足的硬约束是什么？',
    '更希望得到架构选型、实施步骤、资源投入，还是风险清单？',
    '是否已有技术栈、数据条件、部署环境或预算周期限制？',
  ],
};

export const homeModes: Record<HomeModeId, HomeModeConfig> = {
  'internal-industry': {
    id: 'internal-industry',
    label: '内部产业用户模式',
    title: '定义企业问题，组织可落地的科研线索',
    subtitle:
      '围绕企业场景、技术瓶颈与转化约束，先完成需求澄清，再进入论文、专利和合作机构的联合匹配。',
    placeholder:
      '请输入企业需求、应用场景、关键指标，或希望匹配的论文 / 专利方向...',
    inputHint:
      '建议直接写清行业、应用部门、技术指标和落地约束，系统会先帮你补齐筛选边界。',
    suggestions: [
      {
        id: 'industry-1',
        title: '储能需求匹配论文与专利',
        prompt:
          '我们希望围绕固态电池产业化需求匹配相关论文和专利，请先通过多轮提问明确筛选条件。',
      },
      {
        id: 'industry-2',
        title: '机器人感知升级',
        prompt:
          '针对工业机器人感知升级需求，请先追问关键约束，再匹配相关论文和专利。',
      },
      {
        id: 'industry-3',
        title: '绿色催化成果转化',
        prompt:
          '我们想围绕绿色催化工艺寻找可转化成果，请先通过多轮对话澄清业务目标，再匹配论文与专利。',
      },
    ],
    previewSections: [
      {
        id: 'industry-preview-1',
        title: '先说明什么',
        items: ['企业应用场景', '技术瓶颈或评价指标', '论文 / 专利偏好'],
      },
      {
        id: 'industry-preview-2',
        title: '系统会继续追问',
        items: ['成熟度与转化周期', '行业限制或地域要求', '希望输出的匹配结果形式'],
      },
      {
        id: 'industry-preview-3',
        title: '进入匹配后会看到',
        items: ['相关论文候选', '专利线索与方向', '对应团队与机构'],
      },
    ],
    recommendations: {
      scholars: [
        {
          id: 'industry-scholar-1',
          title: '周岚 教授',
          meta: '固态电池与界面工程 | 华东先进储能团队',
          detail: '适合对接储能材料、界面优化和工程化验证相关需求。',
          keywords: ['固态电池', '先进材料'],
        },
        {
          id: 'industry-scholar-2',
          title: '刘朔 研究员',
          meta: '工业机器人感知 | 智能制造联合实验室',
          detail: '在多传感融合、复杂工况感知和产线验证上经验较强。',
          keywords: ['工业机器人感知'],
        },
        {
          id: 'industry-scholar-3',
          title: '陈拓 教授',
          meta: '绿色催化与放大验证 | 产业催化工程中心',
          detail: '兼顾论文输出、专利布局与中试放大，适合成果转化导向项目。',
          keywords: ['绿色催化', '专利转化'],
        },
      ],
      papers: [
        {
          id: 'industry-paper-1',
          title: 'Solid-State Interface Engineering for Scalable Energy Systems',
          meta: 'Advanced Energy Systems, 2025',
          detail: '适合储能方向的工程化成熟度判断，也可联动筛选专利。',
          keywords: ['固态电池', '先进材料'],
        },
        {
          id: 'industry-paper-2',
          title: 'Multi-Sensor Fusion for Industrial Robot Perception',
          meta: 'Robotics Frontiers, 2024',
          detail: '适合作为工业机器人感知升级需求下的论文入口。',
          keywords: ['工业机器人感知'],
        },
        {
          id: 'industry-paper-3',
          title: 'Catalyst Scale-Up Pipelines for Low-Carbon Chemical Production',
          meta: 'Green Process Review, 2025',
          detail: '适合绿色催化、放大验证和专利转化联合评估。',
          keywords: ['绿色催化', '专利转化'],
        },
      ],
      institutions: [
        {
          id: 'industry-inst-1',
          title: '上海先进储能研究院',
          meta: '优势：储能材料中试平台',
          detail: '适合技术试配、验证和与专利转化能力联动评估。',
          keywords: ['固态电池', '专利转化'],
        },
        {
          id: 'industry-inst-2',
          title: '智能制造协同创新中心',
          meta: '优势：机器人与工业软件验证',
          detail: '适合复杂场景下的机器人感知算法与系统协同验证。',
          keywords: ['工业机器人感知'],
        },
        {
          id: 'industry-inst-3',
          title: '绿色催化技术转化平台',
          meta: '优势：催化工艺放大与知识产权梳理',
          detail: '适合催化工艺从论文线索走向专利与工艺验证。',
          keywords: ['绿色催化', '专利转化'],
        },
      ],
      directions: ['固态电池', '工业机器人感知', '绿色催化', '先进材料', '专利转化'],
    },
  },
  'external-expert': {
    id: 'external-expert',
    label: '外部专家用户模式',
    title: '输入成果画像，反向寻找更合适的企业需求',
    subtitle:
      '面向学者与外部专家，先提炼论文、专利和成果的能力边界，再映射到企业真实需求和应用场景。',
    placeholder:
      '请输入论文摘要、专利亮点、技术指标，或希望匹配的企业需求场景...',
    inputHint:
      '建议先给代表论文、专利摘要、成熟度和可转化方向，系统会继续追问补齐成果画像。',
    suggestions: [
      {
        id: 'expert-1',
        title: '输入论文匹配企业需求',
        prompt:
          '我有一篇具身智能方向的代表论文，请先通过多轮提问理解论文内容，再去匹配企业内部需求。',
      },
      {
        id: 'expert-2',
        title: '输入专利寻找应用场景',
        prompt:
          '我有一项柔性电子相关专利，请先了解专利内容和应用边界，再匹配企业需求。',
      },
      {
        id: 'expert-3',
        title: '成果画像对接企业',
        prompt:
          '请根据我提供的论文和专利成果，逐步确认哪些企业内部需求更适合对接。',
      },
    ],
    previewSections: [
      {
        id: 'expert-preview-1',
        title: '先提供什么',
        items: ['论文题目或摘要', '专利核心技术点', '成熟度与验证情况'],
      },
      {
        id: 'expert-preview-2',
        title: '系统会继续追问',
        items: ['适合的应用场景', '想对接的行业类型', '合作或转化方式'],
      },
      {
        id: 'expert-preview-3',
        title: '进入匹配后会看到',
        items: ['相关企业需求', '可能的落地场景', '对接机构与论文线索'],
      },
    ],
    recommendations: {
      scholars: [
        {
          id: 'expert-scholar-1',
          title: '赵闻 教授',
          meta: '具身智能 | 智能系统实验室',
          detail: '适合作为学者成果转向企业需求匹配的参考画像。',
          keywords: ['具身智能', '产业合作'],
        },
        {
          id: 'expert-scholar-2',
          title: 'Maya Lin',
          meta: '柔性电子 | Frontier Wearable Lab',
          detail: '具备论文与专利并行积累，适合成果对接企业场景。',
          keywords: ['柔性电子', '专利运营'],
        },
        {
          id: 'expert-scholar-3',
          title: '宋晗 研究员',
          meta: '材料计算 | 生成式发现团队',
          detail: '适合从论文能力画像延伸到企业筛选与联合研发。',
          keywords: ['材料计算', '产业合作'],
        },
      ],
      papers: [
        {
          id: 'expert-paper-1',
          title: 'Embodied Perception Benchmarks Beyond Controlled Labs',
          meta: 'Intelligent Systems Review, 2025',
          detail: '适合梳理具身智能成果能否进入企业真实工况的判断依据。',
          keywords: ['具身智能', '产业合作'],
        },
        {
          id: 'expert-paper-2',
          title: 'Stretchable Sensing Interfaces for Wearable Electronics',
          meta: 'Flexible Devices, 2024',
          detail: '适合作为柔性电子与可穿戴场景的成果入口文献。',
          keywords: ['柔性电子', '专利运营'],
        },
        {
          id: 'expert-paper-3',
          title: 'Generative Discovery Pipelines in Computational Materials',
          meta: 'Materials Informatics, 2025',
          detail: '适合说明材料计算成果如何对接产业侧问题。',
          keywords: ['材料计算', '产业合作'],
        },
      ],
      institutions: [
        {
          id: 'expert-inst-1',
          title: '未来智能系统联合体',
          meta: '优势：复杂环境评测与应用验证',
          detail: '适合作为专家成果对接企业真实场景的验证平台。',
          keywords: ['具身智能', '产业合作'],
        },
        {
          id: 'expert-inst-2',
          title: '柔性电子成果转化中心',
          meta: '优势：专利梳理与可穿戴应用验证',
          detail: '适合柔性电子成果与专利运营的需求匹配。',
          keywords: ['柔性电子', '专利运营'],
        },
        {
          id: 'expert-inst-3',
          title: '材料计算协同平台',
          meta: '优势：生成式筛选与企业联合研发',
          detail: '适合从论文成果延展到企业需求映射与评估。',
          keywords: ['材料计算', '产业合作'],
        },
      ],
      directions: ['具身智能', '柔性电子', '材料计算', '专利运营', '产业合作'],
    },
  },
  academic: {
    id: 'academic',
    label: '高校科研机构模式',
    title: '输入机构名称，快速建立优势学科与成果画像',
    subtitle:
      '面向高校、研究院所和重点平台，先锁定机构与关注重点，再整理优势学科、代表成果和团队能力。',
    placeholder:
      '请输入高校、研究院、重点实验室，或其他科技成果产出机构名称...',
    inputHint:
      '建议先输入机构名称，再补充想看的方向，例如优势学科、代表成果、团队或平台能力。',
    suggestions: [
      {
        id: 'academic-1',
        title: '查看高校优势学科',
        prompt:
          '请输入某高校名称后，先通过多轮提问帮助我了解它的优势学科和代表成果产出。',
      },
      {
        id: 'academic-2',
        title: '查看研究院成果方向',
        prompt:
          '我想了解某研究院在新能源材料方面的成果产出，请先引导我明确关注重点。',
      },
      {
        id: 'academic-3',
        title: '查看重点实验室画像',
        prompt:
          '请围绕重点实验室名称发起一段对话，帮助我了解它的优势学科、论文产出和成果特色。',
      },
    ],
    previewSections: [
      {
        id: 'academic-preview-1',
        title: '先提供什么',
        items: ['机构名称', '关注学科或方向', '想看的输出内容'],
      },
      {
        id: 'academic-preview-2',
        title: '系统会继续追问',
        items: ['是否关注论文或成果', '是否限定学院 / 实验室', '是否聚焦近年产出'],
      },
      {
        id: 'academic-preview-3',
        title: '进入整理后会看到',
        items: ['优势学科画像', '代表成果与论文', '相关团队与平台能力'],
      },
    ],
    recommendations: {
      scholars: [
        {
          id: 'academic-scholar-1',
          title: '唐越 教授',
          meta: '高分子功能材料 | 重点实验室平台主管',
          detail: '适合作为理解机构优势学科与成果结构的代表学者参考。',
          keywords: ['高分子材料', '重点实验室'],
        },
        {
          id: 'academic-scholar-2',
          title: '高郗 研究员',
          meta: '新能源材料 | 先进表征平台',
          detail: '适合辅助判断机构在新能源材料方向的成果产出强项。',
          keywords: ['新能源材料'],
        },
        {
          id: 'academic-scholar-3',
          title: '林峻 团队负责人',
          meta: '机器人与智能制造 | 装备创新平台',
          detail: '适合观察机构在机器人与智能制造方向的团队布局。',
          keywords: ['机器人与智能制造', '重点实验室'],
        },
      ],
      papers: [
        {
          id: 'academic-paper-1',
          title: 'Functional Polymer Platforms for Industry-Ready Materials',
          meta: 'Advanced Functional Interfaces, 2025',
          detail: '适合代表高分子功能材料方向的论文产出水平。',
          keywords: ['高分子材料'],
        },
        {
          id: 'academic-paper-2',
          title: 'High-Throughput Characterization for Next-Gen Energy Materials',
          meta: 'Materials Research Letters, 2025',
          detail: '适合作为新能源材料与测试平台能力的论文线索。',
          keywords: ['新能源材料'],
        },
        {
          id: 'academic-paper-3',
          title: 'Robot-Centric Manufacturing Cells for Flexible Production',
          meta: 'Advanced Manufacturing Systems, 2024',
          detail: '适合判断机器人与智能制造方向的应用导向产出。',
          keywords: ['机器人与智能制造'],
        },
      ],
      institutions: [
        {
          id: 'academic-inst-1',
          title: '国家高分子材料重点实验室',
          meta: '优势：材料设计与中试验证',
          detail: '适合查看机构优势学科、代表成果与成果转化接口。',
          keywords: ['高分子材料', '重点实验室'],
        },
        {
          id: 'academic-inst-2',
          title: '新能源材料与装备研究院',
          meta: '优势：新能源材料与测试表征',
          detail: '适合了解机构在新能源材料方向的成果产出特点。',
          keywords: ['新能源材料'],
        },
        {
          id: 'academic-inst-3',
          title: '智能制造协同创新平台',
          meta: '优势：机器人、自动化与装备验证',
          detail: '适合梳理机构在机器人与智能制造方向的团队与平台。',
          keywords: ['机器人与智能制造', '重点实验室'],
        },
      ],
      directions: ['新能源材料', '高分子材料', '生物制造', '机器人与智能制造', '重点实验室'],
    },
  },
  'deep-search': {
    id: 'deep-search',
    label: 'Mode 3 深度搜索',
    title: '从需求出发，生成可读的论文总结',
    subtitle:
      '面向“需求 -> 论文总结”的深度搜索流程，先拆解研究问题和检索边界，再组织论文脉络、方法比较和可复用结论。',
    placeholder:
      '请输入研究需求、业务问题、目标场景或希望总结的论文方向，例如“面向工业缺陷检测的多模态大模型方法综述”...',
    inputHint:
      '建议写清研究问题、应用场景、限定年份、评价指标和希望总结的侧重点，系统会先追问检索边界。',
    suggestions: [
      {
        id: 'deep-search-1',
        title: '需求转论文综述',
        prompt:
          '我想围绕工业缺陷检测中的多模态大模型做深度搜索，请先追问需求边界，再总结代表论文的方法路线和实验结论。',
      },
      {
        id: 'deep-search-2',
        title: '论文脉络梳理',
        prompt:
          '请基于“固态电池界面稳定性提升”这个需求，帮我梳理近五年论文脉络、核心方法和研究空白。',
      },
      {
        id: 'deep-search-3',
        title: '技术问题找文献',
        prompt:
          '我需要了解低成本机器人力控方案的论文进展，请先确认应用场景和评价指标，再生成论文总结。',
      },
    ],
    previewSections: [
      {
        id: 'deep-search-preview-1',
        title: '先说明什么',
        items: ['研究需求或问题', '应用场景与评价指标', '年份 / 来源范围'],
      },
      {
        id: 'deep-search-preview-2',
        title: '系统会继续追问',
        items: ['检索关键词边界', '论文总结侧重点', '是否需要方法对比'],
      },
      {
        id: 'deep-search-preview-3',
        title: '进入总结后会看到',
        items: ['代表论文清单', '方法路线归纳', '研究空白与启发'],
      },
    ],
    recommendations: {
      scholars: [
        {
          id: 'deep-search-scholar-1',
          title: '王澈 教授',
          meta: '多模态学习与工业视觉 | 智能感知团队',
          detail: '适合作为工业视觉、缺陷检测与多模态模型方向的论文脉络参照。',
          keywords: ['论文检索', '实验指标'],
        },
        {
          id: 'deep-search-scholar-2',
          title: '许知 研究员',
          meta: '能源材料文献计量 | 先进材料研究中心',
          detail: '适合辅助整理材料方向论文的主题演进、方法聚类和研究空白。',
          keywords: ['研究脉络', '总结报告'],
        },
        {
          id: 'deep-search-scholar-3',
          title: 'Lena Park',
          meta: 'Robotics Survey Lab | Embodied AI',
          detail: '适合围绕机器人控制与具身智能主题建立代表论文索引。',
          keywords: ['论文检索', '研究脉络'],
        },
      ],
      papers: [
        {
          id: 'deep-search-paper-1',
          title: 'Multimodal Foundation Models for Industrial Visual Inspection',
          meta: 'Pattern Recognition Survey, 2025',
          detail: '适合作为工业缺陷检测需求下的方法分类、数据集和实验指标总结入口。',
          keywords: ['论文检索', '实验指标'],
        },
        {
          id: 'deep-search-paper-2',
          title: 'Interface Stabilization Strategies in Solid-State Batteries',
          meta: 'Energy Materials Review, 2024',
          detail: '适合梳理固态电池界面稳定性提升的研究路线和关键实验结论。',
          keywords: ['研究脉络', '总结报告'],
        },
        {
          id: 'deep-search-paper-3',
          title: 'Low-Cost Force Control for Collaborative Robots',
          meta: 'Robotics Methods, 2025',
          detail: '适合总结机器人力控方案的硬件约束、控制方法和性能对比。',
          keywords: ['需求拆解', '实验指标'],
        },
      ],
      institutions: [
        {
          id: 'deep-search-inst-1',
          title: '工业视觉文献分析工作组',
          meta: '优势：论文聚类、数据集与指标对照',
          detail: '适合把需求转化为可搜索关键词、代表论文集合和方法对比表。',
          keywords: ['论文检索', '实验指标'],
        },
        {
          id: 'deep-search-inst-2',
          title: '能源材料综述协作平台',
          meta: '优势：材料方向研究脉络梳理',
          detail: '适合沉淀文献路线图、核心结论和后续可验证假设。',
          keywords: ['研究脉络', '总结报告'],
        },
        {
          id: 'deep-search-inst-3',
          title: '机器人方法评测中心',
          meta: '优势：控制算法、数据集与 benchmark 对比',
          detail: '适合围绕工程需求提炼论文中的可落地方法和验证指标。',
          keywords: ['需求拆解', '实验指标'],
        },
      ],
      directions: ['需求拆解', '论文检索', '研究脉络', '实验指标', '总结报告'],
    },
  },
  'tech-recommendation': {
    id: 'tech-recommendation',
    label: 'Mode 4 技术推荐',
    title: '通过需求追问，形成可执行技术方案',
    subtitle:
      '面向“需求追问 -> 技术方案”的推荐流程，先确认业务目标、约束和资源条件，再输出架构选型、实施路径与风险控制建议。',
    placeholder:
      '请输入业务需求、已有技术栈、数据条件、预算周期或希望解决的技术问题，例如“搭建企业内部科研成果知识库问答系统”...',
    inputHint:
      '建议写清使用对象、关键流程、数据来源、部署环境和必须满足的约束，系统会先补齐方案设计所需条件。',
    suggestions: [
      {
        id: 'tech-rec-1',
        title: '科研知识库方案',
        prompt:
          '我们想搭建企业内部科研成果知识库问答系统，请先追问数据、权限和使用场景，再推荐技术方案。',
      },
      {
        id: 'tech-rec-2',
        title: '智能匹配系统选型',
        prompt:
          '请围绕论文、专利与企业需求智能匹配系统做需求追问，并给出可落地的技术架构和实施步骤。',
      },
      {
        id: 'tech-rec-3',
        title: '生产质检 AI 方案',
        prompt:
          '我们要在生产质检环节引入 AI 识别能力，请先确认现场约束，再推荐模型、数据和部署方案。',
      },
    ],
    previewSections: [
      {
        id: 'tech-rec-preview-1',
        title: '先说明什么',
        items: ['业务目标和用户', '数据与系统现状', '预算周期和约束'],
      },
      {
        id: 'tech-rec-preview-2',
        title: '系统会继续追问',
        items: ['部署环境', '安全合规要求', '评估指标与验收口径'],
      },
      {
        id: 'tech-rec-preview-3',
        title: '进入推荐后会看到',
        items: ['技术架构', '实施里程碑', '风险与备选方案'],
      },
    ],
    recommendations: {
      scholars: [
        {
          id: 'tech-rec-scholar-1',
          title: '方案架构顾问画像',
          meta: '企业 AI 应用架构 | 知识库与智能检索',
          detail: '适合把需求拆成数据治理、检索增强、权限控制和应用集成几个模块。',
          keywords: ['技术方案', '选型评估'],
        },
        {
          id: 'tech-rec-scholar-2',
          title: '工程落地顾问画像',
          meta: 'MLOps 与私有化部署 | 交付实施',
          detail: '适合评估部署环境、运维成本、监控闭环和分阶段上线节奏。',
          keywords: ['落地路径', '风险控制'],
        },
        {
          id: 'tech-rec-scholar-3',
          title: '数据治理顾问画像',
          meta: '权限、质量与合规 | 企业数据平台',
          detail: '适合处理多源数据接入、敏感信息边界和知识更新机制。',
          keywords: ['需求追问', '风险控制'],
        },
      ],
      papers: [
        {
          id: 'tech-rec-paper-1',
          title: 'RAG 知识库技术方案',
          meta: '数据接入 + 向量检索 + 权限控制 + 评测闭环',
          detail: '适合企业内部科研成果问答、文档检索和专家经验沉淀场景。',
          keywords: ['技术方案', '选型评估'],
        },
        {
          id: 'tech-rec-paper-2',
          title: '论文专利需求匹配架构',
          meta: '实体抽取 + 语义匹配 + 规则过滤 + 人工确认',
          detail: '适合构建从需求理解到候选成果推荐的可解释匹配链路。',
          keywords: ['技术方案', '落地路径'],
        },
        {
          id: 'tech-rec-paper-3',
          title: '生产质检 AI 落地方案',
          meta: '数据采集 + 小样本训练 + 边缘部署 + 质量复盘',
          detail: '适合现场约束强、数据逐步积累、需要先试点再扩展的质检场景。',
          keywords: ['落地路径', '风险控制'],
        },
      ],
      institutions: [
        {
          id: 'tech-rec-inst-1',
          title: '企业知识库实施平台',
          meta: '能力：文档治理、检索增强、权限集成',
          detail: '适合从已有文档资产开始，快速搭建可评测、可迭代的问答系统。',
          keywords: ['技术方案', '选型评估'],
        },
        {
          id: 'tech-rec-inst-2',
          title: '智能匹配系统试点环境',
          meta: '能力：需求标签、成果画像、推荐评估',
          detail: '适合先用小范围真实业务数据验证匹配效果，再扩展到多部门使用。',
          keywords: ['需求追问', '落地路径'],
        },
        {
          id: 'tech-rec-inst-3',
          title: 'AI 质检边缘部署平台',
          meta: '能力：产线接入、模型监控、异常复核',
          detail: '适合强调稳定性、响应延迟和持续运维的工业现场。',
          keywords: ['落地路径', '风险控制'],
        },
      ],
      directions: ['需求追问', '技术方案', '选型评估', '落地路径', '风险控制'],
    },
  },
};

export const homeModeList = Object.values(homeModes);

export function createSessionTitle(prompt: string) {
  const trimmed = prompt.trim();

  if (!trimmed) {
    return '新对话';
  }

  return trimmed.length > 22 ? `${trimmed.slice(0, 22)}...` : trimmed;
}

function uniqueList(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function detectSignals(modeId: HomeModeId, text: string) {
  const normalized = text.toLowerCase();
  const groups = modeSignals[modeId];

  return groups
    .filter((group) => group.aliases.some((alias) => normalized.includes(alias.toLowerCase())))
    .map((group) => group.label);
}

function pickItems(items: RecommendationItem[], signals: string[], limit: number) {
  const scored = items
    .map((item, index) => {
      const score = (item.keywords ?? []).reduce((total, keyword) => {
        return signals.includes(keyword) ? total + 2 : total;
      }, 0);

      return { item, index, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    });

  const preferred = scored.filter((entry) => entry.score > 0).map((entry) => entry.item);

  if (preferred.length >= limit) {
    return preferred.slice(0, limit);
  }

  const fallback = scored
    .map((entry) => entry.item)
    .filter((item) => !preferred.some((preferredItem) => preferredItem.id === item.id));

  return [...preferred, ...fallback].slice(0, limit);
}

function pickDirections(baseDirections: string[], signals: string[]) {
  return uniqueList([...signals.filter((signal) => baseDirections.includes(signal)), ...baseDirections]).slice(0, 4);
}

function createReasoning(modeId: HomeModeId, prompt: string, options: MatchOptions, turn: number) {
  const modeName = homeModes[modeId].label;

  if (modeId === 'internal-industry') {
    return `当前处于${modeName}。系统会先通过第 ${turn} 轮追问澄清企业需求边界，再把候选论文规模控制在 Top ${options.paperCount}，并同步联动可参考的专利方向。当前提炼的需求焦点是：${createSessionTitle(prompt)}。`;
  }

  if (modeId === 'external-expert') {
    return `当前处于${modeName}。系统会先通过第 ${turn} 轮追问理解论文与专利内容，再把成果能力与企业内部需求做反向匹配，论文候选规模控制在 Top ${options.paperCount}。当前提炼的成果焦点是：${createSessionTitle(prompt)}。`;
  }

  if (modeId === 'deep-search') {
    return `当前处于${modeName}。系统会先通过第 ${turn} 轮追问拆解研究需求和检索边界，再把代表论文控制在 Top ${options.paperCount} 范围内组织总结。当前提炼的搜索焦点是：${createSessionTitle(prompt)}。`;
  }

  if (modeId === 'tech-recommendation') {
    return `当前处于${modeName}。系统会先通过第 ${turn} 轮追问明确业务目标、系统约束和资源条件，再生成技术架构、实施步骤和风险控制建议。当前提炼的方案焦点是：${createSessionTitle(prompt)}。`;
  }

  return `当前处于${modeName}。系统会先通过第 ${turn} 轮追问明确机构名称与关注重点，再逐步整理其优势学科、代表成果和产出方向。当前提炼的查询焦点是：${createSessionTitle(prompt)}。`;
}

export function buildAssistantReply(
  modeId: HomeModeId,
  prompt: string,
  options: MatchOptions,
  userTurnCount: number,
) {
  const modeName = homeModes[modeId].label;

  if (modeId === 'internal-industry' && userTurnCount === 1) {
    return {
      content:
        '已收到企业侧的初始需求。为了更准确地匹配论文和专利，我先确认三点：\n1. 你的核心业务场景和技术目标是什么？\n2. 更希望匹配论文、专利，还是两者都要？\n3. 是否有行业、年份、成熟度或地域上的筛选条件？\n\n你可以逐条补充，我会在后续几轮对话里继续收敛。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 1) : undefined,
      summary: `${modeName}已进入企业需求澄清阶段。`,
    };
  }

  if (modeId === 'internal-industry' && userTurnCount === 2) {
    return {
      content:
        `我已经拿到第二轮信息，现在继续补两项关键条件：\n1. 你更关注基础研究线索、可转化专利，还是接近产业化的成果？\n2. 最终希望系统输出什么形式：论文清单、专利清单，还是综合匹配建议？\n\n补完后我就可以开始组织 Top ${options.paperCount} 的论文候选，并同步关联相应专利方向。`,
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 2) : undefined,
      summary: '继续收敛企业需求对应的论文与专利筛选条件。',
    };
  }

  if (modeId === 'internal-industry') {
    return {
      content:
        `目前信息已经足够进入匹配阶段。我会优先按 Top ${options.paperCount} 的论文范围整理候选，同时补充与你的需求相关的专利方向。\n\n如果你愿意，我们还可以再补一轮，例如预算、合作方式、应用部门或知识产权偏好，这会让匹配结果更贴近企业内部使用场景。`,
      reasoning:
        options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
      summary: '企业需求已具备进入论文与专利匹配阶段的条件。',
    };
  }

  if (modeId === 'external-expert' && userTurnCount === 1) {
    return {
      content:
        '已收到外部专家 / 学者侧的输入。为了把你的论文和专利更准确地匹配到企业内部需求，我先确认三点：\n1. 你输入的是代表论文、专利摘要，还是某一方向的整体成果？\n2. 你的成果更适合哪些应用场景或行业问题？\n3. 你更希望匹配潜在企业需求、合作机会，还是具体落地方向？',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 1) : undefined,
      summary: `${modeName}已进入成果画像澄清阶段。`,
    };
  }

  if (modeId === 'external-expert' && userTurnCount === 2) {
    return {
      content:
        '我已经初步理解了你的成果内容，现在继续确认两个关键点：\n1. 你的论文或专利目前处于什么成熟阶段，是否已有实验验证或应用案例？\n2. 你更希望匹配哪类企业需求，例如技术升级、成果引进、联合研发还是专利转化？\n\n补完这一步后，我就能把你的成果与企业内部需求做更有针对性的匹配。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 2) : undefined,
      summary: '继续收敛学者成果与企业需求之间的匹配边界。',
    };
  }

  if (modeId === 'external-expert') {
    return {
      content:
        `目前已经具备把你的论文与专利内容映射到企业需求池的条件。接下来我会优先按 Top ${options.paperCount} 的论文线索组织成果画像，并反向寻找适配的企业内部需求方向。\n\n如果你愿意，我们还可以继续补充成果成熟度、专利状态、行业偏好或合作方式，这会让匹配更准确。`,
      reasoning:
        options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
      summary: '学者成果已具备对接企业内部需求的匹配条件。',
    };
  }

  if (modeId === 'deep-search' && userTurnCount === 1) {
    return {
      content:
        '已收到你的深度搜索需求。为了把需求转成可用的论文总结，我先确认三点：\n1. 这个需求要回答的核心研究问题是什么？\n2. 更关注论文的方法路线、实验结果、产业启发，还是研究空白？\n3. 是否限定年份、论文来源、学科方向或关键词范围？\n\n你可以按条补充，我会先收敛检索边界，再进入论文总结。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 1) : undefined,
      summary: `${modeName}已进入需求拆解与检索边界澄清阶段。`,
    };
  }

  if (modeId === 'deep-search' && userTurnCount === 2) {
    return {
      content:
        `我已经拿到第二轮信息，现在继续补两项总结口径：\n1. 论文总结需要按主题脉络、方法类别、实验指标，还是代表论文逐篇展开？\n2. 最终希望输出摘要版、结构化表格，还是可直接用于汇报的综述段落？\n\n补完后我就可以围绕 Top ${options.paperCount} 篇代表论文组织总结。`,
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 2) : undefined,
      summary: '继续收敛论文总结的范围、结构和输出口径。',
    };
  }

  if (modeId === 'deep-search') {
    return {
      content:
        `目前信息已经足够进入论文总结阶段。我会优先围绕 Top ${options.paperCount} 篇代表论文，整理研究脉络、关键方法、实验指标和可复用结论。\n\n如果你愿意，我们还可以再补一轮，例如排除方向、目标期刊会议、中文 / 英文来源或是否需要对比表。`,
      reasoning:
        options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
      summary: '深度搜索已具备进入论文总结阶段的条件。',
    };
  }

  if (modeId === 'tech-recommendation' && userTurnCount === 1) {
    return {
      content:
        '已收到你的技术推荐需求。为了形成可执行方案，我先确认三点：\n1. 业务目标、使用对象和关键流程是什么？\n2. 目前已有的数据、系统、技术栈或部署环境是什么？\n3. 是否有预算、周期、安全合规、性能或运维方面的硬约束？\n\n你可以先补充最确定的信息，我会继续追问方案设计所需条件。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 1) : undefined,
      summary: `${modeName}已进入需求追问与方案边界澄清阶段。`,
    };
  }

  if (modeId === 'tech-recommendation' && userTurnCount === 2) {
    return {
      content:
        '我已经初步理解你的业务需求，现在继续确认两个关键点：\n1. 你更希望优先得到总体架构、技术选型、实施里程碑，还是成本与风险评估？\n2. 这个方案是用于概念验证、部门试点，还是准备进入正式生产环境？\n\n补完这一步后，我就能把需求拆成技术模块、实施路径和风险控制建议。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 2) : undefined,
      summary: '继续收敛技术方案的目标形态、交付阶段和实施约束。',
    };
  }

  if (modeId === 'tech-recommendation') {
    return {
      content:
        '目前信息已经足够进入技术方案推荐阶段。我会围绕目标架构、关键技术选型、实施步骤、资源投入和风险控制来组织方案。\n\n如果你愿意，我们还可以继续补充验收指标、已有供应商、数据规模、私有化要求或运维责任边界，这会让方案更可执行。',
      reasoning:
        options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
      summary: '技术推荐已具备进入方案生成阶段的条件。',
    };
  }

  if (modeId === 'academic' && userTurnCount === 1) {
    return {
      content:
        '已收到你关注的高校 / 科研机构信息。为了更准确地介绍这家机构的优势学科与成果产出，我先确认三点：\n1. 你关注的是哪所高校、研究院或重点实验室？\n2. 更想了解优势学科、代表论文、重点团队，还是成果转化方向？\n3. 是否有特定领域关键词，例如新能源、材料、生物制造、机器人等？',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 1) : undefined,
      summary: `${modeName}已进入机构画像澄清阶段。`,
    };
  }

  if (modeId === 'academic' && userTurnCount === 2) {
    return {
      content:
        '我已经拿到第二轮信息，现在继续收敛两项重点：\n1. 你更关心这家机构的优势学科结构，还是近年的成果产出表现？\n2. 你最终想看到的是概览介绍、代表成果清单，还是适合继续跟踪的机构画像？\n\n补完后我就能更系统地整理这家机构的优势方向与产出特点。',
      reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, 2) : undefined,
      summary: '继续收敛机构优势学科与成果产出查询重点。',
    };
  }

  if (modeId === 'academic') {
    return {
      content:
        '目前信息已经足够进入机构画像整理阶段。我会围绕这家高校 / 科研机构的优势学科、代表成果和产出方向来组织介绍内容。\n\n如果你愿意，我们还可以继续补充关注学院、具体实验室、时间范围或重点技术领域，这会让结果更聚焦。',
      reasoning:
        options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
      summary: '机构画像已具备进入优势学科与成果整理阶段的条件。',
    };
  }

  return {
    content:
      `已收到你的输入。我会先通过多轮对话澄清目标，再逐步进入 Top ${options.paperCount} 的候选整理阶段。为了继续推进，请再补充应用场景、筛选条件或希望输出的结果形式。`,
    reasoning: options.showReasoning ? createReasoning(modeId, prompt, options, userTurnCount) : undefined,
    summary: `${modeName}的多轮澄清已开始。`,
  };
}

function createClarifyingSummary(modeId: HomeModeId, signals: string[]) {
  const joinedSignals = signals.join('、');

  if (modeId === 'internal-industry') {
    return `已从企业初始问题中提取出 ${joinedSignals} 等线索。再补充一轮约束条件后，右侧会开始出现更贴近需求的论文与专利推荐。`;
  }

  if (modeId === 'external-expert') {
    return `已从成果描述中提取出 ${joinedSignals} 等能力关键词。继续补充成熟度和应用边界后，系统会反向推荐更匹配的企业需求与文献。`;
  }

  if (modeId === 'deep-search') {
    return `已从深度搜索需求中提取出 ${joinedSignals} 等检索线索。继续补充论文范围和总结口径后，系统会开始组织代表论文与研究脉络。`;
  }

  if (modeId === 'tech-recommendation') {
    return `已从技术推荐需求中提取出 ${joinedSignals} 等方案线索。继续补充系统现状和约束条件后，系统会开始生成更可执行的技术方案。`;
  }

  return `已识别出 ${joinedSignals} 等机构关注线索。继续补充机构名称、重点学科或团队信息后，系统会开始整理更具体的论文与机构画像。`;
}

function createMatchingSummary(
  modeId: HomeModeId,
  signals: string[],
  options: MatchOptions,
  userTurnCount: number,
) {
  const joinedSignals = signals.join('、');

  if (modeId === 'internal-industry') {
    return `已根据对话中的 ${joinedSignals} 生成第一批匹配结果。当前优先展示更贴近企业需求的论文、相关机构与专利转化线索，候选规模控制在 Top ${options.paperCount}。`;
  }

  if (modeId === 'external-expert') {
    return `已根据成果描述中的 ${joinedSignals} 生成第一批反向匹配结果。当前优先展示可对接的企业需求场景、相关论文线索和合作机构，累计补充轮次 ${Math.max(userTurnCount - 1, 1)}。`;
  }

  if (modeId === 'deep-search') {
    return `已根据对话中的 ${joinedSignals} 生成第一批论文总结线索。当前优先展示代表论文、方法路线和可复用结论，候选规模控制在 Top ${options.paperCount}。`;
  }

  if (modeId === 'tech-recommendation') {
    return `已根据对话中的 ${joinedSignals} 生成第一版技术方案。当前优先展示方案模块、实施路径和风险控制建议，累计补充轮次 ${Math.max(userTurnCount - 1, 1)}。`;
  }

  return `已根据对话中的 ${joinedSignals} 整理第一批机构画像线索。当前优先展示代表论文、优势方向与相关平台，帮助你快速判断这家机构的强项。`;
}

export function buildContextualRecommendations(
  modeId: HomeModeId,
  messages: ChatMessage[],
  options: MatchOptions = defaultMatchOptions,
): ContextualRecommendationState {
  const source = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('\n');
  const detectedSignals = detectSignals(modeId, source);
  const signals = (detectedSignals.length > 0 ? detectedSignals : defaultSignals[modeId]).slice(0, 4);
  const userTurnCount = messages.filter((message) => message.role === 'user').length;
  const stage = userTurnCount >= 2 ? 'matching' : 'clarifying';
  const base = homeModes[modeId].recommendations;

  if (stage === 'clarifying') {
    return {
      stage,
      heading: '已提取的对话线索',
      summary: createClarifyingSummary(modeId, signals),
      signals,
      nextQuestions: nextQuestionMap[modeId],
      recommendations: {
        scholars: [],
        papers: [],
        institutions: [],
        directions: pickDirections(base.directions, signals),
      },
    };
  }

  return {
    stage,
    heading: '基于当前对话生成的匹配推荐',
    summary: createMatchingSummary(modeId, signals, options, userTurnCount),
    signals,
    nextQuestions: [],
    recommendations: {
      scholars: pickItems(base.scholars, signals, 2),
      papers: pickItems(base.papers, signals, 3),
      institutions: pickItems(base.institutions, signals, 2),
      directions: pickDirections(base.directions, signals),
    },
  };
}

export function createSeedSessions(): ChatSession[] {
  const now = Date.now();

  const templates: Array<{
    id: string;
    modeId: HomeModeId;
    prompt: string;
    createdAt: number;
  }> = [
    {
      id: 'seed-internal',
      modeId: 'internal-industry',
      prompt: '我们想围绕固态电池产业化需求匹配相关论文和专利，请先通过多轮提问帮我明确筛选条件。',
      createdAt: now - 1000 * 60 * 60 * 8,
    },
    {
      id: 'seed-expert',
      modeId: 'external-expert',
      prompt: '我有一篇具身智能方向的代表论文和相关专利，请帮我匹配企业内部需求。',
      createdAt: now - 1000 * 60 * 60 * 28,
    },
    {
      id: 'seed-academic',
      modeId: 'academic',
      prompt: '我想了解新能源材料重点实验室的优势学科、成果产出和代表方向，请先通过多轮提问明确关注重点。',
      createdAt: now - 1000 * 60 * 60 * 52,
    },
    {
      id: 'seed-deep-search',
      modeId: 'deep-search',
      prompt: '我想围绕工业缺陷检测中的多模态大模型做深度搜索，请先追问需求边界，再总结代表论文。',
      createdAt: now - 1000 * 60 * 60 * 76,
    },
    {
      id: 'seed-tech-recommendation',
      modeId: 'tech-recommendation',
      prompt: '我们想搭建企业内部科研成果知识库问答系统，请先追问需求，再推荐技术方案。',
      createdAt: now - 1000 * 60 * 60 * 96,
    },
  ];

  return templates.map((template, index) => {
    const options: MatchOptions = {
      paperCount: paperCountOptions[index] ?? defaultMatchOptions.paperCount,
      showReasoning: index !== 1,
    };
    const firstAssistant = buildAssistantReply(template.modeId, template.prompt, options, 1);

    return {
      id: template.id,
      title: createSessionTitle(template.prompt),
      modeId: template.modeId,
      modeLabel: homeModes[template.modeId].label,
      options,
      createdAt: template.createdAt,
      updatedAt: template.createdAt + 1000 * 60 * 20,
      messages: [
        {
          id: `${template.id}-user-1`,
          role: 'user',
          content: template.prompt,
          meta: homeModes[template.modeId].label,
        },
        {
          id: `${template.id}-assistant-1`,
          role: 'assistant',
          content: firstAssistant.content,
          meta: 'TechMatch AI',
          reasoning: firstAssistant.reasoning,
        },
      ],
    };
  });
}
