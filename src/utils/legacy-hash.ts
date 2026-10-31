const LEGACY_SECTIONS: Record<string, string> = {
  '#/expertise': '#process',
  '#/projects': '#work',
};

// Old HashRouter links look like #/path. Returns the new hash, or null if the hash needs no change.
export function resolveLegacyHash(hash: string): string | null {
  if (!hash.startsWith('#/')) return null;
  return LEGACY_SECTIONS[hash] ?? '#top';
}

export function applyLegacyHash(): void {
  const hash = resolveLegacyHash(window.location.hash);
  if (hash) window.history.replaceState(null, '', hash);
}

export function scrollToCurrentHash(): void {
  document
    .getElementById(window.location.hash.slice(1))
    ?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
}
