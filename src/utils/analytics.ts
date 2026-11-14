// Anonymous event counting with Umami. The site behaves the same if the script is blocked, missing or broken.
export type SiteEvent = 'contact-clicked' | 'work-reached' | 'parts-viewed' | 'sticker-peeled';

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Record<string, string>) => void };
  }
}

const sent = new Set<string>();

// Sends each event (per distinct detail) once per page load.
export function trackOnce(name: SiteEvent, data?: Record<string, string>): void {
  const key = `${name}${JSON.stringify(data)}`;
  if (sent.has(key)) return;
  // Umami has no queue, so with no script there is nothing to remember: a later call may still send it
  const umami = window.umami;
  if (!umami || typeof umami.track !== 'function') return;
  // Marked before the call, so a tracker that throws is never retried: a lost event is safer than a double count
  sent.add(key);
  try {
    if (data) umami.track(name, data);
    else umami.track(name);
  } catch (_) { /* analytics must never reach the page */ }
}
