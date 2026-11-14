'use client';

import { useEffect } from 'react';
import { storeBrowserTimezone } from '@/actions/reviewSettings';

const StoreBrowserTimezone = ({ stored }: { stored: string | null }) => {
  useEffect(() => {
    if (stored !== null) {
      return;
    }
    void storeBrowserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [stored]);

  return null;
};

export default StoreBrowserTimezone;
