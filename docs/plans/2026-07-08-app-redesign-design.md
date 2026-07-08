# 财神配对 App 设计重构（v2 Design）

日期：2026-07-08
状态：待评审
范围：对现有 Milestone 1 代码的全面设计重审，确定 v1.0 上线前的架构方向。

---

## 一、现状盘点

已完成（commit `e3ff060` / `3e6b2af`）：

- Expo SDK 55 + expo-router，5 个 Tab 页（今日/测试/结果/日历/我的）+ 壁纸详情 + 穿搭分析
- 14 位财神数据库（`constants/gods.ts`）、7 题测试题库（`constants/quiz.ts`）
- 匹配算法（`lib/godMatcher.ts`）、农历工具（`lib/lunarHelper.ts`）、壁纸服务（`lib/wallpaperService.ts`）、本地通知
- 29 个单元测试（jest-expo）

## 二、现有设计的问题（重审发现）

按严重程度排序：

| # | 问题 | 位置 | 影响 |
|---|------|------|------|
| P1 | CDN 不存在：`cdn.yourdomain.com` 是占位符，壁纸功能整体不可用；上线依赖一条尚未开始的壁纸生产线 + R2 配置 | `wallpaperService.ts:5` | 核心功能（P0）完全阻塞 |
| P2 | Anthropic API Key 打进客户端包：`EXPO_PUBLIC_ANTHROPIC_API_KEY` 会被编译进 JS bundle，任何人可提取盗刷 | `app/outfit/index.tsx:20` | 安全事故 + 费用风险，商店审核也可能被拒 |
| P3 | 匹配度永远 100%：按最高分归一化，第一名恒为 100%，缺乏娱乐性和区分度 | `godMatcher.ts:42-51` | 核心体验伤害 |
| P4 | 吉日判断逻辑无效：在纳音字符串里找「冲/破/害」永远找不到，`isAuspicious` 恒为 true | `lunarHelper.ts:39-41` | 日历功能失真 |
| P5 | 关键节日缺失：**正月初五（迎财神日）**、**七月廿二（财神节）** 不在节日表——这是财神 App 最重要的两天 | `lunarHelper.ts:15-25` | 产品定位级疏漏 |
| P6 | 导航结构：测试和结果作为常驻 Tab 不合理（测试是一次性流程） | `app/(tabs)/_layout.tsx` | 信息架构混乱 |
| P7 | 分享水印（P0 功能）未实现 | — | 裂变获客缺失 |

## 三、两个关键架构决策（重构核心）

### 决策 1：壁纸改为端上合成，v1 不依赖 CDN

**选定方案：RN 视图合成 + react-native-view-shot 截图导出。**

原架构（AI 批量生图 → R2 CDN → App 拉取）意味着上线前必须完成一条独立的壁纸生产线（几百张图的生成、审核、上传），且断网即不可用。而 CLAUDE.md 第八章的生产思路本身就是「固定主体 × 程序化背景」——这套合成完全可以搬到端上做：

```
本地打包资产：14 张财神主体 PNG（透明底，约 800×1200，压缩后 <200KB/张）
      +
程序化图层（RN View）：
  五行/节日/季节配色渐变背景（expo-linear-gradient）
  财神名 + 农历日期 + 每日吉语（文字层）
  品牌水印（右下角半透明）
      ↓
离屏渲染 1290×2796 视图 → react-native-view-shot 捕获 → 保存/分享
```

好处：
- 上线不再被壁纸生产线阻塞，只需 14 张主体图（可购买版权插画或 AI 生成后人工精修）
- 完全离线可用，符合「无后端」原则，零 CDN 成本
- 壁纸随日期/节日/五行无限变化（程序化），分享水印天然内置于同一渲染管线
- 保留 `manifest.json`/R2 通道作为 P2「精品壁纸包」扩展（现有 `wallpaperService.ts` 缓存逻辑保留，改为可选数据源）

备选方案（未选）：
- react-native-skia 渲染 —— 质量上限更高，但复杂度高、测试难，留作 P2 八字定制图的升级路径
- 继续 CDN 方案 —— 上线阻塞、断网不可用、有持续运营成本

### 决策 2：穿搭分析改为两级——v1 端上取色，AI 升级走 Worker 代理

**v1 选定方案：端上主色提取（react-native-image-colors）→ 本地五行映射 → 本地规则输出结论。**

- 颜色→五行映射是固定规则（红/橙→火，黄/棕→土……），不需要 AI 也能完成 CLAUDE.md 第六章的完整流程
- 零网络请求、零成本、零密钥风险、结果秒出
- 结论文案（契合/中性/相克 + 配饰建议）由本地规则表生成：`(穿搭五行, 用户喜用五行, 今日财神五行)` 三元组查表

**P1 升级：Cloudflare Worker 代理 Claude Vision。** Worker（约 50 行，免费额度内）持有 API Key，App 只调 Worker。这不违背「无自建后端」的精神——无服务器可运维，且是唯一能安全用 Claude API 的方式。AI 增强的价值在于更丰富的个性化文案，不在颜色识别本身。

### 附带决策 3：匹配度分数曲线

匹配度改为映射到 **62%–98%** 区间（按该财神理论满分归一化后再线性映射），保证：
- 永远不出现 100%（保持神秘感）
- Top5 之间有可见差距（娱乐性）
- 同样答案永远同分（确定性，可测试）

## 四、v1.0 目标架构

### 4.1 导航结构（重构）

```
app/
├── (tabs)/
│   ├── index.tsx        今日：今日财神卡片 + 壁纸预览 + 穿搭入口
│   ├── calendar.tsx     日历：月视图，财神吉日/宜忌标注
│   └── profile.tsx      我的：我的财神(结果页入口)/生日/通知/重测
├── quiz/
│   ├── index.tsx        测试流程（全屏模态栈，7 题）
│   └── result.tsx       结果页（测完即入，之后从"我的"进）
├── wallpaper/
│   └── [godId].tsx      壁纸预览 + 保存 + 分享（水印卡片）
├── outfit/
│   └── index.tsx        穿搭分析
└── _layout.tsx
```

3 个常驻 Tab；测试是一次性流程走模态栈；未完成测试时「今日」页保持现有欢迎引导。

### 4.2 模块分层

```
constants/   gods.ts / quiz.ts / festivals.ts(新) / advice.ts(新：吉语+配饰规则表)
lib/
  godMatcher.ts        匹配算法（分数曲线重构）
  lunarHelper.ts       农历（修复吉日逻辑，改用 lunar-javascript 宜忌 API）
  recommender.ts       (新) 每日推荐：基础匹配分+农历日+节日+节气+五行加成
  wallpaperComposer.ts (新) 壁纸图层参数计算（背景色/吉语/布局，纯函数）
  outfitAnalyzer.ts    (新) 颜色→五行→结论规则引擎（纯函数）
  notifications.ts     通知（deep link 到今日页）
  wallpaperService.ts  保留，降级为 P2 精品壁纸包的可选数据源
components/
  WallpaperCanvas.tsx  (新) 壁纸合成视图（接受 composer 参数渲染）
  ShareCard.tsx        (新) 分享卡片（壁纸+品牌+二维码位）
store/userStore.ts     增加 dailyGodCache（当日推荐结果缓存，跨日失效）
```

核心原则：**所有业务逻辑写成纯函数放 lib/，接受 `date`/`profile` 参数注入，UI 只做渲染** —— 这是测试计划可行的前提。

### 4.3 每日推荐算法（recommender.ts）

```
score(god) = baseMatch(测试排名分, 40%)
           + lunarDayBonus(初一/十五/初五等, 20%)
           + festivalBonus(财神诞×3/春节×2/其他×1, 20%)
           + elementHarmony(日干支五行 vs 财神五行 相生+2/相克-1, 20%)
输出：Top1 今日财神 + 完整排序（日历和壁纸复用）
约束：同一天同一 profile 结果确定不变（缓存到 store，日期变更失效）
```

### 4.4 数据修正清单

- `festivals.ts`：补正月初五（迎财神，权重最高）、七月廿二（财神节）、每月初一/十五上香日
- 吉日：改用 lunar-javascript 的 `getDayYi()/getDayJi()`，「宜祭祀」即拜财神吉日
- 每位财神补充字段：`artwork`（本地 PNG require）、`blessing[]`（吉语池）、`accessories[]`（配饰建议）

## 五、不做的事（YAGNI）

- 不做八字排盘（P2 原样保留在 backlog）
- 不做签到/财气值/周报（P2）
- v1 不接任何远程 API（穿搭 AI 增强属 P1，且必须走 Worker 代理）
- 不做 GPS 方位推荐（P1，v1 权重公式预留 direction 位即可）

## 六、风险

| 风险 | 缓解 |
|------|------|
| 14 张财神主体图的美术来源 | 与开发并行：先用带版权风险提示的 AI 占位图开发，上线前替换为购买/定制版权图 |
| view-shot 在 Android 离屏渲染兼容性 | Phase 1 首个任务即做双端 spike，失败则回退为「屏幕内预览视图直接捕获」 |
| 迷信/宗教类内容的商店审核 | 文案强调「传统文化/娱乐」定位，添加娱乐性免责声明 |
