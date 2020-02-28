import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('component mounts', () => {
  const { container, getByText } = render(<App />);
  expect(getByText("Loading data...")).toBeInTheDocument();
});
