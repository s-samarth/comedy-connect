import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ShowBookingForm } from '@/components/shows/show-booking';
import { mockShows } from '../mocks/data/shows.mock';

expect.extend(toHaveNoViolations);

describe('Show Booking - Accessibility', () => {
    const mockShow = mockShows()[0];

    it('should have no accessibility violations', async () => {
        const { container } = render(<ShowBookingForm show={mockShow} />);

        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have proper form labels', () => {
        const { getByLabelText } = render(<ShowBookingForm show={mockShow} />);

        // All form inputs should have labels
        expect(getByLabelText(/quantity|tickets/i)).toBeInTheDocument();
    });

    it('should have proper button roles', () => {
        const { getByRole } = render(<ShowBookingForm show={mockShow} />);

        const submitButton = getByRole('button', { name: /book|confirm/i });
        expect(submitButton).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for errors', async () => {
        // This would test that error messages are properly associated with inputs
        // using aria-describedby or aria-invalid
    });

    it('should be keyboard navigable', () => {
        const { container } = render(<ShowBookingForm show={mockShow} />);

        // All interactive elements should be reachable via keyboard
        const interactiveElements = container.querySelectorAll('button, input, select, textarea, a[href]');

        interactiveElements.forEach(element => {
            expect(element).not.toHaveAttribute('tabindex', '-1');
        });
    });
});
