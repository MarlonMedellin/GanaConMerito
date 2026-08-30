# Catálogo de fuentes de conocimiento

Esta carpeta define cómo inventariar normas, teoría, guías, documentos técnicos y
temarios antes de relacionarlos con preguntas, perfiles/cargos u OPEC.

## Principio

**Una fuente = una identidad.** No crear una copia del mismo documento para cada
perfil u OPEC.

## Metadatos mínimos recomendados

Cada registro futuro de catálogo debería poder representar:

- `sourceId` — identificador editorial estable;
- `sourceType` — `normative`, `academic`, `technical`, `guide` o `theme_map`;
- `title`;
- `reference`;
- `issuerOrAuthor`;
- `publicationDate` cuando exista;
- `effectiveFrom` / `effectiveTo` cuando aplique normativa;
- `verificationStatus` — por ejemplo `verified`, `needs_review`, `superseded`;
- `verifiedAt`;
- `url`;
- `repoPath` cuando exista archivo local autorizado;
- `locator` — artículo, página, capítulo o sección;
- `knowledgeLevel` — `A|B|C|D|E|F`, como clasificación de fuente/conocimiento;
- `compatibleDomains` / `compatibleTopics` / `compatibleCompetencies` cuando se
  necesite un guardarraíl simple de clasificación para reactivos V4.1;
- `rightsNote` cuando aplique;
- `notes`.

La aplicabilidad por familia/perfil/OPEC no debe duplicarse dentro del archivo de
fuente si puede modelarse mediante mapas/relaciones dedicadas.

La compatibilidad con `domain`, `topic` y `competency` no es una ontología
exhaustiva. Se declara solo cuando ayuda a detectar usos claramente inválidos de
`sourceId` durante validación editorial o importación.

## Normativa

Para normas, además registrar cuando sea posible:

- autoridad emisora;
- número y año;
- tipo normativo;
- estado de vigencia;
- normas modificatorias/derogatorias relevantes;
- artículos o apartados usados para construir reactivos.

La vigencia debe verificarse antes de generar o auditar una pregunta normativa.

## Fuentes académicas/técnicas

Guardar el archivo completo solo cuando exista derecho/licencia para hacerlo. En
caso contrario conservar metadatos, referencia, URL y notas/extractos permitidos.

## Relación futura con Supabase

La normalización propuesta usa:

- `knowledge_sources`;
- `knowledge_source_targets`;
- `item_source_links`.

Ver `docs/03-architecture/question-bank-knowledge-targeting-architecture.md`.
