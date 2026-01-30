import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ShowCard } from '@/components/shows/show-card';
import { mockShows } from '../../mocks/data/shows.mock';

describe('ShowCard Component', () => {
    const mockShow = mockShows()[0];

    it('should render show information', () => {
        render(<ShowCard show={mockShow} />);

        expect(screen.getByText(mockShow.title)).toBeInTheDocument();
        expect(screen.getByText(mockShow.venue)).toBeInTheDocument();
        expect(screen.getByText(mockShow.city)).toBeInTheDocument();
    });

    it('should display ticket price', () => {
        render(<ShowCard show={mockShow} />);

        const priceText = screen.getByText(/₹/);
        expect(priceText).toBeInTheDocument();
        expect(priceText.textContent).toContain(mockShow.ticketPrice.toString());
    });

    it('should display available seats', () => {
        render(<ShowCard show={mockShow} />);

        const seatsText = screen.getByText(/available/i);
        expect(seatsText).toBeInTheDocument();
    });

    it('should show sold out badge when no seats available', () => {
        const soldOutShow = { ...mockShow, availableSeats: 0 };
        render(<ShowCard show={soldOutShow} />);

        expect(screen.getByText(/sold out/i)).toBeInTheDocument();
    });

    it('should navigate to show details on click', async () => {
        const user = userEvent.setup();
        const mockOnClick = vi.fn();

        render(<ShowCard show={mockShow} onClick={mockOnClick} />);

        const card = screen.getByRole('article') || screen.getByTestId('show-card');
        await user.click(card);

        expect(mockOnClick).toHaveBeenCalledWith(mockShow.id);
    });

    it('should display show poster if available', () => {
        const showWithPoster = { ...mockShow, posterImageUrl: 'https://example.com/poster.jpg' };
        render(<ShowCard show={showWithPoster} />);

        const image = screen.getByRole('img', { name: /poster/i });
        expect(image).toHaveAttribute('src', showWithPoster.posterImageUrl);
    });

    it('should display placeholder if no poster', () => {
        const showNoPoster = { ...mockShow, posterImageUrl: null };
        render(<ShowCard show={showNoPoster} />);

        // Check for placeholder or default image
        const placeholder = screen.queryByTestId('poster-placeholder');
        expect(placeholder).toBeInTheDocument();
    });

    it('should format date correctly', () => {
        render(<ShowCard show={mockShow} />);

        // Verify date is formatted (implementation depends on format)
        const dateElement = screen.getByText(/2026/);
        expect(dateElement).toBeInTheDocument();
    });
});
