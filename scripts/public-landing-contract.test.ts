import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

const file = (relativePath: string) => path.join(root, relativePath);
const read = (relativePath: string) => readFile(file(relativePath), "utf8");

const publicFiles = [
  "src/app/page.tsx",
  "src/app/como-funciona/page.tsx",
  "src/app/tutor-gcm-ia/page.tsx",
  "src/app/preguntas-verificadas/page.tsx",
  "src/components/public-landing/public-header.tsx",
  "src/components/public-landing/public-footer.tsx",
  "src/components/public-landing/public-landing.tsx",
  "src/components/public-landing/hero-illustration.tsx",
];

test("public landing routes and contract files exist", () => {
  assert.equal(existsSync(file("src/app/como-funciona/page.tsx")), true);
  assert.equal(existsSync(file("src/app/tutor-gcm-ia/page.tsx")), true);
  assert.equal(existsSync(file("src/app/preguntas-verificadas/page.tsx")), true);
});

test("public header and footer keep expected navigation and login CTA", async () => {
  const header = await read("src/components/public-landing/public-header.tsx");
  const footer = await read("src/components/public-landing/public-footer.tsx");
  const landing = await read("src/components/public-landing/public-landing.tsx");
  const pages = await Promise.all([
    read("src/app/como-funciona/page.tsx"),
    read("src/app/tutor-gcm-ia/page.tsx"),
    read("src/app/preguntas-verificadas/page.tsx"),
  ]);

  for (const route of ["/como-funciona", "/tutor-gcm-ia", "/preguntas-verificadas"]) {
    assert.match(header, new RegExp(`href: "${route}"`));
    assert.match(footer, new RegExp(`href="${route}"`));
  }

  assert.match(header, /href: "\/#faq"/);
  assert.doesNotMatch(header, /\/\?#faq/);
  assert.match(header, /href="\/login"/);
  assert.match(footer, /href="\/login"/);
  assert.match(landing, /href="\/login"/);

  for (const page of pages) {
    assert.match(page, /href="\/login"/);
  }
});

test("public landing avoids retired asset and overclaiming copy", async () => {
  const contents = await Promise.all(publicFiles.map(read));
  const combined = contents.join("\n");

  assert.doesNotMatch(combined, /hero-image\.png/);
  assert.doesNotMatch(combined, /prueba real/i);
  assert.doesNotMatch(combined, /Esto asegura/);
  assert.doesNotMatch(combined, /normativa vigente/i);
  assert.doesNotMatch(combined, /exactamente qu[eé] áreas/i);
});

test("home keeps authenticated redirect boundary and visitor landing", async () => {
  const page = await read("src/app/page.tsx");

  assert.match(page, /isTestAuthBypassEnabled\(\)/);
  assert.match(page, /redirect\("\/home"\)/);
  assert.match(page, /getSupabaseServerClient\(\)/);
  assert.match(page, /supabase\.auth\.getUser\(\)/);
  assert.match(page, /getAuthenticatedLandingPath\(supabase, user\.id\)/);
  assert.match(page, /return <PublicLanding \/>/);
});

test("public pages use type-only Next metadata imports", async () => {
  const pages = [
    "src/app/page.tsx",
    "src/app/como-funciona/page.tsx",
    "src/app/tutor-gcm-ia/page.tsx",
    "src/app/preguntas-verificadas/page.tsx",
  ];

  for (const pagePath of pages) {
    const source = await read(pagePath);
    assert.match(source, /import type \{ Metadata \} from "next"/);
    assert.doesNotMatch(source, /import \{ Metadata \} from "next"/);
  }
});

test("hero illustration remains exposed as an accessible product image", async () => {
  const hero = await read("src/components/public-landing/hero-illustration.tsx");

  assert.match(hero, /role="img"/);
  assert.match(hero, /aria-label="Vista ilustrativa de una pregunta con respuesta seleccionada y feedback explicativo"/);
  assert.doesNotMatch(hero, /aria-hidden="true">\s*<div className="flex items-center justify-between/);
  assert.equal((hero.match(/<svg/g) ?? []).length, (hero.match(/aria-hidden="true"/g) ?? []).length);
});
