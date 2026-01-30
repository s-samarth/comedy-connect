import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ShowBookingForm } from '@/components/shows/show-booking';
import { mockShows } from '../../mocks/data/shows.mock';

describe('ShowBookingForm Component', () => {
    const mockShow = mockShows()[0];

    beforeEach(() => {
        server.resetHandlers();
    });

    it('should render booking form with show details', () => {
        render(<ShowBookingForm show={mockShow} />);

        expect(screen.getByText(mockShow.title)).toBeInTheDocument();
        expect(screen.getByText(/₹/)).toBeInTheDocument();
        expect(screen.getByLabelText(/quantity|tickets/i)).toBeInTheDocument();
    });

    it('should validate minimum ticket quantity', async () => {
        const user = userEvent.setup();
        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '0');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/at least 1/i)).toBeInTheDocument();
        });
    });

    it('should validate maximum ticket quantity', async () => {
        const user = userEvent.setup();
        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '11');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/maximum|10|limit/i)).toBeInTheDocument();
        });
    });

    it('should prevent booking more than available seats', async () => {
        const user = userEvent.setup();
        const limitedShow = { ...mockShow, availableSeats: 5 };
        render(<ShowBookingForm show={limitedShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '10');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/only 5.*available/i)).toBeInTheDocument();
        });
    });

    it('should calculate total amount correctly', async () => {
        const user = userEvent.setup();
        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '2');

        const expectedTotal = mockShow.ticketPrice * 2;

        await waitFor(() => {
            const totalElement = screen.getByText(new RegExp(expectedTotal.toString()));
            expect(totalElement).toBeInTheDocument();
        });
    });

    it('should submit booking with correct data', async () => {
        const user = userEvent.setup();
        let capturedRequest: any = null;

        server.use(
            http.post('*/api/v1/bookings', async ({ request }) => {
                capturedRequest = await request.json();
                return HttpResponse.json({ booking: { id: 'booking-123' } }, { status: 201 });
            })
        );

        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.clear(quantityInput);
        await user.type(quantityInput, '2');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(capturedRequest).toEqual({
                showId: mockShow.id,
                quantity: 2,
            });
        });
    });

    it('should show success message after booking', async () => {
        const user = userEvent.setup();

        server.use(
            http.post('*/api/v1/bookings', () => {
                return HttpResponse.json({ booking: { id: 'booking-123' } }, { status: 201 });
            })
        );

        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.type(quantityInput, '2');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/success|confirmed/i)).toBeInTheDocument();
        });
    });

    it('should handle booking errors', async () => {
        const user = userEvent.setup();

        server.use(
            http.post('*/api/v1/bookings', () => {
                return HttpResponse.json(
                    { error: 'Not enough seats available' },
                    { status: 400 }
                );
            })
        );

        render(<ShowBookingForm show={mockShow} />);

        const quantityInput = screen.getByLabelText(/quantity|tickets/i);
        await user.type(quantityInput, '2');

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/not enough seats/i)).toBeInTheDocument();
        });
    });

    it('should disable submit button while loading', async () => {
        const user = userEvent.setup();

        server.use(
            http.post('*/api/v1/bookings', async () => {
                await new Promise(resolve => setTimeout(resolve, 1000));
                return HttpResponse.json({ booking: { id: 'booking-123' } });
            })
        );

        render(<ShowBookingForm show={mockShow} />);

        const submitButton = screen.getByRole('button', { name: /book|confirm/i });
        await user.click(submitButton);

        expect(submitButton).toBeDisabled();
    });
});
