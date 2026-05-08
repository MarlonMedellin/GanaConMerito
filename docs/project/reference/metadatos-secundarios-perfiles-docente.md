# Metadatos secundarios para perfiles docentes

## Propósito

Agregar una segunda capa de clasificación para perfiles docentes sin romper la estructura principal del banco.

## Regla central

La organización base sigue siendo:
- `area`
- `subarea`
- `competency`

La segunda capa no reemplaza esa estructura. Solo la complementa.

## Metadatos opcionales recomendados

### `targetRole`
Familia general del examen o rol macro.

Valor recomendado para esta línea del banco:
```yaml
targetRole: docente
```

### `targetPosition`
Perfil puntual al que el ítem apunta de manera principal.

Valores recomendados:
- `rector_director_rural`
- `coordinador`
- `docente_aula_preescolar`
- `docente_aula_basica_primaria`
- `docente_aula_secundaria_media`
- `docente_orientador`

### `applicantProfile`
Agrupador más amplio para análisis, filtros y cobertura.

Valores recomendados:
- `directivo_docente`
- `docente_de_aula`
- `docente_orientador`

### `tags`
Lista opcional para afinidades secundarias, doble pertinencia o filtros livianos.

Ejemplos:
```yaml
tags:
  - perfil:coordinador
  - perfil:rector_director_rural
  - foco:liderazgo_escolar
  - uso:caso_situacional
```

## Cuándo usar cada campo

### Usa `targetPosition`
Cuando el ítem fue diseñado claramente para un perfil principal.

### Usa `applicantProfile`
Cuando necesitas agrupar varios perfiles bajo una misma familia.

### Usa `tags`
Cuando el ítem también sirve para otros perfiles o quieres dejar pistas de búsqueda sin crear más columnas rígidas.

## Cuándo no usar esta capa

No la uses si el ítem es ampliamente reusable y no gana valor real al asociarlo a un perfil.

En esos casos basta con:
- `area`
- `subarea`
- `competency`
- `difficulty`
- `targetLevel`

## Plantilla mínima con segunda capa

```yaml
---
id: item-ped-0042
slug: pedagogia-evaluacion-aprendizaje-004
title: Uso pedagógico de evidencias de aprendizaje
area: pedagogia
subarea: evaluacion_del_aprendizaje
examType: docente
competency: evaluacion_formativa
difficulty: 0.42
targetLevel: intermedio
targetRole: docente
targetPosition: coordinador
applicantProfile: directivo_docente
tags:
  - perfil:coordinador
  - foco:seguimiento_academico
itemType: multiple_choice
normativeRefs: []
published: true
version: 1
---
```

## Cómo queda la segunda capa en la práctica

### Capa 1: estructura canónica
```text
content/items/pedagogia/
```

### Capa 2: lectura editorial y filtrado
```yaml
targetRole: docente
targetPosition: coordinador
applicantProfile: directivo_docente
```

Esto permite que el archivo siga viviendo donde mejor conversa con el banco, pero quede marcado para búsquedas, lotes y filtros por perfil.

## Beneficio real

Mejora la estructura porque:
- conserva reusabilidad
- evita duplicación de ítems
- permite segmentar por perfil sin partir el banco en seis mini bancos
- facilita futuros dashboards, filtros e importaciones

## Riesgo de complejidad

Sí crea una complejidad pequeña, pero controlada.

La complejidad se mantiene baja si cumples estas reglas:
- no vuelvas obligatorios estos campos para todos los ítems
- no inventes nuevos valores fuera del catálogo acordado
- no reemplaces `area`, `subarea` y `competency` por etiquetas de cargo
- usa `tags` con moderación

## Recomendación operativa

Adopta esta segunda capa como `opcional pero estándar`.

Eso significa:
- obligatoria para ítems claramente diseñados para un perfil específico
- opcional para ítems transversales
- útil para lotes, filtros y cobertura editorial
