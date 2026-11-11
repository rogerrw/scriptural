import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyKeystroke,
  gradeAttempt,
  replayKeystrokes,
  startAttempt,
  type Attempt,
  type Keystroke,
} from './typing.ts';

function typeEach(text: string, stepMs: number): Keystroke[] {
  return [...text].map((char, index) => ({ kind: 'insert' as const, char, t: index * stepMs }));
}

test('a clean verse at a steady pace scores 100 against the default speed', () => {
  const verse = 'Jesus wept.';
  const finished = replayKeystrokes(verse, typeEach(verse, 100));
  assert.ok(finished);
  assert.equal(finished.elapsedMs, 1000);
  assert.equal(finished.errorCount, 0);
  const score = gradeAttempt(finished, { meanCpm: null, bestGrade: null });
  assert.equal(score.difficulty, 0);
  assert.equal(score.cpm, 660);
  assert.equal(score.grade, 100);
});

test('one corrected mistake at difficulty 5 scores 76.36', () => {
  const verse = 'Jesus wept.';
  const keys: Keystroke[] = [
    ...typeEach('Jesus wepr', 100),
    { kind: 'delete', t: 1000 },
    { kind: 'insert', char: 't', t: 1100 },
    { kind: 'insert', char: '.', t: 1200 },
  ];
  const finished = replayKeystrokes(verse, keys);
  assert.ok(finished);
  assert.equal(finished.errorCount, 1);
  assert.equal(finished.elapsedMs, 1200);
  const score = gradeAttempt(finished, { meanCpm: 600, bestGrade: 100 });
  assert.equal(score.difficulty, 5);
  assert.ok(Math.abs(score.grade - 76.363636) < 0.001);
});

test('deleting a correct character counts and deleting a wrong one does not', () => {
  let attempt: Attempt = startAttempt('In the beginning');
  attempt = applyKeystroke(attempt, { kind: 'insert', char: 'I', t: 0 });
  attempt = applyKeystroke(attempt, { kind: 'delete', t: 10 });
  assert.equal(attempt.errorCount, 1);
  attempt = applyKeystroke(attempt, { kind: 'insert', char: 'X', t: 20 });
  const afterWrong = attempt.errorCount;
  attempt = applyKeystroke(attempt, { kind: 'delete', t: 30 });
  assert.equal(attempt.errorCount, afterWrong);
});

test('a log that stops early does not finish', () => {
  assert.equal(replayKeystrokes('Jesus wept.', typeEach('Jesus', 50)), null);
});

test('twice the target time zeroes only the speed portion', () => {
  const verse = 'Ab';
  const finished = replayKeystrokes(verse, [
    { kind: 'insert', char: 'A', t: 0 },
    { kind: 'insert', char: 'b', t: 60_000 },
  ]);
  assert.ok(finished);
  const score = gradeAttempt(finished, { meanCpm: 250, bestGrade: null });
  assert.equal(score.errorCount, 0);
  assert.equal(score.grade, 60);
});
