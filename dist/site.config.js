// Edit this file to maintain DOCIA's public content and experiment defaults.
export const site = {
  brand: "DOCIA Lab",
  name: "Lab of Decision, Optimization, and Control for Intelligent Agents",
  university: "ShanghaiTech University",
  palette: { paper: "#EEF7F2", mint: "#B9DEC9", green: "#1BA784", sky: "#63BBD0", ink: "#134857" },
  navigation: [
    { id: "home", label: "Home" }, { id: "research", label: "Research" },
    { id: "publications", label: "Publications" }, { id: "people", label: "People" },
    { id: "alumni", label: "Alumni" }, { id: "contact", label: "Contact" }
  ],
  hero: {
    lines: ["Decision, Optimization", "& Control for", "Intelligent Agents"],
    description: "We study how connected agents make decisions together, designing optimization and control algorithms for large-scale networked systems."
  },
  research: [
    { id: "distributed-optimization", title: "Distributed optimization", icon: "network",
      short: "Solving a shared problem through local computation and neighbor-to-neighbor communication.",
      question: "How much can each agent accomplish with a local objective and messages from its neighbors?",
      detail: "In a distributed problem, each agent holds part of the data or objective. Our work studies algorithms that coordinate these local updates, including methods for nonsmooth objectives, coupling constraints, and changing communication networks.", paper: "constraints" },
    { id: "multi-agent-control", title: "Multi-agent coordination", icon: "agents",
      short: "Understanding how local decisions shape the collective behavior of a network.",
      question: "When do local interactions lead a network to agree?",
      detail: "Consensus algorithms connect the behavior of an entire network to its communication graph. The playground makes this connection tangible: a node transfers load only to its neighbors, yet repeated exchanges can balance all eight nodes.", paper: "proximal" },
    { id: "optimization-algorithms", title: "Optimization algorithms", icon: "contour",
      short: "Designing scalable methods and analyzing the conditions under which they converge.",
      question: "Which information should an algorithm use at each iteration?",
      detail: "First-order, second-order, and proximal methods use different kinds of local information. We study how these choices affect the cost of an update and the rate at which distributed iterates approach a solution.", paper: "stochastic" }
  ],
  publications: [
    { id: "stochastic", year: 2023, title: "A Stochastic Second-Order Proximal Method for Distributed Optimization", authors: "C. Qiu, S. Zhu, Z. Ou, and J. Lu", venue: "IEEE Control Systems Letters", url: "https://ieeexplore.ieee.org/document/10044149" },
    { id: "constraints", year: 2023, title: "Distributed Optimization with Coupling Constraints", authors: "X. Wu, H. Wang, and J. Lu", venue: "IEEE Transactions on Automatic Control", url: "https://ieeexplore.ieee.org/document/9762539" },
    { id: "proximal", year: 2021, title: "A Second-Order Proximal Algorithm for Consensus Optimization", authors: "X. Wu, Z. Qu, and J. Lu", venue: "IEEE Transactions on Automatic Control", url: "https://ieeexplore.ieee.org/document/9097872" }
  ],
  people: [
    { name: "Jie Lu", role: "Lab Director · Associate Professor", affiliation: "School of Information Science and Technology", description: "Research interests include distributed optimization, multi-agent decision making, and networked dynamical systems.", url: "https://sist.shanghaitech.edu.cn/lujie_en/main.htm" }
  ],
  alumni: [
    { name: "Xuyang Wu", degree: "PhD", year: 2020, position: "Postdoctoral researcher", destination: "KTH Royal Institute of Technology", location: "Stockholm, Sweden", source: "https://faculty.sist.shanghaitech.edu.cn/office/Share/Entropy-SIST%20Yearbook%2C2020.pdf" }
  ],
  contact: { name: "Jie Lu", email: "lujie@shanghaitech.edu.cn", office: "Room 1D-201B, SIST Building", street: "393 Huaxia Middle Road", city: "Shanghai 201210, China", school: "School of Information Science and Technology", profile: "https://faculty.sist.shanghaitech.edu.cn/faculty/lujie/", center: "https://star-center.shanghaitech.edu.cn/professors.html" },
  experiment: { topology: "Mesh", initialLoads: [78, 45, 108, 30, 75, 44, 23, 58], capacity: 100, tolerance: 0.1, previewRound: 4 }
};
