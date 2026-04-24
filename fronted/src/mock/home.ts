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
};

const defaultSignals: Record<HomeModeId, string[]> = {
  'internal-industry': ['固态电池', '工业机器人感知', '专利转化'],
  'external-expert': ['具身智能', '产业合作', '专利运营'],
  academic: ['新能源材料', '重点实验室', '机器人与智能制造'],
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
