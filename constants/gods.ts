export type GodId =
  | 'zhao'
  | 'guan'
  | 'bigan'
  | 'liuhai'
  | 'fanli'
  | 'fulushou'
  | 'heguan'
  | 'zhongkui'
  | 'shen'
  | 'huangcaishen'
  | 'baicaishen'
  | 'hongcaishen'
  | 'lvdu'
  | 'zadji';

export type Element = 'fire' | 'water' | 'wood' | 'earth' | 'metal';

export interface God {
  id: GodId;
  name: string;
  title: string;
  description: string;
  element: Element;
  color: string;
  bgColor: string;
  tags: string[];
  affinity: string[]; // user desire types this god is good for
}

export const GODS: Record<GodId, God> = {
  zhao: {
    id: 'zhao',
    name: '赵公明',
    title: '武财神·正财之主',
    description: '五路财神之首，主正财、招财进宝，护佑职场升迁与薪资增长。性格刚正不阿，最适合踏实努力之人。',
    element: 'earth',
    color: '#C9A84C',
    bgColor: '#FFF8E7',
    tags: ['正财', '武财神', '职场', '升职'],
    affinity: ['正财', '薪资', '升职', '职场'],
  },
  guan: {
    id: 'guan',
    name: '关公',
    title: '商业护法·义财神',
    description: '忠义之神，商界守护神，护佑生意兴旺、合同顺利、辟邪护财。讲义气重承诺之人与他最为相合。',
    element: 'metal',
    color: '#B22222',
    bgColor: '#FFF0F0',
    tags: ['生意', '护法', '义财', '辟邪'],
    affinity: ['生意', '辟邪', '护财', '合作'],
  },
  bigan: {
    id: 'bigan',
    name: '比干',
    title: '文财神·智慧理财',
    description: '无心之神，心无偏私，主公正理财与投资智慧。适合从事金融、投资、理财规划的人。',
    element: 'water',
    color: '#2E5DB3',
    bgColor: '#F0F4FF',
    tags: ['文财神', '投资', '理财', '智慧'],
    affinity: ['投资', '理财', '金融', '智慧'],
  },
  liuhai: {
    id: 'liuhai',
    name: '刘海蟾',
    title: '偏财神·戏蟾得财',
    description: '以蟾为伴，善聚偏财横财，彩票运强。活泼随性之人最易与其共振。',
    element: 'water',
    color: '#1A8C6E',
    bgColor: '#F0FFF8',
    tags: ['偏财', '横财', '彩票', '娱乐'],
    affinity: ['偏财', '横财', '彩票', '娱乐'],
  },
  fanli: {
    id: 'fanli',
    name: '范蠡',
    title: '商人之祖·经商智慧',
    description: '春秋大商人，三聚三散财富，智慧经商之道。适合创业者、商人，深谙进退之道。',
    element: 'wood',
    color: '#2D7A3A',
    bgColor: '#F0FFF2',
    tags: ['创业', '经商', '智慧', '商业'],
    affinity: ['创业', '经商', '生意', '商业'],
  },
  fulushou: {
    id: 'fulushou',
    name: '福禄寿',
    title: '家庭守护·福财三合',
    description: '福禄寿三星合一，守护家庭财富稳定增长，家和万事兴。适合注重家庭幸福的人。',
    element: 'earth',
    color: '#8B5CF6',
    bgColor: '#F5F0FF',
    tags: ['家庭', '守财', '福禄', '稳定'],
    affinity: ['守财', '家庭', '稳定', '积累'],
  },
  heguan: {
    id: 'heguan',
    name: '和合财神',
    title: '和合双仙·人脉财神',
    description: '寒山拾得，主人际和合，贵人缘旺，借人脉生财。擅长人际交往、社交型人格最合。',
    element: 'fire',
    color: '#E05C1A',
    bgColor: '#FFF4F0',
    tags: ['人脉', '贵人', '和合', '社交'],
    affinity: ['人脉', '贵人', '社交', '合作'],
  },
  zhongkui: {
    id: 'zhongkui',
    name: '钟馗',
    title: '辟邪护财·驱鬼之神',
    description: '捉鬼之神，专克小人，护财辟邪，化解财运中的阻碍与暗煞。适合遭小人干扰、财运不顺之人。',
    element: 'fire',
    color: '#7B1FA2',
    bgColor: '#F8F0FF',
    tags: ['辟邪', '护财', '小人', '化煞'],
    affinity: ['辟邪', '护财', '化煞', '阻碍'],
  },
  shen: {
    id: 'shen',
    name: '沈万三',
    title: '暴富之神·聚宝盆主',
    description: '明代首富，传说拥聚宝盆，主暴富偏财急财。适合胆大冒险、渴望快速致富之人。',
    element: 'metal',
    color: '#B8860B',
    bgColor: '#FFFDE7',
    tags: ['暴富', '急财', '偏财', '聚宝盆'],
    affinity: ['暴富', '急财', '偏财', '冒险'],
  },
  huangcaishen: {
    id: 'huangcaishen',
    name: '黄财神',
    title: '藏密五色·财富总管',
    description: '藏密第一财神，黄色象征富贵，主一切财富圆满，广增福慧。藏密修行者或信奉藏传佛教者首选。',
    element: 'earth',
    color: '#DAA520',
    bgColor: '#FFFDE7',
    tags: ['藏密', '修行', '佛教', '全财'],
    affinity: ['修行', '藏密', '佛教', '全财'],
  },
  baicaishen: {
    id: 'baicaishen',
    name: '白财神',
    title: '藏密·洁净财神',
    description: '藏密白财神，主清净财富，化解债务业障，适合还债清账、净化财运。',
    element: 'metal',
    color: '#A8A8A8',
    bgColor: '#F8F8F8',
    tags: ['藏密', '清债', '净化', '业障'],
    affinity: ['修行', '藏密', '还债', '净化'],
  },
  hongcaishen: {
    id: 'hongcaishen',
    name: '红财神',
    title: '藏密·烈焰财神',
    description: '藏密红财神，主商业贸易财富，增长人际财缘，火热激进的财富能量。',
    element: 'fire',
    color: '#CC2200',
    bgColor: '#FFF0EE',
    tags: ['藏密', '贸易', '商业', '热情'],
    affinity: ['修行', '藏密', '贸易', '商业'],
  },
  lvdu: {
    id: 'lvdu',
    name: '绿度母',
    title: '女性守护·慈悲财神',
    description: '藏密绿度母，慈悲救苦，庇佑女性财运，助力事业突破，消除障难。女性求财首选。',
    element: 'wood',
    color: '#228B22',
    bgColor: '#F0FFF0',
    tags: ['女性', '慈悲', '藏密', '事业'],
    affinity: ['女性', '修行', '藏密', '事业'],
  },
  zadji: {
    id: 'zadji',
    name: '扎基拉姆',
    title: '藏地女财神',
    description: '西藏拉萨著名女财神，特别护佑女性事业财运，有求必应，灵验著称。',
    element: 'earth',
    color: '#FF69B4',
    bgColor: '#FFF0F8',
    tags: ['女性', '藏地', '灵验', '事业'],
    affinity: ['女性', '藏密', '事业', '灵验'],
  },
};

export const GOD_LIST = Object.values(GODS);
