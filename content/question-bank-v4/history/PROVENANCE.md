# Provenance de insumos históricos V4

Este documento evita que la reorganización del repositorio reescriba retrospectivamente cómo se produjo el banco V4.

## 1. `temas.md` / `temas(1).md`

Varios informes históricos de expansión registran que durante la producción se utilizó un archivo denominado `temas.md` o `temas(1).md` como mapa de oportunidades temáticas.

La arquitectura actual preserva un insumo temático docente en:

`../../knowledge-base/themes/docentes/temario-base.md`

### Lo que sí puede afirmarse

- Los documentos históricos demuestran que existió un insumo temático denominado `temas.md`/`temas(1).md` durante la expansión.
- El archivo `temario-base.md` conserva el temario original aportado posteriormente para la nueva arquitectura de conocimiento.
- Ambos pertenecen a la misma línea funcional: sirven como insumos de planeación y detección de oportunidades, no como autoridad automática de taxonomía ni como banco aprobado.

### Lo que no debe afirmarse sin evidencia adicional

No se ha demostrado mediante hash, commit histórico o comparación byte a byte que `temas.md`, `temas(1).md` y `temario-base.md` sean exactamente el mismo archivo físico o una copia idéntica.

Por ello:

- no se reemplazan retrospectivamente las menciones históricas a `temas.md`;
- no se modifica el cuerpo histórico de los informes para aparentar que usaron `knowledge-base/`;
- para trabajo nuevo se usa `../../knowledge-base/themes/docentes/temario-base.md` como insumo preservado y se crean artefactos derivados separados para normalización, verificación y gap analysis.

## 2. Perfiles históricos

El plan histórico de expansión referencia perfiles bajo:

`content/profiles/docente/`

La arquitectura canónica actual define los perfiles docentes en:

`../../targeting/profiles/docentes.json`

Los códigos canónicos actuales son:

- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

Los documentos históricos pueden seguir mencionando la ruta antigua porque esa mención describe el proceso de producción de aquel momento. Para decisiones nuevas de targeting, importación futura o Supabase solo debe utilizarse el catálogo de `content/targeting/`.

## 3. Regla de interpretación

La reorganización distingue tres clases de evidencia:

1. **evidencia histórica**: qué archivo, ruta o criterio se usó en una fase anterior;
2. **fuente canónica actual**: qué catálogo o documento gobierna el trabajo nuevo;
3. **equivalencia demostrada**: relación respaldada por evidencia suficiente entre una fuente histórica y una actual.

No debe inferirse la tercera categoría solo porque dos archivos tengan nombres, temas o códigos similares.

## 4. Impacto sobre el banco y Supabase

- Este documento no modifica reactivos ni taxonomía.
- No autoriza backfills de perfiles.
- No convierte el temario en `topics`.
- No crea OPEC.
- No modifica `MANIFEST.json`.
- Para una futura migración de targeting/knowledge se deben usar las identidades canónicas actuales y conservar esta capa histórica únicamente como provenance.
