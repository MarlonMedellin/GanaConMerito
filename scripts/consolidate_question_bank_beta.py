#!/usr/bin/env python3
"""Build a reproducible beta consolidation index for the question bank."""

from __future__ import annotations

import csv
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
OUT = CONTENT / "restructuring-v1" / "00-beta-v1"
CONTENT_MANIFEST = CONTENT / "MANIFIESTO-SANEAMIENTO-BETA.md"
CONTENT_README = CONTENT / "README.md"
ITEMS_ARCHIVE = CONTENT / "items" / "no-beta-v1"

AREAS = {
    "pedagogia",
    "normatividad",
    "gestion",
    "lectura_critica",
    "matematicas",
    "competencias_ciudadanas",
}

AREA_ALIASES = {
    "pedagogia": "pedagogia",
    "pedagogía": "pedagogia",
    "didactica_y_mediacion": "pedagogia",
    "inclusion_y_enfoque_diferencial": "pedagogia",
    "normatividad": "normatividad",
    "normatividad educativa": "normatividad",
    "proteccion_integral": "normatividad",
    "protección integral": "normatividad",
    "gestion": "gestion",
    "gestión": "gestion",
    "gestion_institucional": "gestion",
    "gestión institucional": "gestion",
    "lectura_critica": "lectura_critica",
    "lectura crítica": "lectura_critica",
    "matematicas": "matematicas",
    "matemáticas": "matematicas",
    "competencias_ciudadanas": "competencias_ciudadanas",
    "competencias ciudadanas": "competencias_ciudadanas",
}

PROFILES = {
    "rector_director_rural",
    "coordinador",
    "preescolar",
    "basica_primaria",
    "secundaria_media",
    "orientador",
    "por_confirmar",
}

TYPES = {"basica", "funcional", "comportamental"}


@dataclass
class Record:
    id_item: str
    sources: set[str] = field(default_factory=set)
    decisions: set[str] = field(default_factory=set)
    actions: set[str] = field(default_factory=set)
    area: str = "por_clasificar"
    subarea: str = ""
    profile: str = "por_confirmar"
    item_type: str = "por_confirmar"
    path: str = ""
    source_path: str = ""
    lote: str = ""
    notes: list[str] = field(default_factory=list)
    has_physical_json: bool = False
    status: str = "PENDIENTE_CLASIFICACION"
    priority: int = 0
    validation: set[str] = field(default_factory=set)


records: dict[str, Record] = {}
payloads: dict[str, dict[str, Any]] = {}


def get_record(id_item: str) -> Record | None:
    clean = (id_item or "").strip()
    if not clean or clean.lower() in {"id", "id_item", "item_id"}:
        return None
    if clean not in records:
        records[clean] = Record(clean)
    return records[clean]


def norm_text(value: Any) -> str:
    return str(value or "").strip()


def normalize_area(value: str, path: str = "") -> str:
    raw = norm_text(value).lower().replace("-", "_")
    if raw in AREA_ALIASES:
        return AREA_ALIASES[raw]
    for area in AREAS:
        if (
            f"/{area}/" in path
            or path.startswith(f"content/items/{area}/")
            or path.startswith(f"content/items/beta-v1/{area}/")
            or path.startswith(f"content/items/no-beta-v1/banco-operacional-previo/{area}/")
        ):
            return area
    parts = Path(path).parts
    folder = ""
    if path.startswith("content/items/no-beta-v1/banco-operacional-previo/") and len(parts) > 4:
        folder = parts[4]
    elif path.startswith("content/items/") and len(parts) > 2:
        folder = parts[2]
    folder_low = folder.lower()
    if "matem" in folder_low:
        return "matematicas"
    if "lectura" in folder_low or "textual" in folder_low:
        return "lectura_critica"
    if "convivencia" in folder_low or "legal" in folder_low or "ley" in folder_low or "norma" in folder_low:
        return "normatividad"
    if "gest" in folder_low or "pei" in folder_low:
        return "gestion"
    if "ciudad" in folder_low:
        return "competencias_ciudadanas"
    if folder:
        return "pedagogia"
    return "por_clasificar"


def infer_profile(path: str) -> str:
    parts = set(Path(path).parts)
    for profile in PROFILES:
        if profile in parts:
            return profile
    if "docente_orientador" in parts:
        return "orientador"
    if "docente_aula_preescolar" in parts:
        return "preescolar"
    if "docente_aula_basica_primaria" in parts:
        return "basica_primaria"
    if "docente_aula_secundaria_media" in parts:
        return "secundaria_media"
    return "por_confirmar"


def infer_type(path: str, data: dict[str, Any] | None = None) -> str:
    parts = set(Path(path).parts)
    for item_type in TYPES:
        if item_type in parts:
            return item_type
    candidate = norm_text((data or {}).get("tipo_item") or (data or {}).get("tipo"))
    return candidate if candidate in TYPES else "funcional"


def update_record(
    id_item: str,
    source: str,
    decision: str = "",
    action: str = "",
    area: str = "",
    subarea: str = "",
    profile: str = "",
    item_type: str = "",
    path: str = "",
    source_path: str = "",
    lote: str = "",
    note: str = "",
) -> None:
    rec = get_record(id_item)
    if rec is None:
        return
    rec.sources.add(source)
    if decision:
        rec.decisions.add(decision)
    if action:
        rec.actions.add(action)
    if path and (not rec.path or "content/items" in path):
        rec.path = path
    if source_path and not rec.source_path:
        rec.source_path = source_path
    area_norm = normalize_area(area, path or source_path)
    if area_norm != "por_clasificar" and rec.area == "por_clasificar":
        rec.area = area_norm
    elif rec.area == "por_clasificar":
        rec.area = area_norm
    if subarea and not rec.subarea:
        rec.subarea = subarea
    inferred_profile = profile or infer_profile(path or source_path)
    if inferred_profile != "por_confirmar" or rec.profile == "por_confirmar":
        rec.profile = inferred_profile
    inferred_type = item_type or infer_type(path or source_path)
    if inferred_type != "por_confirmar" or rec.item_type == "por_confirmar":
        rec.item_type = inferred_type
    if lote and not rec.lote:
        rec.lote = lote
    if note:
        rec.notes.append(note)


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        return [row for row in csv.DictReader(handle) if any((v or "").strip() for v in row.values())]


def load_content_items() -> None:
    for path in (CONTENT / "items").rglob("*.json"):
        rel = path.relative_to(ROOT).as_posix()
        if (
            "/stand-by/" in rel
            or rel.startswith("content/items/beta-v1/")
            or rel.startswith("content/items/no-beta-v1/stand-by-historico/")
        ):
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception as exc:
            update_record(path.stem, "content/items/json_error", note=f"JSON invalido: {exc}", path=rel)
            continue
        id_item = norm_text(data.get("id_item") or data.get("id") or path.stem)
        payloads.setdefault(id_item, data)
        update_record(
            id_item,
            "content/items",
            decision=norm_text(data.get("estado") or data.get("status")),
            area=norm_text(data.get("area")),
            subarea=norm_text(data.get("subarea") or data.get("subtema")),
            item_type=infer_type(rel, data),
            path=rel,
        )
        rec = records[id_item]
        rec.has_physical_json = True
        validate_item_shape(rec, data)


def validate_item_shape(rec: Record, data: dict[str, Any]) -> None:
    opciones = data.get("opciones")
    clave = data.get("clave") or data.get("respuestaCorrecta") or data.get("respuesta_correcta")
    justificacion = (
        data.get("justificacion_clave")
        or data.get("justificacionClave")
        or data.get("explicacionGeneral")
        or data.get("Explicacion")
        or data.get("explanation")
    )
    if isinstance(opciones, list) and len(opciones) >= 4:
        rec.validation.add("opciones_ok")
    elif isinstance(opciones, dict) and len(opciones) >= 4:
        rec.validation.add("opciones_ok")
    else:
        rec.validation.add("revisar_opciones")
    if clave:
        rec.validation.add("clave_ok")
    else:
        rec.validation.add("revisar_clave")
    if justificacion:
        rec.validation.add("justificacion_ok")
    else:
        rec.validation.add("revisar_justificacion")


def load_operational_csv() -> None:
    path = ITEMS_ARCHIVE / "control-operacional" / "_banco-operacional.csv"
    if not path.exists():
        path = CONTENT / "items" / "_banco-operacional.csv"
    for row in read_csv(path):
        update_record(
            row.get("id_item", ""),
            "content/items/_banco-operacional.csv",
            decision=row.get("decision", ""),
            area=row.get("area", ""),
            subarea=row.get("subarea", ""),
            path=row.get("ruta_final", ""),
        )


def load_fase5() -> None:
    for row in read_csv(CONTENT / "restructuring-v1/consolidacion/fase-5/banco-final.csv"):
        update_record(
            row.get("ID", ""),
            "fase-5/banco-final",
            decision=row.get("estado_final", ""),
            action=row.get("accion_final", ""),
            area=row.get("macrodominio", ""),
            path=row.get("carpeta", ""),
            lote=row.get("lote_origen", ""),
            note=row.get("observaciones", ""),
        )
    for row in read_csv(CONTENT / "restructuring-v1/consolidacion/fase-5/pilotaje.csv"):
        update_record(
            row.get("ID", ""),
            "fase-5/pilotaje",
            decision="LISTO_PARA_PILOTAJE",
            area=row.get("macrodominio", ""),
            note=row.get("observaciones", ""),
        )


def load_fase5b() -> None:
    base = CONTENT / "restructuring-v1/consolidacion/fase-5b"
    for path in base.glob("microbloque-*/banco-premium.csv"):
        for row in read_csv(path):
            update_record(
                row.get("id_item", ""),
                f"fase-5b/{path.parent.name}/banco-premium",
                decision=row.get("estado_operacional", "") or "PREMIUM",
                action=row.get("accion_5b", ""),
                path=row.get("ruta_destino_operacional", "") or row.get("ruta_origen", ""),
                source_path=row.get("ruta_origen", ""),
                lote=row.get("lote_origen", ""),
                note=row.get("observaciones", ""),
            )
    for path in (base / "banco-operacional").glob("*.csv"):
        for row in read_csv(path):
            update_record(
                row.get("id_item", ""),
                f"fase-5b/banco-operacional/{path.name}",
                decision=row.get("decision", ""),
                action=row.get("accion", ""),
                lote=row.get("lote_fuente", ""),
            )
    for path in (base / "remediacion-liviana").glob("*.csv"):
        for row in read_csv(path):
            update_record(
                row.get("id_item", ""),
                f"fase-5b/remediacion-liviana/{path.name}",
                decision="OPERACIONAL_AJUSTADO",
                action=row.get("accion", ""),
                lote=row.get("lote_fuente", ""),
            )
    for path in (base / "descarte-real").glob("*.csv"):
        for row in read_csv(path):
            update_record(
                row.get("id_item", ""),
                f"fase-5b/descarte-real/{path.name}",
                decision=row.get("decision", "") or "DESCARTAR",
                action=row.get("accion", ""),
                lote=row.get("lote_fuente", ""),
            )


def load_audits() -> None:
    for path in (CONTENT / "restructuring-v1/auditoria/lotes").glob("L*/items-corregidos.json"):
        try:
            items = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            id_item = norm_text(item.get("id_item", ""))
            if id_item:
                payloads.setdefault(id_item, item)
            meta = item.get("metadata_editorial") if isinstance(item.get("metadata_editorial"), dict) else {}
            dest = norm_text(meta.get("ruta_destino_propuesta") or item.get("ruta_destino_propuesta"))
            origin = norm_text(meta.get("ruta_origen") or item.get("ruta_origen"))
            update_record(
                id_item,
                f"auditoria/{path.parent.name}",
                decision=norm_text(meta.get("decision") or item.get("decision") or item.get("estado")),
                area=item.get("area", ""),
                subarea=item.get("subtema", ""),
                profile=infer_profile(dest),
                item_type=infer_type(dest, item),
                path=dest,
                source_path=origin,
                lote=norm_text(meta.get("lote") or item.get("lote") or path.parent.name),
                note=norm_text(item.get("motivo") or item.get("justificacion_clave")),
            )


def finalize() -> None:
    rank = {
        "PREMIUM": 100,
        "MATERIALIZADO": 95,
        "LISTO_PARA_BANCO": 90,
        "Listo para el banco": 90,
        "BANCO_OPERACIONAL": 85,
        "OPERACIONAL_AJUSTADO": 75,
        "LISTO_PARA_PILOTAJE": 65,
        "PILOTAJE": 60,
        "DESCARTAR": -100,
        "fuera_banco": -100,
    }
    for rec in records.values():
        text = " ".join([*rec.decisions, *rec.actions, *rec.sources]).lower()
        rec.priority = max([rank.get(d, 0) for d in rec.decisions] + [0])
        if "premium" in text:
            rec.priority = max(rec.priority, 100)
        if rec.has_physical_json:
            rec.priority = max(rec.priority, 85)
        if "descartar" in text or "descarte-real" in text or "excluir" in text:
            rec.status = "DESCARTE_TECNICO"
            rec.priority = -100
        elif "remediacion" in text or "ajuste_menor" in text:
            rec.status = "REMANUFACTURA_TECNICA" if rec.priority < 75 else "PILOTAJE_CON_AJUSTE"
        elif rec.priority >= 85:
            rec.status = "PILOTAJE_V1_CANDIDATO"
        elif "pilotaje" in text:
            rec.status = "PILOTAJE_V1_RESERVA"
        else:
            rec.status = "PENDIENTE_CLASIFICACION"
        if rec.area == "por_clasificar":
            rec.area = normalize_area("", rec.path or rec.source_path)
        if not rec.path and rec.source_path:
            rec.path = rec.source_path


def write_csv(path: Path, rows: list[dict[str, Any]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def as_row(rec: Record) -> dict[str, Any]:
    return {
        "id_item": rec.id_item,
        "estado_beta": rec.status,
        "prioridad": rec.priority,
        "area_canonica": rec.area,
        "subarea": rec.subarea,
        "perfil_sugerido": rec.profile,
        "tipo_item": rec.item_type,
        "ruta_actual_o_propuesta": rec.path,
        "ruta_origen": rec.source_path,
        "lote": rec.lote,
        "decisiones": " | ".join(sorted(rec.decisions)),
        "acciones": " | ".join(sorted(rec.actions)),
        "fuentes": " | ".join(sorted(rec.sources)),
        "json_materializado": "si" if rec.has_physical_json else "no",
        "validacion_minima": " | ".join(sorted(rec.validation)),
        "destino_beta": beta_destination(rec),
        "notas": " / ".join(dict.fromkeys(n for n in rec.notes if n))[:500],
    }


def beta_destination(rec: Record) -> str:
    if rec.status in {"PILOTAJE_V1_CANDIDATO", "PILOTAJE_CON_AJUSTE", "PILOTAJE_V1_RESERVA"}:
        return f"content/items/beta-v1/{rec.area}/{rec.id_item}.json"
    if rec.status in {"REMANUFACTURA_TECNICA", "DESCARTE_TECNICO"}:
        return f"content/restructuring-v1/00-beta-v1/remanufactura/{rec.id_item}.json"
    return ""


def select_pilot(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    candidates = [
        row
        for row in rows
        if row["estado_beta"] in {"PILOTAJE_V1_CANDIDATO", "PILOTAJE_CON_AJUSTE", "PILOTAJE_V1_RESERVA"}
    ]
    targets = {
        "pedagogia": 35,
        "normatividad": 20,
        "competencias_ciudadanas": 15,
        "gestion": 10,
        "lectura_critica": 10,
        "matematicas": 10,
    }
    candidates.sort(key=lambda row: (-int(row["prioridad"]), row["area_canonica"], row["id_item"]))
    selected: list[dict[str, Any]] = []
    used: set[str] = set()
    for area, target in targets.items():
        for row in [r for r in candidates if r["area_canonica"] == area]:
            if len([r for r in selected if r["area_canonica"] == area]) >= target:
                break
            selected.append(row)
            used.add(row["id_item"])
    for row in candidates:
        if len(selected) >= 100:
            break
        if row["id_item"] not in used:
            selected.append(row)
            used.add(row["id_item"])
    for idx, row in enumerate(selected[:100], 1):
        row["orden_piloto"] = idx
        row["estado_pilotaje"] = "PILOTAJE_V1"
    return selected[:100]


def split_pilot_views(pilot: list[dict[str, Any]], fields: list[str]) -> None:
    pilot_fields = ["orden_piloto", "estado_pilotaje", *fields]
    for area in sorted({row["area_canonica"] for row in pilot}):
        write_csv(
            OUT / "piloto-v1" / "por-dimension" / f"{area}.csv",
            [row for row in pilot if row["area_canonica"] == area],
            pilot_fields,
        )
    for profile in sorted({row["perfil_sugerido"] for row in pilot}):
        write_csv(
            OUT / "piloto-v1" / "por-perfil" / f"{profile}.csv",
            [row for row in pilot if row["perfil_sugerido"] == profile],
            pilot_fields,
        )


def materialize_pilot(pilot: list[dict[str, Any]]) -> None:
    base = CONTENT / "items" / "beta-v1"
    base.mkdir(parents=True, exist_ok=True)
    for stale in base.rglob("*.json"):
        stale.unlink()
    readme = [
        "# content/items/beta-v1",
        "",
        "Cohorte materializada de 100 preguntas para pilotaje beta.",
        "",
        "Esta carpeta es generada desde `scripts/consolidate_question_bank_beta.py` usando el indice maestro de `content/restructuring-v1/00-beta-v1`.",
        "",
        "Regla: no editar aqui sin regenerar o registrar el cambio en el indice maestro beta.",
        "",
    ]
    (base / "README.md").write_text("\n".join(readme), encoding="utf-8")
    for row in pilot:
        data = payloads.get(row["id_item"])
        if not data:
            continue
        item = dict(data)
        item["id_item"] = row["id_item"]
        item["estado_beta"] = "PILOTAJE_V1"
        item["area_canonica_beta"] = row["area_canonica"]
        item["perfil_sugerido_beta"] = row["perfil_sugerido"]
        item["tipo_item_beta"] = row["tipo_item"]
        item["trazabilidad_beta"] = {
            "indice_maestro": "content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv",
            "orden_piloto": row.get("orden_piloto", ""),
            "fuentes": row.get("fuentes", ""),
            "ruta_origen": row.get("ruta_actual_o_propuesta", "") or row.get("ruta_origen", ""),
        }
        dest = base / row["area_canonica"] / f"{row['id_item']}.json"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(json.dumps(item, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
def write_markdown(rows: list[dict[str, Any]], pilot: list[dict[str, Any]]) -> None:
    area_counts = Counter(row["area_canonica"] for row in rows)
    status_counts = Counter(row["estado_beta"] for row in rows)
    pilot_area_counts = Counter(row["area_canonica"] for row in pilot)
    profile_counts = Counter(row["perfil_sugerido"] for row in rows)
    lines = [
        "# Consolidacion beta v1 del banco de preguntas",
        "",
        "Esta carpeta es la fuente operativa para cerrar el banco de preguntas de la beta sin borrar originales.",
        "",
        "## Entregables",
        "",
        "- `indice-maestro-beta.csv`: inventario unificado y deduplicado.",
        "- `piloto-v1-candidatos.csv`: primera cohorte de hasta 100 preguntas reales para pilotaje.",
        "- `piloto-v1/`: vistas cerradas de la cohorte piloto por dimension y perfil.",
        "- `remanufactura/indice-remanufactura.csv`: contenido recuperable que no debe entrar todavia.",
        "- `remanufactura/deuda-remanufactura-total.csv`: preguntas con contenido aprovechable para reconstruccion posterior.",
        "- `descarte-tecnico.csv`: material excluido del banco limpio.",
        "- `por-dimension/*.csv` y `por-perfil/*.csv`: vistas de trabajo para balancear el pilotaje.",
        "",
        "## Regla beta",
        "",
        "Una pregunta entra a pilotaje si tiene ID unico, area canonica, tipo de item, cuatro opciones, clave, justificacion y trazabilidad. Los casos con ajuste menor pueden entrar como `PILOTAJE_CON_AJUSTE`; los descartes se conservan solo para remanufactura conceptual.",
        "",
        "## Resumen",
        "",
        f"- Registros unicos consolidados: {len(rows)}",
        f"- Candidatos piloto seleccionados: {len(pilot)}",
        "",
        "### Estados beta",
        "",
    ]
    for key, value in status_counts.most_common():
        lines.append(f"- {key}: {value}")
    lines.extend(["", "### Cobertura por dimension", ""])
    for key, value in area_counts.most_common():
        lines.append(f"- {key}: {value}")
    lines.extend(["", "### Piloto v1 por dimension", ""])
    for key, value in pilot_area_counts.most_common():
        lines.append(f"- {key}: {value}")
    lines.extend(["", "### Cobertura por perfil sugerido", ""])
    for key, value in profile_counts.most_common():
        lines.append(f"- {key}: {value}")
    lines.extend([
        "",
        "## Siguiente gate",
        "",
        "Revisar manualmente `piloto-v1-candidatos.csv`, normalizar perfiles `por_confirmar` y materializar en `content/items/beta-v1` solo los seleccionados con estado final `PILOTAJE_V1`.",
        "",
    ])
    (OUT / "README.md").write_text("\n".join(lines), encoding="utf-8")


def write_plan() -> None:
    lines = [
        "# Plan operativo de consolidacion beta",
        "",
        "## Objetivo",
        "",
        "Cerrar una cohorte de 100 preguntas reales para pilotaje beta y dejar el resto del banco como deuda tecnica trazable, sin borrar originales ni mezclar material inmaduro con runtime.",
        "",
        "## Estructura final de trabajo",
        "",
        "1. `indice-maestro-beta.csv`: unica fuente de verdad para decidir estado de cada ID.",
        "2. `piloto-v1-candidatos.csv`: cohorte inicial de 100 preguntas para revision humana y pilotaje.",
        "3. `piloto-v1/por-dimension/`: control de cobertura tematica de la cohorte beta.",
        "4. `piloto-v1/por-perfil/`: control de afinidad por perfil del sistema de pruebas.",
        "5. `remanufactura/`: deuda tecnica editorial para recuperar contenido.",
        "6. `descarte-tecnico.csv`: no entra al banco beta; solo se consulta si se va a remanufacturar desde cero.",
        "",
        "## Secuencia de cierre",
        "",
        "1. Revisar `piloto-v1-candidatos.csv` y confirmar los 100 IDs.",
        "2. Cambiar `perfil_sugerido=por_confirmar` solo donde haya evidencia suficiente.",
        "3. Normalizar `tipo_item` en `basica`, `funcional` o `comportamental`.",
        "4. Validar que cada pregunta tenga cuatro opciones, clave, justificacion de clave y funcion de distractores.",
        "5. Marcar los 100 confirmados como `PILOTAJE_V1`.",
        "6. Materializar solo esos 100 en `content/items/beta-v1` o en el loader que alimente el banco activo.",
        "7. Mantener `remanufactura/deuda-remanufactura-total.csv` como backlog editorial posterior a beta.",
        "",
        "## Regla ejecutiva",
        "",
        "Para beta no se intenta balance perfecto por perfil. Se cierra primero una cohorte real, trazable y usable. El balance fino por perfil queda como ajuste de pilotaje a partir de resultados y cobertura.",
        "",
    ]
    (OUT / "PLAN-OPERATIVO.md").write_text("\n".join(lines), encoding="utf-8")


def write_content_manifest(rows: list[dict[str, Any]], pilot: list[dict[str, Any]]) -> None:
    lines = [
        "# Manifiesto de saneamiento beta de `content`",
        "",
        "Estado: saneamiento beta estructurado y congelado mediante indice maestro.",
        "",
        "## Fuentes de verdad para beta",
        "",
        "1. `content/restructuring-v1/00-beta-v1/indice-maestro-beta.csv` gobierna la decision de cada ID.",
        "2. `content/restructuring-v1/00-beta-v1/piloto-v1-candidatos.csv` contiene la cohorte de 100 preguntas para pilotaje.",
        "3. `content/restructuring-v1/00-beta-v1/remanufactura/deuda-remanufactura-total.csv` conserva contenido recuperable fuera de beta.",
        "4. `content/restructuring-v1/00-beta-v1/descarte-tecnico.csv` separa material excluido del banco limpio.",
        "",
        "## Regla de carpeta",
        "",
        "- `items/`: banco operativo y materializado; no se borra ni se mezcla con mesas de trabajo.",
        "- `profiles/`: definicion de perfiles y vistas de pilotaje, no duplicacion fisica del banco.",
        "- `normative/`: soporte documental normativo.",
        "- `restructuring-v1/`: trazabilidad, auditoria, consolidacion y remanufactura.",
        "",
        "## Resultado beta",
        "",
        f"- Registros unicos reconciliados: {len(rows)}",
        f"- Preguntas seleccionadas para pilotaje: {len(pilot)}",
        "- Las preguntas no aptas quedan como deuda tecnica de remanufactura, no como material activo.",
        "",
        "## Prohibicion operativa",
        "",
        "Para beta no se debe activar runtime desde `stand-by`, auditorias por lote ni descartes. Todo consumo debe pasar por el indice maestro beta.",
        "",
    ]
    CONTENT_MANIFEST.write_text("\n".join(lines), encoding="utf-8")


def write_content_readme() -> None:
    lines = [
        "# content",
        "",
        "Carpeta raiz del banco de preguntas, fuentes y perfiles de Gana con Merito.",
        "",
        "## Lectura beta",
        "",
        "La carpeta queda organizada para pilotaje con dos rutas principales:",
        "",
        "```text",
        "content/items/beta-v1/                 # 100 preguntas materializadas para beta",
        "content/restructuring-v1/00-beta-v1/  # indice maestro, vistas y deuda tecnica",
        "```",
        "",
        "Ninguna pregunta fuera de `content/items/beta-v1/` debe activarse en beta sin pasar por el indice maestro.",
        "",
        "## Estructura oficial",
        "",
        "```text",
        "content/",
        "  items/",
        "    beta-v1/       Banco beta listo para pilotaje.",
        "    no-beta-v1/    Material historico, previo o pendiente.",
        "  normative/       Soporte normativo.",
        "  profiles/        Definicion de perfiles y vistas; no duplica banco.",
        "  restructuring-v1/",
        "    00-beta-v1/    Cierre beta y fuente de verdad.",
        "    auditoria/      Lotes auditados.",
        "    trazabilidad/   Decisiones y bitacoras.",
        "    consolidacion/  Fases historicas de trabajo.",
        "    docente/        Clasificacion intermedia por perfil y tipo.",
        "```",
        "",
        "## Regla de saneamiento",
        "",
        "- `items/beta-v1/` es la carpeta navegable de preguntas beta.",
        "- `items/no-beta-v1/` conserva todo lo que no entra a beta.",
        "- `restructuring-v1/00-beta-v1/` gobierna el cierre editorial.",
        "- `stand-by`, auditorias, descartes y remanufactura no alimentan runtime directamente.",
        "",
    ]
    CONTENT_README.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    load_content_items()
    load_operational_csv()
    load_fase5()
    load_fase5b()
    load_audits()
    finalize()

    fields = [
        "id_item",
        "estado_beta",
        "prioridad",
        "area_canonica",
        "subarea",
        "perfil_sugerido",
        "tipo_item",
        "ruta_actual_o_propuesta",
        "ruta_origen",
        "lote",
        "decisiones",
        "acciones",
        "fuentes",
        "json_materializado",
        "validacion_minima",
        "destino_beta",
        "notas",
    ]
    rows = [as_row(rec) for rec in records.values()]
    rows.sort(key=lambda row: (-int(row["prioridad"]), row["area_canonica"], row["id_item"]))
    pilot = select_pilot(rows)

    write_csv(OUT / "indice-maestro-beta.csv", rows, fields)
    write_csv(OUT / "piloto-v1-candidatos.csv", pilot, ["orden_piloto", "estado_pilotaje", *fields])
    split_pilot_views(pilot, fields)
    materialize_pilot(pilot)
    write_csv(
        OUT / "remanufactura" / "indice-remanufactura.csv",
        [row for row in rows if row["estado_beta"] in {"REMANUFACTURA_TECNICA", "PILOTAJE_CON_AJUSTE"}],
        fields,
    )
    write_csv(
        OUT / "remanufactura" / "deuda-remanufactura-total.csv",
        [row for row in rows if row["estado_beta"] in {"REMANUFACTURA_TECNICA", "PILOTAJE_CON_AJUSTE", "DESCARTE_TECNICO"}],
        fields,
    )
    write_csv(OUT / "descarte-tecnico.csv", [row for row in rows if row["estado_beta"] == "DESCARTE_TECNICO"], fields)

    for area in sorted({row["area_canonica"] for row in rows}):
        write_csv(OUT / "por-dimension" / f"{area}.csv", [row for row in rows if row["area_canonica"] == area], fields)
    for profile in sorted({row["perfil_sugerido"] for row in rows}):
        write_csv(OUT / "por-perfil" / f"{profile}.csv", [row for row in rows if row["perfil_sugerido"] == profile], fields)

    write_markdown(rows, pilot)
    write_plan()
    write_content_manifest(rows, pilot)
    write_content_readme()
    print(f"Registros consolidados: {len(rows)}")
    print(f"Candidatos piloto: {len(pilot)}")
    print(f"Salida: {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
