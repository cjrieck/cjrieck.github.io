# claytonrieck.com

My personal site, built with Create React App and published to GitHub Pages.

## Run it

```bash
npm install
npm start
```

That opens the site at http://localhost:3000.

## Swap the hero photo

The photo is baked ahead of time into a sticker with a white border, an ink outline and a hard shadow, so the browser never has to draw it.

1. Save a transparent PNG over `src/img/personal-photo.png`. The background has to be cut out, because the sticker's shape follows the edge of the cutout. The bake refuses a photo with no transparency.
2. Run `npm run bake`. It rebuilds every sticker in `public/stickers/`.
3. Run `npm start` and check the shape in a browser.
4. Publish with `npm run deploy`.

## Edit project content

The "take it apart" section of the page is filled in from one file: `src/data/projects.json`. Open it in any text editor, change the words between the quote marks, and save.

The file has two parts.

`labels` are the three small captions on the slider and the notes:
- `whole` is the caption at the "together" end of the slider.
- `parts` is the caption at the "taken apart" end.
- `part` is the word before each note's number, as in "Part 01".

`projects` is the list of projects, in the order they appear. Each project has:
- `id`: a short name that no other project uses. Use lowercase letters and no spaces.
- `title`: the project's name.
- `summary`: the one-line description under the title.
- `image`: the file name of its picture in `public/projects/`. Optional.
- `imageAlt`: a short description of the picture for people who can't see it. Optional.
- `layers`: the parts that come apart, from the top of the stack down. Optional.

Each layer has:
- `kind`: which drawing the layer gets. `app`, `services` and `infrastructure` each have their own drawing. `interface` is the project's own card (its picture and summary), so it gets a note but no drawing. Any other kind shows the layer's title on a plain plate.
- `title`: the layer's name.
- `note`: your words about it, shown beside the stack.

Aim for about 140 characters a note (a sentence or two; a project with fewer parts has room for longer ones). If a note is longer, the box grows by itself to fit it, so that number is there to keep the page height steady, not a hard stop.

To drop a layer, delete its whole entry (from its `{` to its `}`). The page simply leaves it out and the part numbers close up. A project with no layers, written `"layers": []` or left out, has nothing to take apart, so it gets no slider.

### Add a project

1. Run `npm run project-image -- path/to/screenshot.png`. It saves a web-sized copy in `public/projects/`. Add a second word after the path to choose the file name.
2. Copy one project entry in `projects.json`, paste it after the last one (with a comma between them) and change the words. Set `image` to the new file name, such as `"my-project.webp"`.

### Placeholders

Notes that haven't been written yet start with `[placeholder]`. When you write the real note, delete `[placeholder]` and the space after it. `npm run deploy` refuses to run while any note still starts that way, and it lists the ones left. Nothing is built or published until they are all written.

### Check your edits

Run `node scripts/check-content.cjs` to check the file. If a comma or quote mark is out of place, or a project is missing its title, it says which one and what to fix. `npm test` runs the same check. Add `--launch` to also list the notes that are still placeholders.

### Publish

1. Run `npm start` and look at the section in a browser.
2. Run `npm run deploy`. It checks the content, builds the site and publishes it.
