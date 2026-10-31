import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import App from './App';
import { projectData } from './data/projects';

// Every piece of real copy, checked against the mockup's markup and shared-brief.md.
const REQUIRED_COPY = [
  // nav
  'Home',
  'Philosophy',
  'Process',
  'Skills',
  'Work',
  "Let's Talk",
  // hero
  'Hello',
  'my name is',
  "Hi, I'm Clayton",
  'Software Engineer &',
  'Entrepreneur',
  'Over a decade of experience developing frontends, backends, teams, and companies. I build high-value, delightful solutions.',
  'See My Work',
  'My Process',
  // clients
  'Laptop lid',
  'Trusted By Industry Leaders',
  // philosophy
  'Notes on the monitor',
  'How I Think',
  'The Product Engineer',
  "I don't just write code; I build solutions. I bridge the gap between complex engineering challenges and real-world business goals.",
  'Scalable Foundations',
  'Architecture matters. I design robust systems built to grow with your success from day one.',
  'User-Obsessed',
  'Performance is a feature. I craft pixel-perfect, accessible, and lightning-fast experiences.',
  // process
  'Take a ticket',
  'The Build Process',
  'From concept to launch, a proven methodology for building products that matter.',
  '01',
  'Discover & Define',
  "We start with 'Why'. Deep diving into user needs and business goals to define clear success metrics before writing a single line of code.",
  '02',
  'Architect & Plan',
  'Blueprinting the solution. Selecting the right tech stack and designing a system architecture that balances speed with long-term stability.',
  '03',
  'Agile Execution',
  'Rapid, iterative development. Shipping functional builds early and often to gather feedback and continuously refine the product.',
  '04',
  'Launch & Evolve',
  'Deployment is just the beginning. Monitoring performance, optimizing bottlenecks, and scaling based on real-world usage data.',
  // skills
  'Sticker sheet',
  'Technology That Suits You',
  'Swift',
  'SwiftUI',
  'React Native',
  'TypeScript',
  'Python',
  'Other*',
  'Expert',
  'Highly Proficient',
  'Proficient',
  'Mixed',
  '* Note that this is not a full representation of the technologies and services I can provide. Please contact me and/or refer to my CV for further info',
  // work
  'Drag the slider to take it apart',
  'Selected Work',
  "I've worked across many different industries from media streaming to fintech. Here are just a few of the many projects I've worked on.",
  // contact
  'From',
  'Clayton Rieck',
  'cjrieck123@gmail.com',
  'Ready to build something great?',
  "Let's discuss how I can help bring your vision to life.",
  'Resume',
  'LinkedIn ↗',
  'GitHub ↗',
  // footer
  'Back to top ↑',
];

test('renders the page without a router', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});

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

test('the teardown mounts once in the work section, even when React mounts it twice', () => {
  const { container } = render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  expect(container.querySelectorAll('#work-teardown > .td-stage')).toHaveLength(1);
  expect(container.querySelectorAll('#work-teardown .td-tab')).toHaveLength(projectData.projects.length);
  expect(screen.getByText('Drag the slider to take it apart')).toHaveStyle({ visibility: 'visible' });
});

test('the footer shows the current year', () => {
  render(<App />);
  expect(screen.getByText(`© ${new Date().getFullYear()} Clayton Rieck`)).toBeInTheDocument();
});

test.each(['SoundCloud', 'NBC', 'WeWork', 'Nickelodeon', 'Credijusto', 'SiriusXM', 'OneEleven'])('%s logo keeps its name', (name) => {
  render(<App />);
  expect(screen.getByAltText(name)).toBeInTheDocument();
});

describe('nav highlight', () => {
  const stub = window.IntersectionObserver;
  const callbacks: IntersectionObserverCallback[] = [];
  const options: (IntersectionObserverInit | undefined)[] = [];
  const observed: string[] = [];
  let disconnected = 0;

  beforeEach(() => {
    callbacks.length = options.length = observed.length = disconnected = 0;
    // The teardown watches whether it is on screen with an observer of its own (it passes no options); only the nav's is under test here
    window.IntersectionObserver = class {
      private readonly nav: boolean;
      constructor(cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
        this.nav = init !== undefined;
        if (!this.nav) return;
        callbacks.push(cb);
        options.push(init);
      }
      observe(target: Element) {
        if (this.nav) observed.push(target.id);
      }
      unobserve() {}
      disconnect() {
        if (this.nav) disconnected += 1;
      }
    } as unknown as typeof IntersectionObserver;
  });
  afterEach(() => {
    window.IntersectionObserver = stub;
  });

  test('the current section is highlighted in the nav', () => {
    render(<App />);
    act(() => callbacks.forEach((cb) => cb([{ isIntersecting: true, target: { id: 'process' } }] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)));
    expect(screen.getByRole('link', { name: 'Process' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  test('Home starts as the current section and sections that leave the band change nothing', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'true');
    act(() => callbacks.forEach((cb) => cb([{ isIntersecting: false, target: { id: 'skills' } }] as unknown as IntersectionObserverEntry[], {} as IntersectionObserver)));
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('link', { name: 'Skills' })).not.toHaveAttribute('aria-current');
  });

  test('a thin band across the middle of the screen watches the five nav sections', () => {
    const { unmount } = render(<App />);
    expect(options).toEqual([{ rootMargin: '-45% 0px -50% 0px' }]);
    expect(observed).toEqual(['top', 'philosophy', 'process', 'skills', 'work']);
    unmount();
    expect(disconnected).toBe(1);
  });
});
