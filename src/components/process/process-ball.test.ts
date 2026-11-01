import { ballOffset, litSteps, mountProcessBall } from './process-ball';

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

describe('mountProcessBall', () => {
  const innerHeight = window.innerHeight;
  afterEach(() => {
    window.innerHeight = innerHeight;
  });

  function build() {
    const steps = document.createElement('div');
    steps.innerHTML =
      '<div class="track"></div><div class="ball"></div>' +
      '<div class="step"><span class="node"></span><article class="ticket"></article></div>' +
      '<div class="step"><span class="node"></span><article class="ticket"></article></div>';
    steps.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
    // The node centers sit at 112 and 312 below the top of the steps.
    steps.querySelectorAll('.node').forEach((node, i) => {
      node.getBoundingClientRect = () => ({ top: 100 + i * 200, height: 24 } as DOMRect);
    });
    return steps;
  }

  test('puts the track and ball on the line and lights the steps the ball has reached', () => {
    const steps = build();
    window.innerHeight = 300; // the reader's eye sits at 165, between the two steps
    const stop = mountProcessBall(steps);
    expect(steps.querySelector<HTMLElement>('.track')!.style.top).toBe('112px');
    expect(steps.querySelector<HTMLElement>('.track')!.style.height).toBe('200px');
    expect(steps.querySelector<HTMLElement>('.ball')!.style.transform).toBe('translateY(165px)');
    expect(Array.from(steps.querySelectorAll('.node')).map((n) => n.classList.contains('on'))).toEqual([true, false]);
    expect(Array.from(steps.querySelectorAll('.ticket')).map((t) => t.classList.contains('on'))).toEqual([true, false]);
    stop();
  });

  test('removes every listener it added when it is cleaned up', () => {
    const add = jest.spyOn(window, 'addEventListener');
    const remove = jest.spyOn(window, 'removeEventListener');
    const stop = mountProcessBall(build());
    const added = add.mock.calls.filter(([type]) => type === 'scroll' || type === 'resize');
    expect(added.map(([type]) => type).sort()).toEqual(['resize', 'scroll']);
    stop();
    added.forEach(([type, handler]) => expect(remove).toHaveBeenCalledWith(type, handler));
    add.mockRestore();
    remove.mockRestore();
  });
});
