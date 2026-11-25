// AUTO-GENERATED — DO NOT EDIT.
// 此文件由 npm run build:content 根据 content/ 与 config/presentation.yaml 生成。
// 请修改 content/ 下的内容文件，然后重新构建；直接编辑本文件会在下次构建时被覆盖。
export const site = {
  "brand": "DOCIA Lab",
  "name": {
    "en": "Lab of Decision, Optimization, and Control for Intelligent Agents",
    "zh": "决策、优化与控制实验室"
  },
  "university": {
    "en": "ShanghaiTech University",
    "zh": "上海科技大学"
  },
  "url": "https://docia.org",
  "palette": {
    "paper": "#EEF7F2",
    "mint": "#B9DEC9",
    "green": "#1BA784",
    "sky": "#63BBD0",
    "ink": "#134857"
  },
  "navigation": [
    {
      "id": "home",
      "label": {
        "en": "Home",
        "zh": "首页"
      }
    },
    {
      "id": "research",
      "label": {
        "en": "Research",
        "zh": "研究方向"
      }
    },
    {
      "id": "publications",
      "label": {
        "en": "Publications",
        "zh": "论文"
      }
    },
    {
      "id": "people",
      "label": {
        "en": "People",
        "zh": "成员"
      }
    },
    {
      "id": "alumni",
      "label": {
        "en": "Alumni",
        "zh": "校友"
      }
    },
    {
      "id": "gallery",
      "label": {
        "en": "Moments",
        "zh": "合影"
      }
    },
    {
      "id": "news",
      "label": {
        "en": "News",
        "zh": "新闻"
      }
    },
    {
      "id": "honors",
      "label": {
        "en": "Honors",
        "zh": "荣誉"
      }
    },
    {
      "id": "contact",
      "label": {
        "en": "Contact",
        "zh": "联系"
      }
    }
  ],
  "pages": {
    "research": {
      "title": {
        "en": "Research",
        "zh": "研究方向"
      },
      "desc": {
        "en": "How can a network solve a problem when each agent sees only a part of it?",
        "zh": "当每个智能体只看到问题的一部分时，网络如何求解？"
      }
    },
    "publications": {
      "title": {
        "en": "Selected publications",
        "zh": "代表性论文"
      },
      "desc": {
        "en": "Journal articles on distributed optimization, constraints, and consensus.",
        "zh": "关于分布式优化、约束与一致性的期刊论文。"
      }
    },
    "people": {
      "title": {
        "en": "Our Team",
        "zh": "研究团队"
      },
      "desc": {
        "en": "The researchers behind DOCIA’s work in optimization and control.",
        "zh": "从事优化与控制研究的课题组成员。"
      }
    },
    "alumni": {
      "title": {
        "en": "Alumni destinations",
        "zh": "校友去向"
      },
      "desc": {
        "en": "Selected first appointments after graduation from the lab.",
        "zh": "毕业生离校后的首份去向（节选）。"
      }
    },
    "gallery": {
      "title": {
        "en": "Lab moments",
        "zh": "实验室瞬间"
      },
      "desc": {
        "en": "Gatherings, retreats, and everyday life in the lab.",
        "zh": "课题组活动、集体出游与日常生活。"
      }
    },
    "news": {
      "title": {
        "en": "News",
        "zh": "课题组新闻"
      },
      "desc": {
        "en": "Graduations, accepted papers, and other lab updates.",
        "zh": "毕业、论文录用以及课题组的其他消息。"
      }
    },
    "honors": {
      "title": {
        "en": "Honors and awards",
        "zh": "荣誉与获奖"
      },
      "desc": {
        "en": "Awards and recognitions received by the lab.",
        "zh": "课题组获得的奖项与荣誉。"
      }
    },
    "contact": {
      "title": {
        "en": "Contact",
        "zh": "联系我们"
      },
      "desc": {
        "en": "Contact the lab about research, collaboration, and graduate study.",
        "zh": "欢迎就科研合作、招生等事宜联系实验室。"
      }
    }
  },
  "media": {
    "people": "./assets/people/",
    "alumni": "./assets/people/",
    "gallery": "./assets/gallery/"
  },
  "hero": {
    "lines": {
      "en": [
        "Decision, Optimization",
        "& Control for",
        "Intelligent Agents"
      ],
      "zh": [
        "决策、优化与控制",
        "面向智能体系统"
      ]
    },
    "description": {
      "en": "We study how connected agents make decisions together, designing optimization and control algorithms for large-scale networked systems.",
      "zh": "研究互联的智能体如何共同决策，并为大规模网络化系统设计优化与控制算法。"
    }
  },
  "research": [
    {
      "id": "distributed-optimization",
      "icon": "network",
      "title": {
        "en": "Distributed optimization",
        "zh": "分布式优化"
      },
      "short": {
        "en": "Solving a shared problem through local computation and neighbor-to-neighbor communication.",
        "zh": "通过局部计算与邻居之间的通信求解一个共同的问题。"
      },
      "question": {
        "en": "How much can each agent accomplish with a local objective and messages from its neighbors?",
        "zh": "只有局部目标和邻居传来的消息时，每个智能体能完成多少？"
      },
      "detail": {
        "en": "In a distributed problem, each agent holds part of the data or objective. Our work studies algorithms that coordinate these local updates, including methods for nonsmooth objectives, coupling constraints, and changing communication networks.",
        "zh": "在分布式问题中，每个智能体只掌握一部分数据或目标。我们研究协调这些局部更新的算法，涵盖非光滑目标、耦合约束以及动态变化的通信网络。"
      },
      "paper": "constraints"
    },
    {
      "id": "multi-agent-control",
      "icon": "agents",
      "title": {
        "en": "Multi-agent coordination",
        "zh": "多智能体协同"
      },
      "short": {
        "en": "Understanding how local decisions shape the collective behavior of a network.",
        "zh": "理解局部决策如何塑造整个网络的集体行为。"
      },
      "question": {
        "en": "When do local interactions lead a network to agree?",
        "zh": "局部的相互作用在什么条件下能让整个网络达成一致？"
      },
      "detail": {
        "en": "Consensus algorithms connect the behavior of an entire network to its communication graph. The playground makes this connection tangible: a node transfers load only to its neighbors, yet repeated exchanges can balance all eight nodes.",
        "zh": "一致性算法把整个网络的行为与它的通信图联系起来。首页的实验让这一联系变得直观：节点只与邻居交换负载，但重复交换就能让八个节点全部均衡。"
      },
      "paper": "proximal"
    },
    {
      "id": "optimization-algorithms",
      "icon": "contour",
      "title": {
        "en": "Optimization algorithms",
        "zh": "优化算法"
      },
      "short": {
        "en": "Designing scalable methods and analyzing the conditions under which they converge.",
        "zh": "设计可扩展的方法，并分析它们的收敛条件。"
      },
      "question": {
        "en": "Which information should an algorithm use at each iteration?",
        "zh": "算法在每次迭代中应该使用哪一类信息？"
      },
      "detail": {
        "en": "First-order, second-order, and proximal methods use different kinds of local information. We study how these choices affect the cost of an update and the rate at which distributed iterates approach a solution.",
        "zh": "一阶、二阶与邻近类方法使用不同类型的局部信息。我们研究这些选择如何影响单次更新的开销，以及分布式迭代接近解的速率。"
      },
      "paper": "stochastic"
    }
  ],
  "publications": [
    {
      "id": "stochastic",
      "year": 2023,
      "title": "A Stochastic Second-Order Proximal Method for Distributed Optimization",
      "authors": "C. Qiu, S. Zhu, Z. Ou, and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://ieeexplore.ieee.org/document/10044149",
      "selected": true
    },
    {
      "id": "constraints",
      "year": 2023,
      "title": "Distributed Optimization with Coupling Constraints",
      "authors": "X. Wu, H. Wang, and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://ieeexplore.ieee.org/document/9762539",
      "selected": true
    },
    {
      "id": "proximal",
      "year": 2021,
      "title": "A Second-Order Proximal Algorithm for Consensus Optimization",
      "authors": "X. Wu, Z. Qu, and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://ieeexplore.ieee.org/document/9097872",
      "selected": false
    }
  ],
  "people": [
    {
      "name": {
        "en": "Jie Lu"
      },
      "group": "pi",
      "role": {
        "en": "Lab Director · Associate Professor",
        "zh": "实验室主任 · 副教授"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "description": {
        "en": "Research interests include distributed optimization, multi-agent decision making, and networked dynamical systems.",
        "zh": "研究兴趣包括分布式优化、多智能体决策与网络化动力系统。"
      },
      "url": "https://sist.shanghaitech.edu.cn/lujie_en/main.htm",
      "urlLabel": {
        "en": "University profile",
        "zh": "教师主页"
      },
      "email": "lujie@shanghaitech.edu.cn",
      "photo": ""
    }
  ],
  "alumni": [
    {
      "name": {
        "en": "Xuyang Wu",
        "zh": "吴旭阳"
      },
      "degree": {
        "en": "PhD",
        "zh": "博士"
      },
      "year": 2020,
      "position": {
        "en": "Postdoctoral researcher",
        "zh": "博士后研究员"
      },
      "destination": {
        "en": "KTH Royal Institute of Technology",
        "zh": "瑞典皇家理工学院（KTH）"
      },
      "location": {
        "en": "Stockholm, Sweden",
        "zh": "瑞典 · 斯德哥尔摩"
      },
      "source": "https://faculty.sist.shanghaitech.edu.cn/office/Share/Entropy-SIST%20Yearbook%2C2020.pdf",
      "url": "",
      "email": "",
      "photo": ""
    }
  ],
  "gallery": [],
  "news": [
    {
      "date": {
        "en": "2023",
        "zh": "2023 年"
      },
      "text": {
        "en": "“A Stochastic Second-Order Proximal Method for Distributed Optimization” is published in IEEE Control Systems Letters.",
        "zh": "论文《A Stochastic Second-Order Proximal Method for Distributed Optimization》发表于 IEEE Control Systems Letters。"
      },
      "url": "https://ieeexplore.ieee.org/document/10044149"
    },
    {
      "date": {
        "en": "2023",
        "zh": "2023 年"
      },
      "text": {
        "en": "“Distributed Optimization with Coupling Constraints” is published in IEEE Transactions on Automatic Control.",
        "zh": "论文《Distributed Optimization with Coupling Constraints》发表于 IEEE Transactions on Automatic Control。"
      },
      "url": "https://ieeexplore.ieee.org/document/9762539"
    },
    {
      "date": {
        "en": "2021",
        "zh": "2021 年"
      },
      "text": {
        "en": "“A Second-Order Proximal Algorithm for Consensus Optimization” is published in IEEE Transactions on Automatic Control.",
        "zh": "论文《A Second-Order Proximal Algorithm for Consensus Optimization》发表于 IEEE Transactions on Automatic Control。"
      },
      "url": "https://ieeexplore.ieee.org/document/9097872"
    },
    {
      "date": {
        "en": "2020",
        "zh": "2020 年"
      },
      "text": {
        "en": "Xuyang Wu completes his PhD and joins KTH Royal Institute of Technology as a postdoctoral researcher.",
        "zh": "吴旭阳通过博士论文答辩，加入瑞典皇家理工学院（KTH）从事博士后研究。"
      }
    }
  ],
  "honors": [],
  "contact": {
    "name": "Jie Lu",
    "email": "lujie@shanghaitech.edu.cn",
    "school": {
      "en": "School of Information Science and Technology",
      "zh": "信息科学与技术学院"
    },
    "office": {
      "en": "Room 1D-201B, SIST Building",
      "zh": "信息学院 1D-201B 室"
    },
    "street": {
      "en": "393 Huaxia Middle Road",
      "zh": "华夏中路 393 号"
    },
    "city": {
      "en": "Shanghai 201210, China",
      "zh": "中国 上海 201210"
    },
    "profile": "https://faculty.sist.shanghaitech.edu.cn/faculty/lujie/",
    "center": "https://star-center.shanghaitech.edu.cn/professors.html"
  },
  "experiment": {
    "topology": "Mesh",
    "initialLoads": [
      78,
      45,
      108,
      30,
      75,
      44,
      23,
      58
    ],
    "capacity": 100,
    "tolerance": 0.1,
    "previewRound": 4
  },
  "home": {
    "research": {
      "enabled": true
    },
    "selected_publications": {
      "enabled": true,
      "count": 2
    },
    "interactive_experiment": {
      "enabled": true
    },
    "moments": {
      "enabled": true,
      "count": 3
    }
  }
};
