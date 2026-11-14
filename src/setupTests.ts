// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom has neither of these. Plain functions, because CRA resets jest.fn() implementations between tests.
window.matchMedia = (media: string) =>
  ({ matches: false, media, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList);

window.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver;
