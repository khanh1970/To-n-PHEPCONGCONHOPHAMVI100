import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { DEFAULT_QUESTIONS } from '../math/questions';
import { buildH5pPackage, slugifyFilename } from './h5pBuilder';

test('slugifyFilename handles Vietnamese diacritics cleanly', () => {
  assert.equal(
    slugifyFilename('Phép cộng có nhớ trong phạm vi 100 (Lớp 2)'),
    'phep-cong-co-nho-trong-pham-vi-100-lop-2.h5p'
  );
});

test('buildH5pPackage produces a valid .h5p ZIP archive for MultiChoice', async () => {
  const result = await buildH5pPackage(DEFAULT_QUESTIONS, {
    title: 'Phép cộng có nhớ trong phạm vi 100',
    format: 'multichoice',
    passPercentage: 80,
    shuffleAnswers: true,
  });

  assert.equal(result.filename.endsWith('.h5p'), true);
  assert.equal(result.entries.length, 2);

  const loaded = await JSZip.loadAsync(result.buffer);
  const h5pFile = loaded.file('h5p.json');
  const contentFile = loaded.file('content/content.json');

  assert.ok(h5pFile, 'h5p.json must exist inside .h5p zip');
  assert.ok(contentFile, 'content/content.json must exist inside .h5p zip');

  const h5pParsed = JSON.parse(await h5pFile.async('string'));
  const contentParsed = JSON.parse(await contentFile.async('string'));

  assert.equal(h5pParsed.mainLibrary, 'H5P.QuestionSet');
  assert.equal(h5pParsed.language, 'vi');
  assert.equal(contentParsed.questions.length, 5);
  assert.equal(contentParsed.questions[0].library, 'H5P.MultiChoice 1.16');
});

test('buildH5pPackage produces a valid .h5p ZIP archive for Blanks', async () => {
  const result = await buildH5pPackage(DEFAULT_QUESTIONS, {
    title: 'Điền đáp án phép cộng có nhớ',
    format: 'blanks',
    passPercentage: 80,
    shuffleAnswers: false,
  });

  const loaded = await JSZip.loadAsync(result.buffer);
  const contentFile = loaded.file('content/content.json');
  assert.ok(contentFile);
  const contentParsed = JSON.parse(await contentFile.async('string'));

  assert.equal(contentParsed.questions.length, 5);
  assert.equal(contentParsed.questions[0].library, 'H5P.Blanks 1.14');
  assert.ok(contentParsed.questions[0].params.questions[0].includes('*42:'));
});
