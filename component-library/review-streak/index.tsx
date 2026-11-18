'use client';

import { Flame } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/component-library/tooltip';
import type { StreakDay } from '@/lib/review-streak';

export function ReviewStreak({ days }: { readonly days: readonly StreakDay[] }) {
  return (
    <TooltipProvider delayDuration={100} skipDelayDuration={0}>
      <ol className="flex gap-4" aria-label="Daily reviews over the last seven days">
        {days.map((day) => {
          const status = day.completed
            ? `Daily review completed on ${day.label}`
            : `No daily review on ${day.label}`;
          return (
            <li key={day.date}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span aria-label={status} className="flex flex-col items-center gap-1">
                    <Flame
                      aria-hidden
                      className={
                        day.completed ? 'size-7 text-orange-500' : 'size-7 text-muted-foreground'
                      }
                      fill={day.completed ? 'currentColor' : 'none'}
                    />
                    <span className="text-xs text-muted-foreground">{day.weekday}</span>
                  </span>
                </TooltipTrigger>
                <TooltipContent>{status}</TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ol>
    </TooltipProvider>
  );
}
