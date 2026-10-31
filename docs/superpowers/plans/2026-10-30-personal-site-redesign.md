# Personal Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace claytonrieck.com with The Sticker Bench design: every current fact in new form, a 3D "take it apart" teardown driven by JSON that Clayton edits, and a secret sticker toy.

**Architecture:** One static React page with no router. Sections render once and hold no state. Two imperative engines, `mountTeardown` and `mountStickers`, own all per-frame motion outside React and return cleanup functions; their pure logic lives in separate modules for unit tests. Content lives in `src/data/projects.json`, and Node scripts pre-render images into `public/`.

**Tech Stack:** Create React App (`react-scripts` 5.0.1), React 18, TypeScript 4, Jest through `react-scripts test`, `node --test` with Playwright 1.49.1 for browser checks, `sharp` 0.33.5, `gh-pages`.

**Spec:** `docs/superpowers/specs/2026-10-30-personal-site-redesign-design.md`

## Global Constraints

- **Source of truth:** `MOCKUP=/Users/clayton/Projects/cjrieck.github.io/.superpowers/handoff/mockups/files`. Port its look, motion and numbers unchanged, except for the table in spec Section 3. Always use the absolute path, because `.superpowers/` is git-ignored and absent from worktrees. In this plan `HTML` means `$MOCKUP/direction-stickers.html`, and line numbers refer to that file.
- **No invented facts:** no made-up metrics, testimonials, dates or skills. Each section's plain name stays visible next to any witty label.
- **Explicitly out:** dark glassmorphism, gradient blobs, floating orbs, glow effects, bento grids, purple gradients, 3D tilt cards, custom cursors, percentage skill bars.
- **Every animation respects `prefers-reduced-motion`.** Layouts work from 360 to 1440 px with no sideways scrolling.
- **Dependencies:** no new runtime dependencies. The only new dev dependencies are `sharp@0.33.5` and `playwright@1.49.1`. No animation library.
- **React:** per-frame motion never goes through React state. Sections hold no state, so React never re-renders nodes the engines have changed.
- **Stickers are pre-rendered,** never drawn on a canvas. No stacked `drop-shadow` filters; one on the single held sticker is fine.
- **Git:** work on `redesign/sticker-bench`. Commit at the end of each task, staging named files only and never `.claude/`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Outward-facing:** never push, merge or run `npm run deploy` without Clayton's explicit go-ahead.
- **Steps marked Clayton stop the run** until Clayton answers. Don't assume the answer.
- **Build trap, globals:** the build fails on bare `addEventListener`, `removeEventListener`, `innerWidth`, `innerHeight`, `scrollBy`, `location` and `history` (ESLint `no-restricted-globals`). The mockup uses them bare, so port them with `window.`.
- **Build trap, scrolling:** TypeScript 4's `ScrollBehavior` has no `'instant'`. Write `behavior: 'instant' as ScrollBehavior`.
- **Test trap, mocks:** CRA's Jest config sets `resetMocks: true`, so a `jest.fn(impl)` created outside a test loses its implementation. Global stubs must be plain functions.
- **Test trap, jsdom:** it has no layout, `PointerEvent`, `DOMMatrix`, `elementsFromPoint`, `matchMedia` or `IntersectionObserver`.
- **Test trap, WebKit:** Playwright's WebKit screenshots flatten 3D stacks. Never judge the teardown from them.
- **Style:** `src/components/<kebab-name>/<kebab-name>.tsx` with a same-named `.css`, default-exported function components, 2-space indent, single quotes.
- **Standard checks:** `CI=true npm test`, `npx tsc --noEmit` and `npm run build`. "All checks pass" means all three exit 0.

## Review Focus

1. A visitor opens a shared or old link (`/#work`, `/#/projects`, `/#/apps/potpourri/privacy`). They land on the right section with its heading visible below the nav, even with the two-row phone nav, and never on a blank page. Tests: Tasks 2 and 4.
2. Clayton hand-edits the JSON: `layers` missing, `interface` only, more than six plates, an unknown kind, long notes, a stray comma. The page still renders, or the deploy refuses with a plain message. Tests: Tasks 5, 6 and 7.
3. A sticker gesture is interrupted (`pointercancel` from a call or system gesture) or the phone rotates after placing. The sticker isn't stuck to the finger, nothing scrolls sideways, and it stays in its section. Tests: Task 9.
4. A keyboard-only visitor moves through project tabs and the slider. Arrow keys, Home and End work, focus stays on the tab after a switch, and the product view hides the notes. Tests: Tasks 6 and 7.
5. Someone clicks project tabs rapidly mid-animation in the parts view. It ends on the last-clicked project with no leftover plates or notes, and notes are hidden after returning to the product view. Tests: Task 7.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/index.tsx`, `src/App.tsx`, `src/pages/home/home.tsx` | Startup, deep-link scrolling, page composition |
| `src/theme.css` | Tokens, reset and shared styles from the mockup |
| `src/utils/legacy-hash.ts` | Old URL handling and scroll-to-hash |
| `src/utils/analytics.ts` | `trackOnce` |
| `src/utils/assets.ts` | `stickerUrl` |
| `src/components/{nav,hero,clients,philosophy,process,skills,work,contact,footer}/` | One section each |
| `src/components/process/process-ball.ts` | Ball on the dashed line |
| `src/components/teardown/` | `teardown-logic.ts`, `teardown-engine.ts`, `teardown.css` |
| `src/components/stickers/` | `sticker-logic.ts`, `sticker-engine.ts`, `stickers.css` |
| `src/data/projects.json` | **The file Clayton edits** |
| `src/data/projects.ts` | Types and typed export |
| `src/data/validate-projects.cjs` | Shared by Jest and the CLI |
| `scripts/bake-stickers.cjs`, `scripts/project-image.cjs`, `scripts/make-og-image.cjs` | Image pipeline |
| `scripts/check-content.cjs`, `scripts/measure-note-length.cjs` | Data check and launch gate; note length table |
| `scripts/verify/` | Browser checks, run by `npm run verify` |
| `public/stickers/`, `public/projects/`, `public/og-image.png` | Generated images, committed |

---

### Task 1: Phone test of the mockup (Clayton)

This comes first because it can change the numbers everything else ports.

**Files:** none in the repo. Tuning edits only `HTML` line 315.

**Interfaces:**
- Produces: tuned constants in `HTML` line 315, and the value of `STICKERS_ON_TOUCH` for Task 8, both recorded in the Run log at the end of this plan.

- [ ] **Step 1: Serve the mockup on the local network**

Run `ipconfig getifaddr en0`, then in the background: `python3 -m http.server 8765 --bind 0.0.0.0 --directory "$MOCKUP"`.
Expected: `curl -sI http://127.0.0.1:8765/direction-stickers.html` returns 200.

- [ ] **Step 2: Clayton: try it on their phone**

Ask Clayton to open `http://<address>:8765/direction-stickers.html` on their phone (macOS may ask to allow incoming connections, and the phone must be on the same Wi-Fi) and to try:
- press and hold a company sticker until it comes free
- carry it to another section using the screen edge
- drop it, then drop one near its home spot
- do the same with a skill sticker
- swipe starting on a sticker, which should scroll the page

Ask whether it feels right.

- [ ] **Step 3: Tune if needed**

If Clayton wants changes, edit `HOLD`, `TOUCH_DELAY` and related constants in `HTML` line 315 and have them reload. Clayton decides when it's right. If it still feels wrong after tuning, the result is `STICKERS_ON_TOUCH = false` (spec decision 13).

- [ ] **Step 4: Stop the server and fill in the Run log**

Expected: `curl -sI -m 2 http://127.0.0.1:8765/` fails, and the Run log has the final constants and the `STICKERS_ON_TOUCH` value.

---

### Task 2: Cut over to an empty page shell

**Files:**
- Create: `src/utils/legacy-hash.ts`, `src/utils/legacy-hash.test.ts`
- Modify: `.gitignore`, `package.json`, `package-lock.json`, `tsconfig.json`, `public/index.html`, `src/index.tsx`, `src/App.tsx`, `src/App.test.tsx`, `src/setupTests.ts`, `src/theme.css`, `src/pages/home/home.tsx`
- Delete: `yarn.lock`, `src/index.css`, `src/pages/apps/`, everything in `src/components/`, `src/utils/animations.ts`, `src/utils/scroll.ts`

**Interfaces:**
- Produces: `resolveLegacyHash(hash: string): string | null`, `applyLegacyHash(): void`, `scrollToCurrentHash(): void`; global stubs for `matchMedia` and `IntersectionObserver` in `setupTests.ts`; theme classes `.wrap .dots .label .sh .btn .btn--paper .btn--xl .tape`, the `--ink` family of tokens and `--hard`.

- [ ] **Step 1: Branch, ignore and commit the docs**

```bash
git switch -c redesign/sticker-bench
```

Add `.superpowers/` to `.gitignore`, then commit `.gitignore` and `docs/superpowers/`.
Expected: `git status --short` shows only `?? .claude/`.

- [ ] **Step 2: Write the failing tests in `src/utils/legacy-hash.test.ts`**

```ts
test.each([
  ['#/expertise', '#process'],
  ['#/projects', '#work'],
  ['#/apps/potpourri/privacy', '#top'],
  ['#/nope', '#top'],
  ['#/', '#top'],
])('%s goes to %s', (from, to) => expect(resolveLegacyHash(from)).toBe(to));

test.each(['', '#', '#work', '#process', '#top', '#nope'])('%s is left alone', (hash) =>
  expect(resolveLegacyHash(hash)).toBeNull());

test('applyLegacyHash rewrites the URL without adding history', () => {
  window.location.hash = '#/projects';
  const before = window.history.length;
  applyLegacyHash();
  expect(window.location.hash).toBe('#work');
  expect(window.history.length).toBe(before);
});

test('scrollToCurrentHash scrolls to the matching section', () => {
  const section = document.createElement('section');
  section.id = 'work';
  section.scrollIntoView = jest.fn();
  document.body.append(section);
  window.location.hash = '#work';
  scrollToCurrentHash();
  expect(section.scrollIntoView).toHaveBeenCalledTimes(1);
  section.remove();
});

test('scrollToCurrentHash ignores a hash with no matching element', () => {
  window.location.hash = '#nope';
  expect(() => scrollToCurrentHash()).not.toThrow();
});
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/utils/legacy-hash.test.ts`
Expected: FAIL, cannot find module `./legacy-hash`.

- [ ] **Step 4: Implement `src/utils/legacy-hash.ts`**

Export `resolveLegacyHash`, `applyLegacyHash` and `scrollToCurrentHash`. `applyLegacyHash` uses `window.history.replaceState`. `scrollToCurrentHash` calls `scrollIntoView({ behavior: 'instant' as ScrollBehavior })` on the matching element.

- [ ] **Step 5: Run them to confirm they pass**

Run the Step 3 command. Expected: PASS.

- [ ] **Step 6: Remove the old site and its dependencies**

```bash
npm uninstall recharts react-circular-progressbar react-visibility-sensor react-responsive framer-motion lucide-react react-router-dom react-ga
git rm -q yarn.lock src/index.css src/utils/animations.ts src/utils/scroll.ts
git rm -rq src/pages/apps src/components
```

- [ ] **Step 7: Write the new shell**

- `src/index.tsx`: remove `HashRouter` and the `index.css` import, and call `applyLegacyHash()` before `createRoot`. Keep `StrictMode` and `reportWebVitals`.
- `src/App.tsx`: renders `<Home />`. A mount effect calls `scrollToCurrentHash()`, again after `document.fonts?.ready`, and adds the no-op passive `touchstart` listener from `HTML` line 309, removing it on cleanup.
- `src/pages/home/home.tsx`: renders `<main />` for now.
- `src/theme.css`: replace the contents with `HTML` lines 12-42 and the reduced-motion rule on line 199.
- `src/setupTests.ts`: add plain-function stubs for `window.matchMedia` (returns `{ matches: false, media, addEventListener() {}, removeEventListener() {} }`) and a do-nothing `IntersectionObserver` class.
- `public/index.html`: replace the two font preconnects with `HTML` lines 7-9. Leave the title and description alone.
- `package.json`: set `"homepage": "https://claytonrieck.com"`.
- `tsconfig.json`: set `"target": "es2017"`, because the port spreads `Set`s and `NodeList`s. Babel still decides the shipped output.

- [ ] **Step 8: Replace `src/App.test.tsx`**

```tsx
test('renders the page without a router', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
```

- [ ] **Step 9: Verify**

Run the standard checks, then:
```bash
grep -c 'cjrieck.github.io' build/index.html
grep -rlE 'react-router|framer-motion|lucide|react-ga|otpourri|custom-cursor' src
```
Expected: all checks pass, the build prints `hosted at /`, the first command prints `0`, and the second prints nothing.

- [ ] **Step 10: Commit**

Message: `feat: replace old site with empty page shell and remove router`

---

### Task 3: Asset pipeline

**Files:**
- Create: `scripts/bake-stickers.cjs`, `scripts/bake-stickers.test.cjs`, `scripts/project-image.cjs`, `public/stickers/*.webp`, `public/projects/*.webp`
- Modify: `package.json`, `package-lock.json`, `README.md`
- Delete: `src/img/projects/`

**Interfaces:**
- Produces: `public/stickers/{personal-photo,swift,swiftui,react-native,typescript,python,misc}.webp`; `public/projects/{soundcloud,noggin,nbc,peachi}.webp`; `npm run bake`; `npm run project-image -- <path>`; `npm run test:scripts`.
- CJS exports from `bake-stickers.cjs`: `assertTransparent(file: string): Promise<void>`, `bakeSticker({ from, out, css, size }, outDir): Promise<void>`.

- [ ] **Step 1: Install and add scripts**

```bash
npm install --save-dev sharp@0.33.5
```

Add these to `package.json` scripts: `"bake": "node scripts/bake-stickers.cjs"`, `"project-image": "node scripts/project-image.cjs"`, `"test:scripts": "node --test \"scripts/*.test.cjs\""`.

- [ ] **Step 2: Write the failing tests in `scripts/bake-stickers.test.cjs`**

Use `node:test`, `node:assert`, a temp directory, and `sharp` to build the source images.

```js
test('an opaque photo is refused with a plain message', async () => {
  // solid 50×50 PNG with no alpha at opaquePath
  await assert.rejects(assertTransparent(opaquePath), /no transparency/);
});

test('a photo with transparency is accepted', async () => {
  await assertTransparent(transparentPath); // 50×50 with a transparent top row
});

test('a sticker comes out square at the requested size', async () => {
  await bakeSticker({ from: transparentPath, out: 'x', css: 112, size: 224 }, tmp);
  const meta = await sharp(path.join(tmp, 'x.webp')).metadata();
  assert.deepEqual([meta.width, meta.height, meta.format], [224, 224, 'webp']);
});

test('a non-square photo is fitted, not cropped', async () => {
  // 200×100 source: left 10 px red, the rest blue, top row transparent
  await bakeSticker({ from: widePath, out: 'wide', css: 112, size: 224 }, tmp);
  const { data, info } = await sharp(path.join(tmp, 'wide.webp')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => (y * info.width + x) * 4;
  const i = at(18, Math.floor(info.height / 2)); // inset is 15 px at this size
  assert.ok(data[i] > 180 && data[i + 1] < 90, 'left edge of the source survives');
});
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `npm run test:scripts`. Expected: FAIL, cannot find `./bake-stickers.cjs`.

- [ ] **Step 4: Implement `scripts/bake-stickers.cjs`**

Port `/Users/clayton/Projects/cjrieck.github.io/.superpowers/handoff/bake-stickers.cjs`, keeping `INK`, `WHITE`, `STEPS = 48`, `u = size / css`, `border = 6 * u`, `outline = 1.5 * u` and `shadow = round(6 * u)`. Three changes:
- `assertTransparent` uses `sharp(file).stats()`'s `isOpaque` and throws `"<file> has no transparency. Cut out the background and save it as a PNG."` before any baking.
- Resize uses `{ fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }`.
- Output is `<outDir>/<out>.webp` with `.webp({ quality: 88, alphaQuality: 100 })`.

When run directly, bake to `public/stickers/`: `src/img/personal-photo.png` as `personal-photo` (css 460, size 1000), and each `src/img/expertise/technology-logos/<name>.png` as `<name>` (css 112, size 224).

- [ ] **Step 5: Run them to confirm they pass**

Run: `npm run test:scripts`. Expected: `ℹ fail 0`.

- [ ] **Step 6: Implement `scripts/project-image.cjs` and generate all the images**

`node scripts/project-image.cjs <input> [name]` writes `public/projects/<name or basename>.webp` with `resize(700, 700, { fit: 'inside', withoutEnlargement: true })` and `.webp({ quality: 82, alphaQuality: 100 })`.

```bash
npm run bake
for p in soundcloud noggin nbc peachi; do npm run -s project-image -- "src/img/projects/$p.png"; done
git rm -rq src/img/projects
ls -l public/stickers public/projects
```

Expected: 7 stickers and 4 project images. Measured on the same art with these settings: photo about 61 KB, logos 3-11 KB, project images 24-68 KB.

- [ ] **Step 7: Replace `README.md`**

Replace the stock Create React App text with a title, one line on what the site is, how to run it (`npm start`), and a "Swap the hero photo" section: save a transparent PNG over `src/img/personal-photo.png`, run `npm run bake`, check the shape in a browser, then publish.

- [ ] **Step 8: Commit**

Message: `feat: add sticker bake and project image scripts with generated images`

---

### Task 4: The static page

**Files:**
- Create: `src/components/{nav,hero,clients,philosophy,process,skills,work,contact,footer}/<name>.tsx` and `.css`, `src/components/process/process-ball.ts`, `src/components/process/process-ball.test.ts`, `src/utils/assets.ts`, `scripts/verify/helpers.cjs`, `scripts/verify/page.test.cjs`
- Modify: `src/pages/home/home.tsx`, `src/App.test.tsx`, `src/theme.css`, `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: theme classes from Task 2; sticker files from Task 3.
- Produces for later tasks:
  - `stickerUrl(name: string): string` returning `` `${process.env.PUBLIC_URL}/stickers/${name}.webp` ``
  - Selectors `main > section`, `footer`, `.lid`, `.sk`, `.sheet`, `.cell img`, `#work-teardown`, and `#work .label`
  - Section ids `top clients philosophy process skills work contact`
  - `helpers.cjs`: `serveBuild(dir = 'build'): Promise<{ url, close }>`, `launchBrowser(): Promise<Browser>` (from `process.env.BROWSER`, default `chromium`), `openPage(browser, url, { width = 1176, height = 900, reducedMotion, device } = {}): Promise<Page>` with collected errors at `page.errors`
  - `npm run verify`

Port markup and CSS from `HTML`:

| Component | Markup lines | CSS lines |
|---|---|---|
| Nav | 203-209 | 43-54, 182, nav rules in 190-191 |
| Hero | 212-223 | 56-73, hero rules in 184, 189, 197 |
| Clients | 225-239 | 75-82, 96-97 |
| Philosophy | 241-248 | 99-110, notes rules in 185 |
| Process | 250-259 | 112-132, process rules in 192-194 |
| Skills | 261-272 | 134-139, 141-145, sheet rule in 186 |
| Work | 274-279 | 147-158, mat rules in 195 |
| Contact | 281-298 | 160-178, envelope rules in 196 |
| Footer | 300 | 179-180 |

The shared `section` padding on line 189 goes in `theme.css`.

- [ ] **Step 1: Write the failing tests**

`src/components/process/process-ball.test.ts`:
```ts
const c = [10, 110, 210, 310];
test('the ball stays on the line', () => {
  expect(ballOffset(-50, c, false)).toBe(10);
  expect(ballOffset(150, c, false)).toBe(150);
  expect(ballOffset(999, c, false)).toBe(310);
});
test('with reduced motion the ball hops between steps', () => {
  expect(ballOffset(150, c, true)).toBe(110);
});
test('steps light up once the ball reaches them', () => {
  expect(litSteps(110.5, c)).toEqual([true, true, false, false]);
});
```

`src/App.test.tsx`, added to the Task 2 test:
```tsx
test.each(['top', 'clients', 'philosophy', 'process', 'skills', 'work', 'contact'])('section #%s exists', (id) => {
  const { container } = render(<App />);
  expect(container.querySelector(`main > section#${id}`)).not.toBeNull();
});

test('the nav links go to their sections', () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Main' });
  const hrefs = within(nav).getAllByRole('link').map((a) => [a.textContent, a.getAttribute('href')]);
  expect(hrefs).toEqual([['CR', '#top'], ['Home', '#top'], ['Philosophy', '#philosophy'], ['Process', '#process'], ['Skills', '#skills'], ['Work', '#work'], ["Let's Talk", '#contact']]);
});

test('every piece of real copy is on the page', () => {
  const { container } = render(<App />);
  const text = container.textContent;
  REQUIRED_COPY.forEach((line) => expect(text).toContain(line));
});

test('contact details are visible and correct', () => {
  render(<App />);
  expect(screen.getByText('cjrieck123@gmail.com')).toHaveAttribute('href', 'mailto:cjrieck123@gmail.com');
  expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/Clayton_Rieck_Resume.pdf');
  expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/claytonrieck/');
  expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/cjrieck');
});

test('the footer shows the current year', () => {
  render(<App />);
  expect(screen.getByText(`© ${new Date().getFullYear()} Clayton Rieck`)).toBeInTheDocument();
});

test.each(['SoundCloud', 'NBC', 'WeWork', 'Nickelodeon', 'Credijusto', 'SiriusXM', 'OneEleven'])('%s logo keeps its name', (name) => {
  render(<App />);
  expect(screen.getByAltText(name)).toBeInTheDocument();
});

test('the current section is highlighted in the nav', () => {
  // replace window.IntersectionObserver with a class that pushes every instance's callback to `callbacks`
  render(<App />);
  act(() => callbacks.forEach((cb) => cb([{ isIntersecting: true, target: { id: 'process' } }])));
  expect(screen.getByRole('link', { name: 'Process' })).toHaveAttribute('aria-current', 'true');
  expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
});
```

`REQUIRED_COPY` lists, verbatim from `$MOCKUP/shared-brief.md`, every heading, paragraph, section label, skill name and level, and the footnote, plus the labels "Laptop lid", "Notes on the monitor", "Take a ticket", "Sticker sheet" and "Drag the slider to take it apart". Check it against `HTML`, not memory.

- [ ] **Step 2: Run them to confirm they fail**

Run: `CI=true npm test`. Expected: FAIL on missing sections and `process-ball`.

- [ ] **Step 3: Implement `process-ball.ts` and all sections**

- `process-ball.ts` exports `ballOffset(anchor: number, centers: number[], reduce: boolean): number`, `litSteps(y: number, centers: number[]): boolean[]`, and `mountProcessBall(steps: HTMLElement): () => void`, porting `HTML` lines 486-498. The anchor is `window.innerHeight * 0.55 - steps.getBoundingClientRect().top`, a step lights when `center <= y + 1`, and `mountProcessBall` removes its listeners on cleanup. `Process` calls it in a `useEffect`.
- `Nav` holds the only state on the page: the current section, from an `IntersectionObserver` with `rootMargin: '-45% 0px -50% 0px'` over `top, philosophy, process, skills, work`.
- `Clients` imports logos from `src/img/brand-logos/`. `Hero` and `Skills` use `stickerUrl`.
- Pass per-element rotations through `style={{ '--rot': '-2.2deg' } as React.CSSProperties}`.
- `Work` renders the header and `.mat > #work-teardown`, empty until Task 6.
- Differences from the mockup: Resume is `` `${process.env.PUBLIC_URL}/Clayton_Rieck_Resume.pdf` `` with `target="_blank" rel="noopener noreferrer"`, and the year comes from `new Date().getFullYear()`.

- [ ] **Step 4: Run them to confirm they pass**

Run: `CI=true npm test`. Expected: PASS.

- [ ] **Step 5: Write the browser checks**

Run `npm install --save-dev playwright@1.49.1` and `npx playwright install chromium firefox webkit`, and add `"verify": "npm run build && node --test --test-concurrency=1 \"scripts/verify/*.test.cjs\""` to `package.json`. Write `helpers.cjs`, then `page.test.cjs`:

```js
const WIDTHS = [360, 390, 768, 1024, 1176, 1440];

for (const width of WIDTHS) {
  test(`no sideways scrolling at ${width}`, async () => {
    const page = await openPage(browser, site.url, { width });
    const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }));
    assert.ok(sw <= iw);
    assert.deepEqual(page.errors, []);
  });

  test(`section links land below the nav at ${width}`, async () => {
    const page = await openPage(browser, site.url, { width });
    for (const id of ['philosophy', 'process', 'skills', 'work']) {
      await page.click(`nav a[href="#${id}"]`);
      await page.waitForFunction((i) => Math.abs(document.getElementById(i).getBoundingClientRect().top) < 200, id);
      await page.waitForTimeout(700);
      const { heading, nav } = await page.evaluate((i) => ({
        heading: document.querySelector(`#${i} h2`).getBoundingClientRect().top,
        nav: document.querySelector('nav').getBoundingClientRect().bottom,
      }), id);
      assert.ok(heading >= nav, `${id}: heading at ${heading}, nav ends at ${nav}`);
    }
  });
}

const ARRIVALS = [
  ['/#/projects', '#work', 'work'],
  ['/#/expertise', '#process', 'process'],
  ['/#work', '#work', 'work'],
  ['/#/apps/potpourri/privacy', '#top', 'top'],
];

for (const [path, hash, id] of ARRIVALS) {
  for (const width of [390, 1176]) {
    test(`arriving at ${path} at ${width} lands on #${id}`, async () => {
      const page = await openPage(browser, site.url + path, { width });
      await page.waitForTimeout(1000); // fonts loaded
      assert.equal(await page.evaluate(() => window.location.hash), hash);
      const { top, bottom, kids } = await page.evaluate((i) => {
        const r = document.getElementById(i).getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, kids: document.querySelector('main').children.length };
      }, id);
      assert.ok(top < 900 && bottom > 0, 'the section is in view');
      assert.ok(kids > 0, 'the page is not blank');
    });
  }
}
```

A `before` hook starts `serveBuild` and `launchBrowser`, and an `after` hook closes both.

- [ ] **Step 6: Make the heading checks pass**

Run: `npm run verify`. The phone nav wraps to two rows, so add `html { scroll-padding-top: ... }` under `max-width: 760px` in `theme.css`, using the smallest value that passes. Expected: `ℹ fail 0`.

- [ ] **Step 7: Compare with the mockup**

With Playwright, screenshot each section of `HTML` and of the built site at widths 1176 and 390, save them to a temp folder outside the repo, and view the pairs.
Expected: they match, apart from the Work section being empty and the footer year.

- [ ] **Step 8: Commit**

Message: `feat: port all static sections, nav highlight and process ball`

---

### Task 5: Project data and the launch gate

**Files:**
- Create: `src/data/projects.json`, `src/data/projects.ts`, `src/data/validate-projects.cjs`, `src/data/validate-projects.test.js`, `scripts/check-content.cjs`, `scripts/check-content.test.cjs`
- Modify: `package.json`, `README.md`

**Interfaces:**
- Produces in `projects.ts`:
```ts
export type Layer = { kind: string; title: string; note?: string };
export type Project = { id: string; title: string; summary: string; image?: string; imageAlt?: string; layers?: Layer[] };
export type TeardownData = { labels?: { whole?: string; parts?: string; part?: string }; projects: Project[] };
export const projectData: TeardownData;
export const PROJECT_IMAGE_BASE: string; // `${process.env.PUBLIC_URL}/projects/`
```
- Produces in `validate-projects.cjs`: `validateProjects(data, imageExists: (file: string) => boolean): string[]`, `findPlaceholderNotes(data): string[]`, `PLACEHOLDER_MARKER = '[placeholder]'`.
- CLI: `node scripts/check-content.cjs [--launch] [--file <path>]`.

- [ ] **Step 1: Write the failing tests in `src/data/validate-projects.test.js`**

```js
const fs = require('fs');
const path = require('path');
const { validateProjects, findPlaceholderNotes } = require('./validate-projects.cjs');

const good = () => ({ projects: [{ id: 'a', title: 'A', summary: 'S', image: 'a.webp', imageAlt: 'Alt',
  layers: [{ kind: 'app', title: 'The app', note: 'Words.' }] }] });
const ok = () => true;

test('a good file has no problems', () => expect(validateProjects(good(), ok)).toEqual([]));

test('layers may be empty or missing', () => {
  const d = good(); d.projects[0].layers = [];
  expect(validateProjects(d, ok)).toEqual([]);
  delete d.projects[0].layers;
  expect(validateProjects(d, ok)).toEqual([]);
});

test.each([
  ['a missing title', (d) => delete d.projects[0].title, /"a".*title/],
  ['a missing id', (d) => delete d.projects[0].id, /id/],
  ['a layer with no note', (d) => delete d.projects[0].layers[0].note, /"a".*note/],
  ['a layer with no kind', (d) => delete d.projects[0].layers[0].kind, /"a".*kind/],
  ['layers that is not a list', (d) => { d.projects[0].layers = 'app'; }, /"a".*layers/],
  ['a duplicate id', (d) => d.projects.push({ ...d.projects[0] }), /"a".*more than once/],
])('flags %s', (_name, breakIt, message) => {
  const d = good(); breakIt(d);
  expect(validateProjects(d, ok).join('\n')).toMatch(message);
});

test('flags an image file that does not exist', () => {
  expect(validateProjects(good(), () => false).join('\n')).toMatch(/a\.webp/);
});

test('lists every placeholder note by project and part', () => {
  const d = good(); d.projects[0].layers[0].note = '[placeholder] Your words here.';
  expect(findPlaceholderNotes(d)).toEqual(['A: The app']);
});

test('the real projects.json is valid', () => {
  const real = require('./projects.json');
  const exists = (f) => fs.existsSync(path.join(process.cwd(), 'public/projects', f));
  expect(validateProjects(real, exists)).toEqual([]);
});
```

`scripts/check-content.test.cjs`, using `spawnSync` with `--file` pointing at temp fixtures:
```js
test('a good file passes, with and without --launch', ...);      // exit 0 for both
test('a stray comma gives a plain message', ...);                // exit 1, stderr matches /isn't valid JSON/
test('--launch refuses placeholders and names them', ...);       // exit 1, stderr contains 'A: The app'
test('without --launch placeholders are allowed', ...);          // exit 0
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `CI=true npm test` and `npm run test:scripts`. Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

- `validate-projects.cjs` is CommonJS and takes no file paths, so Jest and Node can both use it. Each message says what to fix in plain words, naming the project: `Project "a" is missing its title.`
- `check-content.cjs` reads `src/data/projects.json` or `--file`, checks images in `public/projects/`, prints problems to stderr and exits 1, otherwise prints `Project content looks good.` With `--launch` it also fails on placeholders, printing `Still placeholder text:` followed by the list.
- `projects.json` comes from `$MOCKUP/projects.js`: same labels, ids, titles, summaries, `imageAlt` and layers. Images become `soundcloud.webp`, `noggin.webp`, `nbc.webp`, `peachi.webp`. Every note starts with `[placeholder] `.
- `projects.ts` imports the JSON and casts it to `TeardownData`.
- `package.json`: `"predeploy": "node scripts/check-content.cjs --launch && npm run build"`.

- [ ] **Step 4: Run them to confirm they pass**

Run: `CI=true npm test` and `npm run test:scripts`. Expected: PASS.

- [ ] **Step 5: Confirm the gate blocks a deploy**

Run: `npm run predeploy; echo "exit $?"` (never `npm run deploy`).
Expected: lists every project's placeholder notes and ends with a non-zero exit, without building.

- [ ] **Step 6: Add a README section**

Add "Edit project content": the file path; what each field means; that an omitted layer disappears and numbering closes up; that `kind` picks the drawing (`app`, `services`, `infrastructure`) and any other kind shows its title on a plain plate; that empty `layers` means no slider; how to add a project (`npm run project-image -- <path>` plus one JSON entry); that notes start with `[placeholder]` until written, and `npm run deploy` refuses to run until none remain; and how to publish.

- [ ] **Step 7: Commit**

Message: `feat: add editable project data, validation and launch gate`

---

### Task 6: The teardown

**Files:**
- Create: `src/components/teardown/teardown-logic.ts`, `teardown-logic.test.ts`, `teardown-engine.ts`, `teardown-engine.test.ts`, `teardown.css`
- Modify: `src/components/work/work.tsx`

**Interfaces:**
- Consumes: `TeardownData`, `Project`, `Layer`, `projectData`, `PROJECT_IMAGE_BASE` from Task 5; `#work-teardown` and `#work .label` from Task 4.
- Produces:
```ts
export const SNAP_AT = 0.5, NOTES_FROM = 0.28, REVEAL = 0.7, TOSS = 0.42, TOSS_STAGGER = 0.045, STIFFNESS_FLOOR = 35;
export function snapsToParts(fraction: number): boolean;
export function plateStiffness(i: number): number;   // max(35, 260 - i * 45)
export function arrivalStiffness(i: number): number; // max(35, 300 - i * 40)
export function plateSpread(plateCount: number): number;
export type PartRow = { layer: Layer; plate: number; label: string };
export function splitLayers(project: Project, partWord: string): { under: Layer[]; rows: PartRow[] };
export function mountTeardown(root: HTMLElement, data: TeardownData,
  opts?: { imageBase?: string; onSelect?: (hasParts: boolean) => void }): () => void;
```

- [ ] **Step 1: Write the failing tests in `teardown-logic.test.ts`**

```ts
const project = (layers: Layer[]): Project => ({ id: 'x', title: 'X', summary: 'S', layers });

test('a release at 50% or more goes to the parts', () => {
  expect(snapsToParts(0.5)).toBe(true);
  expect(snapsToParts(0.49)).toBe(false);
});
test('stiffness is unchanged up to six plates', () => {
  expect([0, 1, 2, 3, 4, 5].map(plateStiffness)).toEqual([260, 215, 170, 125, 80, 35]);
  expect([0, 1, 2, 3, 4, 5].map(arrivalStiffness)).toEqual([300, 260, 220, 180, 140, 100]);
});
test('stiffness never drops below the floor', () => {
  expect(plateStiffness(6)).toBe(35);
  expect(plateStiffness(20)).toBe(35);
  expect(arrivalStiffness(8)).toBe(35);
});
test('plates spread by the approved formula', () => {
  expect(plateSpread(1)).toBe(0);
  expect(plateSpread(2)).toBe(120);
  expect(plateSpread(4)).toBe(86);
});
test('an omitted layer closes up the numbering', () => {
  const { rows } = splitLayers(project([{ kind: 'app', title: 'A' }, { kind: 'services', title: 'S' }]), 'Part');
  expect(rows.map((r) => [r.label, r.plate])).toEqual([['Part 01', 1], ['Part 02', 2]]);
});
test('interface labels the top plate and adds no plate of its own', () => {
  const { under, rows } = splitLayers(project([{ kind: 'interface', title: 'I' }, { kind: 'app', title: 'A' }]), 'Part');
  expect(under.map((l) => l.kind)).toEqual(['app']);
  expect(rows.map((r) => [r.label, r.plate])).toEqual([['Part 01', 0], ['Part 02', 1]]);
});
test('missing layers means no parts', () => {
  expect(splitLayers({ id: 'x', title: 'X', summary: 'S' }, 'Part')).toEqual({ under: [], rows: [] });
});
```

- [ ] **Step 2: Write the failing tests in `teardown-engine.test.ts`**

Fixture projects: `full` (`interface`, `app` and an unknown kind `mystery`, notes `One.`, `Two.`, `Three.`), `none` (`layers: []`), `missing` (no `layers` key), `single` (`interface` only). `mount()` appends a div to the body and calls `mountTeardown`, and `afterEach` calls the returned cleanup.

```ts
test('notes are numbered and plain text', () => {
  const labels = [...root.querySelectorAll('.td-note-label')].map((n) => n.textContent);
  expect(labels).toEqual(['Part 01', 'Part 02', 'Part 03']);
  expect(root.querySelector('.td-ph')).toBeNull();
  expect(root.querySelector('.td-note p')).toHaveTextContent('One.');
});
test('an unknown kind gets a plain plate with its title', () => {
  expect(root.querySelector('.td-plain')).toHaveTextContent('Mystery');
});
test('no slider when layers is empty or missing, and onSelect reports it', () => {
  click(tab('None'));
  expect(control().hidden).toBe(true);
  expect(onSelect).toHaveBeenLastCalledWith(false);
  click(tab('Missing'));
  expect(control().hidden).toBe(true);
  click(tab('Full'));
  expect(control().hidden).toBe(false);
  expect(onSelect).toHaveBeenLastCalledWith(true);
});
test('interface only still shows the slider and one note', () => {
  click(tab('Single'));
  expect(control().hidden).toBe(false);
  expect(root.querySelectorAll('.td-note')).toHaveLength(1);
  expect(root.querySelectorAll('.td-layer')).toHaveLength(1);
});
test('notes are hidden in the product view', () => {
  expect(root.querySelector<HTMLElement>('.td-notes')!.style.visibility).toBe('hidden');
});
test('releasing at 49 stays on the product and at 50 goes to the parts', () => {
  drag(input, 49); expect(input).toHaveAttribute('aria-valuetext', 'The Product');
  drag(input, 50); expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
});
test('arrow keys, Home and End jump between states', () => {
  fireEvent.keyDown(input, { key: 'ArrowRight' }); expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
  fireEvent.keyDown(input, { key: 'Home' }); expect(input).toHaveAttribute('aria-valuetext', 'The Product');
  fireEvent.keyDown(input, { key: 'End' }); expect(input).toHaveAttribute('aria-valuetext', 'The Parts');
});
test('switching projects keeps focus and does not rebuild the tabs', () => {
  const t = tab('None'); t.focus(); click(t);
  expect(document.activeElement).toBe(t);
  expect(tab('None')).toBe(t);
  expect(t).toHaveAttribute('aria-pressed', 'true');
});
test('cleanup removes everything, so mounting twice leaves one teardown', () => {
  const clear = jest.spyOn(window, 'clearInterval');
  stop();
  expect(root.innerHTML).toBe('');
  expect(clear).toHaveBeenCalled();
  stop = mountTeardown(root, data);
  expect(root.querySelectorAll('.td-stage')).toHaveLength(1);
});
```

Test helpers:
- `control = () => root.querySelector<HTMLElement>('.td-control')!`
- `input` is the range input.
- `tab(title)` finds the `.td-tab` with that text.
- `click` is `fireEvent.click`.
- `drag` dispatches `pointerdown` on the input, sets `value`, dispatches `input`, then dispatches `pointerup` on `window`.

- [ ] **Step 3: Run them to confirm they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/components/teardown`. Expected: FAIL, modules not found.

- [ ] **Step 4: Implement `teardown-logic.ts`**

- [ ] **Step 5: Implement `teardown-engine.ts`**

Port `$MOCKUP/teardown.js` to TypeScript with every number unchanged, using `teardown-logic.ts` for its constants and layer split. Only these things change:

1. **Plain notes:** `body.textContent = layer.note`, with no `.td-ph` span.
2. **Stiffness:** the frame loop uses `plateStiffness(i)` and `arrivalStiffness(i)`.
3. **Notes never clip on desktop (640 px and up):** `fitStage()` lays each project's notes into a hidden `<ol class="td-notes td-notes-measure">` at the real column width and takes the tallest natural height plus 14 px per note. With `chrome = stage.offsetHeight - notesBox.offsetHeight`, it sets `stage.style.height` if `chrome + tallest` exceeds `--td-height`, otherwise clears it. It runs on mount, on `document.fonts.ready` and on resize. Below 640 px it clears the height.
4. **No height jump on phones (below 640 px):** replace `maxHeight = ceil(t1 * scrollHeight)` with `height = ceil(t1 * H.x)`, where `H` is a new critically damped spring (k=260, c=32) chasing the current notes' natural height: the last note's bottom edge relative to `notesBox`, plus its 10 px margin. Add `H` to the `busy` check; `settle()` and reduced motion snap it. Clear `height` at 640 px and up.
5. **`onSelect(rows.length > 0)`** is called at the end of `build()`.
6. **Cleanup:** the returned function removes every listener through one `AbortController` (including the `matchMedia` ones), clears the interval and timeouts, disconnects the observer, cancels the animation frame, empties `root` and removes the `td` class.

Prefix the restricted globals per Global Constraints.

- [ ] **Step 6: Run them to confirm they pass**

Run the Step 3 command. Expected: PASS.

- [ ] **Step 7: Add the CSS and wire up `Work`**

- `teardown.css`: port `$MOCKUP/teardown.css`. Remove `.td-ph` and `--td-highlight`, add `.td-note p { overflow-wrap: anywhere; }` and `.td-notes-measure { position: absolute; visibility: hidden; display: block; height: auto; overflow: visible; pointer-events: none; }`. Don't add `overflow: hidden` to `.td-scene`.
- `Work`: `useEffect(() => mountTeardown(el, projectData, { imageBase: PROJECT_IMAGE_BASE, onSelect }), [])`. `onSelect` sets `visibility` on the "Drag the slider to take it apart" label through a ref, so no React state is involved.

- [ ] **Step 8: Verify**

Run the standard checks. Expected: all pass.

- [ ] **Step 9: Commit**

Message: `feat: port the teardown with note fitting, stiffness floor and cleanup`

---

### Task 7: Teardown browser checks and Clayton's first look

**Files:**
- Create: `scripts/verify/teardown.test.cjs`, `scripts/verify/long-notes.test.cjs`, `scripts/measure-note-length.cjs`
- Modify: `README.md`, and teardown code if checks fail

**Interfaces:**
- Consumes: `helpers.cjs` from Task 4; `mountTeardown` behavior from Task 6.
- Produces: the measured note length table, in the Run log and the README.

- [ ] **Step 1: Write `scripts/verify/teardown.test.cjs` against the real data**

```js
test('stage stays at the approved 610 px when notes fit', ...);
// at 1176: document.querySelector('.td-stage').offsetHeight === 610 for every tab

test('dragging past halfway snaps to the parts, short of it snaps back', ...);
// real mouse on the slider: release at 40% → aria-valuetext 'The Product'; at 60% → 'The Parts'

test('rapid tab clicks end on the last project with nothing left over', ...);
// parts view; click tabs in sequence 8 times, 30 ms apart; wait 2 s, then assert:
// .td-tossed count 0, .td-notes-out count 0, the last-clicked tab has aria-pressed true,
// .td-note count equals that project's part count, every note has opacity 1

test('notes are hidden after going back to the product view', ...);
// continuing from rapid clicking: click 'The Product', wait 1.5 s:
// getComputedStyle('.td-notes').visibility === 'hidden', same for '.td-leaders'

test('keyboard: slider keys and focus stay put', ...);
// focus the range input; End → 'The Parts'; Home → 'The Product';
// focus a tab, press Enter → it's selected and document.activeElement is still that tab

test('phone: switching projects in the parts view does not jump the page', ...);
// width 390, parts view on Noggin; sample document.documentElement.scrollHeight every animation frame
// while switching to SoundCloud; totalChange = |last - first|;
// assert totalChange > 0 and the largest single-frame change < totalChange / 2

test('project switching keeps the frame rate', { skip: process.env.BROWSER && process.env.BROWSER !== 'chromium' }, ...);
// average frame time during one switch <= 20 ms (mockup averaged 17 ms)

test('every project image is decoded before its tab is clicked', ...);
// after load, every <img> for public/projects has complete === true; cards are never blank mid-switch
```

Also assert `page.errors` is empty in each test.

- [ ] **Step 2: Write `scripts/verify/long-notes.test.cjs`**

`before`: copy `src/data/projects.json` aside, write the fixture over it, and build with `BUILD_PATH` set to a temp folder through `react-scripts build`. Restore the real file in a `finally`, whatever happens. The fixture uses the real images and four projects:
- `long`: four layers with 300-character notes
- `short`: two layers with short notes
- `empty`: `layers: []`
- `many`: seven under-layers, one with an unknown kind

```js
for (const width of [768, 1176, 1440]) test(`no note is clipped at ${width}`, ...);
// for each project, in the parts view: .td-notes scrollHeight <= clientHeight + 1

test('desktop stage height is the same for every project', ...);   // no page jump on switch
test('stage grows past 610 px only because the notes need it', ...); // offsetHeight > 610 here
test('no slider and no slider label on a project with no parts', ...);
// 'empty' tab: .td-control hidden, label visibility 'hidden'; next tab: both visible again
test('seven plates still animate', ...);
// 'many' tab, parts view: no plate's style.transform contains 'NaN', page.errors is empty
test('an unknown kind shows its title on a plain plate', ...);
test('phone: long notes stay readable', ...);
// width 360, parts view: the last note's bottom edge is inside the stage
```

- [ ] **Step 3: Run the checks and fix what fails**

Run: `npm run verify`. Expected: `ℹ fail 0`, and `git status --short src/data/projects.json` shows nothing.

- [ ] **Step 4: Measure the note length and record it**

`scripts/measure-note-length.cjs` opens the built page and, at window widths 1176 and 1440, for 1 to 4 parts, finds by binary search the longest note (ordinary words) where `chrome + total notes height + 14 px per note` still fits in 610 px. It prints a table. Run it, copy the table into the Run log, and add "Aim for about N characters a note" to the README's "Edit project content" section, using the 1176 column.

- [ ] **Step 5: Commit**

Message: `test: add teardown browser checks and measure note length`

- [ ] **Step 6: Clayton: click through the teardown**

Run `npm run build`, then `python3 -m http.server 8765 --bind 0.0.0.0 --directory build` in the background. Ask Clayton to try the Work section at `http://127.0.0.1:8765/` in desktop Chrome and Safari, and on their phone at `http://<address>:8765/`: drag slowly, release on both sides of halfway, switch projects in both views, and click tabs quickly. Ask whether it feels like the mockup. Give them the note length table now, so they can start writing their notes in `src/data/projects.json`. Make their changes, then ask again until they're happy. Stop the server afterward.

---

### Task 8: Stickers

**Files:**
- Create: `src/components/stickers/sticker-logic.ts`, `sticker-logic.test.ts`, `sticker-engine.ts`, `sticker-engine.test.ts`, `stickers.css`
- Modify: `src/pages/home/home.tsx`, `README.md`

**Interfaces:**
- Consumes: selectors from Task 4; Run log values from Task 1.
- Produces:
```ts
export const STICKERS_ON_TOUCH: boolean; // the Task 1 result
export const LIFT = 1.12, TILT = 16, HOLD = 400, TOUCH_DELAY = 70, HOME = 70; // or the tuned values from Task 1
export type Box = { left: number; top: number; width: number; height: number };
export function canPeel(pointerType: string, onTouch: boolean): boolean;
export function isNearHome(x: number, y: number, home: Box): boolean;
export function placementPercent(x: number, y: number, host: { left: number; top: number; clientLeft: number; clientTop: number; clientWidth: number; clientHeight: number }): { left: number; top: number };
export function surfaceIndexAt(y: number, surfaces: { top: number; bottom: number }[]): number;
export function aimPoint(px: number, py: number, ox: number, oy: number, floatUp: number, w: number, h: number, vw: number, vh: number): [number, number];
export function edgeScrollAmount(py: number, vh: number, dt: number): number;
export function mountStickers(opts?: { onTouch?: boolean }): () => void;
```

- [ ] **Step 1: Write the failing tests in `sticker-logic.test.ts`**

```ts
test('placement is a percentage of the section it landed on', () => {
  const host = { left: 100, top: 100, clientLeft: 0, clientTop: 3, clientWidth: 800, clientHeight: 400 };
  expect(placementPercent(300, 200, host)).toEqual({ left: 25, top: 24.25 });
});
test('dropping within 70 px of home sends it home', () => {
  const home = { left: 90, top: 90, width: 20, height: 20 };
  expect(isNearHome(169, 100, home)).toBe(true);
  expect(isNearHome(170, 100, home)).toBe(false);
});
test('a drop lands on the section under it, or the last one past the end', () => {
  const s = [{ top: 0, bottom: 100 }, { top: 100, bottom: 200 }];
  expect(surfaceIndexAt(150, s)).toBe(1);
  expect(surfaceIndexAt(999, s)).toBe(1);
});
test('a sticker cannot be carried off screen', () => {
  expect(aimPoint(-500, 300, 0, 0, 0, 100, 100, 800, 600)).toEqual([35, 300]);
  expect(aimPoint(5000, 5000, 0, 0, 0, 100, 100, 800, 600)).toEqual([765, 565]);
});
test('on touch a lifted sticker floats 30 px above the finger', () => {
  expect(aimPoint(400, 300, 0, 0, 1, 100, 100, 800, 600)).toEqual([400, 270]);
});
test('the page scrolls only near the top or bottom edge', () => {
  expect(edgeScrollAmount(400, 800, 0.016)).toBe(0);
  expect(edgeScrollAmount(0, 800, 0.016)).toBeCloseTo(-14.4);
  expect(edgeScrollAmount(800, 800, 0.016)).toBeCloseTo(14.4);
});
test('touch and pen follow the switch, a mouse always works', () => {
  expect(canPeel('mouse', false)).toBe(true);
  expect(canPeel('touch', false)).toBe(false);
  expect(canPeel('pen', false)).toBe(false);
  expect(canPeel('touch', true)).toBe(true);
});
```

- [ ] **Step 2: Write the failing tests in `sticker-engine.test.ts`**

Set up a `.lid > figure.sk > img` inside `main > section`, stub `global.DOMMatrix` with a class holding `a = 1; b = 0`, and use fake timers. `press(el, pointerType)` builds `new Event('pointerdown', { bubbles: true })`, assigns `{ pointerType, isPrimary: true, button: 0, pointerId: 1, clientX: 5, clientY: 5 }`, and dispatches it.

```ts
test('a touch press does nothing when stickers are off on touch', () => {
  stop = mountStickers({ onTouch: false });
  press(sticker, 'touch');
  jest.advanceTimersByTime(500);
  expect(document.querySelectorAll('.peeled')).toHaveLength(0);
});
test('a touch press starts the peel after the touch delay when on', () => {
  stop = mountStickers({ onTouch: true });
  press(sticker, 'touch');
  jest.advanceTimersByTime(TOUCH_DELAY - 1);
  expect(document.querySelectorAll('.peeled')).toHaveLength(0);
  jest.advanceTimersByTime(1);
  expect(document.querySelectorAll('.peeled')).toHaveLength(1);
});
test('a moving copy is hidden from screen readers and the original keeps its alt', () => {
  stop = mountStickers({ onTouch: true });
  press(sticker, 'mouse');
  expect(document.querySelector('#hand .loose')).toHaveAttribute('aria-hidden', 'true');
  expect(sticker.querySelector('img')).toHaveAttribute('alt', 'SoundCloud');
});
test('cleanup leaves nothing behind, so mounting twice leaves one hand', () => {
  stop = mountStickers({ onTouch: true });
  press(sticker, 'mouse');
  stop();
  expect(document.getElementById('hand')).toBeNull();
  expect(document.querySelectorAll('.peeled, .loose')).toHaveLength(0);
  expect(document.documentElement.classList.contains('holding')).toBe(false);
  stop = mountStickers();
  expect(document.querySelectorAll('#hand')).toHaveLength(1);
});
```

- [ ] **Step 3: Run them to confirm they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/components/stickers`. Expected: FAIL, modules not found.

- [ ] **Step 4: Implement `sticker-logic.ts`**

Port the formulas from `HTML` lines 346-349, 366-367 and 436-442. Use the Task 1 values for the constants.

- [ ] **Step 5: Implement `sticker-engine.ts`**

Port `HTML` lines 312-483 to TypeScript with every number unchanged, and carry over `behavior: 'instant'` in the edge scroll and the release-event position in the drop code. Only these things change:
- Surfaces are `document.querySelectorAll('main > section, footer')`.
- `pointerdown` returns early unless `canPeel(e.pointerType, onTouch)`, where `onTouch` defaults to `STICKERS_ON_TOUCH`.
- Cleanup removes all listeners through one `AbortController`, clears timers, cancels the animation frame, removes `#hand` and every `.loose`, removes `.peeled` from originals, and removes `holding` from `<html>`.

- [ ] **Step 6: Run them to confirm they pass**

Run the Step 3 command. Expected: PASS.

- [ ] **Step 7: Add the CSS and wire it into `Home`**

`stickers.css` holds `HTML` lines 83-95 and 140, and `Home` calls `useEffect(() => mountStickers(), [])`. Keep `.sk`'s `touch-action`, `cursor: grab`, `user-select` and `-webkit-touch-callout` rules where Task 4 ported them. Add to the README: "Stickers on touch screens: set `STICKERS_ON_TOUCH` in `sticker-logic.ts`."

- [ ] **Step 8: Verify**

Run the standard checks. Expected: all pass.

- [ ] **Step 9: Commit**

Message: `feat: port the sticker easter egg with a touch switch and cleanup`

---

### Task 9: Sticker browser checks and Clayton's second look

**Files:**
- Create: `scripts/verify/stickers.test.cjs`
- Modify: sticker code if checks fail; `scripts/bake-stickers.cjs`, `src/utils/assets.ts` and `public/stickers/` only if the foil mask fails in Safari

**Interfaces:**
- Consumes: `helpers.cjs`, `mountStickers` behavior.
- Produces: final decisions on the sticker format and `STICKERS_ON_TOUCH`, in the Run log.

Reuse the techniques in `peel-check.cjs` and `touch-check.cjs` in `/Users/clayton/Projects/cjrieck.github.io/.superpowers/handoff/`. The WebKit and Android touch checks use simulated pointer events, which prove the logic, not the feel.

- [ ] **Step 1: Write `scripts/verify/stickers.test.cjs`**

```js
// Real mouse:
test('a plain click lies back down', ...);          // after up + 800 ms: .peeled 0, #hand empty
test('holding comes free without moving', ...);     // after 550 ms: <html> has .holding
test('moving 3 px picks it up at once', ...);       // .holding true right after the move
test('a drop stays in the section under it', ...);  // .loose parent is that <section>; style.left/top end in '%'
test('nothing is lost while peeled', ...);          // original still has its alt; .sk.peeled still shows the logo; skill tag text stays
test('dropping within 70 px sends it home', ...);   // after settling: .peeled 0, .loose 0
test('a click on a placed sticker lands on what it covers', ...); // drop on a nav-linked button, click: hash changes
test('releasing a drag over a project tab does not trigger it', ...); // selected tab unchanged
test('carrying to the bottom edge scrolls the page', ...);        // scrollY grows
test('a sticker cannot leave the screen', ...);     // center stays within the viewport while held
test('placed stickers sit under the nav', ...);     // .loose z-index 50, nav 60
test('resizing keeps a placed sticker in its section with no sideways scroll', ...);
// drop near the right edge at 1176, resize to 390: parent is the same section, scrollWidth <= innerWidth

test('carrying holds the frame rate', { skip: process.env.BROWSER && process.env.BROWSER !== 'chromium' }, ...);
// average frame <= 20 ms over 800 ms while held (mockup ran about 60 fps)

// Simulated touch, in WebKit with devices['iPhone 13'] and Chromium with devices['Pixel 7']:
test('touch: a quick swipe scrolls and nothing peels', ...);      // move > 10 px within 30 ms: .peeled 0, touchmove not blocked
test('touch: a slow swipe puts the sticker back', ...);           // move at 200 ms: .peeled 0, touchmove not blocked
test('touch: a hold comes free and blocks scrolling only then', ...); // at 200 ms not blocked; at 550 ms blocked
test('touch: a cancelled carry never stays stuck to the finger', ...);
// after coming free, fire pointercancel: .holding false; after 800 ms #hand is empty
test('touch: a press does nothing when the switch is off', { skip: touchOn }, ...); // after 600 ms: .peeled 0
```

`const touchOn = /STICKERS_ON_TOUCH[^=]*=\s*true/.test(fs.readFileSync('src/components/stickers/sticker-logic.ts', 'utf8'));` The other touch tests take `{ skip: !touchOn }`. Each touch block launches its own browser, whatever `BROWSER` says. Timings above assume the default constants; use the Run log values if Task 1 tuned them.

- [ ] **Step 2: Run the checks and fix what fails**

Run: `npm run verify`. Expected: `ℹ fail 0`.

- [ ] **Step 3: Commit**

Message: `test: add sticker browser checks`

- [ ] **Step 4: Clayton: try the stickers**

Run `npm run build`, then `python3 -m http.server 8765 --bind 0.0.0.0 --directory build` in the background. Ask Clayton to try them in desktop Chrome and Safari and on their phone: peel, carry, drop on another section, drop back home, and click a sticker placed over a link. Ask them to look at the foil in Safari in particular, because the stickers are now WebP masks rather than the mockup's PNG.

- [ ] **Step 5: Act on the answers and record them**

- If the foil breaks in real Safari, change `.webp(...)` to `.png({ compressionLevel: 9 })` in `bake-stickers.cjs` and the extension in `stickerUrl`, then re-run `npm run bake` and the bake tests.
- If the phone peel still feels wrong after tuning, set `STICKERS_ON_TOUCH = false` (spec decision 13).
- Stop the server, fill in the Run log, re-run `npm run verify`, and commit any changes with message `fix: apply sticker checkpoint feedback`.

---

### Task 10: Analytics, link previews and browser colors

**Files:**
- Create: `src/utils/analytics.ts`, `src/utils/analytics.test.ts`, `scripts/make-og-image.cjs`, `scripts/verify/analytics.test.cjs`, `public/og-image.png`
- Modify: `public/index.html`, `public/site.webmanifest`, `public/browserconfig.xml`, `src/components/teardown/teardown-engine.ts`, `src/components/teardown/teardown-engine.test.ts`, `src/components/stickers/sticker-engine.ts`, `src/components/contact/contact.tsx`, `src/App.test.tsx`, `package.json`, `README.md`

**Interfaces:**
- Consumes: `helpers.cjs`; the teardown's `setState`, `switchTo` and `IntersectionObserver`; the sticker engine's `pickUp`.
- Produces:
```ts
export type SiteEvent = 'contact-clicked' | 'work-reached' | 'parts-viewed' | 'sticker-peeled';
export function trackOnce(name: SiteEvent, data?: Record<string, string>): void;
```
  with `window.umami` declared in `analytics.ts`; `npm run og`.

- [ ] **Step 1: Write the failing tests**

`src/utils/analytics.test.ts`, using `jest.isolateModules` to get a fresh `trackOnce` per test:
```ts
test('sends each event once per page load', () => {
  const track = jest.fn();
  window.umami = { track };
  trackOnce('work-reached'); trackOnce('work-reached'); trackOnce('sticker-peeled');
  expect(track.mock.calls).toEqual([['work-reached'], ['sticker-peeled']]);
});
test('each distinct detail counts once', () => {
  const track = jest.fn();
  window.umami = { track };
  trackOnce('parts-viewed', { project: 'noggin' });
  trackOnce('parts-viewed', { project: 'noggin' });
  trackOnce('parts-viewed', { project: 'peachi' });
  expect(track.mock.calls).toEqual([['parts-viewed', { project: 'noggin' }], ['parts-viewed', { project: 'peachi' }]]);
});
test('does nothing when the script is blocked, and a later call sends once it exists', () => {
  delete window.umami;
  expect(() => trackOnce('work-reached')).not.toThrow();
  const track = jest.fn();
  window.umami = { track };
  trackOnce('work-reached');
  expect(track).toHaveBeenCalledTimes(1);
});
test('a tracker that throws never reaches the page', () => {
  window.umami = { track: () => { throw new Error('boom'); } };
  expect(() => trackOnce('sticker-peeled')).not.toThrow();
});
```

`teardown-engine.test.ts`, adding `jest.mock('../../utils/analytics')`:
```ts
test('a project counts as viewed when it reaches the parts, not before', () => {
  drag(input, 49);
  expect(trackOnce).not.toHaveBeenCalled();
  drag(input, 50);
  expect(trackOnce).toHaveBeenCalledWith('parts-viewed', { project: 'full' });
});
test('switching projects in the parts view counts the new project', () => {
  fireEvent.keyDown(input, { key: 'End' });
  click(tab('Single'));
  expect(trackOnce).toHaveBeenCalledWith('parts-viewed', { project: 'single' });
});
test('a project with no parts is never counted', () => {
  fireEvent.keyDown(input, { key: 'End' });
  click(tab('None'));
  expect(trackOnce).not.toHaveBeenCalledWith('parts-viewed', { project: 'none' });
});
```

`src/App.test.tsx`, adding `jest.mock('./utils/analytics')`. jsdom can't navigate, so each test adds a click listener on the link that calls `preventDefault`:
```tsx
test.each([
  ['Resume', 'resume'],
  [/LinkedIn/, 'linkedin'],
  [/GitHub/, 'github'],
  ['cjrieck123@gmail.com', 'email'],
])('clicking %s counts as contact via %s', (name, via) => {
  render(<App />);
  fireEvent.click(screen.getByRole('link', { name }));
  expect(trackOnce).toHaveBeenCalledWith('contact-clicked', { via });
});
test("the envelope's Let's Talk counts as email, the nav's does not", () => {
  render(<App />);
  fireEvent.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: "Let's Talk" }));
  expect(trackOnce).not.toHaveBeenCalled();
  fireEvent.click(within(document.getElementById('contact')!).getByRole('link', { name: "Let's Talk" }));
  expect(trackOnce).toHaveBeenCalledWith('contact-clicked', { via: 'email' });
});
```

- [ ] **Step 2: Run them to confirm they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/utils/analytics.test.ts src/components/teardown src/App.test.tsx`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement and wire in `trackOnce`**

`analytics.ts` keys "already sent" on the name plus `JSON.stringify(data)`. It calls `window.umami.track(name)` when there's no data and `window.umami.track(name, data)` otherwise, and marks a key sent only when `window.umami` exists. Umami has no queue, so an event fired while the script is missing is dropped unless a later call sends it. Wire it in here:

| Event | Where |
|---|---|
| `contact-clicked` | `onClick` on Contact's email address and Let's Talk button (`via: 'email'`), and the chips (`'resume'`, `'linkedin'`, `'github'`). Never call `preventDefault`, and never use `data-umami-event`: that attribute makes Umami's script hold a same-tab link until its request finishes |
| `work-reached` | The first `isIntersecting` in the teardown's existing `IntersectionObserver` callback |
| `parts-viewed` | With `{ project: currentId }`: in the teardown's `setState` when `layered` is true, and at the end of `switchTo`, on both the animated and reduced-motion paths, when `target === 1` and the new project has parts |
| `sticker-peeled` | The sticker engine's `pickUp` |

- [ ] **Step 4: Run them to confirm they pass**

Run the Step 2 command. Expected: PASS.

- [ ] **Step 5: Update the page metadata**

In the `<head>` of `public/index.html`, add exactly:
```html
<script defer src="https://cloud.umami.is/script.js" data-website-id="aaa94160-a53a-4982-b472-fb37faadda6e" data-domains="claytonrieck.com"></script>
```
- Set `og:image` and `twitter:image` to `https://claytonrieck.com/og-image.png`.
- Set `theme-color` and `msapplication-TileColor` to `#f7c233`, and add `<link rel="preload" as="image" href="%PUBLIC_URL%/stickers/personal-photo.webp">`, using `.png` if the Run log says so.
- `public/site.webmanifest`: `name` and `short_name` become `Clayton Rieck`, `theme_color` becomes `#f7c233`, `background_color` becomes `#fbf1dc`.
- `public/browserconfig.xml`: `TileColor` becomes `#f7c233`.

- [ ] **Step 6: Write `scripts/verify/analytics.test.cjs`**

Serve the build as if it were the real domain: a context route on `https://claytonrieck.com/**` fulfills from `build/`. A route on `**/api/send` records each `JSON.parse(postData)` and fulfills `{}`, so nothing reaches Clayton's real stats (the script sends to `gateway.umami.is`, not `cloud.umami.is`). Routes on `linkedin.com` and `github.com` fulfill an empty page, so popups never hit the real sites. Page views and custom events both use `type: 'event'`, so match on `payload.name`, which page views don't have. `payload.data` appears only when an event has details, so `work-reached` and `sticker-peeled` won't have it. To keep the mail app from opening, a `window` bubble-phase click listener records `event.defaultPrevented` first and then prevents the default.

```js
test('one page view, however many section links are clicked', ...); // click all nav links: 1 send with no name
test('an old link counts as one page view', ...);                   // open /#/projects: 1 send with no name, window.location.hash '#work'
test('work-reached fires once, when the teardown comes into view', ...);
// 0 at the top of the page; 1 after scrolling to #work; still 1 after scrolling away and back
test('parts-viewed fires once per project', ...);
// 'The Parts' on SoundCloud, back, then again: one { project: 'soundcloud' };
// switch to Noggin while in the parts view: one { project: 'noggin' }; a release below halfway adds nothing
test('sticker-peeled fires once per page load', ...);               // a plain click: 0; peel twice: 1
test('contact clicks fire once per route', ...);
// email, resume, linkedin, github: one send each with the right via; the nav's Let's Talk: none
test('contact links never wait for Umami', ...);
// **/api/send never answers: email link's recorded defaultPrevented is false; Resume's popup opens within 1 s
test('nothing is sent from local development', ...);                // on 127.0.0.1: 0 sends
test('the site works with the script blocked', ...);
// abort cloud.umami.is: tabs, slider and contact links work, page.errors empty
```

- [ ] **Step 7: Run the checks**

Run: `npm run verify`. Expected: `ℹ fail 0`. If section links inflate page views, add `data-exclude-hash="true"` to the snippet.

- [ ] **Step 8: Generate the link preview**

`scripts/make-og-image.cjs` serves `build/`, opens it at 1200×630 with device scale 1, injects `.navwrap { display: none } .hero { padding: 32px 0; min-height: 630px }`, waits for fonts and images, and takes a `clip: { x: 0, y: 0, width: 1200, height: 630 }` screenshot to `public/og-image.png`. Add `"og": "npm run build && node scripts/make-og-image.cjs"`, run it, and view the image.
Expected: 1200×630, showing the name tag, headline, buttons and photo with nothing cut off. If it doesn't fit, adjust the injected CSS only.

- [ ] **Step 9: Update the README and verify**

Add `npm run og` to "Swap the hero photo". Add a short "Reading Umami" section: what each of the four events means, that `via` and `project` are broken down on the Events page's Properties tab, that comparing `parts-viewed` with `work-reached` shows whether people who see the teardown use it, and that Umami won't report a reliable visit length for a one-page site. Then run the standard checks. Expected: all pass, and `build/og-image.png` exists.

- [ ] **Step 10: Commit**

Message: `feat: add Umami analytics, link preview image and new browser colors`

---

### Task 11: Whole-site verification

**Files:**
- Create: `scripts/verify/reduced-motion.test.cjs`
- Modify: whatever the checks show, but nothing that changes the approved look without Clayton's say-so

**Interfaces:**
- Consumes: everything above.
- Produces: Lighthouse scores and any look-changing questions, in the Run log.

- [ ] **Step 1: Write `scripts/verify/reduced-motion.test.cjs`**

Use `reducedMotion: 'reduce'`.

```js
test('nothing is animating after load', ...);       // document.getAnimations().length === 0
test('page scrolling is not smooth', ...);          // getComputedStyle(html).scrollBehavior === 'auto'
test('the ball hops between steps', ...);           // its translateY equals a step center
test('projects switch instantly', ...);             // right after a tab click: .td-tossed 0, notes correct
test('the slider goes straight to the parts', ...); // right after End: notes visible, opacity 1
test('a dropped sticker is settled at once', ...);  // next frame: its .foil has display none
test('the toy still works', ...);                   // pick up, drop, sticker placed in the section
```

- [ ] **Step 2: Run everything in all three browsers**

```bash
BROWSER=chromium npm run verify
BROWSER=firefox npm run verify
BROWSER=webkit npm run verify
```

Expected: `ℹ fail 0` each. In Firefox, the foil must either render or fail silently while the sticker still works. Fix any failures, and report anything that can't be fixed without changing the approved look.

- [ ] **Step 3: Run Lighthouse**

Serve `build/` on port 8765, then:
```bash
npx --yes lighthouse@12 http://127.0.0.1:8765/ --only-categories=performance,accessibility,best-practices,seo --quiet --chrome-flags="--headless=new" --output=json --output-path="$TMPDIR/lh.json"
```
Record the four scores and the failed audits in the Run log.

- [ ] **Step 4: Fix what doesn't change the look**

Fix any failed audit that doesn't change the approved look. Re-run Lighthouse and the verify suite.

- [ ] **Step 5: Clayton: decide on anything that would change the look**

Bring Clayton the failed audits that would change the look, starting with the unlit slider label at about 2.8:1 contrast. Don't change them without an answer.

- [ ] **Step 6: Commit**

Message: `test: add reduced motion checks and fix audit findings`

---

### Task 12: Launch

**Files:**
- Modify: `src/data/projects.json` (Clayton's notes), plus `src/img/personal-photo.png`, `public/stickers/personal-photo.webp` and `public/og-image.png` if the new photo has arrived

**Interfaces:**
- Consumes: everything above.
- Produces: the live site.

- [ ] **Step 1: Clayton: real notes for all four projects**

**This blocks launch.** Clayton replaces every `[placeholder]` note, and decides which parts each project has, for SoundCloud, Noggin, NBCUniversal and Peachi. Never write or suggest facts for them.
Run: `node scripts/check-content.cjs --launch`. Expected: `Project content looks good.`

- [ ] **Step 2: Clayton: the photo, only if it has arrived**

**This doesn't block launch.** If the transparent PNG has arrived, save it over `src/img/personal-photo.png`, then run `npm run bake` and `npm run og`. Serve the build and ask Clayton to check the new sticker's shape, including where the crop ends, and the link preview. If it hasn't arrived, launch with the current photo and follow the README's "Swap the hero photo" section later.

- [ ] **Step 3: Run everything against the real content**

```bash
CI=true npm test
npm run test:scripts
npx tsc --noEmit
BROWSER=chromium npm run verify
BROWSER=firefox npm run verify
BROWSER=webkit npm run verify
```

Expected: everything passes. Commit content changes with message `content: add real project notes`.

- [ ] **Step 4: Clayton: final look**

Serve `build/` on the local network as in Task 7. Ask Clayton to go through the whole page in desktop Chrome, desktop Safari and on their phone, with their real notes.

- [ ] **Step 5: Clayton: go-ahead to publish**

Ask Clayton explicitly whether to merge and deploy. On a yes, use `superpowers:finishing-a-development-branch` for the branch. Record the current live version first for rollback: `git ls-remote origin gh-pages`.

- [ ] **Step 6: Deploy**

Run: `npm run deploy` only after that yes. `predeploy` re-runs the launch gate and the build.
Expected: `Published`.

- [ ] **Step 7: Check the live site**

GitHub Pages can cache for up to 10 minutes.
```bash
curl -s https://claytonrieck.com/ | grep -c 'cjrieck.github.io'
curl -sI https://claytonrieck.com/og-image.png | head -1
curl -sI https://claytonrieck.com/Clayton_Rieck_Resume.pdf | head -1
curl -sI https://claytonrieck.com/stickers/personal-photo.webp | head -1
```
Use `.png` for the sticker if the Run log says so. Expected: `0`, then three `HTTP/2 200` lines. Then ask Clayton to open `https://claytonrieck.com/`, `/#work` and `/#/projects`, take a project apart, click Resume, and confirm in Umami that the visit, `parts-viewed` and `contact-clicked` all show up on the Events page, with `project` and `via` on its Properties tab. The browser checks fake Umami's server, so this is the first real end-to-end test. Roll back to the recorded version only if Clayton asks.

---

## Run log

Fill this in during execution. Later tasks read it.

| Item | Set in | Value |
|---|---|---|
| Tuned sticker constants, or "unchanged" | Task 1 | unchanged (`LIFT 1.12, TILT 16, HOLD 400, TOUCH_DELAY 70, HOME 70`). Clayton on their phone: "Everything works great on mobile." |
| `STICKERS_ON_TOUCH` | Task 1, final in Task 9 | `true` (provisional until Task 9) |
| Mockup edit after the phone test | Task 1 | `$MOCKUP/teardown.css`: added `opacity: 0` to `.td input[type=range]`. On iOS (Safari and Chrome) the 18x44 slider thumb was painted as a white rectangle with a drop shadow around the knob. Clayton asked for it to be invisible but still present. Reproduced in the iOS 26.5 simulator, fixed there, and a real mouse drag still moves the slider. Task 6 ports `teardown.css` as is, so it carries this over. The input's 44px height must stay, and opacity (not `visibility` or `display`) is what keeps the touch target. The first attempt, `-webkit-tap-highlight-color`, was the wrong cause and is gone |
| Note length table | Task 7 | Characters per note that keep the 610 px stage (1176 and 1440 px columns are identical): 1 part 1051, 2 parts 414, 3 parts 229, 4 parts 140. README says "Aim for about 140 characters a note"; the stage grows by itself past that |
| Sticker format, WebP or PNG | Task 9 | WebP (provisional). Tasks 9 and 11's browser checks were skipped by Clayton's light-process instruction; the real-Safari foil check is in the final manual-verification batch. If the foil breaks there, switch `.webp(...)` to `.png({ compressionLevel: 9 })` in `bake-stickers.cjs` and the extension in `stickerUrl`, then re-run `npm run bake` |
| Lighthouse scores and failed audits | Task 11 | One mobile run on the local build (python http.server, so no compression or cache headers): Performance 83, Accessibility 100, Best Practices 100, SEO 100. FCP 3.0 s, LCP 3.9 s, TBT 0 ms, CLS 0, Speed Index 3.0 s. Performance audits below 1: render-blocking Google Fonts CSS and main.css (est. 2.4 s), text compression and cache lifetimes (artifacts of the local server; GitHub Pages compresses and caches), image sizing and PNG brand logos (about 187 KiB and 53 KiB), unused JS 79 KiB, three unsized logo images (CLS is still 0) |
| Clayton's decisions on look-changing audits | Task 11 | None raised by Lighthouse (Accessibility 100). Known from the spec: the unlit slider label is about 2.8:1 against the stage; darkening it would change the approved look, so it waits for Clayton. Optional perf work offered, not done: load the Google Fonts CSS without blocking render, resize and convert the seven brand-logo PNGs to WebP |
| `gh-pages` version before launch | Task 12 | |
