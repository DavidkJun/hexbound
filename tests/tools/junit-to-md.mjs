// Turns the JUnit reports of the last run into tests/results/<stage>/test-run-report.md:
// one row per executed test, grouped by test case ID, with the result.
//
// Usage (from the repository root): node tests/tools/junit-to-md.mjs stage-0 [e2e junit, relative to it]
//   node tests/tools/junit-to-md.mjs stage-0/retest local/e2e-junit.xml
import { readFileSync, writeFileSync } from 'node:fs';

const stage = process.argv[2] ?? 'stage-0';
const dir = `tests/results/${stage}`;
const decode = (s) =>
  s.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

function cases(file, suite) {
  const xml = readFileSync(`${dir}/${file}`, 'utf8');
  return [...xml.matchAll(/<testcase\b([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g)].map((m) => {
    const attr = (name) => decode(new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(m[1])?.[1] ?? '');
    const body = m[3] ?? '';
    const result = /<failure|<error/.test(body) ? 'FAIL' : /<skipped/.test(body) ? 'SKIP' : 'PASS';
    const name = attr('name').split(/ > | › /).at(-1);
    const id = /\b(TC-[A-Z0-9]+-\d+[a-z]?(?:-control)?)\b/.exec(name)?.[1] ?? '—';
    const bug = /^(BUG-\d{3})\b/.exec(name)?.[1]; // only it.fails tests start with BUG-
    const title = name.replace(/^(BUG-\d{3})\s*/, '').replace(/\b(TC-[A-Z0-9]+-\d+[a-z]?(?:-control)?)\b\s*/, '').trim();
    return { suite, file: attr('classname'), id, bug, title, result, time: Number(attr('time')) };
  });
}

const e2eFiles = process.argv.slice(3).length > 0 ? process.argv.slice(3) : ['e2e-junit.xml'];
const all = [
  ...cases('auto-junit.xml', 'unit / acceptance (Vitest)'),
  ...e2eFiles.flatMap((f) => cases(f, `e2e (Playwright, Chromium) ${f.includes('/') ? f.split('/')[0] : ''}`.trim())),
];
const count = (pred) => all.filter(pred).length;
const lines = [
  `# Test run report: ${stage}`,
  '',
  `Generated from \`auto-junit.xml\` and ${e2eFiles.map((f) => `\`${f}\``).join(', ')} by \`tests/tools/junit-to-md.mjs\` on ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC.`,
  '',
  `**${all.length} executed** · ${count((c) => c.result === 'PASS')} passed · ${count((c) => c.result === 'FAIL')} failed · ${count((c) => c.result === 'SKIP')} skipped.`,
  '',
  `${count((c) => c.bug)} of the passing tests are \`it.fails\` bug tests: they pass because the bug is still there. See [bugs/README.md](${'../'.repeat(dir.split('/').length - 1)}bugs/README.md).`,
  '',
  '| Suite | File | Test case | Bug | Check | Result |',
  '|---|---|---|---|---|---|',
  ...all.map((c) => `| ${c.suite} | \`${c.file}\` | ${c.id} | ${c.bug ?? ''} | ${c.title.replace(/\|/g, '\\|')} | ${c.result === 'PASS' && c.bug ? 'PASS (bug confirmed)' : c.result} |`),
  '',
];
writeFileSync(`${dir}/test-run-report.md`, lines.join('\n'));
console.log(`${dir}/test-run-report.md: ${all.length} tests`);
