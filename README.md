# DOCIA Lab Homepage

上海科技大学 DOCIA（Lab of Decision, Optimization, and Control for Intelligent Agents）课题组主页，提供中文与英文两套界面，右上角按钮可随时切换。访客可以浏览研究方向、成果、成员、校友去向、课题组合影、新闻与荣誉，也可以在首页观察梯度下降过程，并通过八个边缘服务器的负载均衡实验比较网络拓扑。[打开网站](https://docia.org)

**日常维护从 [dist/site.config.js](dist/site.config.js) 开始。** `dist/` 是可直接编辑和部署的完整站点。浏览器原生加载 HTML、CSS 和 JavaScript 模块。发布已有内容只需要一个静态文件服务器，站点运行没有 Node.js、Python 服务或数据库依赖。

## 最近更新（2026-11）

- **站内搜索**：页头放大镜打开双语搜索，覆盖成员、研究方向、论文、新闻、校友、合影、荣誉、页面与联系方式；结果可直接跳到对应条目并短暂高亮，支持 `Cmd/Ctrl+K`、`/`、方向键与 `Enter`。索引在浏览器内生成，不需要后端。
- **SEO**：补充 canonical、hreflang、Open Graph/Twitter、JSON-LD，以及 `robots.txt`、`sitemap.xml`、`site.webmanifest`、分享图和站点图标；无 JavaScript 时仍有可读的静态简介与栏目链接。生产域名为 `https://docia.org`。
- **界面改版**：页眉在 DOCIA Lab 旁显示学校名；标题改用 Garamond/Bodoni 风格字体栈并放宽字距；删除首页、People、Alumni、Contact 等页面重复的 eyebrow 小标签；首页主按钮改为「先试实验、再看研究方向」；原 Network playground 改名为 Interactive experiment；页脚去掉「Homepage demo / 课题组主页」等演示后缀。
- **People 分组**：成员按 `group` 字段分为 PI / Students / Alumni，空分类不显示；新增成员时在 `site.people` 里写 `group: "students"` 即可进入学生分组。
- **一键部署**：`tools/deploy-server.sh` 面向 Ubuntu / Debian，自动 apt 安装 nginx/rsync、发布 `dist/` 并启用站点；用法见「部署到服务器 → 一键部署」。

## 本地运行

有仓库读取权限后，在开发电脑上执行以下命令。SSH 克隆使用已关联 GitHub 账号的 SSH 密钥，也可以在仓库的 **Code** 菜单复制 HTTPS 地址。

```sh
git clone git@github.com:C1audine/docia-lab-homepage.git
cd docia-lab-homepage
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
```

打开 <http://127.0.0.1:8000/>。修改配置后刷新浏览器即可。直接双击 `index.html` 时浏览器可能拦截本地模块加载，请使用上面的 HTTP 地址。手机预览可使用浏览器的设备模拟，也可以在可信局域网中将绑定地址改为 `0.0.0.0`，再用手机访问 `http://电脑的局域网IP:8000/`。结束预览时按 Ctrl+C。

## 页面入口

下表路径接在站点根地址后。研究方向的详情地址由配置中的 `research[].id` 决定。

| 页面 | 路径 | 展示内容或操作 |
| --- | --- | --- |
| Home | `/` 或 `/#/home` | 实验室介绍、随滚动移动的梯度下降点、网络实验、研究卡片、前两条论文记录，以及最新三张合影 |
| Interactive experiment | `/#/simulation` | 跳到首页实验区。切换拓扑、选择节点、调整初始负载，然后运行、暂停或重置实验 |
| Research | `/#/research` | 查看研究方向，点击卡片进入详情 |
| Research detail | `/#/research/distributed-optimization` | 示例详情页，包含研究问题、说明与关联论文 |
| Publications | `/#/publications` | 按配置中的顺序列出论文及外部链接 |
| People | `/#/people` | 页面标题为 Our Team；按 PI、Students、Alumni 分类展示成员照片、职务、单位、研究兴趣、个人主页与邮箱（当前有内容的分类才显示） |
| Alumni | `/#/alumni` | 毕业年份、学位及毕业后的首份去向，可附照片、个人主页与邮箱 |
| Moments | `/#/gallery` | 课题组合影分区，按配置顺序展示照片、时间、标题与说明 |
| News | `/#/news` | 课题组动态：日期加一句话，可带外部链接，不展开详情 |
| Honors | `/#/honors` | 课题组奖项：年份、奖项名，可选获奖人与说明 |
| Contact | `/#/contact` | 负责人邮箱、办公室和通信地址。邮箱链接唤起访客的邮件客户端 |

浏览器实际向服务器请求 `index.html`，然后根据 `#` 后的片段渲染相应页面。因此复制详情地址、直接打开和刷新都可以共用同一个服务器入口。

所有页面右上角都有搜索按钮：可以按人名、论文、新闻、研究方向、合影说明、荣誉或邮箱等关键词查找，中英文都能搜；点结果会跳到对应条目并短暂高亮。也可以按 `Cmd/Ctrl+K` 或 `/` 打开，`Esc` 关闭，`↑` `↓` 选择、`Enter` 打开。搜索在浏览器内完成，不需要后端，新增内容会自动进入索引。

## 源码入口与维护方法

| 文件 | 何时修改 |
| --- | --- |
| [dist/index.html](dist/index.html) | 修改 HTML 外壳、默认标题/描述、canonical、Open Graph/Twitter、JSON-LD、无 JS 回退和 favicon 引用。页面通过此处的模块脚本启动 |
| [dist/robots.txt](dist/robots.txt) | 告诉爬虫哪些路径可抓取，并指向 sitemap；换域名或增加禁止目录时改这里 |
| [dist/sitemap.xml](dist/sitemap.xml) | 提交给搜索引擎的入口清单，含中英文 hreflang；换域名、加栏目或大改内容时更新 `lastmod` |
| [dist/site.webmanifest](dist/site.webmanifest) | 主屏幕图标、站点名和主题色的 Web App Manifest；换品牌名或图标时同步 |
| [dist/assets/og-docia.jpg](dist/assets/og-docia.jpg) | 社交分享卡片图（1200×630）。换实验室标语、品牌色或域名时重新生成 |
| [dist/site.config.js](dist/site.config.js) | 修改课题组资料、主色、导航标签、研究记录、论文、成员、校友及实验默认值 |
| [dist/app.js](dist/app.js) | 修改页面结构、首页区块顺序、研究详情和路由。新增一级页面时同时更新 `render()` 的页面映射与配置中的 `navigation` |
| [dist/search.js](dist/search.js) | 站内搜索：从配置生成索引、匹配与排序、结果弹窗和键盘操作。改搜索范围、权重或快捷键来这里；日常加内容不需要动它 |
| [dist/i18n.js](dist/i18n.js) | 界面用语的中英文字典（导航、按钮、图表标签、占位提示）与语言切换逻辑。改界面措辞来这里；改内容去 `site.config.js` |
| [dist/style.css](dist/style.css) | 修改字号、间距、组件样式及响应式布局。当前导航在 1000 px 及以下折叠为菜单，实验区在 650 px 及以下变为单栏，合影网格在 780 px 及以下为两列、410 px 及以下为单列 |
| [dist/ui.js](dist/ui.js) | 公用图标、文本转义、姓名缩写和图片路径解析 |
| [dist/model.js](dist/model.js) | 定义拓扑坐标、邻接边、同步负载交换算法和均方根误差 |
| [dist/experiment.js](dist/experiment.js) | 定义实验界面、运行和暂停逻辑、对照曲线、节点标签及指标说明 |
| [dist/terrain.js](dist/terrain.js) | 把页面滚动进度映射到预计算的下降轨迹，并绘制标记和图例 |
| [tools/render-landscape.py](tools/render-landscape.py) | 修改目标函数、初始点、步长、投影或曲面渲染方式 |
| [tools/deploy-server.sh](tools/deploy-server.sh) | 在 Ubuntu / Debian 服务器一键安装 Nginx、发布 `dist/` 并启用站点；改默认目录或站点名时修改脚本头部 |
| [dist/assets](dist/assets) | `mark.svg` 是站点标识，`landscape.webp` 与 `descent.js` 是同一次计算生成的曲面和轨迹 |
| [dist/assets/people](dist/assets/people) | 成员与校友的照片文件 |
| [dist/assets/gallery](dist/assets/gallery) | 课题组合影文件 |

## 维护手册

### 1. 先分清三层：内容、图片、代码

| 层 | 位置 | 存的是什么 | 什么时候动 |
| --- | --- | --- | --- |
| 内容 | [dist/site.config.js](dist/site.config.js) | 全部文字：成员、校友、论文、研究方向、合影说明、联系方式、导航标签 | 每次有人加入、毕业、发论文、办活动 |
| 图片 | [dist/assets/people](dist/assets/people)、[dist/assets/gallery](dist/assets/gallery) | 照片与合影的图片文件本身 | 有新照片时 |
| 代码 | `dist/*.js`、`dist/style.css` | 页面结构、样式、路由 | 只有改版才需要 |

关于「配置是不是只是个索引」，准确地说：

- **`site.config.js` 不是索引，它仍然是内容的唯一来源。** 文字、条目顺序、链接、日期都写在里面，页面完全按它渲染。
- **`dist/assets/people/` 只是一排文件夹，页面不会去扫描它。** 图片放进去不等于会上线——必须在 config 的某条记录里用 `photo` 指到它。
- 两者的关系是**单向引用**：`site.people` 里的一条记录 = 一个人 + 他的文字；`photo` 可选地指向文件夹里的一张图。同一张图可以被多人引用，不被引用的图永远不会被加载。
- 反过来也做了兜底：config 里写了文件名但文件不存在、或大小写写错时，页面会自动回退成首字母头像，不会出现破图。

一句话：**文字写 config，图片放文件夹，config 里用文件名把两者连起来。**

### 2. 五分钟上手：给一位成员加照片

1. 把照片存成 `dist/assets/people/jie-lu.webp`。
2. 打开 `dist/site.config.js`，找到这条记录，把 `photo` 填上文件名：

```js
{
  name: "Jie Lu",
  role: "Lab Director · Associate Professor",
  affiliation: "School of Information Science and Technology",
  description: "Research interests include distributed optimization, multi-agent decision making, and networked dynamical systems.",
  url: "https://sist.shanghaitech.edu.cn/lujie_en/main.htm",
  urlLabel: "University profile",
  email: "lujie@shanghaitech.edu.cn",
  photo: "jie-lu.webp"
}
```

3. 刷新 <http://127.0.0.1:8000/#/people> 即可看到照片替换了首字母。把 `photo` 改回 `""` 就退回首字母。

### 3. 成员与校友

**成员（`people`）字段**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 英文姓名。首字母头像由它生成（如 Jie Lu → JL），最多取三个词首字母 |
| `role` | 是 | 职务，显示在姓名上方的小标 |
| `affiliation` | 是 | 单位，页面上自动追加 `site.university` |
| `description` | 是 | 研究兴趣，一段话 |
| `url` | 否 | 个人主页链接；留空则不显示 |
| `urlLabel` | 否 | 主页链接的文字，缺省为 `Homepage` |
| `email` | 否 | 邮箱，显示为 `mailto:` 链接 |
| `photo` | 否 | 照片，留空用首字母头像 |
| `group` | 否 | `"pi"`（默认）或 `"students"`；People 页据此分到 PI 或 Students 分类，空分类不显示 |

**校友（`alumni`）字段**

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 英文姓名，首字母小圆标由它生成 |
| `degree` | 是 | `PhD` / `Master` 等，页面上显示为「PhD graduate」 |
| `year` | 是 | 毕业年份 |
| `position` | 是 | 毕业后首份职位 |
| `destination` | 是 | 去向单位，加粗显示 |
| `location` | 是 | 城市、国家 |
| `source` | 否 | 佐证链接（如年鉴）；留空则不显示 |
| `url` / `email` / `photo` | 否 | 同成员字段，显示在姓名下方 |

**新增、删除、排序**

- 新增：在数组里复制一条记录、改字段即可，注意上一条结尾的逗号。
- 删除：整条记录删掉；图片文件可以留着（不会加载），也可以一并删除。
- 排序：**数组顺序就是页面顺序**，直接上下移动整条记录。

### 4. 照片：放哪、路径怎么写

照片目录由配置顶部的 `media` 统一指定，改这里就能整体换目录（`people` 与 `alumni` 默认共用同一个）：

```js
media: {
  people: "./assets/people/",
  alumni: "./assets/people/",
  gallery: "./assets/gallery/"
}
```

`photo` 的写法按以下规则解析（以 `media.people` 为 `./assets/people/` 为例）：

| 写法 | 结果 |
| --- | --- |
| `""` | 不显示照片，用首字母头像 |
| `"jie-lu.webp"` | `./assets/people/jie-lu.webp` |
| `"./jie-lu.webp"` | 同上（开头的 `./` 会被忽略） |
| `"../shared/group.webp"` | `./assets/shared/group.webp`（相对 `media` 目录往上走） |
| `"/assets/people/jie-lu.webp"` | 站点根绝对路径；**站点部署在子目录（如 `/docia/`）时不要用这种写法** |
| `"https://cdn.example.org/x.jpg"` | 直接外链，不拼接目录 |

**图片规范**

- 格式：WebP 或 JPEG；不要用 HEIC。
- 成员照片：竖版，约 4:5，正方形也能接受。
- 合影：横版，约 4:3。
- 体积：单张 300 KB 以内，合影 400 KB 以内；页面用 `loading="lazy"`，不进视口不加载。
- 命名：小写英文 + 连字符，如 `jie-lu.webp`、`2026-spring-retreat.webp`。**Linux 服务器区分大小写**，`Photo.JPG` 和 `photo.jpg` 是两个文件。
- 图片缺失或路径写错时，成员照片会自动回退首字母、合影会显示占位卡片，但控制台仍会有 404，发版前建议清一遍。

### 5. 课题组合影

合影写在 `site.gallery`，**数组顺序即展示顺序**，首页取前三张：

```js
gallery: [
  {
    id: "2026-spring-retreat",
    photo: "2026-spring-retreat.webp",
    date: "April 2026",
    title: "Spring retreat",
    caption: "A weekend of hiking and planning the year ahead.",
    credit: "Wei Zhang",
    alt: "Group photo on the mountain trail"
  }
]
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一标识，仅用于维护时区分 |
| `photo` | 是 | 文件名，按 `media.gallery` 拼接 |
| `date` | 否 | 显示在卡片顶部的小标，如 `April 2026` |
| `title` | 否 | 卡片标题，缺省为 `Lab moment` |
| `caption` | 否 | 一句说明 |
| `credit` | 否 | 摄影者姓名，页面会自动加上「Photo:」前缀，所以这里**只写人名**，不要再写「Photo:」 |
| `alt` | 否 | 图片替代文本，缺省用 `title`，建议填上以便无障碍访问 |

- 相册为空时，`/#/gallery` 显示「Photos coming soon」占位，首页的「Life at DOCIA」区块自动隐藏（不会留空行）。
- 图片文件缺失或路径写错时，卡片会显示「Photo coming soon」斜纹占位，不会出现破图标。
- 想把某张合影挪到首页，把它在数组里往前排即可。

### 6. 新闻与荣誉（News / Honors）

新闻写在 `site.news`，**数组顺序即展示顺序**，把最新的放在最上面。每条只有「日期 + 一句话」，不进入详情页：

```js
news: [
  { date: { en: "2023", zh: "2023 年" },
    text: { en: "“Paper title” is published in IEEE TAC.",
            zh: "论文《Paper title》发表于 IEEE TAC。" },
    url: "https://doi.org/10.xxxx/xxxxx" }   // 可选，有链接时整句可点，末尾自动加 ↗
]
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `date` | 是 | 显示在左列（窄屏时在条目上方），写年份或「2023 年 5 月」 |
| `text` | 是 | 一句话说明，不要换行，中文里建议用《》引用论文名 |
| `url` | 否 | 论文页、DOI 或校内新闻链接，新窗口打开 |

荣誉写在 `site.honors`，同样是数组顺序即展示顺序：

```js
honors: [
  { year: 2025,
    title: { en: "Best Paper Award, ICASSP", zh: "ICASSP 最佳论文奖" },
    recipient: { en: "Jie Lu and the team", zh: "Jie Lu 与课题组" },   // 可选
    note: { en: "For the paper on decentralised consensus.",
            zh: "表彰在分散式一致性方面的论文。" } }                   // 可选
]
```

- 两个页面的路径分别是 `/#/news` 与 `/#/honors`，导航标签在 `site.navigation` 里改。
- 数组为空时页面显示占位提示（`No news yet` / `No awards yet`），不会报错，也不会留下空白排版。
- 首页目前不展示新闻与荣誉；若以后想在首页加「Latest news」区块，在 `dist/app.js` 的 `home()` 里追加一行 `homeNews()` 之类的区块即可。

### 7. 中英文双语维护

站点现在有中文和英文两套界面，右上角（手机上在汉堡菜单顶部）的 `EN / 中` 按钮切换。语言选择记在浏览器 `localStorage` 的 `docia-lang` 里，所以访客下次打开仍是他上次选的语言；也可以直接用 `?lang=zh` 或 `?lang=en` 打开指定语言（例如 `http://127.0.0.1:8000/?lang=zh#/news`）。

维护时只需记住一条规则：**凡是访客会读到的内容，都写成 `{ en: "…", zh: "…" }`**。

```js
title: { en: "Lab members", zh: "课题组成员" }      // 正确：两种语言都覆盖
title: "Lab members"                                // 也可以：中文界面会直接显示这段英文
```

- 界面用语（导航、按钮、图表标签、占位提示、无效链接说明）不在 `site.config.js` 里，而在 `dist/i18n.js` 的字典中；改这些措辞去 `i18n.js`。
- 内容文案（姓名、角色、研究简介、论文、新闻、荣誉、联系方式）在 `site.config.js` 里，每条都带 `{ en, zh }`。
- 纯专有名词不必翻译：论文题目、作者、期刊名、人名、学校英文名保持英文字符串即可，中文界面会原样显示（现有论文条目就是这样处理的）。
- 漏写 `zh` 不会报错，中文界面会回退显示英文原文——这是刻意的降级策略，方便增量补齐。
- 中文排版已单独处理：`:lang(zh)` 下标题字距略增、首页大标题最后一行不加斜体、正文字体回退到系统宋体/黑体。相关规则集中在 `dist/style.css` 末尾的 `Chinese typography` 段落。
- 大标题统一使用 `--display` 字体栈（Bodoni 72 → Didot → Garamond → Baskerville → 系统衬线），中文回退到宋体；首页主标题与栏目页标题的行高、字距也集中由该字体栈附近的 `h1` / `h2` 规则控制，避免中西文各写一套。

### 8. 论文与研究方向

论文写在 `site.publications`，首页只取前两条：

```js
{
  id: "example-paper",
  year: 2026,
  title: "Full paper title",
  authors: "Author A and Author B",
  venue: "Journal or conference",
  url: "https://example.org/paper"
}
```

研究方向写在 `site.research`，`id` 同时是详情页地址（`/#/research/distributed-optimization`）：

```js
{
  id: "distributed-optimization",
  title: "Distributed optimization",
  icon: "network",            // 可选：network / agents / contour
  short: "卡片上的一句话",
  question: "详情页的大标题问题",
  detail: "详情页正文",
  paper: "stochastic"         // 关联论文的 id，留空则不显示论文
}
```

- `id` 一旦对外分享过就不要再改，否则旧链接失效。
- 新增研究方向会自动出现在 `/#/research` 的卡片区，不需要改代码。

### 9. 导航与页面

`site.navigation` 控制导航的**标签和顺序**（下面是节选），目前共九项：

```js
navigation: [
  { id: "home", label: { en: "Home", zh: "首页" } },
  { id: "gallery", label: { en: "Moments", zh: "合影" } },
  { id: "contact", label: { en: "Contact", zh: "联系" } }   // id 为 contact 的项显示为按钮
]
```

页面标题和引导语在 `site.pages` 里（同样是 `{ en, zh }`），但页面本身是代码里注册的：`dist/app.js` 的 `render()` 页面映射决定渲染函数。**新增一个一级页面需要同时改配置（`navigation` + `pages`）和 app.js**；只加配置项的话，点进去会回到首页。日常维护（加人、加照片、加合影、加论文、加新闻、加荣誉）都不需要动代码。

### 10. 首页文案、联系方式、配色

- `hero.lines` 是首页大标题的分行数组，最后一行显示为绿色斜体。
- `hero.description` 是标题下的介绍段落。
- `brand` / `name` / `university` 分别用于站点简称、全称和学校名；页脚、页眉品牌旁的学校小字和无 JS 回退都会复用。
- `url` 是正式域名（当前为 `https://docia.org`，不带末尾斜杠），canonical、hreflang 和分享图都以它为根。换域名或部署到子目录时，除这里外还要同步 `dist/index.html`、`robots.txt` 与 `sitemap.xml`；详见第 14 节。
- `contact` 集中保存邮箱、办公室、街道、城市、学院和外链，联系页与论文页共用。
- `palette` 控制五个主题色；页面里的插图（曲面、网络、等高线）颜色在 SVG 或绘图脚本中，不随 `palette` 变化。

### 11. 实验参数与曲面图

`experiment.initialLoads` 的八个位置依次对应 N01 至 N08。`topology` 支持 `Mesh`、`Ring`、`Star`，`capacity` 是单台服务器的容量，`tolerance` 是 RMS 负载误差阈值，`previewRound` 决定首次显示哪一轮。改变初始负载或切换拓扑会从第 0 轮重新计算。修改算法时从 `simulate()` 开始，修改指标展示时从 `mountExperiment()` 开始。

曲面与轨迹已经提交。仅在修改目标函数或绘图参数时，从仓库根目录重新生成两者，并一同提交：

```sh
python3 -m venv .venv
.venv/bin/python -m pip install numpy pillow contourpy
.venv/bin/python tools/render-landscape.py
git add tools/render-landscape.py dist/assets/landscape.webp dist/assets/descent.js
```

### 12. 改完自检

1. 首页：`/` 打开正常，实验能跑，页脚链接完整。
2. 成员页：`/#/people` 照片或首字母都正常，主页与邮箱链接可点。
3. 校友页：`/#/alumni` 头像、去向、年鉴链接正常。
4. 合影页：`/#/gallery` 顺序正确，首页「Life at DOCIA」同步。
5. 新闻页 `/#/news`、荣誉页 `/#/honors`：条目顺序正确，日期与文案没有串行。
6. 点右上角 `中 / EN`：整页（导航、标题、正文、页脚）立刻切换，刷新后仍是上次选的语言。
7. 看控制台（F12）：没有红色报错、没有 404。
8. 搜索：点右上角放大镜（或 `Cmd/Ctrl+K`、`/`）能打开；搜一个人名、一个论文关键词和一个年份，结果数量合理；点结果能跳到对应条目并短暂高亮；无结果时显示提示；`Esc` 能关闭。
9. 缩窄窗口到手机宽度（约 390 px）：导航折叠成汉堡菜单、语言按钮出现在菜单顶部，合影变成两列再到单列；搜索弹窗不超出屏幕。
10. 新版界面：页眉 DOCIA Lab 旁有 ShanghaiTech University / 上海科技大学，各页标题上方不再出现重复的小字标签；首页按钮顺序为 Try the simulation → Explore research；People 页只保留 Our Team 主标题，分类为 PI / Students / Alumni（空分类不显示）。
11. SEO：查看网页源代码，`<title>`、description、canonical 和 `og:image` 都是绝对地址；`/robots.txt`、`/sitemap.xml`、`/site.webmanifest` 返回 200；在浏览器禁用 JavaScript 后刷新，仍能看到实验室简介、栏目链接和联系方式。

### 13. 站内搜索

搜索入口在页头右侧。索引在第一次打开搜索时由 [dist/search.js](dist/search.js) 从 `site.config.js` 与 `i18n.js` 生成，没有后端请求，也没有单独的数据文件。

- **能搜到什么**：导航页面、首页与实验区、研究方向（标题、简介、问题、详情、关联论文）、论文（标题、年份、期刊、作者）、成员（姓名、职务、单位、简介、邮箱、主页）、校友（姓名、学位、职位、去向、地点、邮箱）、合影（标题、日期、说明、图片替代文本）、新闻（日期、正文、链接）、荣誉（年份、奖项、获奖人、说明）以及联系方式。
- **中英文**：内容写成 `{ en, zh }` 时，两种语言的关键词都能命中。若界面是英文而用中文搜索，结果摘要会显示命中的那条中文原文，避免出现「有结果却看不到命中词」的情况。
- **排序**：标题完全匹配最优先，其次是标题开头、标题包含、副标题和正文；同分时按类型（成员、研究方向、论文、新闻、校友、合影、荣誉、页面）再按字母序，最多显示 30 条。
- **改界面措辞**：按钮、占位符、结果数量、无结果提示、类型名称和键盘提示都在 [dist/i18n.js](dist/i18n.js) 的 `search` 字典里。改搜索字段范围、权重或快捷键则改 [dist/search.js](dist/search.js)。
- **新增页面**：只加 `navigation` 和 `pages` 时，新页面会出现在搜索的「浏览页面」里；若它还有可跳转的详情条目，按第 9 节同时注册页面渲染函数，并在生成索引时补一条记录。
- **条目 id 与跳转**：搜索结果的链接形如 `#/people/person-0`、`#/publications/paper-stochastic`。这些 id 由 `app.js` 渲染时用 `targetId()` 生成；调整记录顺序后旧链接可能指向别的条目，但搜索本身会重新生成正确链接。

### 14. 搜索引擎优化（SEO）

这是带 `#` 路由的单页站点，Google 通常只把 `/` 和 `/?lang=zh` 当作两个可索引入口，各栏目共用同一个文档。当前做法是让爬虫拿到完整的首页信息、结构化数据和分享卡片，同时保留站内跳转；如果以后要让每个栏目独立收录，需要把 `#/people` 改成 `/people/` 这样的真实路径并由服务器回退到 `index.html`，那是一次路由改造，不是改文案能完成的。

- **站点地址**：`dist/site.config.js` 的 `url` 是 canonical、hreflang 和分享图的根地址。换域名或部署到子目录时，先改这里，再同步 `dist/index.html`、`robots.txt`、`sitemap.xml` 里写死的 `https://docia.org`。
- **页面 head**：`dist/index.html` 是爬虫看到的默认版本，含 title、description、canonical、hreflang、Open Graph/Twitter 和 JSON-LD。页面运行后 `dist/app.js` 的 `syncSeo()` 会按当前语言更新 hreflang 和分享信息，并按地址里是否带 `?lang=zh` 更新 canonical；子页标题仍是「栏目 · DOCIA Lab · 上海科技大学」，canonical 仍指向语言入口，避免把 `#` 片段当成不同页面。地址里明确带 `?lang=zh` 时，canonical 才指向 `?lang=zh`；仅由浏览器语言自动检测出的中文仍用根地址，避免同一内容出现两个 canonical。
- **无 JS 回退**：`<noscript>` 里的 `.seo-fallback` 给禁用脚本的访客和简单爬虫提供实验室简介、研究方向、成员、论文、新闻和联系方式。正常浏览器不会显示它。
- **robots / sitemap**：`robots.txt` 允许全站抓取并指向 `sitemap.xml`；后者列出英文、中文两个入口及 hreflang。上线后到 Google Search Console 添加 `https://docia.org` 资源并提交 `https://docia.org/sitemap.xml`；Bing 用对应 Webmaster Tools 同样提交。
- **分享图**：`assets/og-docia.jpg` 是 1200×630 的分享卡片，`assets/logo-512.png` 用于结构化数据和 manifest。换品牌色或标语时同步更新图片；社交平台有缓存，改完用各平台的分享调试工具重新抓取。
- **改内容时**：新增新闻、成员、论文会进入页面和站内搜索，但不会自动改变 meta description。首页描述来自 `hero.description`，栏目描述来自 `pages[].desc`；要让搜索引擎看到新内容，除了保持文案更新，还要手动更新 `sitemap.xml` 的 `lastmod` 并重新提交。
- **不要做**：不要堆砌关键词，不要给同一页面写多个 canonical，也不要把 `?lang=zh` 当成独立的语言站群；中英文互指 hreflang 即可。

站内搜索帮助已经进入网站的访客找条目，SEO 帮助搜索引擎找到并理解首页。两者都读取 `site.config.js`，所以日常加内容仍然只需要改这一处。

### 15. 维护时常见的坑

| 现象 | 原因与处理 |
| --- | --- |
| 照片不显示，退回首字母 | `photo` 拼写、扩展名或大小写与文件不一致；确认文件在该 `media` 目录下 |
| 改完刷新没变化 | 浏览器缓存了 ES 模块，用强制刷新（macOS `Cmd+Shift+R`，Windows `Ctrl+F5`） |
| 整个页面空白 | 配置里少了逗号、引号或括号，看控制台第一条报错 |
| 新加的导航项点进去是首页 | 该 `id` 没在 `app.js` 的 `render()` 页面映射里注册，补上页面标题和渲染函数 |
| 合影页是「Photos coming soon」 | `gallery` 数组为空，属正常占位 |
| 首页没有合影区块 | `gallery` 为空时故意不渲染 |
| 图片在本地正常、上线 404 | 文件名大小写与服务器不一致，或用了 `/` 开头的绝对路径而站点在子目录 |
| 切到中文后某条内容还是英文 | 该字段只写了英文字符串；按第 7 节改成 `{ en, zh }` |
| 语言按钮点了没反应 | 浏览器控制台看 `i18n.js` 是否 404（部署时漏传了该文件），或 `dist/app.js` 引用的键被删了 |
| 新闻条目「日期」与「内容」串行 | 每条新闻是独立对象，检查花括号与逗号是否闭合 |

## 提交代码与发布

本站没有构建步骤，`dist/` 就是线上文件；但 **GitHub 提交不会自动更新 Nginx 上的站点**，两者要分开做。

### 提交前

1. 用「本地运行」的地址完整点一遍：首页、People、Alumni、Contact、搜索、移动端菜单。
2. 改过页面结构或样式时，按第 12 节自检；改过 SEO 文件时，确认 `/robots.txt`、`/sitemap.xml`、`/site.webmanifest` 都返回 200。
3. 只提交站点需要的文件，不要把私钥、缓存或临时测试页带进仓库；`tools/deploy-server.sh` 是通用的服务器部署脚本，不包含本机服务器信息。

### 提交到 GitHub

```sh
git status
git diff --check
git add README.md dist tools/deploy-server.sh
git commit -m "Update site content and deployment"
git push origin main
```

提交信息建议一句话说明「改了什么、为什么」，例如上面的提交同时包含站内搜索、SEO 和页眉/排版改版。只改文案时，提交信息可以写成 `Update news and member text`。

### 发布到服务器

`git push` 之后，按下一节的「一键部署」或「发布更新与回退」把 `dist/` 同步到线上目录。只提交到 GitHub、不同步 `dist/`，访客看到的仍是旧页面。

## 部署到服务器（Ubuntu / Debian + Nginx）

下面先给出一键部署脚本，再给出适合已有 Nginx、独立部署用户或需要精细控制的手动步骤。示例域名使用 `lab.example.org`，实际使用时替换即可。

### 0. 一键部署（Ubuntu / Debian，推荐）

适合一台 Ubuntu / Debian 服务器，域名可选。脚本会自动安装依赖并把仓库里的 `dist/` 发布到 Nginx：

1. 安装 `nginx` 和 `rsync`（已安装则跳过 apt）。
2. 把 `dist/` 同步到 `/var/www/docia`。
3. 生成 `/etc/nginx/sites-available/docia`，启用站点并检查配置。
4. 停用 Nginx 默认站点（可用 `DISABLE_DEFAULT_SITE=0` 关闭），最后重载服务。

在**服务器**上克隆仓库后执行：

```sh
git clone https://github.com/C1audine/docia-lab-homepage.git
cd docia-lab-homepage
sudo ./tools/deploy-server.sh
```

默认通过 `http://服务器IP/` 访问。域名 A 记录已经指向服务器时，传入域名：

```sh
sudo DOMAIN=lab.example.org ./tools/deploy-server.sh
```

之后要更新线上内容，拉取新提交再执行一次脚本即可；`rsync --delete` 会移除旧版本残留文件：

```sh
git pull --ff-only
sudo ./tools/deploy-server.sh
```

可用环境变量：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WEBROOT` | `/var/www/docia` | 网站根目录；也可以写相对仓库的路径，脚本会解析成绝对路径 |
| `DOMAIN` | `_` | 域名。共享服务器上请填写自己的域名，避免默认站点冲突 |
| `SITE_NAME` | `docia` | Nginx 配置文件名，生成 `/etc/nginx/sites-available/docia` |
| `INSTALL_DEPS` | `1` | `0` 表示不执行 apt；缺 nginx/rsync 时直接退出 |
| `DISABLE_DEFAULT_SITE` | `1` | `1` 表示停用 Nginx 默认站点，`0` 表示保留 |
| `FORCE` | `0` | 目标目录非空且不是脚本创建过时，必须显式设为 `1` 才会覆盖 |

脚本只支持 Ubuntu / Debian，并且需要 root 或 sudo。默认会启用 `default_server`；如果服务器上已有其他网站，请设置 `DOMAIN` 或在执行前备份 `/etc/nginx`。HTTPS 仍按下面的 Certbot 步骤配置。

### 1. 准备域名和服务（手动方式）

将域名的 A 记录指向服务器公网 IPv4。使用 IPv6 时也应设置对应的 AAAA 记录。让服务器的入站规则允许 HTTP 80 和 HTTPS 443。在**服务器**执行：

```sh
sudo apt update
sudo apt install nginx rsync
sudo install -d -m 0755 -o deploy /var/www/docia
```

在**开发电脑**的仓库根目录执行以下命令。电脑需有 `rsync` 及 SSH 客户端，并能以部署用户登录服务器。命令中 `dist/` 末尾的斜杠表示复制目录内容，发布后应存在 `/var/www/docia/index.html`。

```sh
rsync -rtvz --chmod=D755,F644 dist/ deploy@lab.example.org:/var/www/docia/
```

### 2. 配置 Nginx

在**服务器**新建 `/etc/nginx/sites-available/docia`，写入以下内容。使用独立的 server block 可以与同一台机器上的其他网站共存。

```nginx
server {
    listen 80;
    server_name lab.example.org;

    root /var/www/docia;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

若域名有 AAAA 记录，且服务器提供 IPv6 服务，可在同一块中加入 `listen [::]:80;`。首次启用站点时执行以下命令：

```sh
sudo ln -s /etc/nginx/sites-available/docia /etc/nginx/sites-enabled/docia
sudo nginx -t && sudo systemctl reload nginx
curl -I -H 'Host: lab.example.org' http://127.0.0.1/
curl -I -H 'Host: lab.example.org' http://127.0.0.1/app.js
```

预期两次请求均返回 200，第二次响应的 `Content-Type` 是 JavaScript 类型。随后在另一台设备上打开 `http://lab.example.org/#/research`。脚本和图像的缺失文件应正常返回 404，以便定位部署错误。[Nginx 静态站点官方文档](https://nginx.org/en/docs/beginners_guide.html#static)

### 3. 启用 HTTPS

域名已解析且公网 HTTP 可访问后，在服务器按系统版本安装 Certbot 和 Nginx 插件。使用 Ubuntu / Debian 软件仓库时可执行以下命令；已经安装 Certbot 的服务器应沿用原有安装方式。

```sh
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d lab.example.org
sudo certbot renew --dry-run
```

打开 `https://lab.example.org/#/simulation`，切换一次拓扑并启动实验，即可同时检查 HTTPS、脚本加载和静态资源访问。[Certbot 的 Nginx 安装指南](https://certbot.eff.org/instructions?ws=nginx&os=snap)

### 4. 发布更新与回退

组员合并修改后，在**开发电脑**的干净 `main` 工作区执行以下命令。Nginx 会直接读取更新后的文件，日常内容更新只需同步文件；改过 Nginx 配置时才需要检查并重载服务。

```sh
git switch main
git pull --ff-only
rsync -rtvz --chmod=D755,F644 dist/ deploy@lab.example.org:/var/www/docia/
```

需要让线上目录与新版本完全一致时，可对站点专用目录先执行 `rsync -rtvzn --delete dist/ deploy@lab.example.org:/var/www/docia/` 查看拟删除项，再按需同步。回退时，从一个临时 Git 工作区发布已知可用的版本：

```sh
read -r -p '输入已验证的 Git 提交号: ' release_commit
git worktree add --detach ../docia-rollback "$release_commit"
rsync -rtvz --chmod=D755,F644 ../docia-rollback/dist/ deploy@lab.example.org:/var/www/docia/
git worktree remove ../docia-rollback
```

### 其他托管方式

- **已有学院服务器**：将 `dist/` 内容上传到管理员提供的静态目录。若挂在 `https://example.edu/docia/`，以 `/docia/#/people` 等形式分享页面，并保留目录地址末尾的 `/`。脚本和图像均使用相对路径。
- **GitHub Pages**：适用于账号套餐支持的仓库。可用 Actions 上传 `dist/` 作为 Pages artifact，或把 `dist/` 的内容放到专门发布分支的根目录，在 **Settings → Pages** 中选择该分支和 `/(root)`。分支发布可选根目录或 `/docs`。私有仓库发布的 Pages 网站也可能向所有人开放，启用时请单独核对站点访问范围。[GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 部署与运行常见问题

| 现象 | 优先检查 |
| --- | --- |
| 浏览器显示 Nginx 欢迎页 | 使用实际域名访问。检查 `server_name`、启用的站点链接以及 DNS |
| 首页返回 403 或目录列表 | 检查 Nginx 的 `root` 下是否直接存在 `index.html`，以及 Nginx 是否能遍历目录并读取文件 |
| 导航存在但正文空白 | 在浏览器开发者工具检查 `app.js`、`site.config.js` 的状态码和 MIME，以及配置数组中是否缺少逗号或引号 |
| 首页正常，分享的成员页打不开 | 从地址栏复制含 `/#/people` 的完整地址；服务器直接请求的是站点根目录 |
| 曲面能看到但轨迹错位 | 从同一提交上传 `landscape.webp` 和 `descent.js`，刷新浏览器缓存 |
| 私有仓库无法克隆 | 确认已接受仓库协作邀请，SSH 密钥或 HTTPS 凭据属于获邀的 GitHub 账号 |

本项目的内容与布局分离方式参考了 [AcadHomepage](https://github.com/RayeRen/acad-homepage.github.io) 和 [Academic Pages](https://github.com/academicpages/academicpages.github.io)。页面与交互实验使用本仓库的静态模块实现。
