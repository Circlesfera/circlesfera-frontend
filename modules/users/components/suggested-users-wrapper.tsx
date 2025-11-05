'use client';

import { type ReactElement } from 'react';
import { SuggestedUsers } from './suggested-users';
import { SuggestedUsersCompact } from './suggested-users-compact';

interface SuggestedUsersWrapperProps {
  readonly variant?: 'default' | 'compact';
}

/**
 * Wrapper cliente para SuggestedUsers que permite su uso en Server Components
 */
export function SuggestedUsersWrapper({ variant = 'default' }: SuggestedUsersWrapperProps): ReactElement {
  if (variant === 'compact') {
    return <SuggestedUsersCompact />;
  }
  return <SuggestedUsers />;
}

