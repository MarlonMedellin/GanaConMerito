/*
 Advisory documentation trigger checker.

 Current philosophy:
 - advisory only;
 - no CI blocking;
 - no build failure;
 - no enforcement yet.
*/

type TriggerRule = {
  related: string[];
  severity: 'high' | 'medium' | 'low';
  category: 'governance' | 'delivery' | 'quality' | 'content';
};

const triggerMap: Record<string, TriggerRule> = {
  'AGENTS.md': {
    related: ['docs/project/status.md', 'docs/05-ops/'],
    severity: 'high',
    category: 'governance'
  },
  'docs/project/status.md': {
    related: ['docs/02-delivery/sprint-log.md', 'docs/02-delivery/change-log.md'],
    severity: 'high',
    category: 'delivery'
  },
  'src/domain/taxonomy/': {
    related: ['content/items/', 'docs/04-quality/'],
    severity: 'high',
    category: 'quality'
  },
  'src/domain/tutor/': {
    related: ['docs/04-quality/', 'docs/project/status.md'],
    severity: 'medium',
    category: 'quality'
  },
  'content/items/': {
    related: ['scripts/validate-question-bank.ts', 'src/domain/taxonomy/'],
    severity: 'high',
    category: 'content'
  }
};

function emitWarning(source: string, rule: TriggerRule) {
  console.log('\n[doc-trigger-warning]');
  console.log(`Modified area: ${source}`);
  console.log(`Severity: ${rule.severity.toUpperCase()}`);
  console.log(`Category: ${rule.category}`);
  console.log('Consider reviewing:');

  for (const item of rule.related) console.log(`- ${item}`);

  console.log('References:');
  console.log('- docs/project/canonical-docs.md');
  console.log('- docs/05-ops/drift-resolution-policy.md');
  console.log('If intentionally skipped, register explicit technical debt.');
}

function main() {
  console.log('\nDocumentation trigger checker (advisory mode)');
  console.log('No blocking enforcement enabled.\n');

  Object.entries(triggerMap).forEach(([source, rule]) => emitWarning(source, rule));

  console.log('\nGovernance mode: advisory-heavy incremental hardening.\n');
}

main();
