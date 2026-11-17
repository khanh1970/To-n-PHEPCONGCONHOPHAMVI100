import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDistractors,
  DEFAULT_QUESTIONS,
  explainAddition,
  generateQuestionSet,
  isValidCarryingAddition,
} from './questions';

test('DEFAULT_QUESTIONS has exactly 5 valid Grade 2 carrying additions within 100', () => {
  assert.equal(DEFAULT_QUESTIONS.length, 5);
  for (const q of DEFAULT_QUESTIONS) {
    const check = isValidCarryingAddition(q.a, q.b);
    assert.equal(check.valid, true, `${q.a} + ${q.b} should be valid: ${check.reason}`);
    assert.equal(q.options.length, 4);
    assert.equal(q.options.includes(q.a + q.b), true);
    assert.equal(new Set(q.options).size, 4);
  }
});

test('isValidCarryingAddition rejects non-carrying, 1-digit, and >100 sums', () => {
  // Non-carrying: 23 + 14 -> 3+4=7 < 10
  assert.equal(isValidCarryingAddition(23, 14).valid, false);
  // Single-digit operand
  assert.equal(isValidCarryingAddition(9, 15).valid, false);
  // Exceeds 100: 67 + 45 = 112
  assert.equal(isValidCarryingAddition(67, 45).valid, false);
  // Valid boundary: 47 + 53 = 100 (7+3=10 >= 10)
  assert.equal(isValidCarryingAddition(47, 53).valid, true);
});

test('explainAddition accurately computes ones, carry, and tens', () => {
  const exp = explainAddition(27, 15);
  assert.equal(exp.onesSum, 12);
  assert.equal(exp.onesDigit, 2);
  assert.equal(exp.carry, 1);
  assert.equal(exp.tensSum, 4);
  assert.equal(exp.total, 42);
});

test('buildDistractors returns 4 distinct numbers including the answer', () => {
  const opts = buildDistractors(49, 34);
  assert.equal(opts.length, 4);
  assert.equal(new Set(opts).size, 4);
  assert.equal(opts.includes(83), true);
  // 73 is the classic forgot-to-carry distractor
  assert.equal(opts.includes(73), true);
});

test('generateQuestionSet creates 5 distinct valid questions', () => {
  const set = generateQuestionSet(5);
  assert.equal(set.length, 5);
  for (const q of set) {
    assert.equal(isValidCarryingAddition(q.a, q.b).valid, true);
    assert.equal(q.options.length, 4);
    assert.equal(q.options.includes(q.a + q.b), true);
  }
});
