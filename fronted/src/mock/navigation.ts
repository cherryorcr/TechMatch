export interface NavigationItem {
  id: string;
  label: string;
  shortLabel: string;
  path: string;
  summary: string;
  highlights: string[];
  iconKey: string;
  group?: 'primary' | 'workspace';
  badge?: string;
}

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: '新建对话',
    shortLabel: 'NEW',
    path: '/',
    summary: '发起一段新的科研成果匹配对话。',
    highlights: ['AI 问答入口', '推荐提问', '推荐线索'],
    iconKey: 'home',
    group: 'primary',
  },
  {
    id: 'history',
    label: '历史对话',
    shortLabel: 'HIS',
    path: '/history',
    summary: '查看所有历史会话记录并重新进入对话。',
    highlights: ['历史记录', '多轮会话', '继续追问'],
    iconKey: 'history',
    group: 'primary',
  },
  {
    id: 'subscription',
    label: '订阅',
    shortLabel: 'SUB',
    path: '/subscription',
    summary: '订阅主题、提醒与动态追踪。',
    highlights: ['Topic feeds', 'Saved alerts', 'Digest schedule'],
    iconKey: 'subscription',
    group: 'workspace',
  },
  {
    id: 'library',
    label: '文库',
    shortLabel: 'LIB',
    path: '/library',
    summary: '浏览已保存论文、报告与研究资料。',
    highlights: ['Collections', 'Pinned assets', 'Import queue'],
    iconKey: 'library',
    group: 'workspace',
  },
  {
    id: 'scholars',
    label: '学者',
    shortLabel: 'SCH',
    path: '/scholars',
    summary: '查看学者画像、研究方向与合作适配。',
    highlights: ['Profile cards', 'Expertise filters', 'Institution links'],
    iconKey: 'scholars',
    group: 'workspace',
  },
  {
    id: 'knowledge-base',
    label: '知识库',
    shortLabel: 'KB',
    path: '/knowledge-base',
    summary: '沉淀知识条目、内部答案与结构化资料。',
    highlights: ['Reusable snippets', 'Topic trees', 'Revision status'],
    iconKey: 'knowledge',
    group: 'workspace',
  },
  {
    id: 'sciencepedia',
    label: 'SciencePedia',
    shortLabel: 'SP',
    path: '/sciencepedia',
    summary: '概念图谱、方法百科与术语索引。',
    highlights: ['Entity overview', 'Concept graph', 'Reading links'],
    iconKey: 'sciencepedia',
    group: 'workspace',
  },
  {
    id: 'notebooks',
    label: '笔记本',
    shortLabel: 'NB',
    path: '/notebooks',
    summary: '实验记录、分析草稿与协同笔记。',
    highlights: ['Draft sessions', 'Experiment notes', 'Shareable views'],
    iconKey: 'notebooks',
    group: 'workspace',
  },
  {
    id: 'competitions',
    label: '竞赛',
    shortLabel: 'CMP',
    path: '/competitions',
    summary: '竞赛机会、截止时间与参与进度。',
    highlights: ['Live opportunities', 'Deadline board', 'Team status'],
    iconKey: 'competitions',
    group: 'workspace',
  },
  {
    id: 'courses',
    label: '课程',
    shortLabel: 'CRS',
    path: '/courses',
    summary: '课程路径、学习模块与培训入口。',
    highlights: ['Skill paths', 'Module progress', 'Recommended lessons'],
    iconKey: 'courses',
    group: 'workspace',
  },
  {
    id: 'apps',
    label: '应用',
    shortLabel: 'APP',
    path: '/apps',
    summary: '内部应用与工作流工具集合。',
    highlights: ['Pinned apps', 'Recent launches', 'Workspace shortcuts'],
    iconKey: 'apps',
    group: 'workspace',
    badge: 'Beta',
  },
];
