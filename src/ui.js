export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
export const initials = (name) => String(name || "").trim().split(/\s+/).filter(Boolean).map(word => word[0]).join("").slice(0, 3).toUpperCase();
export const targetId = (kind, key) => `${kind}-${key}`;
export const mediaUrl = (value, dir) => {
  const path = String(value ?? "").trim();
  if (!path) return "";
  if (/^(https?:)?\/\//i.test(path) || /^(\/|data:|blob:)/.test(path)) return path;
  const base = String(dir || "").replace(/\/?$/, "/");
  const relative = path.replace(/^\.\//, "");
  if (!base) return relative;
  return base + relative;
};
const strokes = {
  network: '<circle cx="5" cy="16" r="2.8"/><circle cx="12" cy="5" r="2.8"/><circle cx="19" cy="16" r="2.8"/><path d="m6.4 13.5 4-6m3.2 0 4 6M8 16h8"/>',
  agents: '<circle cx="12" cy="7" r="3"/><path d="M6 20v-2a6 6 0 0 1 12 0v2M4 8a2.4 2.4 0 1 0 1.4 4.3M2 18a4 4 0 0 1 2.2-3.6M20 8a2.4 2.4 0 1 1-1.4 4.3M22 18a4 4 0 0 0-2.2-3.6"/>',
  contour: '<path d="M3 15c-2-4 5-11 10-12s10 5 8 10-6 9-12 8-5-3-6-6Z"/><path d="M7 14c-1-3 3-7 6-7s6 3 4 6-4 5-7 4-3-1-3-3Z"/><circle cx="12" cy="12" r="1"/>',
  book: '<path d="M3 5c3-1 6-.6 9 1.4C15 4.4 18 4 21 5v14c-3-1-6-.5-9 1.2C9 18.5 6 18 3 19ZM12 6.4v13"/>',
  mail:'<rect x="2.5" y="4.5" width="19" height="15" rx="2.5"/><path d="m3.5 6 8.5 6.5L20.5 6"/>',
  play:'<path d="m7 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  pause:'<path d="M7 5v14M17 5v14" stroke-width="4"/>',
  reset:'<path d="M4 10a8 8 0 1 1 1.2 6M4 4v6h6"/>',
  slider:'<path d="M3 6h9m5 0h4M3 17h3m6 0h9"/><circle cx="14.5" cy="6" r="2.5"/><circle cx="9" cy="17" r="2.5"/>',
  chart:'<path d="M3 3v17h18M6 6l4 6 4 3 6 1"/>',
  location:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
  close:'<path d="m5 5 14 14M19 5 5 19"/>',
  chip:'<rect x="5" y="5" width="14" height="14" rx="3"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3m6-3v3m-6 14v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.8"/><path d="m15.6 15.6 5 5"/>',
  news:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2Z"/><path d="M17 9h3v7a3 3 0 0 1-3 3M7 9h7M7 12h7M7 15h4"/>',
  camera:'<path d="M3 8h4l2-3h6l2 3h4v11H3Z"/><circle cx="12" cy="13" r="3.3"/>',
  award:'<circle cx="12" cy="9" r="5"/><path d="m8.6 13.2-1.6 8 5-3 5 3-1.6-8"/>',
  file:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  arrow:'<path d="M4 12h15M13 6l6 6-6 6"/>'
};
export function icon(id,size=18) { return '<svg class="icon" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+strokes[id]+'</svg>'; }

