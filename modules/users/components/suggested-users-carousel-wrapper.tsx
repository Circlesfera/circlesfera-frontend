'use client';

import { type ReactElement } from 'react';
import { SuggestedUsersCarousel } from './suggested-users-carousel';

/**
 * Wrapper cliente para SuggestedUsersCarousel que permite su uso en Server Components
 */
export function SuggestedUsersCarouselWrapper(): ReactElement {
  return <SuggestedUsersCarousel />;
}

