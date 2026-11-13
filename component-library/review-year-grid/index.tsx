'use client';

import { useEffect, useState } from 'react';
import { loadReviewYear } from '@/actions/loadReviewYear';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/component-library/tooltip';
import type { ReviewYear } from '@/lib/review-year';

type Load = { status: 'loading' } | { status: 'ready'; year: ReviewYear } | { status: 'failed' };

const heatClass = 'block size-[11px] rounded-[2px]';

function heatStyle(level: number) {
  return { backgroundColor: `var(--heatmap-${level})` };
}

export function ReviewYearHeatmap() {
  const [load, setLoad] = useState<Load>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadReviewYear(Intl.DateTimeFormat().resolvedOptions().timeZone)
      .then((year) => {
        if (!cancelled) {
          setLoad({ status: 'ready', year });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoad({ status: 'failed' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (load.status === 'loading') {
    return <div className="mt-8 h-[140px]" aria-busy="true" />;
  }

  if (load.status === 'failed') {
    return (
      <div className="mt-8 h-[140px] text-xs text-muted-foreground">
        Could not load the past year.
      </div>
    );
  }

  const { year } = load;

  return (
    <div className="mt-8 w-fit max-w-full overflow-x-auto">
      <TooltipProvider delayDuration={100} skipDelayDuration={0}>
        <div
          role="group"
          aria-label="Verse reviews over the past year"
          className="inline-grid gap-[3px]"
          style={{
            gridTemplateColumns: `32px repeat(${year.weeks.length}, 11px)`,
            gridTemplateRows: '16px repeat(7, 11px)',
          }}
        >
          {year.weekdayLabels.map((name, row) => (
            <span
              key={row}
              className="pr-2 text-right text-xs leading-none text-muted-foreground"
              style={{ gridColumn: 1, gridRow: row + 2 }}
            >
              {name}
            </span>
          ))}
          {year.months.map((month) => (
            <span
              key={`${month.name}-${month.weekIndex}`}
              className="whitespace-nowrap text-xs leading-none text-muted-foreground"
              style={{ gridColumn: month.weekIndex + 2, gridRow: 1 }}
            >
              {month.name}
            </span>
          ))}
          {year.weeks.map((week, weekIndex) =>
            week.map((slot, dayIndex) => {
              const placement = { gridColumn: weekIndex + 2, gridRow: dayIndex + 2 };
              return (
                // The wrapper is the grid item, so the square keeps its cell whatever the tooltip root emits.
                <div key={slot.date} style={placement}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span
                        aria-label={slot.tooltip}
                        className={heatClass}
                        style={heatStyle(slot.level)}
                      />
                    </TooltipTrigger>
                    <TooltipContent>{slot.tooltip}</TooltipContent>
                  </Tooltip>
                </div>
              );
            }),
          )}
        </div>
      </TooltipProvider>
      <div className="mt-2 flex items-center justify-end gap-[3px] text-xs text-muted-foreground">
        <span>Less</span>
        {year.legend.map((level) => (
          <span key={level} className={heatClass} style={heatStyle(level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
