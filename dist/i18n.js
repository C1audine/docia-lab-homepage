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
    eyebrow: {
      researchDirections: "Research directions",
      researchOutput: "Research output",
      labMoments: "Lab moments",
      groupDirectory: "Group directory",
      graduateDestinations: "Graduate destinations",
      researchDirection: "Research direction",
      interactive: "Interactive experiment",
      news: "Lab news",
      honors: "Honors and awards"
    },
    heading: {
      whatWeStudy: "What we study",
      selectedPublications: "Selected publications",
      lifeAtDocia: "Life at DOCIA",
      labMembers: "Lab members",
      afterDocia: "After DOCIA",
      formerMembers: "Former members",
      writeToLab: "Write to the lab",
      findUs: "Find us on campus",
      localUpdates: "Local updates in action",
      relatedPublication: "Related publication",
      latestNews: "Latest news",
      awards: "Awards and honors",
      allNews: "All news"
    },
    link: {
      exploreResearch: "Explore research",
      trySimulation: "Try the simulation",
      exploreAll: "Explore all research",
      allPublications: "All publications",
      viewAllMoments: "View all moments",
      allDirections: "All research directions",
      viewPaper: "View paper",
      openPlayground: "Open playground",
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
      localUpdates: "See how communication links change the speed of load balancing.",
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
      title: "Network playground",
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
    terrain: {
      figureAria: "Gradient descent on a two-dimensional objective. Scroll to follow the point downhill.",
      surfaceAria: "A green contour surface with two peaks and a descent path into a shared valley",
      objective: "Objective landscape",
      descentPath: "Descent path",
      optimum: "Optimum",
      scroll: "Scroll to descend",
      atOptimum: "At the optimum"
    },
    footer: {
      tagline: "Homepage demo",
      people: "People",
      alumni: "Alumni",
      moments: "Moments",
      contact: "Contact"
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
    eyebrow: {
      researchDirections: "研究方向",
      researchOutput: "研究成果",
      labMoments: "实验室瞬间",
      groupDirectory: "成员名录",
      graduateDestinations: "毕业去向",
      researchDirection: "研究方向",
      interactive: "交互实验",
      news: "课题组新闻",
      honors: "荣誉与获奖"
    },
    heading: {
      whatWeStudy: "我们在研究什么",
      selectedPublications: "代表性论文",
      lifeAtDocia: "实验室生活",
      labMembers: "研究团队",
      afterDocia: "毕业之后",
      formerMembers: "往届成员",
      writeToLab: "邮件联系",
      findUs: "到访地址",
      localUpdates: "局部更新如何起作用",
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
      openPlayground: "打开实验",
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
      localUpdates: "观察通信链路如何改变负载均衡的速度。",
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
      title: "网络实验场",
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
    terrain: {
      figureAria: "二维目标函数上的梯度下降。向下滚动页面，观察点沿坡面下降。",
      surfaceAria: "绿色的等高面、两座山峰，以及一条通向公共谷底的下降路径",
      objective: "目标函数曲面",
      descentPath: "下降路径",
      optimum: "最优点",
      scroll: "向下滚动",
      atOptimum: "已到达最优点"
    },
    footer: {
      tagline: "课题组主页",
      people: "成员",
      alumni: "校友",
      moments: "合影",
      contact: "联系"
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
