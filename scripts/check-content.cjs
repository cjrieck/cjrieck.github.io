// Checks the project content before it goes live.
// Usage: node scripts/check-content.cjs [--launch] [--file <path>]
// --launch also refuses any note that still starts with the placeholder marker.
const fs = require('fs');
const path = require('path');
const { validateProjects, findPlaceholderNotes, PLACEHOLDER_MARKER } = require('../src/data/validate-projects.cjs');

const root = path.join(__dirname, '..');
const usage = 'Usage: node scripts/check-content.cjs [--launch] [--file <path>]';

function fail(lines) {
  console.error(lines.join('\n'));
  process.exitCode = 1;
}

function main(args) {
  const launch = args.includes('--launch');
  const flag = args.indexOf('--file');
  if (flag !== -1 && !args[flag + 1]) return fail([usage]);
  const file = flag === -1 ? path.join(root, 'src', 'data', 'projects.json') : path.resolve(args[flag + 1]);
  const shown = path.relative(process.cwd(), file) || file;

  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    return fail([`Can't open ${shown}. Check that the file is there.`]);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    const line = /line (\d+)/.exec(e.message);
    return fail([
      `${shown} isn't valid JSON, so the page can't read it${line ? ` (look near line ${line[1]})` : ''}.`,
      'Look for a stray comma after the last item in a list, a missing comma between two items, or a missing quote mark.',
    ]);
  }

  const imageExists = (name) => fs.existsSync(path.join(root, 'public', 'projects', name));
  const problems = validateProjects(data, imageExists);
  if (problems.length > 0) return fail([`Fix these in ${shown}:`, ...problems.map((p) => `  ${p}`)]);

  if (launch) {
    const placeholders = findPlaceholderNotes(data);
    if (placeholders.length > 0) {
      return fail([
        'Still placeholder text:',
        ...placeholders.map((p) => `  ${p}`),
        '',
        `Write the real note for each one and delete "${PLACEHOLDER_MARKER} " from the start of it, then try again.`,
      ]);
    }
  }
  console.log('Project content looks good.');
}

main(process.argv.slice(2));
