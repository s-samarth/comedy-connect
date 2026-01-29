import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Frontend Infrastructure Smoke Test', () => {
    it('should render a component', () => {
        render(<div data-testid="smoke">Hello World</div>);
        expect(screen.getByTestId('smoke')).toBeInTheDocument();
    });
});
