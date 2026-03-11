import { GodId, Element } from './gods';

export interface QuizOption {
  text: string;
  godScores: Partial<Record<GodId, number>>;
  element?: Element;
  desire?: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  subtitle?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: '你目前的身份是？',
    subtitle: '让财神了解你的处境',
    options: [
      {
        text: '打工人 / 上班族',
        desire: '职场',
        godScores: { zhao: 3, bigan: 2, guan: 1 },
      },
      {
        text: '创业者 / 小老板',
        desire: '创业',
        godScores: { fanli: 3, guan: 3, shen: 1 },
      },
      {
        text: '投资人 / 炒股炒币',
        desire: '投资',
        godScores: { bigan: 3, liuhai: 2, shen: 2 },
      },
      {
        text: '自由职业 / 副业达人',
        desire: '偏财',
        godScores: { liuhai: 2, heguan: 2, fanli: 2 },
      },
      {
        text: '学生 / 求学阶段',
        desire: '智慧',
        godScores: { bigan: 3, zhao: 1, fulushou: 1 },
      },
      {
        text: '家庭主心骨 / 全职',
        desire: '守财',
        godScores: { fulushou: 3, heguan: 2, zhao: 1 },
      },
    ],
  },
  {
    id: 2,
    title: '你最迫切的财愿是？',
    subtitle: '说出你心里那个愿望',
    options: [
      {
        text: '薪资涨涨涨，升职快快快',
        desire: '正财',
        godScores: { zhao: 4, bigan: 2 },
      },
      {
        text: '偏财横财，来一笔意外之财',
        desire: '偏财',
        godScores: { liuhai: 4, shen: 3, zhongkui: 1 },
      },
      {
        text: '生意红火，客源滚滚来',
        desire: '生意',
        godScores: { guan: 4, fanli: 3, heguan: 2 },
      },
      {
        text: '投资顺手，钱生钱不停歇',
        desire: '投资',
        godScores: { bigan: 4, shen: 2, liuhai: 1 },
      },
      {
        text: '贵人相助，人脉带来财运',
        desire: '人脉',
        godScores: { heguan: 4, zhongkui: 1, guan: 2 },
      },
      {
        text: '守住钱，家庭财富稳定增长',
        desire: '守财',
        godScores: { fulushou: 4, zhao: 2, guan: 1 },
      },
    ],
  },
  {
    id: 3,
    title: '哪种元素让你感觉最舒服？',
    subtitle: '五行感应测试',
    options: [
      {
        text: '火焰 — 热烈、激情、光芒四射',
        element: 'fire',
        godScores: { guan: 2, zhongkui: 2, heguan: 2, hongcaishen: 3 },
      },
      {
        text: '流水 — 灵动、智慧、随机应变',
        element: 'water',
        godScores: { bigan: 3, liuhai: 3 },
      },
      {
        text: '大树 — 生机、成长、扎根深沉',
        element: 'wood',
        godScores: { fanli: 3, lvdu: 3 },
      },
      {
        text: '厚土 — 踏实、稳重、积累长久',
        element: 'earth',
        godScores: { zhao: 3, fulushou: 2, huangcaishen: 2 },
      },
      {
        text: '金属 — 锋利、果断、价值坚硬',
        element: 'metal',
        godScores: { guan: 2, shen: 3, baicaishen: 2 },
      },
    ],
  },
  {
    id: 4,
    title: '遇到重大财务决策时，你怎么做？',
    subtitle: '性格测探',
    options: [
      {
        text: '跟着感觉走，直觉最重要',
        godScores: { liuhai: 3, heguan: 2, shen: 2 },
      },
      {
        text: '理性分析，数据说话',
        godScores: { bigan: 4, fanli: 2 },
      },
      {
        text: '随缘，该来的自然会来',
        godScores: { fulushou: 3, huangcaishen: 2, liuhai: 1 },
      },
      {
        text: '相信玄学，看日子、占卜',
        godScores: { zhao: 2, zhongkui: 3, huangcaishen: 2 },
      },
      {
        text: '问身边信任的人，听从建议',
        godScores: { heguan: 3, guan: 2, fanli: 1 },
      },
    ],
  },
  {
    id: 5,
    title: '你相信财运是怎么来的？',
    subtitle: '财运时机观',
    options: [
      {
        text: '把握当下，机会稍纵即逝',
        godScores: { shen: 3, liuhai: 2, guan: 1 },
      },
      {
        text: '厚积薄发，积累到一定程度自然爆发',
        godScores: { zhao: 3, bigan: 2, fanli: 2 },
      },
      {
        text: '周期循环，顺势而为最重要',
        godScores: { fanli: 4, bigan: 1 },
      },
      {
        text: '贵人相助，对的人带你飞',
        godScores: { heguan: 4, guan: 1 },
      },
      {
        text: '福报积累，善念自然招财',
        godScores: { fulushou: 3, huangcaishen: 3, lvdu: 2 },
      },
    ],
  },
  {
    id: 6,
    title: '你最容易在哪里"漏财"？',
    subtitle: '找到你的破财天敌',
    options: [
      {
        text: '冲动消费，买买买停不下来',
        godScores: { fulushou: 2, zhao: 2, bigan: 2 },
      },
      {
        text: '投资失利，总踩在高点',
        godScores: { bigan: 3, fanli: 2, shen: 1 },
      },
      {
        text: '人情债，借钱出去收不回来',
        godScores: { guan: 3, heguan: 2, zhongkui: 2 },
      },
      {
        text: '意外支出，总有不可预见的花费',
        godScores: { fulushou: 3, zhongkui: 2 },
      },
      {
        text: '小人作梗，被算计或受骗',
        godScores: { zhongkui: 4, guan: 2 },
      },
    ],
  },
  {
    id: 7,
    title: '你平时拜财神是什么方式？',
    subtitle: '找到你的财神缘分',
    options: [
      {
        text: '登庙上香，诚心实拜',
        godScores: { zhao: 3, guan: 2, huangcaishen: 2 },
      },
      {
        text: '家里供奉，每日祈福',
        godScores: { fulushou: 3, zhao: 2, guan: 1 },
      },
      {
        text: '手机壁纸 / 数字供奉',
        godScores: { liuhai: 2, heguan: 2, bigan: 1, shen: 1 },
      },
      {
        text: '佩戴吉祥物、开光饰品',
        godScores: { zhongkui: 2, heguan: 2, huangcaishen: 2 },
      },
      {
        text: '从来不拜，第一次接触',
        godScores: { fanli: 2, bigan: 2, fulushou: 1 },
      },
    ],
  },
];
