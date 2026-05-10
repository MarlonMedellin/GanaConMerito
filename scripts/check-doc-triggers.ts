/*
 Advisory documentation trigger checker.

 Current philosophy:
 - advisory only;
 - no CI blocking;
 - no build failure;
 - no enforcement yet.

 Goal:
 - reduce silent drift;
 - remind agents to review related files;
 - improve synchronization progressively.
*/

const triggerMap: Record<string, string[]> = {
  'AGENTS.md': [
    'docs/project/status.md',
    'docs/05-ops/'
  ],
  'docs/project/status.md': [
    'docs/02-delivery/sprint-log.md',
    'docs/02-delivery/change-log.md'
  ],
  'src/domain/taxonomy/': [
    'content/items/',
    'docs/04-quality/'
  ],
  'src/domain/tutor/': [
    'docs/04-quality/',
    'docs/project/status.md'
  ],
  'content/items/': [
    'scripts/validate-question-bank.ts',
    'src/domain/taxonomy/'
  ]
};

function emitWarning(source: string, related: string[]) {
  console.log('\n[doc-trigger-warning]');
  console.log(`Modified area: ${source}`);
  console.log('Consider reviewing:');

  for (const item of related) {
    console.log(`- ${item}`);
  }

  console.log('If intentionally skipped, register explicit technical debt.');
}

function main() {
  console.log('\nDocumentation trigger checker (advisory mode)');
  console.log('No blocking enforcement enabled.\n');

  Object.entries(triggerMap).forEach(([source, related]) => {
    emitWarning(source, related);
  });

  console.log('\nGovernance mode: advisory-heavy incremental hardening.\n');
}

main();
