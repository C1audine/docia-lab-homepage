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
      "id": "deng2026exact",
      "year": 2026,
      "title": "Exact Convergence Analysis for Primal Solutions of Dual First-Order Methods: A Numerical Approach",
      "authors": "Z. Deng and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://doi.org/10.1109/LCSYS.2026.3706922",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "zhicheng-deng",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Deng",
          "member": "zhicheng-deng"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "liu2026unified",
      "year": 2026,
      "title": "A Unified Dual-Consensus Approach to Distributed Optimization With Globally Coupled Constraints",
      "authors": "Z. Liu, X. Wu, D. Wang, and J. Lu",
      "venue": "IEEE Transactions on Control of Network Systems",
      "url": "https://doi.org/10.1109/TCNS.2025.3649114",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "zixuan-liu",
        "xuyang-wu",
        "dandan-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Liu",
          "member": "zixuan-liu"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "ou2026robust",
      "year": 2026,
      "title": "Robust Distributed Nonconvex Optimization Enabling Communication Acceleration and Privacy Protection",
      "authors": "Z. Ou and J. Lu",
      "venue": "2026 American Control Conference (ACC)",
      "url": "https://arxiv.org/abs/2602.22670",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "zichong-ou",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2026globally",
      "year": 2026,
      "title": "Globally Constrained Decentralized Optimization With Variable Coupling",
      "authors": "D. Wang, X. Wu, Z. Ou, and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://doi.org/10.1109/TAC.2025.3629001",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "dandan-wang",
        "xuyang-wu",
        "zichong-ou",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "deng2025delay",
      "year": 2025,
      "title": "A Delay-Free Adaptive Stepsize for the Incremental Aggregated Gradient Method",
      "authors": "Z. Deng, X. Wu, and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://doi.org/10.1109/LCSYS.2025.3650105",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "zhicheng-deng",
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Deng",
          "member": "zhicheng-deng"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "zhu2025deep",
      "year": 2025,
      "title": "A Deep Reinforcement Learning Approach to Efficient Distributed Optimization",
      "authors": "D. Zhu, T. Xu, and J. Lu",
      "venue": "IEEE Transactions on Control of Network Systems",
      "url": "https://doi.org/10.1109/TCNS.2025.3587331",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "daokuan-zhu",
        "tianqi-xu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "D. Zhu",
          "member": "daokuan-zhu"
        },
        {
          "name": "T. Xu",
          "member": "tianqi-xu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "hu2024design",
      "year": 2024,
      "title": "Design and Control of a Transformable Quadrotor",
      "authors": "B. Hu, X. Song, Z. Ou, X. Liu, and J. Lu",
      "venue": "2024 43rd Chinese Control Conference (CCC)",
      "url": "https://doi.org/10.23919/CCC63176.2024.10662840",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "zichong-ou",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "B. Hu"
        },
        {
          "name": "X. Song"
        },
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "X. Liu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "ou2024mixing",
      "year": 2024,
      "title": "A Mixing-Accelerated Primal-Dual Proximal Algorithm for Distributed Nonconvex Optimization",
      "authors": "Z. Ou, C. Qiu, D. Wang, and J. Lu",
      "venue": "2024 American Control Conference (ACC)",
      "url": "https://doi.org/10.23919/ACC60939.2024.10644289",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "zichong-ou",
        "chenyang-qiu",
        "dandan-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "C. Qiu",
          "member": "chenyang-qiu"
        },
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2024distributed",
      "year": 2024,
      "title": "Distributed Task Offloading in Cooperative Mobile Edge Computing Networks",
      "authors": "D. Wang, H. Zhu, C. Qiu, Y. Zhou, and J. Lu",
      "venue": "IEEE Transactions on Vehicular Technology",
      "url": "https://doi.org/10.1109/TVT.2024.3363034",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "dandan-wang",
        "chenyang-qiu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "H. Zhu"
        },
        {
          "name": "C. Qiu",
          "member": "chenyang-qiu"
        },
        {
          "name": "Y. Zhou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2024zeroth",
      "year": 2024,
      "title": "A Zeroth-Order Proximal Algorithm for Consensus Optimization",
      "authors": "C. Wang, Z. Ou, and J. Lu",
      "venue": "2024 IEEE 63rd Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC56724.2024.10886308",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "chengan-wang",
        "zichong-ou",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "C. Wang",
          "member": "chengan-wang"
        },
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "stochastic",
      "year": 2023,
      "title": "A Stochastic Second-Order Proximal Method for Distributed Optimization",
      "authors": "C. Qiu, S. Zhu, Z. Ou, and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://ieeexplore.ieee.org/document/10044149",
      "selected": true,
      "kind": "article",
      "research": [
        "optimization-algorithms"
      ],
      "members": [
        "jie-lu",
        "chenyang-qiu",
        "zichong-ou"
      ],
      "authorList": [
        {
          "name": "C. Qiu",
          "member": "chenyang-qiu"
        },
        {
          "name": "S. Zhu"
        },
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "constraints",
      "year": 2023,
      "title": "Distributed Optimization With Coupling Constraints",
      "authors": "X. Wu, H. Wang, and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://ieeexplore.ieee.org/document/9762539",
      "selected": true,
      "kind": "article",
      "research": [
        "distributed-optimization"
      ],
      "members": [
        "jie-lu",
        "xuyang-wu",
        "he-wang"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2023distributed-buffering",
      "year": 2023,
      "title": "A Distributed Buffering Drift-Plus-Penalty Algorithm for Coupling Constrained Optimization",
      "authors": "D. Wang, D. Zhu, Z. Ou, and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://doi.org/10.1109/LCSYS.2023.3345694",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "dandan-wang",
        "daokuan-zhu",
        "zichong-ou",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "D. Zhu",
          "member": "daokuan-zhu"
        },
        {
          "name": "Z. Ou",
          "member": "zichong-ou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2023distributed-online",
      "year": 2023,
      "title": "Distributed Online Optimization with Coupled Inequality Constraints Over Unbalanced Directed Networks",
      "authors": "D. Wang, D. Zhu, K. C. Sou, and J. Lu",
      "venue": "2023 62nd IEEE Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC49753.2023.10383341",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "dandan-wang",
        "daokuan-zhu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "D. Wang",
          "member": "dandan-wang"
        },
        {
          "name": "D. Zhu",
          "member": "daokuan-zhu"
        },
        {
          "name": "K. C. Sou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2023fenchel",
      "year": 2023,
      "title": "A Fenchel dual gradient method enabling regularization for nonsmooth distributed optimization over time-varying networks",
      "authors": "X. Wu, K. C. Sou, and J. Lu",
      "venue": "Optimization Methods and Software",
      "url": "https://doi.org/10.1080/10556788.2023.2189713",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "K. C. Sou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2023unifying",
      "year": 2023,
      "title": "A Unifying Approximate Method of Multipliers for Distributed Composite Optimization",
      "authors": "X. Wu and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://doi.org/10.1109/TAC.2022.3173171",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "gao2022learning",
      "year": 2022,
      "title": "Learning-based Local Path Planning for UAV in Unknown Environments",
      "authors": "L. Gao, X. Song, X. Liu, and J. Lu",
      "venue": "2022 European Control Conference (ECC)",
      "url": "https://doi.org/10.23919/ECC55457.2022.9837997",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "L. Gao"
        },
        {
          "name": "X. Song"
        },
        {
          "name": "X. Liu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "sou2022relaxed",
      "year": 2022,
      "title": "Relaxed Connected Dominating Set Problem for Power System Cyber–Physical Security",
      "authors": "K. C. Sou and J. Lu",
      "venue": "IEEE Transactions on Control of Network Systems",
      "url": "https://doi.org/10.1109/TCNS.2022.3165088",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "K. C. Sou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "proximal",
      "year": 2021,
      "title": "A Second-Order Proximal Algorithm for Consensus Optimization",
      "authors": "X. Wu, Z. Qu, and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://ieeexplore.ieee.org/document/9097872",
      "selected": false,
      "kind": "article",
      "research": [
        "multi-agent-control"
      ],
      "members": [
        "jie-lu",
        "xuyang-wu",
        "zhihai-qu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "Z. Qu",
          "member": "zhihai-qu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2021decentralized",
      "year": 2021,
      "title": "Decentralized Statistical Inference with Unrolled Graph Neural Networks",
      "authors": "H. Wang, Y. Shen, Z. Wang, D. Li, J. Zhang, K. B. Letaief, and J. Lu",
      "venue": "2021 60th IEEE Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC45484.2021.9682857",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "he-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "Y. Shen"
        },
        {
          "name": "Z. Wang"
        },
        {
          "name": "D. Li"
        },
        {
          "name": "J. Zhang"
        },
        {
          "name": "K. B. Letaief"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wei2021decentralized",
      "year": 2021,
      "title": "Decentralized Approximate Newton Methods for Convex Optimization on Networked Systems",
      "authors": "H. Wei, Z. Qu, X. Wu, H. Wang, and J. Lu",
      "venue": "IEEE Transactions on Control of Network Systems",
      "url": "https://doi.org/10.1109/TCNS.2021.3070663",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "zhihai-qu",
        "xuyang-wu",
        "he-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "H. Wei"
        },
        {
          "name": "Z. Qu",
          "member": "zhihai-qu"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wang2020inexact",
      "year": 2020,
      "title": "An Inexact Fenchel Dual Gradient Algorithm for Distributed Optimization",
      "authors": "H. Wang and J. Lu",
      "venue": "2020 IEEE 16th International Conference on Control & Automation (ICCA)",
      "url": "https://doi.org/10.1109/ICCA51439.2020.9264365",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "he-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2020distributed-optimization",
      "year": 2020,
      "title": "Distributed Optimization Over Time-Varying Networks With Minimal Connectivity",
      "authors": "X. Wu and J. Lu",
      "venue": "IEEE Control Systems Letters",
      "url": "https://doi.org/10.1109/LCSYS.2020.2971835",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2020distributed-proximal",
      "year": 2020,
      "title": "A Distributed Proximal Primal-Dual Algorithm for Nonsmooth Optimization with Coupling Constraints",
      "authors": "X. Wu, H. Wang, and J. Lu",
      "venue": "2020 59th IEEE Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC42340.2020.9303937",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "xuyang-wu",
        "he-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "qu2019finite",
      "year": 2019,
      "title": "Finite-Time-Consensus-Based Methods for Distributed optimization",
      "authors": "Z. Qu, X. Wu, and J. Lu",
      "venue": "2019 Chinese Control Conference (CCC)",
      "url": "https://doi.org/10.23919/ChiCC.2019.8865722",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "zhihai-qu",
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "Z. Qu",
          "member": "zhihai-qu"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2019fenchel",
      "year": 2019,
      "title": "Fenchel Dual Gradient Methods for Distributed Convex Optimization Over Time-Varying Networks",
      "authors": "X. Wu and J. Lu",
      "venue": "IEEE Transactions on Automatic Control",
      "url": "https://doi.org/10.1109/TAC.2019.2901829",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2019improved",
      "year": 2019,
      "title": "Improved Convergence Rates of P-EXTRA for Non-smooth Distributed optimization",
      "authors": "X. Wu and J. Lu",
      "venue": "2019 IEEE 15th International Conference on Control and Automation (ICCA)",
      "url": "https://doi.org/10.1109/ICCA.2019.8899909",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "lu2018distributed",
      "year": 2018,
      "title": "A Distributed Algorithm for Solving Positive Definite Linear Equations Over Networks With Membership Dynamics",
      "authors": "J. Lu and C. Y. Tang",
      "venue": "IEEE Transactions on Control of Network Systems",
      "url": "https://doi.org/10.1109/TCNS.2016.2594487",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "J. Lu",
          "member": "jie-lu"
        },
        {
          "name": "C. Y. Tang"
        }
      ]
    },
    {
      "id": "wei2018approximately",
      "year": 2018,
      "title": "An Approximately-Zero-Gradient-Sum Algorithm for Consensus Optimization",
      "authors": "H. Wei, Z. Qu, X. Wu, H. Wang, and J. Lu",
      "venue": "2018 15th International Conference on Control, Automation, Robotics and Vision (ICARCV)",
      "url": "https://doi.org/10.1109/ICARCV.2018.8581380",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "zhihai-qu",
        "xuyang-wu",
        "he-wang",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "H. Wei"
        },
        {
          "name": "Z. Qu",
          "member": "zhihai-qu"
        },
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "H. Wang",
          "member": "he-wang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2018distributed",
      "year": 2018,
      "title": "Distributed Fenchel Dual Gradient Methods Enabling a Smoothing Technique for Nonsmooth Optimization",
      "authors": "X. Wu, K. C. Sou, and J. Lu",
      "venue": "2018 IEEE Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC.2018.8619031",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "K. C. Sou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "sou2017relaxed",
      "year": 2017,
      "title": "Relaxed connected dominating set problem with application to secure power network design",
      "authors": "K. C. Sou and J. Lu",
      "venue": "2017 American Control Conference (ACC)",
      "url": "https://doi.org/10.23919/ACC.2017.7963674",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "K. C. Sou"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2017deterministic",
      "year": 2017,
      "title": "Deterministic coordinate descent algorithms for smooth convex optimization",
      "authors": "X. Wu and J. Lu",
      "venue": "2017 IEEE 56th Annual Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC.2017.8263744",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "wu2017fenchel",
      "year": 2017,
      "title": "Fenchel dual gradient methods for distributed convex optimization over time-varying networks",
      "authors": "X. Wu and J. Lu",
      "venue": "2017 IEEE 56th Annual Conference on Decision and Control (CDC)",
      "url": "https://doi.org/10.1109/CDC.2017.8264079",
      "selected": false,
      "kind": "inproceedings",
      "research": [],
      "members": [
        "xuyang-wu",
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "X. Wu",
          "member": "xuyang-wu"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        }
      ]
    },
    {
      "id": "yang2017distributed",
      "year": 2017,
      "title": "A Distributed Algorithm for Economic Dispatch Over Time-Varying Directed Networks With Delays",
      "authors": "T. Yang, J. Lu, D. Wu, J. Wu, G. Shi, Z. Meng, and K. H. Johansson",
      "venue": "IEEE Transactions on Industrial Electronics",
      "url": "https://doi.org/10.1109/TIE.2016.2617832",
      "selected": false,
      "kind": "article",
      "research": [],
      "members": [
        "jie-lu"
      ],
      "authorList": [
        {
          "name": "T. Yang"
        },
        {
          "name": "J. Lu",
          "member": "jie-lu"
        },
        {
          "name": "D. Wu"
        },
        {
          "name": "J. Wu"
        },
        {
          "name": "G. Shi"
        },
        {
          "name": "Z. Meng"
        },
        {
          "name": "K. H. Johansson"
        }
      ]
    }
  ],
  "people": [
    {
      "id": "jie-lu",
      "name": {
        "en": "Jie Lu",
        "zh": "陆疌"
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
        "en": "Research interests include distributed and large-scale optimization algorithms, multi-agent decision and control, and applications of optimization, control, and learning.",
        "zh": "研究兴趣包括分布式及大规模优化算法、多智能体决策与控制与优化、控制与学习的应用。"
      },
      "url": "https://sist.shanghaitech.edu.cn/lujie_en/main.htm",
      "urlLabel": {
        "en": "University profile",
        "zh": "教师主页"
      },
      "email": "lujie@shanghaitech.edu.cn",
      "photo": ""
    },
    {
      "id": "zichong-ou",
      "name": {
        "en": "Zichong Ou",
        "zh": "欧子翀"
      },
      "group": "students",
      "role": {
        "en": "Doctoral student",
        "zh": "博士研究生"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "description": {
        "en": "Research interests include distributed optimization.",
        "zh": "研究兴趣包括分布式优化。"
      },
      "url": "",
      "urlLabel": {
        "en": "Personal website",
        "zh": "个人主页"
      },
      "email": "",
      "photo": ""
    },
    {
      "id": "daokuan-zhu",
      "name": {
        "en": "Daokuan Zhu"
      },
      "group": "students",
      "role": {
        "en": "Master’s student",
        "zh": "硕士研究生"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "url": "",
      "urlLabel": {
        "en": "Personal website",
        "zh": "个人主页"
      },
      "email": "",
      "photo": ""
    },
    {
      "id": "tianqi-xu",
      "name": {
        "en": "Tianqi Xu"
      },
      "group": "students",
      "role": {
        "en": "Master’s student",
        "zh": "硕士研究生"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "url": "",
      "urlLabel": {
        "en": "Personal website",
        "zh": "个人主页"
      },
      "email": "",
      "photo": ""
    },
    {
      "id": "chengan-wang",
      "name": {
        "en": "Chengan Wang",
        "zh": "王成安"
      },
      "group": "students",
      "role": {
        "en": "Student",
        "zh": "学生"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "url": "",
      "urlLabel": {
        "en": "Personal website",
        "zh": "个人主页"
      },
      "email": "",
      "photo": ""
    },
    {
      "id": "zhicheng-deng",
      "name": {
        "en": "Zhicheng Deng"
      },
      "group": "students",
      "role": {
        "en": "Student",
        "zh": "学生"
      },
      "affiliation": {
        "en": "School of Information Science and Technology",
        "zh": "信息科学与技术学院"
      },
      "url": "",
      "urlLabel": {
        "en": "Personal website",
        "zh": "个人主页"
      },
      "email": "",
      "photo": ""
    }
  ],
  "alumni": [
    {
      "id": "xuyang-wu",
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
      "url": "https://xuyangwu.github.io",
      "email": "",
      "photo": ""
    },
    {
      "id": "dandan-wang",
      "name": {
        "en": "Dandan Wang"
      },
      "degree": {
        "en": "PhD",
        "zh": "博士"
      },
      "year": 2025,
      "source": "",
      "url": "",
      "email": "",
      "photo": ""
    },
    {
      "id": "zixuan-liu",
      "name": {
        "en": "Zixuan Liu"
      },
      "degree": {
        "en": "Master’s",
        "zh": "硕士"
      },
      "year": 2025,
      "position": {
        "en": "PhD student in systems and control",
        "zh": "系统与控制方向博士生"
      },
      "destination": {
        "en": "University of Groningen",
        "zh": "荷兰格罗宁根大学"
      },
      "location": {
        "en": "Groningen, the Netherlands",
        "zh": "荷兰 · 格罗宁根"
      },
      "source": "",
      "url": "",
      "email": "",
      "photo": ""
    },
    {
      "id": "chenyang-qiu",
      "name": {
        "en": "Chenyang Qiu"
      },
      "degree": {
        "en": "Former student",
        "zh": "曾在组学生"
      },
      "source": "",
      "url": "",
      "email": "",
      "photo": ""
    },
    {
      "id": "he-wang",
      "name": {
        "en": "He Wang"
      },
      "degree": {
        "en": "Former student",
        "zh": "曾在组学生"
      },
      "source": "",
      "url": "",
      "email": "",
      "photo": ""
    },
    {
      "id": "zhihai-qu",
      "name": {
        "en": "Zhihai Qu"
      },
      "degree": {
        "en": "Former student",
        "zh": "曾在组学生"
      },
      "source": "",
      "url": "",
      "email": "",
      "photo": ""
    }
  ],
  "gallery": [],
  "news": [
    {
      "date": {
        "en": "Dec 2024",
        "zh": "2024 年 12 月"
      },
      "text": {
        "en": "PhD student Zichong Ou gives an oral presentation of “A Zeroth-Order Proximal Algorithm for Consensus Optimization”, joint work with labmate Chengan Wang, at the 63rd IEEE Conference on Decision and Control in Milan.",
        "zh": "博士生欧子翀在意大利米兰举行的第 63 届 IEEE 决策与控制会议（CDC）上，口头报告了与同课题组王成安合作完成的论文《A Zeroth-Order Proximal Algorithm for Consensus Optimization》。"
      },
      "url": "https://sist.shanghaitech.edu.cn/2025/0307/c2864a1108005/page.htm"
    },
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
    },
    {
      "date": {
        "en": "Dec 2018",
        "zh": "2018 年 12 月"
      },
      "text": {
        "en": "PhD student Xuyang Wu presents the invited paper “Distributed Fenchel Dual Gradient Methods Enabling a Smoothing Technique for Nonsmooth Optimization” at the 57th IEEE Conference on Decision and Control in Miami, in a session chaired by Jie Lu.",
        "zh": "博士生吴旭阳在美国迈阿密举行的第 57 届 IEEE 决策与控制会议（CDC）上宣讲邀请论文《Distributed Fenchel Dual Gradient Methods Enabling a Smoothing Technique for Nonsmooth Optimization》，陆疌担任该分会场主席。"
      },
      "url": "http://sist.shanghaitech.edu.cn/2018/1227/c2864a38419/page.htm"
    },
    {
      "date": {
        "en": "May 2016",
        "zh": "2016 年 5 月"
      },
      "text": {
        "en": "Jie Lu is selected for the 2016 Shanghai Pujiang Talent Program.",
        "zh": "陆疌荣获 2016 年度上海市浦江人才计划资助。"
      },
      "url": "http://sist.shanghaitech.edu.cn/2016/0520/c2858a23843/page.htm"
    },
    {
      "date": {
        "en": "Apr 2015",
        "zh": "2015 年 4 月"
      },
      "text": {
        "en": "Jie Lu joins the School of Information Science and Technology at ShanghaiTech University full time, after postdoctoral research at KTH Royal Institute of Technology and Chalmers University of Technology.",
        "zh": "陆疌全职加入上海科技大学信息科学与技术学院。此前在瑞典皇家理工学院（KTH）与查尔姆斯理工大学从事博士后研究。"
      },
      "url": "https://hr.shanghaitech.edu.cn/2015/0420/c3812a40380/page.htm"
    }
  ],
  "honors": [
    {
      "year": 2019,
      "title": {
        "en": "Best Student Paper Finalist, IEEE ICCA 2019",
        "zh": "IEEE ICCA 2019 最佳学生论文奖入围"
      },
      "recipient": {
        "en": "Xuyang Wu, Jie Lu",
        "zh": "吴旭阳、陆疌"
      },
      "note": {
        "en": "For “Improved Convergence Rates of P-EXTRA for Non-smooth Distributed Optimization”, Edinburgh.",
        "zh": "论文《Improved Convergence Rates of P-EXTRA for Non-smooth Distributed Optimization》，英国爱丁堡。"
      }
    },
    {
      "year": 2016,
      "title": {
        "en": "Shanghai Pujiang Talent Program",
        "zh": "上海市浦江人才计划资助"
      },
      "recipient": {
        "en": "Jie Lu",
        "zh": "陆疌"
      }
    }
  ],
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
