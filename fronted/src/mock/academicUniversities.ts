export interface AcademicUniversityLink {
  label: string;
  type: string;
  url: string;
}

export interface AcademicUniversityRecommendation {
  accessNote: string;
  description: string;
  domain: string;
  id: string;
  keywords: string[];
  links: AcademicUniversityLink[];
  location: string;
  logoMark: string;
  name: string;
  shortName: string;
  tags: string[];
}

const defaultLinks = (domain: string): AcademicUniversityLink[] => [
  {
    label: '学校官网',
    type: '官方入口',
    url: `https://${domain}/`,
  },
];

function createUniversity(
  university: Omit<AcademicUniversityRecommendation, 'links'> & {
    links?: AcademicUniversityLink[];
  },
): AcademicUniversityRecommendation {
  return {
    ...university,
    links: university.links ?? defaultLinks(university.domain),
  };
}

export const academicUniversityRecommendations: AcademicUniversityRecommendation[] = [
  createUniversity({
    id: 'pku',
    name: '北京大学',
    shortName: 'PKU',
    logoMark: '北大',
    location: '北京',
    domain: 'www.pku.edu.cn',
    tags: ['基础学科', '医学', '人工智能'],
    keywords: ['基础研究', '数学', '物理', '化学', '医学', '生命科学', '人工智能', '文科', '北京'],
    description: '适合追踪基础学科、生命医学、信息科学与交叉创新方向，作为高水平综合研究型大学样本。',
    accessNote: '可优先从学院、研究院和公开成果新闻建立专家与方向索引。',
  }),
  createUniversity({
    id: 'tsinghua',
    name: '清华大学',
    shortName: 'THU',
    logoMark: '清华',
    location: '北京',
    domain: 'www.tsinghua.edu.cn',
    tags: ['工程技术', '成果转化', '人工智能'],
    keywords: ['工程', '材料', '能源', '人工智能', '自动化', '芯片', '技术转移', '北京'],
    description: '适合做工程技术和成果转化流程标杆样本，覆盖成果披露、成果库查询和商务转化流程。',
    accessNote: '建议把成果库作为候选项目入口，再结合院系与知识产权信息服务补全成熟度。',
    links: [
      { label: '学校官网', type: '官方入口', url: 'https://www.tsinghua.edu.cn/' },
      { label: '技术转移院', type: '成果转化', url: 'https://ott.tsinghua.edu.cn/' },
      { label: '成果转化流程', type: '流程说明', url: 'https://ott.tsinghua.edu.cn/mxyjry/cgzh.htm' },
    ],
  }),
  createUniversity({
    id: 'ruc',
    name: '中国人民大学',
    shortName: 'RUC',
    logoMark: '人大',
    location: '北京',
    domain: 'www.ruc.edu.cn',
    tags: ['人文社科', '政策研究', '数据治理'],
    keywords: ['人文社科', '经济', '管理', '法学', '公共政策', '数据治理', '北京'],
    description: '适合补充人文社科、政策咨询、管理科学与数据治理类机构画像。',
    accessNote: '建议重点采集学院、智库和科研平台公开资料。',
  }),
  createUniversity({
    id: 'buaa',
    name: '北京航空航天大学',
    shortName: 'BUAA',
    logoMark: '北航',
    location: '北京',
    domain: 'www.buaa.edu.cn',
    tags: ['航空航天', '机器人', '智能制造'],
    keywords: ['航空', '航天', '飞行器', '机器人', '无人机', '智能制造', '控制', '北京'],
    description: '适合航空航天、无人系统、机器人与先进制造方向的高校成果推荐。',
    accessNote: '建议围绕学院、重点实验室和成果转化动态建立技术方向索引。',
  }),
  createUniversity({
    id: 'bit',
    name: '北京理工大学',
    shortName: 'BIT',
    logoMark: '北理',
    location: '北京',
    domain: 'www.bit.edu.cn',
    tags: ['智能装备', '车辆工程', '信息技术'],
    keywords: ['智能装备', '车辆', '兵器', '机器人', '光电', '信息技术', '北京'],
    description: '适合智能装备、车辆工程、光电信息和先进制造场景的技术线索筛选。',
    accessNote: '建议先按重点实验室和工程中心补充公开成果。',
  }),
  createUniversity({
    id: 'bnu',
    name: '北京师范大学',
    shortName: 'BNU',
    logoMark: '北师',
    location: '北京',
    domain: 'www.bnu.edu.cn',
    tags: ['教育科技', '心理认知', '环境科学'],
    keywords: ['教育', '心理', '认知', '环境', '遥感', '地理', '生态', '北京'],
    description: '适合教育科技、心理认知、地理环境和生态治理方向的机构画像。',
    accessNote: '建议按学院、实验室和研究中心公开页面组织资料。',
  }),
  createUniversity({
    id: 'cau',
    name: '中国农业大学',
    shortName: 'CAU',
    logoMark: '农大',
    location: '北京',
    domain: 'www.cau.edu.cn',
    tags: ['农业工程', '食品科学', '生物育种'],
    keywords: ['农业', '食品', '生物育种', '作物', '畜牧', '智慧农业', '北京'],
    description: '适合农业工程、食品科学、智慧农业与生物育种方向的成果推荐。',
    accessNote: '建议优先采集学院和国家重点实验室成果动态。',
  }),
  createUniversity({
    id: 'muc',
    name: '中央民族大学',
    shortName: 'MUC',
    logoMark: '民大',
    location: '北京',
    domain: 'www.muc.edu.cn',
    tags: ['民族学', '文化数字化', '区域治理'],
    keywords: ['民族学', '文化', '语言', '区域治理', '数字人文', '北京'],
    description: '适合文化数字化、民族地区发展和区域治理类研究资料整理。',
    accessNote: '建议以学院和科研机构公开页面作为主要资料源。',
  }),
  createUniversity({
    id: 'nankai',
    name: '南开大学',
    shortName: 'NKU',
    logoMark: '南开',
    location: '天津',
    domain: 'www.nankai.edu.cn',
    tags: ['化学材料', '经济管理', '生命科学'],
    keywords: ['化学', '材料', '经济', '管理', '生命科学', '药物', '天津'],
    description: '适合化学材料、生命科学和经济管理方向的综合高校样本。',
    accessNote: '建议从学院与科研动态抓取代表团队和成果线索。',
  }),
  createUniversity({
    id: 'tju',
    name: '天津大学',
    shortName: 'TJU',
    logoMark: '天大',
    location: '天津',
    domain: 'www.tju.edu.cn',
    tags: ['化工', '建筑工程', '智能制造'],
    keywords: ['化工', '建筑', '土木', '精仪', '智能制造', '能源', '天津'],
    description: '适合化工、建筑工程、精密仪器和智能制造方向的技术画像。',
    accessNote: '建议按学院和工程研究中心构建成果条目。',
  }),
  createUniversity({
    id: 'dlut',
    name: '大连理工大学',
    shortName: 'DUT',
    logoMark: '大工',
    location: '大连',
    domain: 'www.dlut.edu.cn',
    tags: ['化工过程', '装备制造', '海洋工程'],
    keywords: ['化工', '过程工程', '装备', '机械', '海洋工程', '船舶', '辽宁', '大连'],
    description: '适合过程工程、装备制造、海洋工程和工业软件相关方向。',
    accessNote: '建议从技术转移、学院新闻和重点实验室页面补充资料。',
  }),
  createUniversity({
    id: 'neu',
    name: '东北大学',
    shortName: 'NEU',
    logoMark: '东大',
    location: '沈阳',
    domain: 'www.neu.edu.cn',
    tags: ['自动化', '冶金材料', '工业智能'],
    keywords: ['自动化', '控制', '冶金', '材料', '工业智能', '软件', '辽宁', '沈阳'],
    description: '适合自动化、工业智能、冶金材料和流程制造场景的成果筛选。',
    accessNote: '建议按控制、材料和软件方向建立候选库。',
  }),
  createUniversity({
    id: 'jlu',
    name: '吉林大学',
    shortName: 'JLU',
    logoMark: '吉大',
    location: '长春',
    domain: 'www.jlu.edu.cn',
    tags: ['汽车工程', '材料化学', '医学'],
    keywords: ['汽车', '车辆', '材料', '化学', '医学', '地学', '吉林', '长春'],
    description: '适合汽车工程、材料化学、医学和地学等多学科机构画像。',
    accessNote: '建议把学院成果和公开专利按技术方向聚合。',
  }),
  createUniversity({
    id: 'hit',
    name: '哈尔滨工业大学',
    shortName: 'HIT',
    logoMark: '哈工',
    location: '哈尔滨',
    domain: 'www.hit.edu.cn',
    tags: ['航天装备', '机器人', '智能制造'],
    keywords: ['航天', '机器人', '智能制造', '材料', '控制', '空间', '黑龙江', '哈尔滨'],
    description: '适合航天装备、机器人、智能制造和材料方向的高技术成果推荐。',
    accessNote: '建议按航天、机器人和先进材料三个主题组织资料。',
  }),
  createUniversity({
    id: 'fudan',
    name: '复旦大学',
    shortName: 'FDU',
    logoMark: '复旦',
    location: '上海',
    domain: 'www.fudan.edu.cn',
    tags: ['医学', '芯片', '基础科学'],
    keywords: ['医学', '生命科学', '芯片', '微电子', '材料', '基础科学', '上海'],
    description: '适合医学生命科学、微电子、材料和基础研究类成果画像。',
    accessNote: '建议从院系和科研机构公开页面补充专家及成果条目。',
  }),
  createUniversity({
    id: 'tongji',
    name: '同济大学',
    shortName: 'TJU',
    logoMark: '同济',
    location: '上海',
    domain: 'www.tongji.edu.cn',
    tags: ['土木建筑', '汽车交通', '环境工程'],
    keywords: ['土木', '建筑', '交通', '汽车', '环境', '城市', '上海'],
    description: '适合土木建筑、智慧交通、汽车和城市环境方向的成果推荐。',
    accessNote: '建议围绕学院、设计研究院和工程平台整理资料。',
  }),
  createUniversity({
    id: 'sjtu',
    name: '上海交通大学',
    shortName: 'SJTU',
    logoMark: '上交',
    location: '上海',
    domain: 'www.sjtu.edu.cn',
    tags: ['产研院', '一门式服务', '成果转化'],
    keywords: ['人工智能', '机器人', '船舶', '医学', '材料', '成果转化', '上海'],
    description: '适合做高水平研究型大学的成果转化组织样本，重点看产研院转化服务和项目推广。',
    accessNote: '建议从先进产业技术研究院入口建立机构节点，再扩展到学院和实验室。',
    links: [
      { label: '学校官网', type: '官方入口', url: 'https://www.sjtu.edu.cn/' },
      { label: '先进产业技术研究院', type: '成果转化', url: 'https://aitri.sjtu.edu.cn/' },
      { label: '产研院架构', type: '转化体系', url: 'https://aitri.sjtu.edu.cn/aitri/strut' },
    ],
  }),
  createUniversity({
    id: 'ecnu',
    name: '华东师范大学',
    shortName: 'ECNU',
    logoMark: '华师',
    location: '上海',
    domain: 'www.ecnu.edu.cn',
    tags: ['教育科技', '数据科学', '生态环境'],
    keywords: ['教育', '心理', '数据科学', '软件', '生态', '环境', '上海'],
    description: '适合教育科技、数据科学、心理认知和生态环境方向的机构画像。',
    accessNote: '建议从科研平台和学院页面采集专家及成果。',
  }),
  createUniversity({
    id: 'nju',
    name: '南京大学',
    shortName: 'NJU',
    logoMark: '南大',
    location: '南京',
    domain: 'www.nju.edu.cn',
    tags: ['基础科学', '人工智能', '环境地学'],
    keywords: ['物理', '化学', '天文', '地学', '人工智能', '环境', '江苏', '南京'],
    description: '适合基础科学、地球环境、人工智能和前沿交叉方向的资料整理。',
    accessNote: '建议先按院系和重点实验室建立主题索引。',
  }),
  createUniversity({
    id: 'seu',
    name: '东南大学',
    shortName: 'SEU',
    logoMark: '东南',
    location: '南京',
    domain: 'www.seu.edu.cn',
    tags: ['电子信息', '建筑交通', '生物医学'],
    keywords: ['电子', '信息', '通信', '建筑', '交通', '生物医学', '江苏', '南京'],
    description: '适合电子信息、智慧交通、建筑和生物医学工程方向的成果推荐。',
    accessNote: '建议重点采集电子信息和交通建筑相关平台资料。',
  }),
  createUniversity({
    id: 'zju',
    name: '浙江大学',
    shortName: 'ZJU',
    logoMark: '浙大',
    location: '杭州',
    domain: 'www.zju.edu.cn',
    tags: ['人工智能', '农业生命', '工程技术'],
    keywords: ['人工智能', '农业', '生命科学', '材料', '能源', '机器人', '浙江', '杭州'],
    description: '适合人工智能、农业生命、工程技术和创新创业转化方向的综合样本。',
    accessNote: '建议从院系、研究院和技术转移平台补充项目线索。',
  }),
  createUniversity({
    id: 'ustc',
    name: '中国科学技术大学',
    shortName: 'USTC',
    logoMark: '中科',
    location: '合肥',
    domain: 'www.ustc.edu.cn',
    tags: ['量子信息', '基础科学', '先进材料'],
    keywords: ['量子', '物理', '化学', '材料', '人工智能', '信息', '安徽', '合肥'],
    description: '适合量子信息、基础科学、先进材料和前沿交叉技术方向。',
    accessNote: '建议围绕国家实验室、学院和成果新闻建立条目。',
  }),
  createUniversity({
    id: 'xmu',
    name: '厦门大学',
    shortName: 'XMU',
    logoMark: '厦大',
    location: '厦门',
    domain: 'www.xmu.edu.cn',
    tags: ['化学化工', '海洋科学', '生命医学'],
    keywords: ['化学', '化工', '海洋', '生命科学', '医学', '材料', '福建', '厦门'],
    description: '适合化学化工、海洋科学、生命医学和材料方向的高校画像。',
    accessNote: '建议按海洋、化学和医学三个专题梳理成果。',
  }),
  createUniversity({
    id: 'sdu',
    name: '山东大学',
    shortName: 'SDU',
    logoMark: '山大',
    location: '济南',
    domain: 'www.sdu.edu.cn',
    tags: ['晶体材料', '医学', '智能制造'],
    keywords: ['晶体', '材料', '医学', '数学', '智能制造', '能源', '山东', '济南'],
    description: '适合晶体材料、医学、数学和智能制造相关成果推荐。',
    accessNote: '建议从学院、科研平台和成果新闻聚合资料。',
  }),
  createUniversity({
    id: 'ouc',
    name: '中国海洋大学',
    shortName: 'OUC',
    logoMark: '海大',
    location: '青岛',
    domain: 'www.ouc.edu.cn',
    tags: ['海洋科学', '水产食品', '蓝色技术'],
    keywords: ['海洋', '水产', '食品', '海洋装备', '海洋生物', '环境', '山东', '青岛'],
    description: '适合补充海洋特色高校样本，围绕海洋装备、海洋生物、海洋环境与水产食品成果建立专题库。',
    accessNote: '建议把科技成果汇编作为主入口，再按学院和成果关键词补专家与专利。',
    links: [
      { label: '学校官网', type: '官方入口', url: 'https://www.ouc.edu.cn/' },
      { label: '科技成果汇编', type: '成果资料', url: 'https://www.ouc.edu.cn/_t65/31247/listm.htm' },
      { label: '成果转化管理', type: '政策资料', url: 'https://mlsec.ouc.edu.cn/kjcgzhgl/list.htm' },
    ],
  }),
  createUniversity({
    id: 'whu',
    name: '武汉大学',
    shortName: 'WHU',
    logoMark: '武大',
    location: '武汉',
    domain: 'www.whu.edu.cn',
    tags: ['测绘遥感', '水利电力', '医学'],
    keywords: ['测绘', '遥感', '水利', '电力', '医学', '信息', '湖北', '武汉'],
    description: '适合测绘遥感、水利电力、医学和信息技术方向的成果画像。',
    accessNote: '建议重点采集测绘、水利和医学相关学院平台。',
  }),
  createUniversity({
    id: 'hust',
    name: '华中科技大学',
    shortName: 'HUST',
    logoMark: '华科',
    location: '武汉',
    domain: 'www.hust.edu.cn',
    tags: ['工科成果', '医工交叉', '技术转移'],
    keywords: ['人工智能', '机械', '光电', '医学', '能源', '材料', '技术转移', '湖北', '武汉'],
    description: '适合作为综合工科高校样本，优先跟踪技术转移、成果转化和校企联合研发线索。',
    accessNote: '建议先抓取成果转化公示和技术转移动态，再补学院专家页与公开专利。',
    links: [
      { label: '学校官网', type: '官方入口', url: 'https://www.hust.edu.cn/' },
      { label: '国家技术转移中心', type: '成果转化', url: 'https://iat.hust.edu.cn/index.htm' },
      { label: '成果转化管理办法', type: '政策资料', url: 'https://iat.hust.edu.cn/info/1046/1659.htm' },
    ],
  }),
  createUniversity({
    id: 'hnu',
    name: '湖南大学',
    shortName: 'HNU',
    logoMark: '湖大',
    location: '长沙',
    domain: 'www.hnu.edu.cn',
    tags: ['车辆工程', '设计创新', '材料化学'],
    keywords: ['车辆', '汽车', '设计', '材料', '化学', '土木', '湖南', '长沙'],
    description: '适合车辆工程、工业设计、材料化学和土木建筑方向的成果推荐。',
    accessNote: '建议围绕汽车、设计和材料平台建立专题资料。',
  }),
  createUniversity({
    id: 'csu',
    name: '中南大学',
    shortName: 'CSU',
    logoMark: '中南',
    location: '长沙',
    domain: 'www.csu.edu.cn',
    tags: ['有色金属', '轨道交通', '医学'],
    keywords: ['有色金属', '材料', '轨道交通', '矿业', '医学', '粉末冶金', '湖南', '长沙'],
    description: '适合有色金属材料、轨道交通、矿业工程和医学方向的成果整理。',
    accessNote: '建议按材料、交通和医学方向建立候选库。',
  }),
  createUniversity({
    id: 'nudt',
    name: '国防科技大学',
    shortName: 'NUDT',
    logoMark: '国科',
    location: '长沙',
    domain: 'www.nudt.edu.cn',
    tags: ['计算机', '航天信息', '智能系统'],
    keywords: ['计算机', '超级计算', '人工智能', '航天', '信息系统', '控制', '湖南', '长沙'],
    description: '适合计算机、智能系统、航天信息和高性能计算方向的技术资料整理。',
    accessNote: '公开资料有限时，建议只采集官网、公开新闻和可公开论文专利。',
  }),
  createUniversity({
    id: 'sysu',
    name: '中山大学',
    shortName: 'SYSU',
    logoMark: '中大',
    location: '广州',
    domain: 'www.sysu.edu.cn',
    tags: ['医学', '海洋科学', '信息技术'],
    keywords: ['医学', '生命科学', '海洋', '信息技术', '材料', '公共卫生', '广东', '广州'],
    description: '适合医学生命科学、海洋科学、信息技术和公共卫生方向的高校画像。',
    accessNote: '建议从医院体系、学院和科研平台公开资料补全能力图谱。',
  }),
  createUniversity({
    id: 'scut',
    name: '华南理工大学',
    shortName: 'SCUT',
    logoMark: '华工',
    location: '广州',
    domain: 'www.scut.edu.cn',
    tags: ['轻工材料', '化工食品', '智能制造'],
    keywords: ['轻工', '材料', '化工', '食品', '智能制造', '电子', '广东', '广州'],
    description: '适合轻工材料、化工食品、电子信息和智能制造方向的成果推荐。',
    accessNote: '建议优先采集成果转化、学院和产业研究院资料。',
  }),
  createUniversity({
    id: 'scu',
    name: '四川大学',
    shortName: 'SCU',
    logoMark: '川大',
    location: '成都',
    domain: 'www.scu.edu.cn',
    tags: ['医学', '高分子材料', '水利环保'],
    keywords: ['医学', '口腔', '高分子', '材料', '水利', '环保', '四川', '成都'],
    description: '适合医学、口腔、高分子材料和水利环保方向的综合机构画像。',
    accessNote: '建议结合华西医学体系和材料学院公开资料建立条目。',
  }),
  createUniversity({
    id: 'uestc',
    name: '电子科技大学',
    shortName: 'UESTC',
    logoMark: '电子',
    location: '成都',
    domain: 'www.uestc.edu.cn',
    tags: ['电子信息', '通信网络', '集成电路'],
    keywords: ['电子', '通信', '集成电路', '芯片', '雷达', '网络安全', '四川', '成都'],
    description: '适合电子信息、通信网络、集成电路和网络安全方向的成果推荐。',
    accessNote: '建议按电子、通信和集成电路方向聚合学院与平台资料。',
  }),
  createUniversity({
    id: 'cqu',
    name: '重庆大学',
    shortName: 'CQU',
    logoMark: '重大',
    location: '重庆',
    domain: 'www.cqu.edu.cn',
    tags: ['电气工程', '智能制造', '建筑环境'],
    keywords: ['电气', '能源', '机械', '智能制造', '建筑', '环境', '重庆'],
    description: '适合电气能源、智能制造、建筑环境和装备工程方向的成果画像。',
    accessNote: '建议优先采集电气、机械和建筑相关科研平台资料。',
  }),
  createUniversity({
    id: 'xjtu',
    name: '西安交通大学',
    shortName: 'XJTU',
    logoMark: '西交',
    location: '西安',
    domain: 'www.xjtu.edu.cn',
    tags: ['能源动力', '装备制造', '科技成果'],
    keywords: ['能源', '动力', '装备', '机械', '电气', '材料', '成果转化', '陕西', '西安'],
    description: '技术转移资料相对集中，适合做“成果清单 + 技术经纪人 + 转孵化”类型的机构画像。',
    accessNote: '建议优先解析成果汇编，再把动态新闻中的产业合作案例作为补充证据。',
    links: [
      { label: '学校官网', type: '官方入口', url: 'https://www.xjtu.edu.cn/' },
      { label: '国家技术转移中心', type: '成果转化', url: 'https://tlo.xjtu.edu.cn/' },
      { label: '科技成果汇编', type: '成果资料', url: 'https://tlo.xjtu.edu.cn/info/1020/4481.htm' },
    ],
  }),
  createUniversity({
    id: 'nwpu',
    name: '西北工业大学',
    shortName: 'NPU',
    logoMark: '西工',
    location: '西安',
    domain: 'www.nwpu.edu.cn',
    tags: ['航空航天', '航海工程', '无人系统'],
    keywords: ['航空', '航天', '航海', '无人机', '无人系统', '材料', '陕西', '西安'],
    description: '适合航空、航天、航海、无人系统和先进材料方向的技术推荐。',
    accessNote: '建议围绕“三航”特色和重点实验室公开资料建立索引。',
  }),
  createUniversity({
    id: 'nwafu',
    name: '西北农林科技大学',
    shortName: 'NWAFU',
    logoMark: '西农',
    location: '杨凌',
    domain: 'www.nwafu.edu.cn',
    tags: ['农业科技', '生态治理', '食品生物'],
    keywords: ['农业', '农林', '食品', '生态', '水土保持', '生物', '陕西', '杨凌'],
    description: '适合农业科技、生态治理、食品生物和水土保持方向的成果整理。',
    accessNote: '建议按作物、畜牧、食品和生态治理方向组织资料。',
  }),
  createUniversity({
    id: 'lzu',
    name: '兰州大学',
    shortName: 'LZU',
    logoMark: '兰大',
    location: '兰州',
    domain: 'www.lzu.edu.cn',
    tags: ['生态环境', '化学材料', '西部资源'],
    keywords: ['生态', '环境', '草业', '化学', '材料', '西部资源', '甘肃', '兰州'],
    description: '适合生态环境、草业科学、化学材料和西部资源方向的高校画像。',
    accessNote: '建议从生态、草业和化学材料方向补充专家与成果。',
  }),
];

const defaultRecommendedIds = ['hust', 'xjtu', 'sjtu', 'ouc', 'tsinghua', 'zju'];

export function getAcademicUniversityLogoUrl(domain: string) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=96`;
}

export function getRecommendedAcademicUniversities(historyText: string, limit = 6) {
  const normalizedHistory = historyText.toLowerCase();

  if (!normalizedHistory.trim()) {
    return defaultRecommendedIds
      .map((id) => academicUniversityRecommendations.find((university) => university.id === id))
      .filter((university): university is AcademicUniversityRecommendation => Boolean(university))
      .slice(0, limit);
  }

  const scored = academicUniversityRecommendations.map((university, index) => {
    const keywordScore = university.keywords.reduce((score, keyword) => {
      return normalizedHistory.includes(keyword.toLowerCase()) ? score + 3 : score;
    }, 0);
    const tagScore = university.tags.reduce((score, tag) => {
      return normalizedHistory.includes(tag.toLowerCase()) ? score + 2 : score;
    }, 0);
    const nameScore =
      normalizedHistory.includes(university.name.toLowerCase()) ||
      normalizedHistory.includes(university.shortName.toLowerCase())
        ? 8
        : 0;

    return {
      index,
      score: keywordScore + tagScore + nameScore,
      university,
    };
  });

  const matched = scored
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map((entry) => entry.university);

  if (matched.length >= limit) {
    return matched.slice(0, limit);
  }

  const fallback = academicUniversityRecommendations.filter(
    (university) => !matched.some((selected) => selected.id === university.id),
  );

  return [...matched, ...fallback].slice(0, limit);
}
