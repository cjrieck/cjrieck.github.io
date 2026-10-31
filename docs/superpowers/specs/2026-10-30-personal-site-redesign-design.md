# Personal site redesign: design

**Date:** 2026-10-30
**Status:** Builder check done and Clayton's answers added. Waiting for Clayton's approval. Nothing gets built until they approve it.

Each decision carries a tag saying whose it is:

- **[Clayton]** Clayton decided this.
- **[Claude, seen]** Claude decided this during brainstorming. Clayton has seen it and hasn't objected.
- **[Claude, new]** Claude decided this while writing this document, usually after checking the repo. Clayton first sees it here.

## 1. What this is and why

Clayton Rieck is a software engineer and entrepreneur, a career iOS engineer with over a decade of experience. This project replaces the dark, glassy single-page site at claytonrieck.com with a new design, working name "The Sticker Bench". The working name never appears on the site.

Clayton's brief: a "breathtaking design that portrays the current information in a fun, whimsical, yet deliberate and meaningful" way. "I don't want something that's fun, but not practical. The delight is in the details when it comes to design and experience."

The idea that holds it together is **one playful object given a real job**. Each section is an object from a maker's desk: a name tag, a laptop lid, notes, tickets, a sticker sheet, a cutting mat, an envelope. Each one presents real information. Decoration that does nothing is a failure.

| Who | What they should leave feeling | Source |
|---|---|---|
| Non-technical: recruiters, project managers, business-focused people | Confident Clayton can help bring their ideas to reality | Clayton |
| Technical: engineers, engineering managers, technical leaders | Clayton can fill their skill or expertise gap and deliver high-quality solutions | Clayton |
| Founders, as a main group | Same confidence as the non-technical group | Proposed by Claude; Clayton: "I like this!" |
| People passing the link along, as a secondary group | The small details give them a reason to share it | Proposed by Claude; Clayton: "I like this!" |

## 2. Goals, non-goals, anti-goals

**Goals**

1. Within seconds a visitor knows who Clayton is and what they do, and can reach contact details from anywhere on the page.
2. Every fact on the current site survives in the new form.
3. A technical visitor can take a real project apart and read how it was built, in Clayton's own words.
4. Clayton can change project content by editing one JSON file, without help.
5. The page feels the way the approved mockup feels. Hand-feel is the acceptance test, not a nice-to-have.

**Non-goals**

- New pages, a blog, a CMS or separate case-study pages.
- Saving sticker placements, or a keyboard way to pick up stickers. They're a secret toy and no information depends on them.
- Layouts below 360 px wide.
- Moving off Create React App. [Claude, seen: keep the stack]
- Dark mode. The mockup has one palette. [Claude, new]
- A new favicon. The current icons stay. [Claude, new]
- Background removal in the asset pipeline. The new photo arrives already cut out. [Clayton]
- Serving real-path URLs such as `claytonrieck.com/expertise`. They already return GitHub's 404 today (checked on the live site) and will keep doing so. Section 11 covers the hash URLs that do work. [Claude, new]

**Anti-goals: these are failures even if everything technically works**

- Fun but impractical: information hidden behind a gimmick, a nav or contact route that isn't obvious, text that's hard to read at rest.
- A sticker that blocks the page or loses information.
- Invented facts about Clayton or their work: no made-up metrics, testimonials, dates or skills.
- A project switch that flashes. "Flashing to the clicked project takes away from the joy and delight."
- A site whose own copy says "pixel-perfect, accessible, and lightning-fast" and isn't. Technical visitors will check.
- Motion that loses its feel because the springs were re-created in a library instead of ported.

## 3. Source of truth

The approved mockup defines the look, the motion and every number. Clayton clicked through it and approved it in desktop Chrome and desktop Safari: "everything looks good in both Safari and Chrome." It's throwaway code, so port what it does rather than copying its structure.

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory /Users/clayton/Projects/cjrieck.github.io/.superpowers/handoff/mockups/files
# then open http://127.0.0.1:8765/direction-stickers.html and hard-reload after edits
```

`.superpowers/` will be git-ignored, so it won't appear in a fresh clone or a git worktree. Use the absolute path above, and copy anything the real site needs into the repo.

| File in `.superpowers/handoff/` | What it is |
|---|---|
| `mockups/files/direction-stickers.html` | The approved page: all sections, CSS and sticker code |
| `mockups/files/teardown.js`, `teardown.css`, `projects.js` | The approved teardown and its data |
| `mockups/files/die-*.png` | Pre-rendered die-cut stickers |
| `mockups/files/shared-brief.md` | Full real site copy |
| `bake-stickers.cjs` | Renders `die-*.png`; the starting point for the real pipeline |
| `peel-check.cjs`, `touch-check.cjs`, `label-check.cjs` | Throwaway WebKit checks; pass the page URL as the first argument |
| `mockups/files/direction-manual.html`, `direction-quiet.html` | The two rejected directions. Reference only |

Where the mockup and this document differ, the mockup wins on look, motion and numbers. These are the only intended differences:

| Mockup | Real site | Whose |
|---|---|---|
| Every teardown note is highlighted yellow (`.td-ph`), because all of them are placeholders | Notes are plain text and the highlight is gone | [Claude, new] |
| Placeholder layers and notes | Clayton's real content. Launch waits for all four projects (Section 14) | [Clayton] |
| Current photo, whose sticker outline is mostly its built-in hexagon | The same photo at launch if the new one isn't ready. The new cut-out photo changes the sticker's shape, and Clayton sees that before it goes live (Section 14) | [Clayton] |
| Resume link is `href="#"` | `public/Clayton_Rieck_Resume.pdf`, opening in a new tab as it does today | Handoff |
| "© 2025" | The current year, generated automatically | [Claude, new] |
| `<title>The Sticker Bench</title>` | Keep the current title and description in `public/index.html` | [Claude, new] |
| Notes can be clipped if they get long | Notes never clip (Section 8) | [Claude, new] |
| Spring stiffness can go negative on very long projects | Stiffness has a floor (Section 8) | [Claude, new] |

## 4. Constraints

- **Stack:** keep React, TypeScript and GitHub Pages. [Claude, seen]
- **No invented facts.** Short witty labels are fine if they make no factual claim, and each section's plain name stays visible next to any witty label. [Clayton]
- **Explicitly out:** dark glassmorphism, gradient blobs, floating orbs, glow effects, bento grids, purple gradients, 3D tilt cards, custom cursors, percentage skill bars.
- **Every animation respects `prefers-reduced-motion`.**
- **Layouts work from 360 to 1440 px with no sideways scrolling.**
- **Git:** commit only when Clayton asks, and branch first, since the repo is on `master`. Add `.superpowers/` to `.gitignore` before any commit; Clayton already knows about this. Leave the untracked `.claude/` alone.
- **Going live is Clayton's call.** `npm run deploy` publishes straight to the live site, so never run it without their say-so.
- **Show, don't describe.** Clayton gives their sharpest feedback on things they can click. The plan needs checkpoints where they try the real thing: the mockup on their phone before the port starts, then after the teardown, after the stickers, and before launch.

## 5. Clayton's decisions

1. **Direction: The Sticker Bench**, chosen over The Owner's Manual and Quiet Craft.
2. **Signature interaction: "take it apart"**, an Xcode Debug View Hierarchy style 3D teardown of each project in the Work section. Chosen because it "felt the most personal" and "the visualization makes a lot of sense."
3. **The slider is slim and modern**, with little real estate under the project.
4. **Project content is driven by JSON Clayton can edit without help.** A project has a default view plus layers. An omitted layer simply doesn't appear, because "not every project has a layer that I touched."
5. **The slider snaps:** at 50% or more on release it goes to the parts view, otherwise back to the product view. The in-between stays scrubbable, because people will want to slowly enjoy the transition.
6. **Slider labels: "The Product" and "The Parts".**
7. **Switching projects must animate.**
8. **Easter egg:** company and skill stickers can be placed anywhere on the page, and the site never says so. Visitors discover it themselves.
9. **Picking up a sticker is press-and-hold with a "holographic peeling" effect.** Clayton proposed about a second; Claude built about half a second and explained why; Clayton approved the result.
10. **Remove the Potpourri privacy policy.** "That app is now obsolete."
11. **New hero photo.** Clayton offered to provide one and Claude said yes. It hasn't been provided yet. It will arrive as a transparent PNG, and launch doesn't wait for it (Section 14).
12. **Launch waits for real notes on all four projects:** SoundCloud, Noggin, NBCUniversal and Peachi.
13. **If the sticker peel still feels wrong on a phone after tuning, stickers go desktop-only for now** and come back once they feel right. This doesn't block launch.
14. **Analytics: Umami Cloud.** Claude recommended it when Clayton asked for a free tool, and Clayton created the account for `claytonrieck.com`.
15. **No consent banner.** "No consent banner is fine."

## 6. Claude's calls

**Seen by Clayton, no objection**

- Keep the existing React, TypeScript and GitHub Pages stack.
- The labels "Laptop lid", "Notes on the monitor", "Take a ticket", "Sticker sheet" and "Drag the slider to take it apart". The first and fourth deliberately don't hint at the easter egg.
- Notes say "Part 01" rather than "Layer 01", to match the slider.
- All the sticker details in Section 9, including that reloading resets placements.
- The peel-off direction and arrival motion for project switching.
- Pre-rendering die-cut stickers instead of drawing them in the browser.

**New in this document**

- Remove `react-router-dom` and handle old URLs with a small startup step (Section 11).
- Point `homepage` at the custom domain (Section 11).
- Add the missing link-preview image and update the leftover dark theme colors (Section 11).
- A data check that fails the deploy on broken JSON or leftover placeholder text (Section 10).
- Real notes never clip, and spring stiffness has a floor (Section 8).
- Fix the phone page-height jump before launch (Section 13).
- An accessibility and speed bar, with changes to the approved look brought to Clayton first (Section 13).
- Standardize on npm and remove `yarn.lock` (Section 11).
- Automatic copyright year, no dark mode, no new favicon (Sections 2 and 3).
- Umami counts page views plus four anonymous events, and only on `claytonrieck.com` (Section 11).
- The "Drag the slider to take it apart" label shows only while the selected project has a slider (Section 10).
- The bake rejects a photo with no transparency, instead of quietly making a square sticker (Section 11).
- Clayton's own phone is the real-device bar, plus emulated Android (Section 13).

## 7. The design, section by section

**Visual language.** Colors: ink `#1b1626`, cream `#fbf1dc`, paper `#fff8ea`, tomato `#ec4a2c`, mustard `#f7c233`, teal `#12857b`, dark teal `#0d6e66`, mint `#c4e8e1`. Fonts from Google Fonts: Bricolage Grotesque for display, DM Sans for body, DM Mono for labels. Hard offset shadows (`5px 6px 0 ink`), thick ink borders, slight rotations, dotted paper backgrounds.

**Sections, in order.** Exact copy is in the mockup. It matches the current components in `src/components/` word for word (checked), apart from the labels in Section 6 and the name tag's "Hello, my name is".

- **Nav:** sticky strip of label tape with the CR monogram, Home, Philosophy, Process, Skills, Work and a Let's Talk button that goes to `#contact`. Highlights the current section. On phones the links wrap to a second row.
- **Hero** (`#top`, mustard): a "Hello, my name is" name tag reading "Hi, I'm Clayton", then the headline "Software Engineer & Entrepreneur", the intro paragraph, and See My Work and My Process buttons. On the right, Clayton's photo as a die-cut sticker on a rotated teal card, with a star sticker and a CR badge.
- **Clients** (`#clients`): "Trusted By Industry Leaders", with seven logo stickers on a teal laptop lid.
- **Philosophy** (`#philosophy`, tomato): "How I Think", as three pinned or taped notes.
- **Process** (`#process`): "The Build Process", as four tickets along a dashed line, with a ball that rides the line as you scroll and lights each step. With reduced motion the ball hops from step to step.
- **Skills** (`#skills`, mustard): "Technology That Suits You", as a sticker sheet of six logos, each with a name and level tag, plus the footnote.
- **Work** (`#work`): "Selected Work", with the teardown on a teal cutting mat.
- **Contact** (`#contact`, teal): an airmail envelope with "Ready to build something great?", the email address printed visibly, a Let's Talk mailto button, and Resume, LinkedIn and GitHub chips.
- **Footer:** copyright and Back to top.

## 8. The teardown

Code: `teardown.js`, `teardown.css`. Mounted with `Teardown.mount(element, data, { imageBase })` and themed with `--td-*` CSS variables. The timing constants are at the top of `teardown.js`.

**Slider**

- Slim track with a midpoint tick. Pressing on it follows the pointer with stiff springs (k=520, c=40); release snaps with soft springs (k=170, c=14). Each plate has its own looser spring (`k = 260 - i*45`, `c = sqrt(k)`) and leans with velocity, which gives the jiggle.
- Crossing the midpoint pulses the knob and vibrates where supported. The end labels are clickable and light up to preview where a release will land. Arrow keys, Home and End jump between states. The input keeps a 44 px tall touch target.
- Plates separate in 3D (`rotateX(55deg) rotateZ(-40deg)`, spread `min(120, 258/(N-1))`), with leader lines drawing out to numbered notes. The card sits centered until the notes arrive.
- Until first touched, the stack briefly breathes apart every 7 seconds while visible.
- On phones (below 640 px) the notes sit below the control and open with it, leader lines are hidden, and the slider shortens so the labels stay on one line.

**Project switching**

- The old project peels up by one edge and flies off, toward the left for a later tab and the right for an earlier one, while the new one rises from underneath, slightly crooked, and settles.
- In the parts view, old plates peel away one at a time from the top, then the new stack starts closed and takes itself apart with the same springs, and its notes and lines arrive one by one.
- Every click takes effect immediately, even mid-animation. A new card is never blank, so project images must be decoded before they can be needed. Tabs aren't rebuilt, so keyboard focus stays put and the selected tab animates.
- Switching to a project with no parts returns to the product view.
- With reduced motion, projects switch instantly.

**Safeguards to carry over**

- The notes column and leader lines are `visibility: hidden` while the slider is below the point where the first note appears. Clayton once saw notes faded to about 27% opacity in the product view (`~/Desktop/layers.png`). The code shouldn't be able to produce that and it was never reproduced, so this safeguard stays.
- `.td-scene` must not have `overflow: hidden`. It clipped the card's right edge at some window widths.

**Two changes from the mockup** [Claude, new]

- **Notes never clip.** `.td-notes` has `overflow: hidden` inside a fixed 610 px stage, and the mockup has only been seen with short placeholder notes. By estimate, four notes on desktop fit at roughly 180 characters each, and the mockup's own prompt suggests "two or three sentences". Keep 610 px whenever the notes fit and let the stage grow when they don't. Test with realistic lengths, measure the real limit, and give it to Clayton before they write the notes. It also goes in the editing note.
- **Stiffness has a floor.** `k = 260 - i*45` goes negative at the seventh plate and `300 - i*40` at the ninth, which turns `sqrt(k)` into `NaN`. Hand-edited JSON can reach that. Floor both at 35, which leaves the approved feel unchanged for up to six plates.

## 9. Sticker easter egg

Code: the first block of the inline script in `direction-stickers.html`. All of this is [Claude, seen], built on Clayton's decisions 8 and 9.

- **What can move:** the seven company stickers and six skill stickers. Not the photo, star or badge.
- **The only hints:** a grab cursor, a small lift on hover, and the peel itself starting when pressed.
- **Picking up:** pressing starts the peel at once. On touch, it starts after 70 ms and comes free at 400 ms more. If the finger moves more than 10 px first, the sticker goes straight back and the page scrolls. With a mouse, moving 3 px picks it up immediately, and holding also works. Letting go early lays it back down.
- **Foil:** holographic foil spreads from under the finger during the hold, the grabbed side lifts toward you, and the hard shadow grows. When carried, the rainbow shifts with movement and tilt, and the sticker swings with velocity. On drop the foil fades, the sticker presses down with a small squash and lands slightly crooked, so placed stickers stay matte.
- **Reach:** carrying to the top or bottom edge scrolls the page, so any section is reachable. A sticker can't be carried off screen.
- **Placement:** stored as a percentage within the section or footer it was dropped on, so it stays with that section when the layout changes. Last placed lands on top.
- **Information is never lost:** a peeled company sticker leaves a faded logo in a dashed outline on the lid. A peeled skill leaves a faint shape, and its name and level tag stay. Originals stay in the DOM with their alt text; the moving copies are `aria-hidden`.
- **The page keeps working:** placed stickers sit under the nav, and a plain click on one lands on whatever it covers, so a sticker on a button doesn't block it. Exception: a sticker covering the teardown slider must be moved first.
- **Getting back:** dropping within 70 px of the original spot sends it home. Reloading resets everything; placements aren't saved.
- **Touch detail:** a lifted sticker floats 30 px above the finger so it stays visible. Scrolling is blocked only once a sticker has come free.
- **If it doesn't work on phones** [Clayton]: Clayton tries the mockup on their phone before the port starts, and tuning happens in the mockup, where changes are cheap. If the peel still feels wrong, stickers stay put as plain logos on touch input and keep working with a mouse, behind one switch that's easy to turn back on. Clayton decides whether it feels right.

## 10. Project data

This is the file Clayton edits by hand, so it has to be easy to find and hard to break. The mockup's `projects.js` is a script; the real thing is plain JSON with this shape. [Clayton: JSON. Shape: Claude, seen]

```json
{
  "labels": { "whole": "The Product", "parts": "The Parts", "part": "Part" },
  "projects": [{
    "id": "noggin",
    "title": "Noggin",
    "summary": "...",
    "image": "noggin.png",
    "imageAlt": "...",
    "layers": [
      { "kind": "interface", "title": "What you see", "note": "..." },
      { "kind": "app", "title": "The app", "note": "..." },
      { "kind": "services", "title": "The services", "note": "..." },
      { "kind": "infrastructure", "title": "The infrastructure", "note": "..." }
    ]
  }]
}
```

- An omitted layer disappears and the numbering closes up.
- The default card is always the top plate; `interface` only adds a label and note to it.
- `kind` picks the drawing (`app`, `services`, `infrastructure`). An unknown kind gets a plain plate showing its title.
- Empty `layers` means no slider at all. All four launch projects have sliders, but a later project might not, so the "Drag the slider to take it apart" label shows only while the selected project has one. [Claude, new]
- Titles and summaries in `projects.js` are real; they match `src/components/portfolio/portfolio.tsx`. **Which layers each project has, and every note, are placeholders.**
- Adding a project means one JSON entry and one image in one folder, with no code changes.
- A short note, in the README or beside the file, explains how to edit it and how to publish. Replace the stock Create React App README while you're there.

**Data check** [Claude, new]: `npm test` and `predeploy` both validate the file, so a bad edit can't reach the live site. They fail on invalid JSON, missing required fields, duplicate ids, or an image file that doesn't exist. The error message says what to fix, in plain words, because Clayton will be the one reading it.

**Launch gate** [Clayton's rule, Claude's mechanism]: `predeploy` also fails on any leftover placeholder note, which enforces decision 12. Give every placeholder note one shared marker so the check can't miss any. Only `predeploy` checks for this, so `npm test` stays green while Clayton is still writing.

## 11. Repo changes

**Repo today, as checked:** Create React App (`react-scripts` 5.0.1), React 18, TypeScript 4, deployed with `gh-pages`, Node 24 per `.nvmrc`. `react-scripts build` works on Node 24.11.1. There's no CI. GitHub Pages serves the root of the `gh-pages` branch at `claytonrieck.com` (`public/CNAME`). The only test is the stock `src/App.test.tsx`, which fails today because it renders `App` outside a router; replace it.

**Remove**

- Route `/apps/potpourri/privacy` and `src/pages/apps/potpourri/`. [Clayton]
- `src/components/custom-cursor/`, and old section components and CSS as they're replaced.
- Dependencies never imported in `src/` (checked): `recharts`, `react-circular-progressbar`, `react-visibility-sensor`, `react-responsive`.
- `framer-motion` and `lucide-react`, once nothing imports them. Only components being replaced use them today. Port the hand-written springs instead of re-creating them in `framer-motion`.
- `yarn.lock`. Both lockfiles are tracked and the README uses npm, so this standardizes on npm. [Claude, new]
- `react-ga` and the `UA-40166119-1` property. Google has shut Universal Analytics down, so this probably collects nothing.

**Remove the router and keep old URLs working** [Claude, new]

The site uses `HashRouter`, and the mockup's section links are plain anchors like `#work`. The router treats those as routes. Running its matcher against the current routes, `#work`, `#process` and any unknown hash match nothing, which renders a blank page. Today's nav avoids this by intercepting every click. Today's `#/expertise` redirect sets the hash to `#process`, so it most likely ends on a blank page too (route match tested, not clicked through in a browser).

With the privacy policy gone there's only one page, so remove `react-router-dom`. A small startup step handles the old URLs instead:

| URL on arrival | Result |
|---|---|
| `#/expertise` | Goes to `#process` |
| `#/projects` | Goes to `#work` |
| Any other `#/...`, including `#/apps/potpourri/privacy` | Top of the home page, never blank |
| `#work` and other section links | Normal anchors, which also makes sections linkable for people sharing them |

**Deploy settings** [Claude, new]

`package.json` has `homepage` set to `https://cjrieck.github.io/cjrieck.github.io`, so the live page asks for `/cjrieck.github.io/static/...`, and each of those requests gets a 301 redirect to `/static/...` (checked on the live site). Change `homepage` to `https://claytonrieck.com`. This makes `%PUBLIC_URL%` empty, so anything that must be a full URL has to be written out in full.

**Link previews and browser colors** [Claude, new]

- `public/index.html` points `og:image` and `twitter:image` at `og-image.png`, which doesn't exist in the repo. People passing the link along are a named audience, so add a 1200×630 card made from the new hero, with no new claims. Use the full URL `https://claytonrieck.com/og-image.png`. Regenerate it whenever the photo changes.
- `theme-color` and `msapplication-TileColor` are still the old `#0a0a0b`. Use mustard `#f7c233` to match the top of the page. `public/site.webmanifest` has empty names and white colors; fill those in too.

**Analytics** [Clayton: Umami, account created 2026-10-30, and the smallest useful set of events. Claude, new: which events, and the domain limit]

- Use the free Hobby plan of Umami Cloud: 100K events a month, one site, six months of data (checked 2026-10-30). Cloudflare Web Analytics is also free and needs no DNS change, but it doesn't support custom events. Umami does, and that's the deciding difference for a site built around two interactions.
- Page views, custom events and each stored property all count toward the 100K, so `parts-viewed` and `contact-clicked` cost 2 each and the most one visit can use is 19. The pricing page doesn't say what happens to a free site past the limit.
- Umami counts page views, referrers and devices by itself. Don't expect visit length: Umami only calculates it for visitors who view more than one page, and section links on this one-page site don't count as new pages. On top of that, the site sends four anonymous events, each at most once per page load for each distinct value:

| Event | Fires when | What it answers |
|---|---|---|
| `contact-clicked`, with `via`: `email`, `resume`, `linkedin` or `github` | Someone clicks the email address, the envelope's Let's Talk button, or a Resume, LinkedIn or GitHub chip. The nav's Let's Talk only scrolls to Contact, so it doesn't count | Is the site making people reach out, and how? |
| `work-reached` | The teardown first comes into view | How many visitors get far enough to see the signature interaction? |
| `parts-viewed`, with `project`: the project's id | A project reaches The Parts, by release, key or label, or by switching to it while in that view | Do they take it apart once they see it, and which projects draw them? |
| `sticker-peeled` | A sticker first comes free | Is anyone finding the secret? |

- Contact links use the site's own click handlers, never Umami's `data-umami-event` attribute. That attribute cancels a same-tab link click and only opens the link after Umami's request finishes (checked in its script), which would make the email link depend on Umami's server.
- The design has no consent banner, based on Umami's own statement: it "does not use cookies, does not collect personal data", and you can use it "without needing to display a cookie consent banner" (umami.is/pricing). That's the vendor's claim, not legal advice. Its privacy notice says standard analytics don't store visitor IP addresses, but they are processed transiently to calculate visitor identifiers and approximate location, and customer-site data falls under its Data Processing Agreement. Clayton has weighed this and chosen no banner.
- The site must work exactly the same if the script is blocked or missing.
- Add this to the `<head>` of `public/index.html`. It's Umami's snippet for `claytonrieck.com` plus `data-domains`, which keeps local development from being counted:

  ```html
  <script defer src="https://cloud.umami.is/script.js" data-website-id="aaa94160-a53a-4982-b472-fb37faadda6e" data-domains="claytonrieck.com"></script>
  ```

- Section links change the URL hash. Check they don't inflate page views, and add `data-exclude-hash` if they do.

**Asset pipeline**

- Stickers are pre-rendered with `sharp`, never drawn in the browser (Section 12). Port `bake-stickers.cjs` into the repo; it currently reads from the mockup folder, and `sharp` isn't installed in the repo.
- The bake traces the image's transparency, so a photo with an opaque background would quietly become a square sticker. It stops with a clear error instead. [Claude, new]
- Clayton needs one command to re-run it with a new photo, documented in the editing note. Whether it runs on demand with committed output or as part of the build is left to the builder. On demand fits best, since deploys run on Clayton's machine and there's no CI.

## 12. Hard-won lessons

- **Don't draw stickers in the browser.** Canvas drawing failed intermittently in WebKit: the photo came out blank or lost its border, and `img.decode()` didn't fully fix it. Skipping pre-rendering is what produced Clayton's empty hero square.
- **Stacked CSS `drop-shadow` filters froze the browser** on the sticker page, at 42 seconds for two frames. Bake shadows into the image. A single drop-shadow on the one held sticker is fine.
- **A global `section` style leaks into the teardown**, whose scene is a `<section>`. The mockup resets it with `#work-teardown section{...}`.
- **`html{scroll-behavior:smooth}` breaks programmatic edge scrolling** unless `scrollBy` passes `behavior:'instant'`.
- **Brand logos are light gray on transparent**, so they need `filter: brightness(0)` on light backgrounds.
- **Playwright's WebKit screenshots flatten 3D stacks**, even in a visible window, although layout and hit testing are correct. Don't trust them for the teardown; check real Safari.
- **Testing a pointer gesture synchronously can miss the last move.** The drop code computes the final position from the release event for this reason.
- **The animation loops run outside React, and need real cleanup.** Both run on `requestAnimationFrame` and write directly to the DOM, and the mockup's versions never clean up their timers and global listeners. `src/index.tsx` uses `React.StrictMode`, which runs effects twice in development, so they need a proper teardown. Don't drive per-frame motion through React state. The sticker code also moves nodes into sections at runtime, which React must not overwrite.

## 13. Verification

**Automated tests** cover the logic that's easy to break: the snap threshold, omitted-layer numbering, the no-layers case, sticker placement percentages, the old-URL step, the stiffness floor, and the data check.

**By hand, because tests can't judge feel**

| Check | Who | Status from the mockup |
|---|---|---|
| Whole page in desktop Chrome and Safari | Clayton | Passed on the mockup; repeat on the real build |
| Teardown 3D in real Safari | Clayton or builder | Passed on the mockup; repeat, since Playwright can't see it |
| Sticker hold on Clayton's own phone, the highest risk. Done on the mockup before the port starts, and again on the real build | Clayton | **Never tested.** Emulated iPhone 13 in WebKit only |
| Sticker hold in emulated Android Chrome. Clayton's phone is the only real-device bar [Claude, new] | Builder | **Never tested** |
| The new photo's sticker shape, including where the crop ends, before it goes live | Clayton | **New.** The approved outline is mostly the hexagon |
| `prefers-reduced-motion` across the whole page | Builder | **Never tested** |
| Firefox, including the foil's mask and blend mode | Builder | **Never tested.** If the foil can't render there, the sticker must still work |
| 360 to 1440 px with no sideways scrolling | Builder | Check on the real build |

The plan needs a way for Clayton to open the mockup and the unpublished build on their phone, because deploying is the only other route to a device and that publishes to the live site. Serving over the local network is the obvious route; the mockup server above would need `--bind 0.0.0.0` instead of `127.0.0.1`.

**Bars** [Claude, new]

- **Motion:** no worse than the mockup, which carried a sticker at about 60 frames per second in Chrome and WebKit and averaged 17 ms per frame on a project switch.
- **Accessibility and speed:** everything except the easter egg works by keyboard with visible focus, and Lighthouse runs before launch. Fix whatever doesn't change the approved look. Bring anything that would change it to Clayton rather than changing it silently. The first known example: the unlit slider label works out to about 2.8:1 contrast against the stage.
- **Image weight:** the photo is 978 KB and the four project images total about 2 MB, against a stated claim of "lightning-fast". The cards display them at about 300 px wide from 1000 px sources. Resize them, and use WebP if the foil mask still works in real Safari.

**Known issues from the mockup**

- On phones in the parts view, page height jumps when the new project has a different number of notes. Fix before launch. [Claude, new]
- At 320 px, below the 360 px minimum, the slider is only 56 px long. Accepted, since it's below the minimum.
- Very rapid project clicking had one 84 ms frame in a heavy test setup. Watch for it, but don't chase it.

## 14. What Clayton still provides

| What | Blocks launch? | Details |
|---|---|---|
| Phone test of the mockup | No, but it comes first | Before the port starts, so any tuning happens where it's cheap (Section 9) |
| Real parts and notes for all four projects | **Yes** | Which parts each project has, and what the notes say. Only Clayton can write these, since inventing them would break the no-invented-facts rule. Technical visitors need this content, since it's how the site convinces them. The builder gives Clayton the measured length limit first (Section 8) |
| New hero photo | No | A transparent PNG: chest-up, sharp, looking at the camera, at least 2000 px on the long edge, with Clayton's face recognizable and only the sticker treatment plus a light color grade. Until it arrives the site uses `src/img/personal-photo.png`, whose green-yellow hexagon competes with the palette |

## 15. Left to the builder

- Component and file structure, and how the mockup's plain JS is ported to TypeScript, as long as behavior and numbers don't change.
- Where the JSON and project images live, within the rules in Section 10. Create React App only bundles imports from `src/`, and JSON can't import images, so `public/` is the simple route for images.
- How stickers are kept out of React's way (Section 12).
- The exact way the stage grows for long notes (Section 8) and how the phone height jump is fixed (Section 13).
- When project images are decoded, as long as a new card is never blank.
- Build order, as long as the phone test comes first and Clayton gets clickable checkpoints (Section 4).

## 16. Inspiration

The pattern worth keeping is "one playful object given a real job." Dribbble: [Erikas Chesonis, Personal Website](https://dribbble.com/shots/21845588-Personal-Website), [Bailey Sullivan, new yob!](https://dribbble.com/shots/3400560-new-yob), [The Mad Brains](https://dribbble.com/shots/27377040-My-Portfolio-Landing-Page), [Arthur De Klerck](https://dribbble.com/shots/26582947-Portfolio-Website-UX-UI-designer), [RetroSupply, Table Tennis Hero](https://dribbble.com/shots/5334703-Table-Tennis-Hero), [Pete Nawara](https://dribbble.com/shots/27606603-Portfolio-2026-Creative-Technologist).
