import { render, screen } from '@testing-library/react';

import { FeedShell } from '@/modules/feed/components/feed-shell';

jest.mock('@/modules/feed/hooks/use-feed-stream', () => ({
  useFeedStream: () => ({
    data: {
      pages: [
        {
          data: [
            {
              id: 'post-1',
              caption: 'Hola CircleSfera',
              createdAt: new Date().toISOString(),
              author: {
                id: 'user-1',
                handle: 'joseph',
                displayName: 'Joseph Gómez',
                avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
                isVerified: true
              },
              media: [
                {
                  id: 'media-1',
                  kind: 'image',
                  url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1',
                  thumbnailUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1'
                }
              ],
              stats: {
                likes: 1200,
                comments: 45,
                saves: 212,
                shares: 10,
                views: 23_000
              },
              isLikedByViewer: false,
              isSavedByViewer: false
            }
          ]
        }
      ]
    },
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    status: 'success',
    error: null
  })
}));

describe('FeedShell', () => {
  it('renderiza los elementos del feed', () => {
    render(<FeedShell />);
    expect(screen.getByText(/Hola CircleSfera/)).toBeInTheDocument();
    expect(screen.getByText(/❤️/)).toBeInTheDocument();
  });
});

