import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
    it('should render button with text', () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('should handle click events', async () => {
        const user = userEvent.setup();
        const handleClick = vi.fn();

        render(<Button onClick={handleClick}>Click me</Button>);

        const button = screen.getByRole('button');
        await user.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Click me</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('should show loading state', () => {
        render(<Button isLoading>Click me</Button>);

        expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
        const { rerender } = render(<Button variant="primary">Primary</Button>);

        let button = screen.getByRole('button');
        expect(button).toHaveClass(/primary/i);

        rerender(<Button variant="secondary">Secondary</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveClass(/secondary/i);
    });

    it('should apply size styles', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);

        let button = screen.getByRole('button');
        expect(button).toHaveClass(/sm/i);

        rerender(<Button size="lg">Large</Button>);
        button = screen.getByRole('button');
        expect(button).toHaveClass(/lg/i);
    });
});
