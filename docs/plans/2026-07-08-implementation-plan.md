# 财神配对 v1.0 实施计划（含完整测试计划）

日期：2026-07-08
前置：`2026-07-08-app-redesign-design.md`（设计已重构：端上合成壁纸、端上穿搭取色、3-Tab 导航）
原则：每个 Phase 结束时 App 可运行、测试全绿、单独提交。**逻辑先行**——每个功能先写纯函数 + 单测，再接 UI。

---

## Phase 0 — 地基修复（约 2 天）

修掉现有代码的已知缺陷，为后续开发铺路。

| # | 任务 | 文件 | 验收标准 |
|---|------|------|----------|
| 0.1 | 节日数据独立成模块，补迎财神日（正月初五）、财神节（七月廿二）、初一/十五上香日，含权重 | 新建 `constants/festivals.ts`；`lunarHelper.ts` 改为引用 | 单测：给定已知公历日期断言命中对应节日 |
| 0.2 | 修复吉日判断：删除无效纳音判断，改用 lunar-javascript `getDayYi()/getDayJi()`；「宜祭祀」= 拜财神吉日 | `lib/lunarHelper.ts` | 单测：固定日期断言宜/忌输出非空且类型正确 |
| 0.3 | 匹配度曲线重构：按财神理论满分归一化 → 线性映射到 62–98%；删除 `MatchResult.answers` 死字段 | `lib/godMatcher.ts` | 单测：任意答案组合下 62 ≤ percent ≤ 98，Top1 ≠ 100%，同答案结果确定 |
| 0.4 | 导航重构：Tab 缩为 3 个（今日/日历/我的）；quiz → `app/quiz/` 模态栈；result → `app/quiz/result.tsx`；「我的」页加「我的财神」入口 | `app/(tabs)/_layout.tsx`、移动 `quiz.tsx`/`result.tsx` | 手动：全部路由可达，无死链；未测试用户仍见欢迎页 |
| 0.5 | store 增加 `dailyGodCache: { date: string; ranking: GodId[] } | null` 及读写 action | `store/userStore.ts` | 单测：写入后跨日读取返回 null |

**提交点：** `fix: foundation — festivals, auspicious logic, score curve, 3-tab nav`

## Phase 1 — 端上壁纸引擎（约 4 天，核心）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|----------|
| 1.1 | **Spike（首日必做）**：view-shot 离屏渲染 1290×2796 双端验证；Android 失败则回退屏幕内捕获方案并更新设计文档 | scratch 分支 | 双端均产出正确尺寸 PNG |
| 1.2 | 财神主体占位图 ×14（AI 生成，透明底，<200KB/张），gods.ts 增加 `artwork`/`blessing[]`/`accessories[]` 字段 | `assets/gods/`、`constants/gods.ts` | 单测：14 位财神字段完整；资产文件存在 |
| 1.3 | `wallpaperComposer.ts`：纯函数 `composeParams(godId, date) → { bgGradient, blessing, dateText, layout }`；背景色由五行+节日+季节决定 | 新建 `lib/wallpaperComposer.ts` | 单测：五行→配色映射正确；节日日优先节日配色；同日同神输出确定 |
| 1.4 | `WallpaperCanvas.tsx`：接受 composer 参数渲染（渐变背景+主体图+文字+水印） | 新建 `components/WallpaperCanvas.tsx` | 组件测试：渲染不崩溃，吉语/日期文本存在 |
| 1.5 | 壁纸详情页接入：预览 + 保存到相册（权限拒绝路径给设置引导） | `app/wallpaper/[godId].tsx` | 手动双端：保存成功出现在相册；拒绝权限有引导弹窗 |
| 1.6 | `ShareCard.tsx` + 分享流程：壁纸+品牌水印+"测测你的财神"文案，expo-sharing 调起系统分享 | 新建组件、壁纸页接入 | 手动双端：分享出的图片带水印 |
| 1.7 | 通知点击 deep link 到今日页；通知文案带当日财神名 | `lib/notifications.ts`、`app/_layout.tsx` | 手动：点通知落在今日页 |

**提交点：** `feat: on-device wallpaper engine with save & watermark share`

## Phase 2 — 每日推荐引擎（约 2 天）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|----------|
| 2.1 | `recommender.ts`：`recommendToday(profile, date) → GodScore[]`，权重 = 基础匹配 40% + 农历日 20% + 节日 20% + 日干支五行相生克 20%；结果写入 dailyGodCache | 新建 `lib/recommender.ts` | 单测见测试计划 §T2 |
| 2.2 | 今日页接入：今日财神卡片由 recommender 驱动，展示推荐理由标签（如「初五迎财神」「五行相生」） | `app/(tabs)/index.tsx` | 组件测试：mock 日期下理由标签正确 |
| 2.3 | 结果页 Top5 财神池：排行 + 匹配度 + 每位可点入壁纸页 | `app/quiz/result.tsx` | 组件测试：5 项渲染、跳转参数正确 |

**提交点：** `feat: daily recommendation engine v2`

## Phase 3 — 穿搭分析 v1（端上，约 2 天）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|----------|
| 3.1 | 移除客户端 Anthropic SDK 调用与 `EXPO_PUBLIC_ANTHROPIC_API_KEY`（安全）；从 package.json 移除 `@anthropic-ai/sdk` | `app/outfit/index.tsx` | grep 无 anthropic 引用 |
| 3.2 | 接入 `react-native-image-colors` 主色提取 | package.json、`lib/outfitAnalyzer.ts` | 双端手动：真实照片可出主色 |
| 3.3 | `outfitAnalyzer.ts`：纯函数 颜色→五行映射 + `(穿搭五行, 喜用五行, 今日财神五行)` 查表 → 契合/中性/相克 + 配饰建议（规则表放 `constants/advice.ts`） | 新建 | 单测见 §T3 |
| 3.4 | 穿搭页 UI 接入本地分析器，保留现有三色结论卡片样式 | `app/outfit/index.tsx` | 组件测试：三种结论均可渲染 |

**提交点：** `feat: on-device outfit analysis, remove client API key`

## Phase 4 — 日历升级（约 2 天）

| # | 任务 | 文件 | 验收标准 |
|---|------|------|----------|
| 4.1 | 月视图标注：财神节日（初五/七月廿二/初一/十五）、宜祭祀吉日、忌日 | `app/(tabs)/calendar.tsx` | 组件测试：mock 月份断言标注日期正确 |
| 4.2 | 日详情：点击某天展示当日推荐财神 + 宜忌 + 吉语（复用 recommender 传入 date） | 同上 | 单测：recommender 对任意日期可算 |

**提交点：** `feat: caishen calendar with auspicious days`

## Phase 5 — 发布准备（约 3 天）

| # | 任务 | 验收标准 |
|---|------|----------|
| 5.1 | E2E 测试（Maestro）+ 截图测试落地（见测试计划 §T5/§T6） | CI 全绿 |
| 5.2 | App 图标/启动屏/名称双语；娱乐性免责声明（设置页 + 首启弹窗一次） | 手动检查 |
| 5.3 | 性能：冷启动 <2s、壁纸合成 <1s、内存无泄漏（详见 §T7） | 指标达标 |
| 5.4 | EAS Build 配置 + 双端内测包（TestFlight / APK） | 真机可装可用 |
| 5.5 | 占位美术替换为版权图（外部依赖，最迟此时完成） | 版权文件归档 |

**提交点：** `chore: release prep v1.0`

**总工期估算：约 15 个工作日。** 关键外部依赖：14 张财神版权美术图（Phase 1 起并行采购，Phase 5 前必须到位）。

---

# 完整测试计划

## 测试金字塔与工具

| 层级 | 工具 | 范围 | 何时跑 |
|------|------|------|--------|
| 单元测试 | jest-expo（已有） | lib/ 纯函数、constants/ 数据完整性、store | 每次提交（CI） |
| 组件测试 | @testing-library/react-native（已有） | 各屏幕渲染态与交互 | 每次提交（CI） |
| 截图测试 | expo web + Playwright，**393×851 固定**（共享常量），另测 393×727 | 关键屏视觉回归 | 每次提交（CI） |
| E2E | Maestro | 双端核心用户旅程 | 每日/发版前 |
| 手动矩阵 | 真机 | 权限/离线/系统集成 | 每 Phase 结束 + 发版前 |

**覆盖率目标：** `lib/` + `constants/` 语句覆盖 ≥ 90%；全项目 ≥ 70%。CI（GitHub Actions）：push 即跑 typecheck + jest + 截图对比。

**通用约定：** 所有涉及日期的测试必须注入固定 `Date`（禁止隐式 `new Date()`）；农历断言值须先用万年历人工核对后写死在 fixture 里。

## T1 单元测试 — 匹配与农历（Phase 0）

godMatcher：
- [ ] 任意答案组合：matchPercent ∈ [62, 98]，Top1 < 100
- [ ] 同一答案两次调用结果完全一致（确定性）
- [ ] 空答案、越界题号/选项号不抛错
- [ ] 5 组典型画像 fixture（打工人求正财→赵公明入 Top2；创业求生意→关公/范蠡入 Top3；投资→比干；求偏财→刘海蟾/沈万三；女性修行→绿度母/扎基拉姆入 Top5），断言排名
- [ ] Top5 无重复财神；element/desire 统计正确

lunarHelper / festivals：
- [ ] 固定公历日期命中：春节、**正月初五迎财神**、**七月廿二财神节**、十五（fixture 日期人工核对）
- [ ] 非节日日期返回 null；节日权重排序正确
- [ ] `getDayYi/getDayJi` 输出为非空字符串数组；「宜祭祀」日被标记为拜财神吉日
- [ ] 农历闰月日期不崩溃（fixture：一个闰月年份）
- [ ] `getLunarDayBonus`：初一/初二/十五/十六=2，初八/十八/廿八=1，其余=0

数据完整性（constants）：
- [ ] 14 位财神字段齐全（含新 artwork/blessing/accessories），色值合法，五行枚举合法
- [ ] 7 题每题 4–6 选项；每个 godScores 引用的 godId 存在；每位财神至少被 2 题引用（防孤儿）
- [ ] 每种五行至少有 1 位财神（elementHarmony 不会空转）

## T2 单元测试 — 推荐引擎（Phase 2）

- [ ] 权重合成正确：手工构造 profile + 日期，断言分数分解（base/lunar/festival/element 各分量）
- [ ] 正月初五：财神节加成使推荐显著偏移（对比前一日）
- [ ] 五行相生（如日干属水 vs 木属性财神）加分、相克减分方向正确
- [ ] 同 profile 同日期 100 次调用结果一致；跨日结果可不同
- [ ] dailyGodCache：当日命中缓存不重算；日期变更后失效重算
- [ ] 未完成测试（空 godRanking）时降级为通用推荐不崩溃

## T3 单元测试 — 壁纸合成与穿搭（Phase 1/3）

wallpaperComposer：
- [ ] 五行→背景配色映射逐一断言（金白/木绿/水蓝/火红/土黄系）
- [ ] 节日优先级：春节日出节日配色而非五行配色
- [ ] 吉语从该财神 blessing 池中选出且同日确定（伪随机种子 = 日期）
- [ ] 日期文案含正确农历表述

outfitAnalyzer：
- [ ] 颜色→五行全表断言（红/橙→火，黄/棕→土，白/银→金，黑/深蓝→水，绿→木）
- [ ] 三元组规则：相生→契合、同行→契合、相克→相克、其余→中性（按 advice.ts 规则表全覆盖）
- [ ] 每种结论均附非空配饰建议；未知颜色降级为中性不崩溃

## T4 组件测试（RNTL，各 Phase 随做）

- [ ] 今日页：未测试→欢迎页含「开始测试」；已测试→财神卡 + 推荐理由标签（mock 日期）
- [ ] 测试流程：7 题逐题前进、可返回改答、完成后跳结果页且 store 更新
- [ ] 结果页：Top5 渲染、匹配度显示、点击跳壁纸页参数正确
- [ ] 壁纸页：非法 godId 显示「财神未找到」；保存按钮 loading 态
- [ ] WallpaperCanvas：给定 composer 参数渲染出吉语/日期/财神名
- [ ] 穿搭页：无照片态、分析中态、三种结论态各自渲染
- [ ] 我的页：通知开关调用 schedule/cancel（mock expo-notifications）；重测清空后回到欢迎流程
- [ ] 日历：mock 月份下节日/吉日标注位置正确

## T5 截图测试（Phase 5 落地，之后每提交跑）

按全局规范：视口 **393×851** 硬编码为共享常量 `TEST_VIEWPORT`，另跑 393×727 验证 URL 栏压缩后不破版。expo web 启动真实 App，Playwright 截图对比基线（阈值 0.1%）。

覆盖屏幕：欢迎页 / 测试第 1 题 / 结果页（固定答案 fixture）/ 今日页（固定日期）/ 壁纸预览（固定财神+日期）/ 日历（固定月份）/ 穿搭结论卡 ×3。
要点：所有页面注入固定日期与 profile，保证像素级可重复；验证在真实 Tab 壳内截图（含底部 TabBar），不做孤立组件截图。

## T6 E2E（Maestro，Phase 5）

- [ ] 旅程 A（核心）：首启 → 欢迎页 → 完成 7 题 → 结果页出 Top5 → 进壁纸页 → 保存成功提示
- [ ] 旅程 B：今日页 → 穿搭分析 → 选照片（测试夹具图）→ 出结论卡
- [ ] 旅程 C：我的 → 开通知（授权弹窗接受）→ 关通知；重测 → 数据清空回欢迎页
- [ ] 旅程 D：杀进程重启 → 测试结果与今日财神保持（持久化验证）
- [ ] 双端各跑一遍（iOS 模拟器 + Android 模拟器），发版前真机加跑旅程 A

## T7 手动测试矩阵（每 Phase 结束 + 发版前）

设备：iPhone SE（小屏）/ iPhone 15 Pro Max / 中端 Android（如 Pixel 5）/ 大屏 Android。

| 类别 | 用例 |
|------|------|
| 权限 | 相册/通知权限拒绝→有设置引导且不崩溃；拒绝后再允许功能恢复 |
| 离线 | 全程飞行模式：测试、壁纸合成/保存、穿搭分析、日历全部可用（v1 应零网络依赖） |
| 时间 | 23:59→00:00 跨日：今日财神刷新、缓存失效；改系统时区不崩溃；农历闰月当月显示正确 |
| 通知 | 每日 8 点通知到达（改系统时间验证）；点击落今日页；重复开关不产生重复通知 |
| 分享 | 微信/系统分享出图带水印、清晰度可用 |
| 壁纸 | 保存图在相册中为全分辨率（1290×2796 或按机型），设为锁屏后主体不被时钟遮挡（关键区域留白检查） |
| 视觉 | 小屏无截断、大屏无拉伸；深色模式下可读（v1 若不适配深色则强制浅色并验证） |

## T8 非功能验收（Phase 5 出口条件）

- [ ] 冷启动 → 今日页可交互 < 2s（中端 Android 实测）
- [ ] 壁纸合成+保存 < 1s；连续保存 10 张内存无持续增长
- [ ] 安装包：iOS < 60MB、Android APK < 40MB（14 张主体图压缩预算 ≤ 3MB）
- [ ] 无障碍：按钮均有 accessibilityLabel；字体跟随系统缩放不破版（1.3× 抽查）
- [ ] 崩溃率门槛：内测周崩溃率 < 1%（Expo 自带错误上报或 Sentry，P1 再定）

## 发布检查单

- [ ] 全部 CI 绿；覆盖率达标；E2E 双端通过；手动矩阵签字
- [ ] 版权美术已替换占位图，授权文件归档
- [ ] 免责声明（娱乐/传统文化定位）在设置页与商店描述中
- [ ] 隐私清单：相册（保存壁纸/选穿搭照）、通知；v1 无网络传输个人数据——商店隐私标签如实填写
- [ ] CLAUDE.md 状态章节同步更新
