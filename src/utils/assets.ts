// Pre-baked die-cut stickers live in public/stickers (see scripts/bake-stickers.cjs).
export function stickerUrl(name: string): string {
  return `${process.env.PUBLIC_URL}/stickers/${name}.webp`;
}
