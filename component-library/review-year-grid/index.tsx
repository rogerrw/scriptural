'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { loadReviewYear } from '@/actions/loadReviewYear';
import { ScrollBar } from '@/component-library/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/component-library/tooltip';
import type { ReviewYear } from '@/lib/review-year';

type Load = { status: 'loading' } | { status: 'ready'; year: ReviewYear } | { status: 'failed' };

const SQUARE = 11;
const GAP = 3;
const LABEL_COLUMN = 32;
const MONTH_ROW = 16;
const heatClass = 'block size-[11px] rounded-[2px]';

function heatStyle(level: number) {
  return { backgroundColor: `var(--heatmap-${level})` };
}

export function ReviewYearHeatmap() {
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const viewportRef = useRef<HTMLDivElement>(null);

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

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    // The horizontal scrollbar enables overflow after mount, so the first assignment can be clamped.
    let frame = 0;
    let attempts = 0;
    const pinToRecent = () => {
      viewport.scrollLeft = viewport.scrollWidth;
      const atEnd =
        viewport.scrollWidth <= viewport.clientWidth + 1 || viewport.scrollLeft > 0;
      attempts += 1;
      if (!atEnd && attempts < 8) frame = requestAnimationFrame(pinToRecent);
    };
    pinToRecent();
    return () => cancelAnimationFrame(frame);
  }, [load]);

  if (load.status === 'loading') {
    return <div className="h-[140px]" aria-busy="true" />;
  }

  if (load.status === 'failed') {
    return (
      <div className="h-[140px] text-xs text-muted-foreground">Could not load the past year.</div>
    );
  }

  const { year } = load;
  const weeks = year.weeks.length;
  const gridWidth = weeks * SQUARE + Math.max(0, weeks - 1) * GAP;

  return (
    <div className="w-full min-w-0">
      <TooltipProvider delayDuration={100} skipDelayDuration={0}>
        <div className="flex min-w-0 items-start">
          <div
            aria-hidden="true"
            className="grid shrink-0 gap-[3px] pr-2 text-right text-xs leading-none text-muted-foreground"
            style={{
              width: LABEL_COLUMN,
              gridTemplateRows: `${MONTH_ROW}px repeat(7, ${SQUARE}px)`,
            }}
          >
            <span />
            {year.weekdayLabels.map((name, row) => (
              <span key={row}>{name}</span>
            ))}
          </div>
          <ScrollAreaPrimitive.Root
            type="always"
            className="relative min-w-0 flex-1 overflow-hidden"
          >
            <ScrollAreaPrimitive.Viewport
              ref={viewportRef}
              className="h-auto w-full pb-3 [&>div]:!block"
            >
              <div
                role="group"
                aria-label="Verse reviews over the past year"
                className="grid gap-[3px]"
                style={{
                  width: gridWidth,
                  gridTemplateColumns: `repeat(${weeks}, ${SQUARE}px)`,
                  gridTemplateRows: `${MONTH_ROW}px repeat(7, ${SQUARE}px)`,
                }}
              >
                {year.months.map((month) => (
                  <span
                    key={`${month.name}-${month.weekIndex}`}
                    className="whitespace-nowrap text-xs leading-none text-muted-foreground"
                    style={{ gridColumn: month.weekIndex + 1, gridRow: 1 }}
                  >
                    {month.name}
                  </span>
                ))}
                {year.weeks.map((week, weekIndex) =>
                  week.map((slot, dayIndex) => {
                    const placement = { gridColumn: weekIndex + 1, gridRow: dayIndex + 2 };
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
            </ScrollAreaPrimitive.Viewport>
            <ScrollBar
              orientation="horizontal"
              className="h-2 [&>div]:bg-muted-foreground/40"
            />
          </ScrollAreaPrimitive.Root>
        </div>
      </TooltipProvider>
      <div className="mt-1 flex items-center justify-end gap-[3px] text-xs text-muted-foreground">
        <span>Less</span>
        {year.legend.map((level) => (
          <span key={level} className={heatClass} style={heatStyle(level)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
