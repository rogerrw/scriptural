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
  return year.weeks.flat().filter((slot) => slot.kind === 'day');
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

test('the Pacific window brackets the local year by a year on each side', () => {
  const query = reviewYearQuery('America/Los_Angeles', UTC_MIDYEAR);
  assert.equal(query.build([]).year, 2026);
  assert.equal(query.start.toISOString(), '2025-01-01T00:00:00.000Z');
  assert.equal(query.end.toISOString(), '2028-01-01T00:00:00.000Z');
});

test('a Pacific instant before local midnight still builds the old year', () => {
  const query = reviewYearQuery('America/Los_Angeles', new Date('2026-01-01T07:30:00.000Z'));
  const year = query.build(rowsAt([[1, '2026-01-01T07:30:00.000Z']]));
  assert.equal(year.year, 2025);
  const active = activeCells(year);
  assert.equal(active.length, 1);
  assert.equal(active[0].tooltip, '1 verse on Dec 31, 2025');
});

test('a Pacific instant after local midnight builds the new year', () => {
  const query = reviewYearQuery('America/Los_Angeles', new Date('2026-01-01T08:30:00.000Z'));

  const beforeMidnight = query.build(rowsAt([[1, '2026-01-01T07:30:00.000Z']]));
  assert.equal(beforeMidnight.year, 2026);
  assert.equal(activeCells(beforeMidnight).length, 0);
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

test('UTC 2026 is 365 day cells across 53 Monday-first weeks', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  assert.equal(dayCells(year).length, 365);
  assert.equal(year.weeks.length, 53);

  const first = year.weeks[0];
  assert.deepEqual(
    first.map((slot) => slot.kind),
    ['outside', 'outside', 'outside', 'day', 'day', 'day', 'day'],
  );
  assert.equal(cellFor(year, '2026-01-01'), first[3]);

  const last = year.weeks[52];
  assert.deepEqual(
    last.slice(3).map((slot) => slot.kind),
    ['day', 'outside', 'outside', 'outside'],
  );
  assert.equal(cellFor(year, '2026-12-31'), last[3]);
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

test('UTC 2026 month labels run Jan through Dec on rising week columns', () => {
  const year = reviewYearQuery('UTC', UTC_MIDYEAR).build([]);
  assert.deepEqual(
    year.months.map((month) => month.name),
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  );
  assert.equal(year.months[0].weekIndex, 0);
  for (let index = 1; index < year.months.length; index += 1) {
    const month = year.months[index];
    assert.ok(month.weekIndex > year.months[index - 1].weekIndex, `${month.name} sits too early`);
  }
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
