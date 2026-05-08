# Checklist operativo — rollout de segmentación por perfil profesional

## Objetivo
Aplicar y validar la segmentación por perfil profesional + núcleos temáticos sin romper el flujo actual de práctica.

## Nota de coherencia editorial
Esta checklist describe una capa de segmentación de base de datos y runtime.

No reemplaza la arquitectura editorial vigente del banco, que sigue esta regla:
- `content/items/` = ítems finales canónicos
- organización primaria del banco = `area -> subarea -> competency`
- `content/profiles/docente/` = capa secundaria de trabajo editorial por perfil
- metadatos como `targetRole`, `targetPosition` y `applicantProfile` = segmentación editorial secundaria opcional en Markdown

La capa de segmentación operacional no debe reinterpretarse como una orden para reorganizar carpetas principales por cargo.

## Alcance de este rollout
- `0006_profiles_nuclei_editorial_base.sql`
- `0007_backfill_profiles_nuclei.sql`
- `select-next-item.ts`
- `session/start/route.ts`
- `session/advance/route.ts`

---

## 1. Precondiciones

- [ ] El entorno actual de producción está estable
- [ ] Existe respaldo lógico de la base de datos o punto de recuperación aceptable
- [ ] El repo local tiene los cambios correctos revisados
- [ ] Se conoce el proyecto Supabase correcto
- [ ] Se dispone del flujo de deploy con o sin DB según corresponda

---

## 2. Validación previa al cambio

### 2.1 Verificar estado actual del banco
```sql
select count(*) as total_items from public.item_bank;

select count(*) as published_items
from public.item_bank
where is_published = true;
```

### 2.2 Verificar que todavía no existan los nuevos objetos
```sql
select to_regclass('public.professional_profiles');
select to_regclass('public.thematic_nuclei');
select to_regclass('public.profile_thematic_nuclei');
```

---

## 3. Aplicación de migraciones

## Orden obligatorio
1. `0006_profiles_nuclei_editorial_base.sql`
2. `0007_backfill_profiles_nuclei.sql`

### Comando esperado
```bash
npx supabase db push
```

### Opción recomendada en este proyecto
Usar el script con DB cuando ya quede integrado en el entorno operativo.

---

## 4. Validación post-migración (estructura)

### 4.1 Tablas nuevas
```sql
select to_regclass('public.professional_profiles');
select to_regclass('public.thematic_nuclei');
select to_regclass('public.profile_thematic_nuclei');
```

### 4.2 Nuevas columnas
```sql
select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'learning_profiles'
  and column_name = 'professional_profile_id';

select column_name
from information_schema.columns
where table_schema = 'public'
  and table_name = 'item_bank'
  and column_name in ('thematic_nucleus_id', 'status', 'is_active', 'source_type', 'source_path');
```

---

## 5. Validación post-migración (datos)

### 5.1 Núcleo legacy
```sql
select id, code, name, is_universal, is_active
from public.thematic_nuclei
where code = 'legacy-general';
```

### 5.2 Perfiles iniciales
```sql
select code, name, is_active
from public.professional_profiles
order by code;
```

### 5.3 Matriz inicial
```sql
select count(*) as relations_count
from public.profile_thematic_nuclei;
```

### 5.4 Backfill del banco
```sql
select count(*) as items_without_nucleus
from public.item_bank
where thematic_nucleus_id is null;
```

Resultado esperado:
- `0`

### 5.5 Gate crítico
```sql
select count(*) as published_without_nucleus
from public.item_bank
where status = 'published'
  and thematic_nucleus_id is null;
```

Resultado esperado:
- `0`

---

## 6. Validación editorial transitoria

### 6.1 Coherencia básica entre `is_published` y `status`
```sql
select count(*) as published_flag_but_not_status
from public.item_bank
where is_published = true
  and status <> 'published';
```

Resultado esperado:
- `0` o valor explicado conscientemente

### 6.2 Ítems elegibles con el nuevo criterio
```sql
select count(*) as eligible_items
from public.item_bank
where status = 'published'
  and is_active = true;
```

### 6.3 Recordatorio de coherencia con el sistema editorial
- [ ] Confirmar que el rollout de segmentación no introdujo carpetas principales por cargo en `content/items/`
- [ ] Confirmar que la taxonomía base `area`, `subarea`, `competency` sigue siendo el eje editorial primario
- [ ] Confirmar que la segunda capa por perfil sigue siendo opcional y gobernada

---

## 7. Validación de aplicación

### 7.1 Build local / CI
```bash
npx tsc --noEmit
```

### 7.2 Deploy del backend/app
- [ ] Deploy realizado
- [ ] Servicio reiniciado correctamente
- [ ] Logs sin error inmediato

### 7.3 Health check
```bash
curl -I http://127.0.0.1:3000
curl -Ik https://cnsc.profemarlon.com
```

---

## 8. Prueba funcional mínima de práctica

### Caso base
- [ ] iniciar sesión autenticada
- [ ] abrir `/practice`
- [ ] iniciar práctica
- [ ] verificar que se crea sesión
- [ ] verificar que llega `currentItemId`
- [ ] responder un ítem
- [ ] verificar que `advance` devuelve `nextItemId` o estado coherente
- [ ] completar la sesión sin error 500

### Qué vigilar
- error en `learning_profiles`
- error por columnas nuevas ausentes
- error por tablas nuevas ausentes
- mensajes tipo “No hay un siguiente ítem disponible...” cuando no corresponde

---

## 9. Consultas de depuración rápida

### 9.1 Usuarios sin perfil profesional aún
```sql
select count(*) as learning_profiles_without_professional_profile
from public.learning_profiles
where professional_profile_id is null;
```

### 9.2 Distribución de ítems por núcleo
```sql
select tn.code, count(*)
from public.item_bank ib
join public.thematic_nuclei tn on tn.id = ib.thematic_nucleus_id
group by tn.code
order by count(*) desc;
```

### 9.3 Estado editorial del banco
```sql
select status, is_active, count(*)
from public.item_bank
group by status, is_active
order by status, is_active;
```

---

## 10. Criterio de éxito de la Épica 1

La Épica 1 se considera validada si:
- [ ] migraciones aplicadas sin error
- [ ] published_without_nucleus = 0
- [ ] la app compila y despliega
- [ ] `/practice` inicia sesión correctamente
- [ ] `start` y `advance` usan la nueva selección sin fallos
- [ ] no aparecen errores 500 por incompatibilidad de esquema
- [ ] no se rompió la coherencia entre segmentación operacional y estructura editorial del banco

---

## 11. Qué NO hacer todavía

- [ ] no construir aún `/admin/editorial/*`
- [ ] no asumir que `legacy-general` es clasificación final
- [ ] no endurecer toda la lógica de elegibilidad en RLS sin evidencia de necesidad
- [ ] no eliminar `is_published` hasta cerrar la transición de queries críticas
- [ ] no usar esta checklist como justificación para convertir el banco en carpetas primarias por perfil

---

## 12. Siguiente paso después de validar esta checklist

1. ajustar onboarding para `learning_profiles.professional_profile_id`
2. definir reclasificación progresiva del banco desde `legacy-general`
3. luego avanzar a biblioteca editorial y admin
4. decidir si parte de esta segmentación debe leer también los metadatos editoriales secundarios del Markdown
