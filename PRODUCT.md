# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary (confirmed by Clayton): non-technical buyers. Recruiters, project managers and business-focused people who need confidence that Clayton can help bring their idea to reality. When the site trades one thing against another, they come first.

Also served, in this order: technical evaluators (engineers, engineering managers, technical leaders) who need to see that Clayton can fill their skill gap and deliver high-quality work; founders, who need the same confidence as the non-technical group; and people passing the link along, who need a reason to share it (the small details).

## Product Purpose

A one-page personal site for Clayton Rieck, a software engineer and entrepreneur. It replaces the dark single-page site at claytonrieck.com.

Success means a visitor knows within seconds who Clayton is and what he does, can reach contact details from anywhere on the page, and can take a real project apart to see how it was built, in Clayton's own words. Every fact on the current site survives in the new form.

## Positioning

A career iOS engineer with over a decade of experience who now builds whole products: frontends, backends, teams and companies. The site lets visitors take real projects apart, in Clayton's own words, to see how each one was built. Confirmed by Clayton as the claim a neighbouring portfolio could not truthfully copy.

## Operating Context

- Visitors arrive from a shared link, a search, or a direct visit, on phones and desktops. The site is one page; sections are reached by in-page links (`#work`, `#process`, and so on) that should be linkable.
- Clayton edits project content alone, in `src/data/projects.json`, with no code changes. Helper scripts cover the hero sticker (`npm run bake`), the link-preview image (`npm run og`) and project images (`npm run project-image`).
- Publishing is `npm run deploy` to GitHub Pages at claytonrieck.com. A content check runs first and refuses to deploy while any note still starts with `[placeholder]`. Going live is Clayton's decision, and nothing is deployed without his go-ahead.
- Analytics: Umami Cloud, with four anonymous custom events (`contact-clicked`, `work-reached`, `parts-viewed`, `sticker-peeled`). The site works the same when the script is blocked.

## Capabilities and Constraints

Sections, in order: navigation, hero, client logos, "How I Think", the build process, skills, "Selected Work" (the teardown), contact, footer.

Confirmed constraints from the redesign spec:
- Stack stays React 18 and TypeScript on Create React App, with npm and GitHub Pages. No router: old URLs are handled by a startup step. No new pages, blog, CMS or case-study pages.
- The teardown is driven entirely by `src/data/projects.json`. Adding a project means one JSON entry and one image, with no code change. A project with no layers gets no slider.
- Launch projects: SoundCloud, Noggin, NBCUniversal, Peachi. Launch waits for real parts and notes on all four.
- Stickers can be moved around the page by visitors. Placements are not saved, and reloading resets them. The site never says they can be moved. No information is lost when a sticker moves.
- Layouts work from 360 to 1440 px wide, with no sideways scrolling. Layouts below 360 px are out of scope.
- Every animation respects `prefers-reduced-motion`.
- No consent banner. The site uses no cookies of its own.
- Clayton's photo is replaced by a transparent PNG when it arrives; the site does not wait for it.

Terminology to keep: "Selected Work", "Take it apart" / "Drag the slider to take it apart", "The Product" and "The Parts" (slider ends), "Part 01" for notes. The working name "Sticker Bench" never appears on the site.

Still undecided, and must not be filled in by guesswork:
- The real parts and notes for each of the four projects. Only Clayton can write these.
- The new hero photo.
- Whether the sticker interaction feels right on Clayton's own phone. If it does not, stickers become desktop-only.

## Brand Commitments

- Name and identity: Clayton Rieck. Hero copy: "Hi, I'm Clayton", "Software Engineer & Entrepreneur", and the current intro paragraph. The current copy is kept word for word unless Clayton changes it.
- Voice (Clayton's brief): fun and whimsical, yet deliberate and meaningful. "The delight is in the details."
- The site's copy must not claim anything it does not deliver. Clayton's own rule: no invented metrics, testimonials, dates or skills.

## Evidence on Hand

- Résumé: `public/Clayton_Rieck_Resume.pdf`, linked from the contact section.
- Project images for the four launch projects: `public/projects/`.
- Client and technology logos: `src/img/brand-logos/` and `src/img/expertise/technology-logos/`.
- Current hero photo: `src/img/personal-photo.png`. It will be replaced.
- Project summaries in `src/data/projects.json` are Clayton's own words. Metrics appear only where Clayton wrote them there, for example the Peachi sizing-calculator figures. Do not add any others.
- Absent, and must not be fabricated: real layer notes for the four projects, testimonials, case studies and any figures beyond those already written.

## Product Principles

- Every fact is real. Decoration that does nothing is a failure, and so is a claim the site cannot back up.
- One playful object does a real job. Each section is a maker's-desk object that presents real information.
- Technical visitors check, so the site's own words must match how it performs.
- Clayton can change content himself, through one JSON file.
- Delight never hides information or blocks the route to contact.

## Accessibility & Inclusion

Proposed by the redesign spec, not yet binding (Clayton's answer: a proposal, not a requirement). Any change to the approved look that this would require comes back to Clayton first.

- Everything except the sticker easter egg works by keyboard, with visible focus.
- Lighthouse runs before launch.
- Known gap: the unlit slider label measures about 2.8:1 contrast against its stage.
- Photos are sized for their display size (cards display at about 300 px wide), not shipped at full resolution.
