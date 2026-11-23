export const layouts = {
  Mesh: [[51,125],[132,55],[151,166],[235,109],[290,46],[336,154],[416,87],[429,184]],
  Ring: [[78,117],[126,56],[239,37],[352,56],[404,117],[352,179],[239,199],[126,179]],
  Star: [[240,118],[59,120],[126,55],[247,36],[354,59],[419,137],[328,191],[159,192]]
};
const edgeLists = {
  Mesh: [[0,1],[0,2],[1,2],[1,3],[1,4],[2,3],[2,5],[3,4],[3,5],[3,6],[4,6],[5,6],[5,7],[6,7]],
  Ring: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0]],
  Star: [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7]]
};
export const edgesFor = name => edgeLists[name];
export const mean = values => values.reduce((a,b)=>a+b,0)/values.length;
export function rms(values) {
  const avg=mean(values);
  return Math.sqrt(mean(values.map(v=>(v-avg)**2)));
}
export function simulate(initial, topology, tolerance) {
  const links = edgesFor(topology);
  const degree = initial.map(()=>0);
  for (const [a,b] of links) { degree[a]++; degree[b]++; }
  const weights = links.map(([a,b])=>[a,b, .85/(1+Math.max(degree[a],degree[b]))]);
  const states = [initial.slice()], errors = [rms(initial)];
  while (errors.at(-1)>tolerance && states.length<1001) {
    const prev=states.at(-1), next=prev.slice();
    for (const [a,b,weight] of weights) {
      const flow=weight*(prev[a]-prev[b]);
      next[a]-=flow; next[b]+=flow;
    }
    states.push(next); errors.push(rms(next));
  }
  return {states,errors};
}
