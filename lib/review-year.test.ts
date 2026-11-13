import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { reviewYearQuery, type ReviewInstant, type ReviewYear } from './review-year.ts';

const UTC_MIDYEAR = new Date('2026-06-15T12:00:00.000Z');

function rowsAt(rows: readonly (readonly [number, string])[]): ReviewInstant[] {
  return rows.map(([userVerseId, instant]) => ({ userVerseId, reviewedAt: new Date(instant) }));
}

function dayCells(year: ReviewYear) {
  return year.weeks.flat();
}

function utcWeekday(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function cellFor(year: ReviewYear, date: string) {
  const cell = dayCells(year).find((slot) => slot.date === date);
  assert.ok(cell, `no day cell for ${date}`);
  return cell;
}

function activeCells(year: ReviewYear) {
  return dayCells(year).filter((slot) => slot.level > 0);
}

function cssBlock(css: string, selectorIndex: number): string {
  const open = css.indexOf('{', selectorIndex);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === '{') {
      depth += 1;
    }
    if (css[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return css.slice(open, index);
      }
    }
  }
  throw new Error('unbalanced css block');
}

test('an unusable time zone is rejected', () => {
  assert.throws(() => reviewYearQuery('Not/AZone', new Date()), {
    name: 'Error',
    message: 'Invalid time zone',
  });
  assert.throws(() => reviewYearQuery('', new Date()), {
    name: 'Error',
    message: 'Invalid time zone',
  });
});

test('the query window brackets the shown weeks with two days of slack', () => {
  const query = reviewYearQuery('America/Los_Angeles', UTC_MIDYEAR);
  const days = dayCells(query.build([]));
  assert.equal(days[0].date, '2025-06-16');
  assert.equal(days[days.length - 1].date, '2026-06-21');
  assert.equal(query.start.toISOString(), '2025-06-14T00:00:00.000Z');
  assert.equal(query.end.toISOString(), '2026-06-23T00:00:00.000Z');
});

test('a Pacific instant before local midnight counts on the previous local day', () => {
  const query = reviewYearQuery('America/Los_Angeles', new Date('2026-01-01T07:30:00.000Z'));
  const year = query.build(rowsAt([[1, '2026-01-01T07:30:00.000Z']]));
  const days = dayCells(year);
  assert.equal(days[0].date, '2024-12-30');
  assert.equal(days[days.length - 1].date, '2026-01-04');
  assert.equal(cellFor(year, '2025-12-31').tooltip, '1 verse on Dec 31, 2025');
});

test('a Pacific instant after local midnight counts on the new local day', () => {
  const query = reviewYearQuery('America/Los_Angeles', new Date('2026-01-01T08:30:00.000Z'));

  const beforeMidnight = query.build(rowsAt([[1, '2026-01-01T07:30:00.000Z']]));
  const days = dayCells(beforeMidnight);
  assert.equal(days[0].date, '2024-12-30');
  assert.equal(days[days.length - 1].date, '2026-01-04');
  assert.equal(cellFor(beforeMidnight, '2025-12-31').tooltip, '1 verse on Dec 31, 2025');
  assert.equal(cellFor(beforeMidnight, '2026-01-01').tooltip, 'No verses on Jan 1, 2026');

  const afterMidnight = query.build(rowsAt([[1, '2026-01-01T08:30:00.000Z']]));
  assert.equal(cellFor(afterMidnight, '2026-01-01').tooltip, '1 verse on Jan 1, 2026');
});

test('one local day counts distinct verses', () => {
  const query = reviewYearQuery('America/Los_Angeles', new Date('2026-01-01T08:30:00.000Z'));

  const repeated = query.build(
    rowsAt([
      [7, '2026-01-01T08:30:00.000Z'],
      [7, '2026-01-01T19:00:00.000Z'],
    ]),
  );
  assert.equal(cellFor(repeated, '2026-01-01').tooltip, '1 verse on Jan 1, 2026');

  const twoVerses = query.build(
    rowsAt([
      [7, '2026-01-01T08:30:00.000Z'],
      [8, '2026-01-01T19:00:00.000Z'],
    ]),
  );
  assert.equal(cellFor(twoVerses, '2026-01-01').tooltip, '2 verses on Jan 1, 2026');
});

test('one instant lands on different local days either side of the date line', () => {
  const instant = '2026-03-01T23:30:00.000Z';
  const rows = rowsAt([[1, instant]]);

  const kiritimati = reviewYearQuery('Pacific/Kiritimati', new Date(instant)).build(rows);
  assert.equal(cellFor(kiritimati, '2026-03-02').tooltip, '1 verse on Mar 2, 2026');

  const honolulu = reviewYearQuery('Pacific/Honolulu', new Date(instant)).build(rows);
  assert.equal(cellFor(honolulu, '2026-03-01').tooltip, '1 verse on Mar 1, 2026');
});

test('the grid is 53 Monday-Sunday weeks through Sunday of this week', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  const days = dayCells(year);
  assert.equal(days.length, 53 * 7);
  assert.equal(year.weeks.length, 53);
  assert.equal(days[0].date, '2025-06-16');
  assert.equal(days[days.length - 1].date, '2026-06-21');
  assert.equal(utcWeekday(days[0].date), 1);
  assert.equal(utcWeekday(days[days.length - 1].date), 0);
  assert.deepEqual(
    year.weeks[year.weeks.length - 1].map((slot) => slot.date),
    [
      '2026-06-15',
      '2026-06-16',
      '2026-06-17',
      '2026-06-18',
      '2026-06-19',
      '2026-06-20',
      '2026-06-21',
    ],
  );
});

test('a Friday still shows Saturday and Sunday of the current week', () => {
  const year = reviewYearQuery('UTC', new Date('2026-11-13T12:00:00.000Z')).build(
    rowsAt([
      [1, '2025-11-09T12:00:00.000Z'],
      [2, '2025-11-10T12:00:00.000Z'],
      [3, '2026-11-15T12:00:00.000Z'],
    ]),
  );
  const days = dayCells(year);
  assert.equal(year.weeks.length, 53);
  assert.equal(days[0].date, '2025-11-10');
  assert.equal(days[days.length - 1].date, '2026-11-15');
  assert.equal(utcWeekday(days[0].date), 1);
  assert.equal(utcWeekday(days[days.length - 1].date), 0);
  assert.equal(
    days.some((slot) => slot.date === '2025-11-09'),
    false,
  );
  assert.equal(cellFor(year, '2025-11-10').tooltip, '1 verse on Nov 10, 2025');
  assert.equal(cellFor(year, '2026-11-14').tooltip, 'No verses on Nov 14, 2026');
  assert.equal(cellFor(year, '2026-11-15').tooltip, '1 verse on Nov 15, 2026');
});

test('a leap day still fills 53 weeks through Sunday', () => {
  const year = reviewYearQuery('UTC', new Date('2024-02-29T12:00:00.000Z')).build([]);
  const days = dayCells(year);
  assert.equal(year.weeks.length, 53);
  assert.equal(days[0].date, '2023-02-27');
  assert.equal(days[days.length - 1].date, '2024-03-03');
  assert.equal(cellFor(year, '2024-02-29').tooltip, 'No verses on Feb 29, 2024');
});

test('UTC 2024 includes the leap day', () => {
  const year = reviewYearQuery('UTC', new Date('2024-06-15T12:00:00.000Z')).build([]);
  assert.equal(cellFor(year, '2024-02-29').tooltip, 'No verses on Feb 29, 2024');
});

test('a year with no reviews is flat', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  for (const slot of dayCells(year)) {
    assert.equal(slot.level, 0);
    assert.ok(slot.tooltip.startsWith('No verses on'), slot.tooltip);
  }
});

test('a lone active day is the brightest level', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build(rowsAt([[1, '2026-06-15T12:00:00.000Z']]));
  const cell = cellFor(year, '2026-06-15');
  assert.equal(cell.level, 4);
  assert.equal(cell.tooltip, '1 verse on Jun 15, 2026');
});

test('a busiest day of 8 verses spreads the counts over the four filled levels', () => {
  const rows: ReviewInstant[] = [];
  for (let count = 1; count <= 8; count += 1) {
    for (let userVerseId = 1; userVerseId <= count; userVerseId += 1) {
      rows.push({ userVerseId, reviewedAt: new Date(`2026-06-0${count}T12:00:00.000Z`) });
    }
  }
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build(rows);
  const expected = [1, 1, 2, 2, 3, 3, 4, 4];
  for (let count = 1; count <= 8; count += 1) {
    assert.equal(cellFor(year, `2026-06-0${count}`).level, expected[count - 1], `count ${count}`);
  }
});

test('the gutter labels Monday, Wednesday, and Friday', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  assert.deepEqual(year.weekdayLabels, ['Mon', null, 'Wed', null, 'Fri', null, null]);
});

test('month labels follow the rolling year and skip a cramped opening month', () => {
  const midyear = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  assert.deepEqual(
    midyear.months.map((month) => month.name),
    ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  );
  assert.equal(midyear.months[0].weekIndex, 0);
  for (let index = 1; index < midyear.months.length; index += 1) {
    const month = midyear.months[index];
    assert.ok(
      month.weekIndex >= midyear.months[index - 1].weekIndex + 2,
      `${month.name} sits too close`,
    );
  }

  const sameColumn = reviewYearQuery('UTC', new Date('2027-01-01T12:00:00.000Z')).build([]);
  assert.equal(sameColumn.months[0].name, 'Jan');
  assert.equal(sameColumn.months[0].weekIndex, 0);

  const nextColumn = reviewYearQuery('UTC', new Date('2026-12-22T12:00:00.000Z')).build([]);
  assert.equal(nextColumn.months[0].name, 'Jan');
  assert.equal(nextColumn.months[0].weekIndex, 1);
});

test('every legend level has a color in both token blocks of global.css', () => {
  const css = readFileSync(path.join(process.cwd(), 'app/ui/global.css'), 'utf8');
  const darkIndex = css.indexOf('.dark {');
  assert.ok(darkIndex > 0, 'no .dark block');
  // `:root` also opens a height rule and an @apply rule, so take the one next to `.dark`.
  const rootIndex = css.lastIndexOf(':root {', darkIndex);
  assert.ok(rootIndex > 0, 'no :root token block');

  const root = cssBlock(css, rootIndex);
  const dark = cssBlock(css, darkIndex);
  const { legend } = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  assert.deepEqual(legend, [0, 1, 2, 3, 4]);
  for (const level of legend) {
    assert.ok(root.includes(`--heatmap-${level}:`), `:root is missing --heatmap-${level}`);
    assert.ok(dark.includes(`--heatmap-${level}:`), `.dark is missing --heatmap-${level}`);
  }
});
