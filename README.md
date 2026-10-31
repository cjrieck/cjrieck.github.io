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
