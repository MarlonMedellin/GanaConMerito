#!/usr/bin/env python3
"""Generate or verify the deterministic Question Bank V4 freeze manifest."""

from __future__ import annotations

import argparse
import collections
import datetime as dt
import hashlib
import json
import pathlib
import re
import subprocess
import sys
from typing import Any


REPO_ROOT = pathlib.Path(__file__).resolve().parents[1]
BANK_ROOT = REPO_ROOT / "content" / "question-bank-v4"
ITEMS_ROOT = BANK_ROOT / "items"
MANIFEST_PATH = BANK_ROOT / "MANIFEST.json"
CONTRACT_PATH = BANK_ROOT / "CONTRATO-EDITORIAL-V4.md"
TAXONOMY_PATHS = (
    BANK_ROOT / "taxonomy" / "domains.json",
    BANK_ROOT / "taxonomy" / "topics.json",
    BANK_ROOT / "taxonomy" / "competencies.json",
    BANK_ROOT / "taxonomy" / "question-types.json",
)
REMOTE = "https://github.com/MarlonMedellin/GanaConMerito"
BRANCH = "master"
LABELS = {"A", "B", "C", "D"}
REQUIRED_FIELDS = {
    "id",
    "scope",
    "domain",
    "topic",
    "competency",
    "questionType",
    "cognitiveLevel",
    "context",
    "stem",
    "options",
    "correctAnswer",
    "explanations",
    "hint",
    "learningNote",
    "source",
    "estimatedDifficulty",
}
DEFAULT_RETIRED_IDS = [
    "DOC-001206",
    "DOC-001218",
    "DOC-001220",
    "DOC-001222",
    "DOC-001225",
    "DOC-001227",
    "DOC-001228",
    "DOC-001230",
    "DOC-001232",
    "DOC-001246",
    "DOC-001249",
    "DOC-001250",
    "DOC-001251",
    "DOC-001252",
    "DOC-001253",
    "DOC-001254",
    "DOC-001255",
    "DOC-001258",
    "DOC-001259",
    "DOC-001261",
    "DOC-001265",
    "DOC-001268",
    "DOC-001290",
    "DOC-001291",
    "DOC-001294",
]


class DuplicateJsonKey(ValueError):
    pass


def strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateJsonKey(f"duplicate JSON key: {key}")
        result[key] = value
    return result


def load_json(path: pathlib.Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=strict_object)


def relative(path: pathlib.Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def sha256_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def aggregate_hash(paths: list[pathlib.Path]) -> str:
    digest = hashlib.sha256()
    for path in sorted(paths, key=relative):
        digest.update(relative(path).encode("utf-8"))
        digest.update(b"\0")
        digest.update(sha256_bytes(path.read_bytes()).encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def load_taxonomy() -> tuple[dict[str, set[str]], dict[str, list[str]]]:
    domains, topics, competencies, question_types = [load_json(path) for path in TAXONOMY_PATHS]
    errors: list[str] = []
    for name, values in (
        ("domains", domains),
        ("topics", topics),
        ("competencies", competencies),
    ):
        if not isinstance(values, list) or not all(non_empty_string(value) for value in values):
            errors.append(f"taxonomy/{name}.json must be a non-empty string array")
        elif len(values) != len(set(values)):
            errors.append(f"taxonomy/{name}.json contains duplicates")
    expected_question_type_fields = {
        "questionTypes",
        "cognitiveLevels",
        "estimatedDifficultyLevels",
    }
    if not isinstance(question_types, dict) or set(question_types) != expected_question_type_fields:
        errors.append("taxonomy/question-types.json has unexpected fields")
    else:
        for name in sorted(expected_question_type_fields):
            values = question_types[name]
            if not isinstance(values, list) or not all(non_empty_string(value) for value in values):
                errors.append(f"taxonomy/question-types.json:{name} must be a non-empty string array")
            elif len(values) != len(set(values)):
                errors.append(f"taxonomy/question-types.json:{name} contains duplicates")
    if errors:
        raise ValueError("\n".join(errors))
    catalogs = {
        "domain": set(domains),
        "topic": set(topics),
        "competency": set(competencies),
        "questionType": set(question_types["questionTypes"]),
        "cognitiveLevel": set(question_types["cognitiveLevels"]),
        "estimatedDifficulty": set(question_types["estimatedDifficultyLevels"]),
    }
    ordered = {
        "domains": domains,
        "topics": topics,
        "competencies": competencies,
        "questionTypes": question_types["questionTypes"],
        "cognitiveLevels": question_types["cognitiveLevels"],
        "estimatedDifficultyLevels": question_types["estimatedDifficultyLevels"],
    }
    return catalogs, ordered


def validate_item(
    item: Any,
    path: pathlib.Path,
    catalogs: dict[str, set[str]],
) -> list[str]:
    item_path = relative(path)
    if not isinstance(item, dict):
        return [f"{item_path}: root must be an object"]
    errors: list[str] = []
    allowed_fields = REQUIRED_FIELDS | {"opecId"}
    missing = REQUIRED_FIELDS - set(item)
    unexpected = set(item) - allowed_fields
    if missing:
        errors.append(f"{item_path}: missing fields {sorted(missing)}")
    if unexpected:
        errors.append(f"{item_path}: unexpected fields {sorted(unexpected)}")
    item_id = item.get("id")
    if not isinstance(item_id, str) or not re.fullmatch(r"(?:DOC|GEN)-\d{6}", item_id):
        errors.append(f"{item_path}: invalid id")
    elif path.stem != item_id:
        errors.append(f"{item_path}: filename does not match id {item_id}")
    elif path.parent.name == "docentes" and not item_id.startswith("DOC-"):
        errors.append(f"{item_path}: docentes item must use DOC prefix")
    elif path.parent.name == "general" and not item_id.startswith("GEN-"):
        errors.append(f"{item_path}: general item must use GEN prefix")
    scope = item.get("scope")
    if scope not in {"general", "opec_specific"}:
        errors.append(f"{item_path}: invalid scope {scope!r}")
    elif scope == "general" and "opecId" in item:
        errors.append(f"{item_path}: general item must omit opecId")
    elif scope == "opec_specific" and not non_empty_string(item.get("opecId")):
        errors.append(f"{item_path}: opec_specific item requires opecId")
    for field, values in catalogs.items():
        if item.get(field) not in values:
            errors.append(f"{item_path}: {field} outside taxonomy: {item.get(field)!r}")
    for field in ("options", "explanations"):
        value = item.get(field)
        if not isinstance(value, dict) or set(value) != LABELS:
            errors.append(f"{item_path}: {field} must contain exactly A-D")
        elif not all(non_empty_string(value[label]) for label in LABELS):
            errors.append(f"{item_path}: {field} values must be non-empty strings")
    options = item.get("options")
    if isinstance(options, dict) and set(options) == LABELS:
        normalized = [str(options[label]).strip().casefold() for label in sorted(LABELS)]
        if len(normalized) != len(set(normalized)):
            errors.append(f"{item_path}: option texts must be unique")
    if item.get("correctAnswer") not in LABELS:
        errors.append(f"{item_path}: correctAnswer must be A-D")
    for field in ("context", "stem", "hint", "learningNote"):
        if not non_empty_string(item.get(field)):
            errors.append(f"{item_path}: {field} must be a non-empty string")
    source = item.get("source")
    if (
        not isinstance(source, dict)
        or not {"reference"} <= set(source) <= {"reference", "sourceId"}
        or not non_empty_string(source.get("reference"))
        or ("sourceId" in source and not non_empty_string(source.get("sourceId")))
    ):
        errors.append(f"{item_path}: source must contain one non-empty reference and optional non-empty sourceId")
    return errors


def build_manifest(source_commit: str, generated_on: str, retired_ids: list[str]) -> dict[str, Any]:
    catalogs, taxonomy_values = load_taxonomy()
    item_paths = sorted(ITEMS_ROOT.rglob("*.json"), key=relative)
    ids: list[str] = []
    errors: list[str] = []
    distributions = {
        field: collections.Counter()
        for field in (
            "domain",
            "topic",
            "competency",
            "questionType",
            "cognitiveLevel",
            "correctAnswer",
            "estimatedDifficulty",
        )
    }
    total_bytes = 0
    for item_path in item_paths:
        raw = item_path.read_bytes()
        total_bytes += len(raw)
        try:
            item = json.loads(raw, object_pairs_hook=strict_object)
        except Exception as error:
            errors.append(f"{relative(item_path)}: {error}")
            continue
        item_errors = validate_item(item, item_path, catalogs)
        errors.extend(item_errors)
        if isinstance(item.get("id"), str):
            ids.append(item["id"])
        if not item_errors:
            for field, counter in distributions.items():
                counter[item[field]] += 1
    duplicate_ids = sorted(item_id for item_id, count in collections.Counter(ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"duplicate item ids: {duplicate_ids}")
    retired_present = sorted(set(retired_ids) & set(ids))
    if retired_present:
        errors.append(f"retired ids present in active corpus: {retired_present}")
    if errors:
        raise ValueError("V4 structural validation failed:\n" + "\n".join(errors))
    sorted_ids = sorted(ids)
    ids_payload = "".join(f"{item_id}\n" for item_id in sorted_ids).encode("utf-8")
    contract_raw = CONTRACT_PATH.read_bytes()
    return {
        "manifestVersion": 1,
        "bank": "question-bank-v4",
        "repository": {
            "remote": REMOTE,
            "branch": BRANCH,
            "sourceCommit": source_commit,
        },
        "generatedOn": generated_on,
        "contract": {
            "path": relative(CONTRACT_PATH),
            "sha256": sha256_bytes(contract_raw),
        },
        "editorialState": {
            "status": "FROZEN",
            "approval": "APPROVED",
            "runtimeActivationAuthorized": False,
            "supabaseMigrationAuthorized": False,
        },
        "expectedItemCount": len(item_paths),
        "corpus": {
            "path": relative(ITEMS_ROOT),
            "hashAlgorithm": "sha256(relative_path + NUL + file_sha256 + LF), sorted by relative_path",
            "sha256": aggregate_hash(item_paths),
            "totalBytes": total_bytes,
            "idsSha256": sha256_bytes(ids_payload),
            "ids": sorted_ids,
        },
        "taxonomy": {
            "paths": [relative(path) for path in TAXONOMY_PATHS],
            "sha256": aggregate_hash(list(TAXONOMY_PATHS)),
            "catalogs": taxonomy_values,
        },
        "metrics": {
            "duplicateIdCount": 0,
            "structuralErrorCount": 0,
            "requiredFields": sorted(REQUIRED_FIELDS),
            "optionLabels": sorted(LABELS),
            "explanationLabels": sorted(LABELS),
            "distributions": {
                field: dict(sorted(counter.items()))
                for field, counter in distributions.items()
            },
        },
        "retiredIds": sorted(retired_ids),
    }


def current_commit() -> str:
    return subprocess.check_output(
        ["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, text=True
    ).strip()


def first_differences(expected: Any, actual: Any, prefix: str = "$") -> list[str]:
    if type(expected) is not type(actual):
        return [f"{prefix}: expected {type(expected).__name__}, got {type(actual).__name__}"]
    if isinstance(expected, dict):
        differences: list[str] = []
        for key in sorted(set(expected) | set(actual)):
            if key not in expected:
                differences.append(f"{prefix}.{key}: unexpected")
            elif key not in actual:
                differences.append(f"{prefix}.{key}: missing")
            else:
                differences.extend(first_differences(expected[key], actual[key], f"{prefix}.{key}"))
            if len(differences) >= 20:
                break
        return differences
    if isinstance(expected, list):
        if expected == actual:
            return []
        return [f"{prefix}: list mismatch (expected {len(expected)} entries, got {len(actual)} entries)"]
    if expected != actual:
        return [f"{prefix}: expected {expected!r}, got {actual!r}"]
    return []


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--write", action="store_true", help="regenerate MANIFEST.json")
    mode.add_argument("--check", action="store_true", help="verify MANIFEST.json (default)")
    parser.add_argument("--source-commit", help="corpus source commit for --write")
    parser.add_argument("--generated-on", help="YYYY-MM-DD date for --write")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.write:
        previous = load_json(MANIFEST_PATH) if MANIFEST_PATH.exists() else {}
        retired_ids = previous.get("retiredIds", DEFAULT_RETIRED_IDS)
        source_commit = args.source_commit or current_commit()
        generated_on = args.generated_on or dt.date.today().isoformat()
        manifest = build_manifest(source_commit, generated_on, retired_ids)
        MANIFEST_PATH.write_text(
            json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
            newline="\n",
        )
        print(json.dumps({
            "mode": "write",
            "manifest": relative(MANIFEST_PATH),
            "itemCount": manifest["expectedItemCount"],
            "corpusSha256": manifest["corpus"]["sha256"],
            "idsSha256": manifest["corpus"]["idsSha256"],
        }, indent=2))
        return 0
    if not MANIFEST_PATH.exists():
        raise FileNotFoundError(f"missing canonical manifest: {relative(MANIFEST_PATH)}")
    actual = load_json(MANIFEST_PATH)
    source_commit = actual.get("repository", {}).get("sourceCommit")
    generated_on = actual.get("generatedOn")
    retired_ids = actual.get("retiredIds")
    if not isinstance(source_commit, str) or not re.fullmatch(r"[0-9a-f]{40}", source_commit):
        raise ValueError("manifest repository.sourceCommit must be a full Git SHA")
    if not isinstance(generated_on, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", generated_on):
        raise ValueError("manifest generatedOn must use YYYY-MM-DD")
    if not isinstance(retired_ids, list) or not all(isinstance(item_id, str) for item_id in retired_ids):
        raise ValueError("manifest retiredIds must be an array of ids")
    if retired_ids != sorted(set(retired_ids)):
        raise ValueError("manifest retiredIds must be sorted and unique")
    expected = build_manifest(source_commit, generated_on, retired_ids)
    differences = first_differences(expected, actual)
    if differences:
        raise ValueError("V4 manifest mismatch:\n" + "\n".join(differences))
    print(json.dumps({
        "mode": "check",
        "manifest": relative(MANIFEST_PATH),
        "itemCount": actual["expectedItemCount"],
        "duplicateIds": actual["metrics"]["duplicateIdCount"],
        "structuralErrors": actual["metrics"]["structuralErrorCount"],
        "totalBytes": actual["corpus"]["totalBytes"],
        "corpusSha256": actual["corpus"]["sha256"],
        "idsSha256": actual["corpus"]["idsSha256"],
        "keyDistribution": actual["metrics"]["distributions"]["correctAnswer"],
        "difficultyDistribution": actual["metrics"]["distributions"]["estimatedDifficulty"],
        "retiredIdsPresent": [],
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
