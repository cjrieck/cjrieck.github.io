// Where the ball sits on the dashed line. `anchor` is how far down the steps the reader's eye is;
// the ball never leaves the line, and with reduced motion it hops from step to step instead of gliding.
export function ballOffset(anchor: number, centers: number[], reduce: boolean): number {
  const first = centers[0];
  const last = centers[centers.length - 1];
  const y = Math.min(Math.max(anchor, first), last);
  return reduce ? Math.max(...centers.filter((c) => c <= y + 1)) : y;
}

// A step lights up once the ball has reached it.
export function litSteps(y: number, centers: number[]): boolean[] {
  return centers.map((c) => c <= y + 1);
}

// The ball rides the dashed line as you scroll. Returns a cleanup that removes every listener.
export function mountProcessBall(steps: HTMLElement): () => void {
  const track = steps.querySelector<HTMLElement>('.track');
  const ball = steps.querySelector<HTMLElement>('.ball');
  const nodes = Array.from(steps.querySelectorAll<HTMLElement>('.node'));
  const tickets = Array.from(steps.querySelectorAll<HTMLElement>('.ticket'));
  if (!track || !ball || !nodes.length) return () => {};
  const line: HTMLElement = track;
  const dot: HTMLElement = ball;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0;
  let mounted = true;

  function update() {
    const box = steps.getBoundingClientRect();
    const centers = nodes.map((n) => {
      const b = n.getBoundingClientRect();
      return b.top + b.height / 2 - box.top;
    });
    const first = centers[0];
    const last = centers[centers.length - 1];
    line.style.top = first + 'px';
    line.style.height = last - first + 'px';
    const y = ballOffset(window.innerHeight * 0.55 - box.top, centers, reduce);
    dot.style.transform = 'translateY(' + y + 'px)';
    litSteps(y, centers).forEach((on, i) => {
      nodes[i].classList.toggle('on', on);
      tickets[i].classList.toggle('on', on);
    });
  }

  const request = () => {
    if (!frame) {
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    }
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();
  // Fonts shift the layout, so measure again once they load.
  document.fonts?.ready.then(() => {
    if (mounted) update();
  });

  return () => {
    mounted = false;
    window.removeEventListener('scroll', request);
    window.removeEventListener('resize', request);
    window.cancelAnimationFrame(frame);
  };
}
