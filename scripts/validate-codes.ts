// Validation: every generated code string (catalog, learn, samples) must parse cleanly.
// Run with: bun scripts/validate-codes.ts

import { parseSceneLang } from '../src/lib/scenelang/parser';
import { parseStyleKit } from '../src/lib/scenelang/stylekit';
import { CATALOG_STYLES, CATALOG_TEMPLATES } from '../src/lib/scenelang/catalog';
import { CATALOG_EFFECTS } from '../src/lib/scenelang/effects';
import { LIBRARY } from '../src/lib/scenelang/learn';
import { SAMPLES } from '../src/lib/scenelang/samples';

let failures = 0;
const styleNames = CATALOG_STYLES.map((s) => s.name);

function checkScene(label: string, code: string, allowThemeError = false) {
  const { errors } = parseSceneLang(code, styleNames, ['logo.png', 'hero.png', 'terrain.jpg', 'dialogue.txt', 'data.csv']);
  const real = allowThemeError ? errors.filter((e) => !/theme|base/i.test(e.message)) : errors;
  if (real.length > 0) {
    failures++;
    console.log(`✗ ${label}`);
    for (const e of real.slice(0, 4)) console.log(`   line ${e.line}: ${e.message}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

function checkStyle(label: string, code: string) {
  const { errors, name, tokens } = parseStyleKit(code);
  if (errors.length > 0 || !name || !tokens) {
    failures++;
    console.log(`✗ ${label}`);
    for (const e of errors.slice(0, 4)) console.log(`   line ${e.line}: ${e.message}`);
  } else {
    console.log(`✓ ${label}`);
  }
}

// 1. catalog styles must parse as StyleKit
for (const s of CATALOG_STYLES) checkStyle(`style ${s.name}`, s.code);

// 2. catalog templates must parse as SceneLang (themes referencing catalog styles are allowed)
for (const t of CATALOG_TEMPLATES) checkScene(`template ${t.id}`, t.code, true);

// 3. effects — must parse with NO errors (no theme needed since they're scene snippets)
for (const f of CATALOG_EFFECTS) {
  const { errors } = parseSceneLang(f.code, styleNames, ['logo.png', 'hero.png', 'terrain.jpg', 'dialogue.txt', 'data.csv']);
  const real = errors.filter((e) => !/declare the look/i.test(e.message));
  if (real.length > 0) {
    failures++;
    console.log(`✗ effect ${f.id}`);
    for (const e of real.slice(0, 4)) console.log(`   line ${e.line}: ${e.message}`);
  } else {
    console.log(`✓ effect ${f.id}`);
  }
}

// 4. samples
for (const s of SAMPLES) checkScene(`sample ${s.id}`, s.code);

// 5. learn library: scene tutorials parse as SceneLang, style ones as StyleKit
for (const section of LIBRARY) {
  for (const tut of section.tutorials) {
    if (tut.lang === 'scene') checkScene(`learn ${tut.id}`, tut.code, true);
    else checkStyle(`learn ${tut.id}`, tut.code);
  }
}

console.log(failures === 0 ? `\nALL PASS (${CATALOG_STYLES.length} styles, ${CATALOG_TEMPLATES.length} templates, ${SAMPLES.length} samples, ${LIBRARY.reduce((n, s) => n + s.tutorials.length, 0)} tutorials)` : `\n${failures} FAILURES`);
if (failures > 0) process.exit(1);
