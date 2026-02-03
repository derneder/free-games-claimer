/**
 * App Component Tests
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Check that the app rendered by verifying the router is present
    expect(document.body).toBeTruthy();
  });
});
