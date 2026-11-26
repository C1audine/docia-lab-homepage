// Pure helpers behind the Publications filter bar. Keeping them free of DOM
// access lets the build data and the filtering rules be unit tested and keeps
// app.js focused on rendering.

export const MEMBER_PREFIX = "member:";
export const AUTHOR_PREFIX = "author:";

export const memberValue = (id) => MEMBER_PREFIX + String(id ?? "");
export const authorValue = (name) => AUTHOR_PREFIX + String(name ?? "");

export const emptyFilters = () => ({ year: "", person: "", research: "", kind: "" });

export function hasActiveFilters(filters) {
  return Object.values(filters || {}).some(Boolean);
}

// Builds the selectable options from the publications themselves, so adding a
// paper to publications.bib automatically adds its year, authors, research
// areas and type to the interface.
export function buildPublicationFacets(publications, people = [], alumni = [], research = []) {
  const papers = Array.isArray(publications) ? publications : [];
  const allPeople = [...people, ...alumni];
  const years = new Set();
  const memberIds = new Set();
  const authorNames = new Set();
  const researchIds = new Set();
  const kinds = new Set();

  for (const paper of papers) {
    if (paper.year != null) years.add(paper.year);
    for (const id of paper.members || []) memberIds.add(id);
    for (const author of paper.authorList || []) {
      if (author?.name && !author.member) authorNames.add(author.name);
    }
    for (const id of paper.research || []) researchIds.add(id);
    if (paper.kind) kinds.add(paper.kind);
  }

  const members = allPeople
    .filter((person) => memberIds.has(person.id))
    .map((person) => ({ id: person.id, name: person.name }));

  const authors = [...authorNames].sort((a, b) => a.localeCompare(b, "en"));

  // The research page order is editorial, so keep it instead of sorting.
  const researchAreas = research
    .filter((item) => researchIds.has(item.id))
    .map((item) => ({ id: item.id, title: item.title }));

  const knownKinds = ["article", "inproceedings"].filter((kind) => kinds.has(kind));
  const otherKinds = [...kinds].filter((kind) => !knownKinds.includes(kind)).sort();
  const orderedKinds = [...knownKinds, ...otherKinds];

  return {
    years: [...years].sort((a, b) => Number(b) - Number(a)),
    members,
    authors,
    research: researchAreas,
    kinds: orderedKinds
  };
}

export function filterPublications(publications, filters = {}) {
  const { year = "", person = "", research = "", kind = "" } = filters || {};

  return (Array.isArray(publications) ? publications : []).filter((paper) => {
    if (year && String(paper.year) !== String(year)) return false;
    if (kind && paper.kind !== kind) return false;
    if (research && !(paper.research || []).includes(research)) return false;

    if (person.startsWith(MEMBER_PREFIX)) {
      return (paper.members || []).includes(person.slice(MEMBER_PREFIX.length));
    }
    if (person.startsWith(AUTHOR_PREFIX)) {
      const name = person.slice(AUTHOR_PREFIX.length);
      return (paper.authorList || []).some((author) => author?.name === name);
    }
    if (person) return false;

    return true;
  });
}
