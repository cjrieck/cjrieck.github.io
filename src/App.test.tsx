import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the page without a router', () => {
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
});
