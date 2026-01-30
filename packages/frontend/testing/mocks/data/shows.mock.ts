/**
 * Mock show data for testing
 */

export function mockShows() {
    return [
        {
            id: 'show-1',
            title: 'Stand-up Comedy Night',
            description: 'A hilarious evening of stand-up comedy',
            date: new Date('2026-06-01'),
            time: '19:00:00',
            venue: 'Comedy Club',
            city: 'Hyderabad',
            address: '123 Main Street',
            duration: 90,
            category: 'Standup',
            language: 'English',
            ticketPrice: 500,
            totalSeats: 100,
            availableSeats: 75,
            posterImageUrl: 'https://example.com/poster1.jpg',
            isPublished: true,
            creatorId: 'organizer-1',
            createdAt: new Date('2026-01-10'),
        },
        {
            id: 'show-2',
            title: 'Improv Workshop',
            description: 'Learn the art of improvisation',
            date: new Date('2026-06-15'),
            time: '18:30:00',
            venue: 'Art Center',
            city: 'Mumbai',
            address: '456 Art Lane',
            duration: 120,
            category: 'Improv',
            language: 'Hindi',
            ticketPrice: 800,
            totalSeats: 50,
            availableSeats: 30,
            posterImageUrl: 'https://example.com/poster2.jpg',
            isPublished: true,
            creatorId: 'organizer-2',
            createdAt: new Date('2026-01-15'),
        },
        {
            id: 'show-3',
            title: 'Sold Out Show',
            description: 'This show is completely sold out',
            date: new Date('2026-05-20'),
            time: '20:00:00',
            venue: 'Grand Theater',
            city: 'Delhi',
            address: '789 Theater Road',
            duration: 90,
            category: 'Standup',
            language: 'English',
            ticketPrice: 1000,
            totalSeats: 200,
            availableSeats: 0,
            posterImageUrl: 'https://example.com/poster3.jpg',
            isPublished: true,
            creatorId: 'comedian-1',
            createdAt: new Date('2026-01-05'),
        },
    ];
}

export function mockSingleShow() {
    return mockShows()[0];
}
