export interface MathQuestion {
  id: string;
  a: number;
  b: number;
  options: number[];
}

export interface AdditionValidation {
  valid: boolean;
  reason?: string;
}

export interface AdditionExplanation {
  aTens: number;
  aOnes: number;
  bTens: number;
  bOnes: number;
  onesSum: number;
  onesDigit: number;
  carry: number;
  tensSum: number;
  total: number;
  step1Text: string;
  step2Text: string;
  summaryText: string;
}

/**
 * Validates Grade 2 topic:
 * "Phép cộng có nhớ trong phạm vi 100 (số có 2 chữ số với số có 2 chữ số)"
 */
export function isValidCarryingAddition(a: number, b: number): AdditionValidation {
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return { valid: false, reason: 'Cả hai số hạng phải là số nguyên.' };
  }
  if (a < 10 || a > 99 || b < 10 || b > 99) {
    return { valid: false, reason: 'Cả hai số hạng phải là số có 2 chữ số (từ 10 đến 99).' };
  }
  const onesSum = (a % 10) + (b % 10);
  if (onesSum < 10) {
    return {
      valid: false,
      reason: `Đây là phép cộng không nhớ (${a % 10} + ${b % 10} = ${onesSum} < 10). Cần tổng hàng đơn vị từ 10 trở lên.`,
    };
  }
  const total = a + b;
  if (total > 100) {
    return {
      valid: false,
      reason: `Tổng ${a} + ${b} = ${total} vượt quá phạm vi 100.`,
    };
  }
  return { valid: true };
}

export function explainAddition(a: number, b: number): AdditionExplanation {
  const aTens = Math.floor(a / 10);
  const aOnes = a % 10;
  const bTens = Math.floor(b / 10);
  const bOnes = b % 10;

  const onesSum = aOnes + bOnes;
  const onesDigit = onesSum % 10;
  const carry = Math.floor(onesSum / 10);
  const tensSum = aTens + bTens + carry;
  const total = a + b;

  const step1Text = `${aOnes} + ${bOnes} = ${onesSum}, viết ${onesDigit}, nhớ ${carry}.`;
  const step2Text = `${aTens} + ${bTens} = ${aTens + bTens}, thêm ${carry} bằng ${tensSum}, viết ${tensSum}.`;
  const summaryText = `Vậy ${a} + ${b} = ${total}.`;

  return {
    aTens,
    aOnes,
    bTens,
    bOnes,
    onesSum,
    onesDigit,
    carry,
    tensSum,
    total,
    step1Text,
    step2Text,
    summaryText,
  };
}

/**
 * Generates 4 unique answer options (sorted ascending) with realistic Grade 2 distractors
 * such as forgetting to carry 1 (-10) or miscalculating by ±1 / ±2 / +10.
 */
export function buildDistractors(a: number, b: number): number[] {
  const answer = a + b;
  const candidates = [
    answer - 10, // Forgot to carry 1 (most common Grade 2 error)
    answer + 10, // Over-carried
    answer - 1,
    answer + 1,
    answer - 2,
    answer + 2,
    answer - 11,
    answer + 9,
    answer - 9,
    answer + 3,
    answer - 3,
  ];

  const chosen = new Set<number>([answer]);
  for (const val of candidates) {
    if (chosen.size >= 4) break;
    if (val >= 20 && val <= 100 && val !== answer) {
      chosen.add(val);
    }
  }

  let fallback = 21;
  while (chosen.size < 4 && fallback <= 100) {
    if (!chosen.has(fallback)) {
      chosen.add(fallback);
    }
    fallback += 1;
  }

  return Array.from(chosen).sort((x, y) => x - y);
}

export function createQuestion(id: string, a: number, b: number): MathQuestion {
  return {
    id,
    a,
    b,
    options: buildDistractors(a, b),
  };
}

export const DEFAULT_QUESTIONS: MathQuestion[] = [
  createQuestion('q1', 27, 15), // 42
  createQuestion('q2', 38, 26), // 64
  createQuestion('q3', 49, 34), // 83
  createQuestion('q4', 56, 28), // 84
  createQuestion('q5', 48, 37), // 85
];

/**
 * Generates `count` distinct valid 2-digit + 2-digit addition problems with carrying within 100.
 */
export function generateQuestionSet(
  count = 5,
  rng: () => number = Math.random
): MathQuestion[] {
  const allValidPairs: Array<[number, number]> = [];
  for (let a = 12; a <= 89; a++) {
    for (let b = 12; b <= 89; b++) {
      if (isValidCarryingAddition(a, b).valid) {
        allValidPairs.push([a, b]);
      }
    }
  }

  // Fisher-Yates partial shuffle for distinct pairs (avoiding identical unordered pairs too)
  const picked: MathQuestion[] = [];
  const usedSignatures = new Set<string>();
  let safety = 0;

  while (picked.length < count && safety < 2000) {
    safety += 1;
    const idx = Math.floor(rng() * allValidPairs.length);
    const [a, b] = allValidPairs[idx];
    const sig = a <= b ? `${a}+${b}` : `${b}+${a}`;
    if (usedSignatures.has(sig)) continue;
    usedSignatures.add(sig);
    picked.push(createQuestion(`q${picked.length + 1}`, a, b));
  }

  return picked.length === count ? picked : DEFAULT_QUESTIONS.slice(0, count);
}
