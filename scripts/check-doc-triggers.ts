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


const legacyHighConflictDocs = [
  "docs/02-delivery/sprint-33-post-merge-checklist.md",
  "docs/02-delivery/sprint-33-repo-only-closeout.md",
  "docs/06-governance/sprint-33-execution-board.md"
];

function emitLegacyWarning(file: string) {
  console.log("\n[legacy-high-conflict-warning]");
  console.log(`Legacy file flagged: ${file}`);
  console.log("Review before editing:");
  console.log("- docs/project/canonical-docs.md");
  console.log("- docs/05-ops/drift-resolution-policy.md");
  console.log("Keep advisory mode; do not treat this as CI blocking.");
}


const archiveReadyDocs = [
  "docs/archive/archive-ready-queue.md",
  "docs/02-delivery/sprint-33-post-merge-checklist.md",
  "docs/02-delivery/sprint-33-repo-only-closeout.md"
];

const supersededDocs = [
  "docs/02-delivery/sprint-33-post-merge-checklist.md",
  "docs/02-delivery/sprint-33-repo-only-closeout.md",
  "docs/technical-debt/sprint-33-actionable-debt-matrix.md"
];

function emitArchiveReadyWarning(file: string) {
  console.log("\n[archive-ready-warning]");
  console.log(`Archive-ready candidate touched: ${file}`);
  console.log("Review:");
  console.log("- docs/archive/archive-ready-queue.md");
  console.log("- docs/project/canonical-docs.md");
}

function emitSupersededWarning(file: string) {
  console.log("\n[superseded-doc-warning]");
  console.log(`Superseded document touched: ${file}`);
  console.log("Do not promote as executive source. Review drift policy.");
  console.log("- docs/05-ops/drift-resolution-policy.md");
}

function main() {
  console.log('\nDocumentation trigger checker (advisory mode)');
  console.log('No blocking enforcement enabled.\n');

  Object.entries(triggerMap).forEach(([source, rule]) => emitWarning(source, rule));

  legacyHighConflictDocs.forEach((file) => emitLegacyWarning(file));
  archiveReadyDocs.forEach((file) => emitArchiveReadyWarning(file));
  supersededDocs.forEach((file) => emitSupersededWarning(file));

  console.log('\nGovernance mode: advisory-heavy incremental hardening.\n');
}

main();
