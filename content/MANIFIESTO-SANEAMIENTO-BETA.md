# Manifiesto de saneamiento beta de `content`

Estado: saneamiento beta estructurado y congelado mediante indice maestro.

## Fuentes de verdad para beta

1. `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` gobierna la decision de cada ID.
2. `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv` contiene la cohorte de 100 preguntas para pilotaje.
3. `content/restructuring-v1/00-beta-v1/remanufactura/deuda-remanufactura-total.csv` conserva contenido recuperable fuera de beta.
4. `content/restructuring-v1/00-beta-v1/descarte-tecnico.csv` separa material excluido del banco limpio.

## Regla de carpeta

- `items/`: banco operativo y materializado; no se borra ni se mezcla con mesas de trabajo.
- `profiles/`: definicion de perfiles y vistas de pilotaje, no duplicacion fisica del banco.
- `normative/`: soporte documental normativo.
- `restructuring-v1/`: trazabilidad, auditoria, consolidacion y remanufactura.

## Resultado beta

- Registros unicos reconciliados: 350
- Preguntas seleccionadas para pilotaje: 100
- Las preguntas no aptas quedan como deuda tecnica de remanufactura, no como material activo.

## Prohibicion operativa

Para beta no se debe activar runtime desde `stand-by`, auditorias por lote ni descartes. Todo consumo debe pasar por el indice maestro beta.
