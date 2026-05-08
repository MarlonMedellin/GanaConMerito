# Estructura híbrida del banco por taxonomía y perfiles docentes

## Decisión de organización

El banco de preguntas de GanaConMerito debe mantener como eje canónico:

1. `area`
2. `subarea`
3. `competency`

Los perfiles profesionales docentes deben operar como una capa secundaria de organización, planeación y filtrado editorial, sin convertirse en la base principal del almacenamiento.

## Carpeta canónica de preguntas

```text
content/items/
  matematicas/
  pedagogia/
  normatividad/
  gestion/
  lectura_critica/
  competencias_ciudadanas/
```

Aquí viven los ítems finales en formato canónico del proyecto.

## Carpeta secundaria por perfiles docentes

```text
content/profiles/
  docente/
    rector_director_rural/
    coordinador/
    docente_aula_preescolar/
    docente_aula_basica_primaria/
    docente_aula_secundaria_media/
    docente_orientador/
```

Estas carpetas sirven para:
- planeación editorial por perfil
- curación de lotes por cargo
- mapeo entre perfiles y taxonomía
- organización de trabajo futuro sin duplicar ítems canónicos

## Regla de uso

### Guardar aquí
- preguntas definitivas: `content/items/<area>/`
- notas, mapas, lotes y criterios por perfil: `content/profiles/docente/<perfil>/`

### No hacer
- duplicar un mismo ítem final en `content/items/` y `content/profiles/`
- reorganizar el banco primero por cargo
- crear carpetas principales por convocatoria

## Perfiles docentes cubiertos

1. `rector_director_rural`
2. `coordinador`
3. `docente_aula_preescolar`
4. `docente_aula_basica_primaria`
5. `docente_aula_secundaria_media`
6. `docente_orientador`

## Relación recomendada entre taxonomía y perfiles

### rector_director_rural
Mayor afinidad con:
- `gestion`
- `pedagogia`
- `normatividad`
- `competencias_ciudadanas`

### coordinador
Mayor afinidad con:
- `gestion`
- `pedagogia`
- `normatividad`
- `lectura_critica`

### docente_aula_preescolar
Mayor afinidad con:
- `pedagogia`
- `competencias_ciudadanas`
- `lectura_critica`

### docente_aula_basica_primaria
Mayor afinidad con:
- `pedagogia`
- `lectura_critica`
- `matematicas`
- `competencias_ciudadanas`

### docente_aula_secundaria_media
Mayor afinidad con:
- `pedagogia`
- `lectura_critica`
- `matematicas`
- `normatividad`

### docente_orientador
Mayor afinidad con:
- `pedagogia`
- `competencias_ciudadanas`
- `normatividad`
- `gestion`

## Convención práctica sugerida

Cuando un ítem necesite segmentación adicional por perfil, usar metadatos secundarios futuros como:
- `targetRole`
- `targetPosition`
- `applicantProfile`
- `tags`

Sin romper la carpeta base `content/items/<area>/`.
