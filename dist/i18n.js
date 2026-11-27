// Interface copy for both languages. Text that belongs to the lab's content
// (members, papers, news entries, page titles) lives in site.config.js instead.
//
// To add a language: add its code to LANGS, add a block under `ui` and fill the
// same keys, then translate the values in site.config.js.

export const LANGS = ["en", "zh"];

export const LABEL = { en: "EN", zh: "中" };

export const LANG_ATTR = { en: "en", zh: "zh-CN" };

const ui = {
  en: {
    skip: "Skip to content",
    menu: "Menu",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    navLabel: "Main navigation",
    language: "Language",
    english: "English",
    chinese: "中文",
    heading: {
      whatWeStudy: "What we study",
      selectedPublications: "Selected publications",
      lifeAtDocia: "Life at DOCIA",
      afterDocia: "After DOCIA",
      principalInvestigators: "PI",
      students: "Students",
      alumni: "Alumni",
      writeToLab: "Write to the lab",
      findUs: "Find us on campus",
      relatedPublication: "Related publication",
      latestNews: "Latest news",
      awards: "Awards and honors",
      allNews: "All news"
    },
    link: {
      exploreResearch: "Explore research",
      trySimulation: "Try the experiment",
      exploreAll: "Explore all research",
      allPublications: "All publications",
      viewAllMoments: "View all moments",
      allDirections: "All research directions",
      viewPaper: "View paper",
      alumniDestinations: "Alumni destinations",
      facultyPublications: "Faculty publication list",
      facultyHomepage: "Faculty homepage",
      starCenter: "STAR Center directory",
      yearbook: "SIST graduate yearbook",
      allNews: "All news",
      homepage: "Homepage"
    },
    text: {
      formerMembers: "Explore where DOCIA graduates went after the lab.",
      selectedPapers: "Selected journal articles",
      newsIntro: "Graduations, accepted papers, and other lab updates.",
      honorsIntro: "Awards, prizes, and recognitions received by the lab.",
      contactIntro: "Write to the lab about research, collaboration, and graduate study."
    },
    empty: {
      photosTitle: "Photos coming soon",
      photosText: "Group photos from lab gatherings will appear here once they are published.",
      newsTitle: "No news yet",
      newsText: "Graduations, accepted papers, and other lab updates will appear here.",
      honorsTitle: "No awards yet",
      honorsText: "Prizes and recognitions received by the lab will be listed here.",
      missingPhoto: "Photo coming soon"
    },
    filters: {
      label: "Filter publications",
      year: "Year",
      person: "Author",
      research: "Research area",
      type: "Type",
      allYears: "All years",
      allPeople: "All authors",
      allResearch: "All research areas",
      allTypes: "All types",
      members: "Lab members",
      coauthors: "Co-authors",
      reset: "Reset filters",
      showing: "Showing {shown} of {total}",
      emptyTitle: "No publications match",
      emptyText: "Try another year, author, research area, or type.",
      types: {
        article: "Journal article",
        inproceedings: "Conference paper"
      }
    },
    labels: {
      graduation: "Graduation",
      degreeSuffix: "graduate",
      degreeLine: "{degree} graduate",
      photoCredit: "Photo: ",
      labMoment: "Lab moment",
      labDirector: "Lab Director",
      portraitAlt: "{name} portrait"
    },
    experiment: {
      title: "Load balancing on a network",
      intro: "Change the topology and see how eight edge servers balance their workloads.",
      run: "Run simulation",
      pause: "Pause",
      replay: "Replay",
      restart: "Restart from round zero",
      networkTitle: "Communication network",
      topologyLabel: "Network topology",
      edgeServer: "Edge server",
      link: "Communication link",
      initialLoad: "Initial load",
      selectedServer: "Selected server",
      loadLabel: "Selected server initial load",
      convergence: "Convergence",
      round: "Round {n}",
      chartTitle: "RMS load imbalance",
      chartUnit: "(load units)",
      chartAria: "Load imbalance by communication round",
      efficiency: "Efficiency",
      withinCapacity: "Within capacity",
      roundsToBalance: "Rounds to balance",
      rounds: "rounds",
      networkAria: "Eight servers. Select one to adjust its starting load.",
      reference: "reference",
      communicationRound: "Communication round",
      howTitle: "How does the experiment work?",
      howP1: "Each server starts with a divisible workload and a capacity of {capacity} units. At each round, neighboring servers transfer a fraction of their load difference. Equal and opposite transfers preserve the total work. Editing a starting load begins a new run.",
      howP2: "For an edge joining servers {i} and {j}, the transfer from {i} to {j} is 0.85 (xᵢ − xⱼ) / (1 + max(dᵢ, dⱼ)), where {d} is the number of neighbors. The graph compares the selected topology with a reference topology using the same starting loads.",
      howP3: "RMS imbalance is the root mean square distance from the average load. “Rounds to balance” gives the first round below {tolerance} load units. Efficiency is the mean load divided by the maximum load, assuming identical servers. “Within capacity” counts servers at or below {capacity} units."
    },
    researchDemo: {
      kicker: "Interactive demo",
      jump: "Jump to the experiment",
      cardJump: "Try the experiment",
      distributed: {
        title: "Distributed gradient descent",
        intro: "Eight agents hold local quadratic objectives. They take local gradient steps and exchange values with their neighbors; watch them approach a shared optimum.",
        topology: "Network topology",
        stepSize: "Step size",
        run: "Run simulation",
        pause: "Pause",
        replay: "Replay",
        reset: "Reset the simulation",
        chartTitle: "Agent estimates",
        chartUnit: "(local value)",
        chartAria: "Line chart of eight agent estimates across communication rounds, converging toward the central optimum.",
        round: "Round {n}",
        mean: "Mean estimate",
        optimum: "Central optimum",
        optimalityGap: "Optimality gap",
        disagreement: "Disagreement",
        reference: "Central optimum",
        howTitle: "What is happening?",
        howP1: "Each agent minimizes a local quadratic 0.5·aᵢ(x − bᵢ)² while a consensus penalty pulls it toward its neighbors. The update is xᵢ ← xᵢ − α(aᵢ(xᵢ − bᵢ) + β Σⱼ(xᵢ − xⱼ)). Because the consensus term is not corrected, the estimates settle near, but not exactly at, the central optimum.",
        howP2: "The central optimum is the weighted average of the local targets, x* = Σaᵢbᵢ / Σaᵢ. The step size and the network topology change how quickly the agents agree; β is fixed at 0.5."
      },
      optimizer: {
        title: "Descending a loss surface",
        intro: "Follow gradient-based methods down an ill-conditioned quadratic. Compare plain gradient descent with momentum and Nesterov acceleration at the same step size.",
        algorithm: "Algorithm",
        gradient: "Gradient descent",
        momentum: "Momentum",
        nesterov: "Nesterov acceleration",
        stepSize: "Step size",
        run: "Run",
        pause: "Pause",
        replay: "Replay",
        reset: "Reset the path",
        chartAria: "Contour plot of a quadratic loss with the descent path from the starting point toward the optimum.",
        round: "Iteration {n}",
        contours: "Loss contours",
        path: "Descent path",
        optimum: "Optimum",
        loss: "Loss",
        distance: "Distance to optimum",
        howTitle: "What is happening?",
        howP1: "The objective is f(x, y) = 0.5(x² + 12y²): a narrow valley whose curvature differs by a factor of twelve. Gradient descent zig-zags at large steps; momentum and Nesterov acceleration reuse previous updates to move along the valley faster.",
        howP2: "The step size applies to all three methods; momentum uses μ = 0.6. The path starts at (−2.6, 1.7) and the optimum is (0, 0)."
      }
    },
    publicationStats: {
      title: "Publications by year",
      caption: "Peer-reviewed papers, {first}–{last}.",
      total: "{count} publications",
      journal: "Journal articles",
      conference: "Conference papers",
      average: "{value} per year",
      aria: "Stacked bar chart of publications per year, split into journal articles and conference papers.",
      tableCaption: "Publications by year",
      year: "Year",
      journalShort: "Journal",
      conferenceShort: "Conference",
      totalShort: "Total",
      barAria: "{year}: {total} publications, {journal} journal articles and {conference} conference papers."
    },
    terrain: {
      figureAria: "Gradient descent on a two-dimensional objective.",
      surfaceAria: "A green contour surface with two peaks and a descent path into a shared valley",
      descentPath: "Descent path",
      optimum: "Optimum",
    },
    footer: {
      people: "People",
      alumni: "Alumni",
      moments: "Moments",
      contact: "Contact"
    },
    search: {
      button: "Search",
      dialog: "Search the lab site",
      inputLabel: "Search news, people, publications, research, moments, and honors",
      placeholder: "Search news, people, papers, research…",
      browse: "Browse pages",
      resultCount: "{count} results",
      resultCountOne: "1 result",
      noResults: "No results for “{query}”",
      noResultsHint: "Try a name, a paper title, a year, or a research topic.",
      close: "Close search",
      keyNavigate: "navigate",
      keyOpen: "open",
      keyClose: "close",
      types: {
        page: "Page",
        people: "People",
        research: "Research",
        publications: "Publication",
        news: "News",
        alumni: "Alumni",
        gallery: "Moments",
        honors: "Honor"
      }
    }
  },

  zh: {
    skip: "跳到主要内容",
    menu: "菜单",
    openNav: "打开导航",
    closeNav: "关闭导航",
    navLabel: "主导航",
    language: "语言",
    english: "English",
    chinese: "中文",
    heading: {
      whatWeStudy: "我们在研究什么",
      selectedPublications: "代表性论文",
      lifeAtDocia: "实验室生活",
      afterDocia: "毕业之后",
      principalInvestigators: "PI",
      students: "学生",
      alumni: "校友",
      writeToLab: "邮件联系",
      findUs: "到访地址",
      relatedPublication: "相关论文",
      latestNews: "最新动态",
      awards: "奖项与荣誉",
      allNews: "全部动态"
    },
    link: {
      exploreResearch: "探索研究方向",
      trySimulation: "试试这个实验",
      exploreAll: "查看全部研究方向",
      allPublications: "全部论文",
      viewAllMoments: "查看全部合影",
      allDirections: "全部研究方向",
      viewPaper: "查看论文",
      alumniDestinations: "校友去向",
      facultyPublications: "教师论文列表",
      facultyHomepage: "教师主页",
      starCenter: "STAR 中心名录",
      yearbook: "SIST 毕业生年鉴",
      allNews: "全部动态",
      homepage: "个人主页"
    },
    text: {
      formerMembers: "看看课题组的毕业生都去了哪里。",
      selectedPapers: "代表性期刊论文",
      newsIntro: "毕业、论文录用以及课题组的其他消息。",
      honorsIntro: "课题组获得的奖项与荣誉。",
      contactIntro: "欢迎就科研合作、招生等事宜联系实验室。"
    },
    empty: {
      photosTitle: "照片即将上线",
      photosText: "课题组活动的合影会在这里陆续发布。",
      newsTitle: "暂无动态",
      newsText: "毕业、论文录用等消息会在这里更新。",
      honorsTitle: "暂无获奖信息",
      honorsText: "课题组获得的奖项与荣誉会在这里列出。",
      missingPhoto: "照片即将上线"
    },
    filters: {
      label: "筛选论文",
      year: "年份",
      person: "作者",
      research: "研究方向",
      type: "类型",
      allYears: "全部年份",
      allPeople: "全部作者",
      allResearch: "全部研究方向",
      allTypes: "全部类型",
      members: "课题组成员",
      coauthors: "合作者",
      reset: "清除筛选",
      showing: "显示 {shown} / {total} 篇",
      emptyTitle: "没有符合条件的论文",
      emptyText: "试试其他年份、作者、研究方向或类型。",
      types: {
        article: "期刊论文",
        inproceedings: "会议论文"
      }
    },
    labels: {
      graduation: "毕业年份",
      degreeSuffix: "毕业",
      degreeLine: "{degree}毕业",
      photoCredit: "摄影：",
      labMoment: "实验室瞬间",
      labDirector: "实验室主任",
      portraitAlt: "{name} 的照片"
    },
    experiment: {
      title: "网络上的负载均衡",
      intro: "切换网络拓扑，观察八台边缘服务器如何均衡负载。",
      run: "运行模拟",
      pause: "暂停",
      replay: "重播",
      restart: "从第 0 轮重新开始",
      networkTitle: "通信网络",
      topologyLabel: "网络拓扑",
      edgeServer: "边缘服务器",
      link: "通信链路",
      initialLoad: "初始负载",
      selectedServer: "选中的服务器",
      loadLabel: "选中服务器的初始负载",
      convergence: "收敛过程",
      round: "第 {n} 轮",
      chartTitle: "RMS 负载不均衡度",
      chartUnit: "（负载单位）",
      chartAria: "各轮通信下的负载不均衡度",
      efficiency: "效率",
      withinCapacity: "容量内服务器",
      roundsToBalance: "均衡所需轮数",
      rounds: "轮",
      networkAria: "八台服务器。选择其中一台可调整它的初始负载。",
      reference: "参考",
      communicationRound: "通信轮次",
      howTitle: "这个实验是怎么运作的？",
      howP1: "每台服务器一开始都有一个可分割的负载，容量为 {capacity} 个单位。每一轮中，相邻服务器交换一部分负载差值，等量反向的交换保持总负载不变。修改初始负载会重新开始一次运行。",
      howP2: "对于连接服务器 {i} 与 {j} 的边，从 {i} 到 {j} 的转移量为 0.85 (xᵢ − xⱼ) / (1 + max(dᵢ, dⱼ))，其中 {d} 表示邻居数量。图中用相同的初始负载，把当前拓扑与一个参考拓扑作对比。",
      howP3: "RMS 不均衡度是各服务器负载与平均负载之差的均方根。「均衡所需轮数」指不均衡度首次低于 {tolerance} 个负载单位的那一轮。假设各服务器容量相同，效率等于平均负载除以最大负载。「容量内服务器」统计不超过 {capacity} 个单位的服务器数量。"
    },
    researchDemo: {
      kicker: "交互实验",
      jump: "跳到交互实验",
      cardJump: "试试交互实验",
      distributed: {
        title: "分布式梯度下降",
        intro: "八个智能体各自持有局部二次目标。它们做局部梯度步，并与邻居交换数值；观察它们如何逼近共同的最优解。",
        topology: "网络拓扑",
        stepSize: "步长",
        run: "运行模拟",
        pause: "暂停",
        replay: "重播",
        reset: "重置模拟",
        chartTitle: "智能体估计值",
        chartUnit: "（局部数值）",
        chartAria: "八个智能体估计值随通信轮次变化的折线图，逐渐收敛到中心最优解。",
        round: "第 {n} 轮",
        mean: "平均估计",
        optimum: "中心最优解",
        optimalityGap: "最优性差距",
        disagreement: "不一致度",
        reference: "中心最优解",
        howTitle: "这里发生了什么？",
        howP1: "每个智能体用局部数据最小化 0.5·aᵢ(x − bᵢ)²，同时一致性惩罚把它拉向邻居。更新为 xᵢ ← xᵢ − α(aᵢ(xᵢ − bᵢ) + β Σⱼ(xᵢ − xⱼ))。由于一致性项没有被校正，估计值会停在中心最优解附近，而不是恰好落在最优点。",
        howP2: "中心最优解是局部目标的加权平均，x* = Σaᵢbᵢ / Σaᵢ。步长和网络拓扑影响智能体达成一致的快慢；β 固定为 0.5。"
      },
      optimizer: {
        title: "损失曲面上的下降",
        intro: "沿着一个病态二次函数的损失曲面下降，比较相同步长下普通梯度下降、动量法和 Nesterov 加速。",
        algorithm: "算法",
        gradient: "梯度下降",
        momentum: "动量法",
        nesterov: "Nesterov 加速",
        stepSize: "步长",
        run: "运行",
        pause: "暂停",
        replay: "重播",
        reset: "重置路径",
        chartAria: "二次损失函数的等高线图，以及从起点到最优点附近的下降路径。",
        round: "第 {n} 次迭代",
        contours: "损失等高线",
        path: "下降路径",
        optimum: "最优点",
        loss: "损失",
        distance: "到最优点的距离",
        howTitle: "这里发生了什么？",
        howP1: "目标函数为 f(x, y) = 0.5(x² + 12y²)：一个曲率相差十二倍的狭长山谷。步长较大时梯度下降会来回折返；动量法与 Nesterov 加速利用之前的更新，更快地沿山谷前进。",
        howP2: "三种方法使用同一个步长；动量系数 μ = 0.6。路径从 (−2.6, 1.7) 出发，最优点为 (0, 0)。"
      }
    },
    publicationStats: {
      title: "论文年度统计",
      caption: "经同行评审的论文，{first}–{last} 年。",
      total: "共 {count} 篇论文",
      journal: "期刊论文",
      conference: "会议论文",
      average: "平均每年 {value} 篇",
      aria: "按年份统计的论文堆叠柱状图，分为期刊论文与会议论文。",
      tableCaption: "按年份统计论文",
      year: "年份",
      journalShort: "期刊",
      conferenceShort: "会议",
      totalShort: "合计",
      barAria: "{year} 年：共 {total} 篇，其中期刊 {journal} 篇、会议 {conference} 篇。"
    },
    terrain: {
      figureAria: "二维目标函数上的梯度下降。",
      surfaceAria: "绿色的等高面、两座山峰，以及一条通向公共谷底的下降路径",
      descentPath: "下降路径",
      optimum: "最优点",
    },
    footer: {
      people: "成员",
      alumni: "校友",
      moments: "合影",
      contact: "联系"
    },
    search: {
      button: "搜索",
      dialog: "站内搜索",
      inputLabel: "搜索新闻、成员、论文、研究方向、合影与荣誉",
      placeholder: "搜索新闻、成员、论文、研究方向……",
      browse: "浏览页面",
      resultCount: "{count} 个结果",
      resultCountOne: "1 个结果",
      noResults: "没有找到“{query}”",
      noResultsHint: "可以试试姓名、论文题目、年份或研究关键词。",
      close: "关闭搜索",
      keyNavigate: "选择",
      keyOpen: "打开",
      keyClose: "关闭",
      types: {
        page: "页面",
        people: "成员",
        research: "研究方向",
        publications: "论文",
        news: "新闻",
        alumni: "校友",
        gallery: "合影",
        honors: "荣誉"
      }
    }
  }
};

let current = "en";

export const currentLang = () => current;

export function isLang(value) {
  return LANGS.includes(value);
}

// Sets the language and mirrors it onto <html lang> for :lang() styling.
export function useLang(value) {
  current = isLang(value) ? value : "en";
  document.documentElement.lang = LANG_ATTR[current];
  return current;
}

// Interface strings for the current language.
export const S = () => ui[current] || ui.en;

// Reads a {en, zh} pair (or a plain value) in the current language.
export function pick(value, lang = current) {
  if (value && typeof value === "object" && !Array.isArray(value) && ("en" in value || "zh" in value)) {
    return value[lang] ?? value.en ?? "";
  }
  return value ?? "";
}

// Replaces {name} placeholders in an interface string.
export function fill(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
}

// Language remembered in the URL query (?lang=zh), then in storage, then the
// browser preference, then English.
export function initialLang() {
  const fromQuery = new URLSearchParams(location.search).get("lang");
  if (isLang(fromQuery)) return fromQuery;
  let stored = null;
  try {
    stored = localStorage.getItem("docia-lang");
  } catch {
    stored = null;
  }
  if (isLang(stored)) return stored;
  return /^zh/i.test(navigator.language || "") ? "zh" : "en";
}

export function rememberLang(value) {
  try {
    localStorage.setItem("docia-lang", value);
  } catch {
    // Private mode and file:// pages may refuse storage; the query string still works.
  }
}
