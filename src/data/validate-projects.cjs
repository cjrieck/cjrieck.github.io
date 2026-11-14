// Checks the hand-edited project data. Plain CommonJS with no file-system code,
// so Jest and the check-content script can share it. The caller says which
// image files exist.
const PLACEHOLDER_MARKER = '[placeholder]';

const isText = (value) => typeof value === 'string' && value.trim() !== '';
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function validateLayer(layer, index, name, problems) {
  const where = `${name}, layer ${index + 1}`;
  if (!isObject(layer)) {
    problems.push(`${where} isn't filled in correctly. Each layer should be wrapped in { } with a kind, a title and a note.`);
    return;
  }
  const label = isText(layer.title) ? `${where} (${layer.title.trim()})` : where;
  for (const field of ['kind', 'title', 'note']) {
    if (!isText(layer[field])) problems.push(`${label} is missing its ${field}.`);
  }
}

function validateProject(project, index, imageExists, problems) {
  if (!isObject(project)) {
    problems.push(`Project number ${index + 1} isn't filled in correctly. Each project should be wrapped in { }.`);
    return;
  }
  const name = isText(project.id) ? `Project "${project.id}"` : `Project number ${index + 1}`;
  if (!isText(project.id)) problems.push(`${name} is missing its id. Give it a short name that no other project uses, such as "my-project".`);
  if (!isText(project.title)) problems.push(`${name} is missing its title.`);
  if (!isText(project.summary)) problems.push(`${name} is missing its summary.`);

  if (project.image !== undefined) {
    if (!isText(project.image)) {
      problems.push(`${name} has an image that isn't a file name. Use a name such as "my-project.webp", or leave the image out.`);
    } else if (!imageExists(project.image)) {
      problems.push(`${name} uses the image "${project.image}", but there is no file with that name in public/projects.`);
    }
  }
  if (project.imageAlt !== undefined && typeof project.imageAlt !== 'string') {
    problems.push(`${name} has an imageAlt that isn't text.`);
  }

  if (project.layers === undefined) return;
  if (!Array.isArray(project.layers)) {
    problems.push(`${name} has "layers" that isn't a list. Use [ ] with one { } entry per layer, or leave "layers" out.`);
    return;
  }
  project.layers.forEach((layer, i) => validateLayer(layer, i, name, problems));
}

// Returns a list of plain-words problems; an empty list means the data is fine.
function validateProjects(data, imageExists) {
  if (!isObject(data) || !Array.isArray(data.projects)) {
    return ['The file needs a "projects" list at the top, like { "projects": [ ... ] }.'];
  }
  const problems = [];
  data.projects.forEach((project, i) => validateProject(project, i, imageExists, problems));

  const seen = new Set();
  const repeated = new Set();
  for (const project of data.projects) {
    if (!isObject(project) || !isText(project.id)) continue;
    if (seen.has(project.id)) repeated.add(project.id);
    seen.add(project.id);
  }
  for (const id of repeated) problems.push(`Project "${id}" appears more than once. Every project needs its own id.`);
  return problems;
}

// Returns "<project title>: <layer title>" for each note that still holds the marker.
function findPlaceholderNotes(data) {
  const found = [];
  const projects = isObject(data) && Array.isArray(data.projects) ? data.projects : [];
  for (const project of projects) {
    if (!isObject(project) || !Array.isArray(project.layers)) continue;
    for (const layer of project.layers) {
      if (isObject(layer) && typeof layer.note === 'string' && layer.note.includes(PLACEHOLDER_MARKER)) {
        found.push(`${project.title}: ${layer.title}`);
      }
    }
  }
  return found;
}

module.exports = { validateProjects, findPlaceholderNotes, PLACEHOLDER_MARKER };
