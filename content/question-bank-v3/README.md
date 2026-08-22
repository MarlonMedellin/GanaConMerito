# Banco de preguntas v3

Estructura nueva y limpia para preguntas por OPEC/perfil. Esta version elimina la estructura v2 previa y no contiene migracion de preguntas legacy.

La OPEC inicial es `docente-aula-basica-secundaria`, perfil provisional para docente de aula de basica secundaria mientras no exista codigo OPEC oficial especifico.

Los items de esta estructura son insumo legacy para V4: se procesan uno por uno
con la fabrica y el auditor correspondientes de `docs/ai/skills/`. No se migran
ni se corrigen in-place hacia V4; solo puede nacer un reactivo nuevo aprobado.
