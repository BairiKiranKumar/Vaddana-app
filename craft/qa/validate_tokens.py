#!/usr/bin/env python3
"""Validate a design-token file against the common DTCG 2025.10 types used in this craft system.

Usage: python3 craft/qa/validate_tokens.py tokens.json
Exit code 0 = valid, 1 = errors found. Warnings never fail the run.
Covers: color, dimension, duration, cubicBezier, fontFamily, fontWeight, number, and {alias} references.
It is a practical checker, not a full implementation of the spec.
"""
import json
import re
import sys

ALIAS = re.compile(r"^\{([^{}]+)\}$")
HEX = re.compile(r"^#[0-9A-Fa-f]{6}$")
WEIGHT_NAMES = {
    "thin", "hairline", "extra-light", "ultra-light", "light", "normal", "regular", "book",
    "medium", "semi-bold", "demi-bold", "bold", "extra-bold", "ultra-bold", "black", "heavy",
    "extra-black", "ultra-black",
}
COLOR_SPACES = {"srgb", "srgb-linear", "hsl", "hwb", "lab", "lch", "oklab", "oklch",
                "display-p3", "a98-rgb", "prophoto-rgb", "rec2020", "xyz-d65", "xyz-d50"}


def is_num(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool)


def collect(node, path, inherited, tokens):
    gtype = node.get("$type", inherited) if isinstance(node, dict) else inherited
    for key, child in node.items():
        if key.startswith("$") or not isinstance(child, dict):
            continue
        p = path + [key]
        if "$value" in child:
            tokens[".".join(p)] = (child.get("$type", gtype), child["$value"])
        else:
            collect(child, p, child.get("$type", gtype), tokens)


def check_value(name, ttype, value, errors):
    def err(msg):
        errors.append(f"{name} ({ttype}): {msg}")

    if ttype == "color":
        if not isinstance(value, dict):
            return err("value must be an object {colorSpace, components, hex?}; plain hex strings are not valid in 2025.10")
        if value.get("colorSpace") not in COLOR_SPACES:
            err(f"unknown or missing colorSpace {value.get('colorSpace')!r}")
        comps = value.get("components")
        if not (isinstance(comps, list) and len(comps) == 3 and all(is_num(c) or c == "none" for c in comps)):
            err("components must be a list of 3 numbers")
        if "hex" in value and not HEX.match(str(value["hex"])):
            err("hex must look like #RRGGBB")
    elif ttype == "dimension":
        if not (isinstance(value, dict) and is_num(value.get("value")) and value.get("unit") in ("px", "rem")):
            err("must be {value: number, unit: 'px'|'rem'}")
    elif ttype == "duration":
        if not (isinstance(value, dict) and is_num(value.get("value")) and value.get("unit") in ("ms", "s")):
            err("must be {value: number, unit: 'ms'|'s'}")
    elif ttype == "cubicBezier":
        if not (isinstance(value, list) and len(value) == 4 and all(is_num(v) for v in value)):
            return err("must be 4 numbers [x1, y1, x2, y2]")
        if not (0 <= value[0] <= 1 and 0 <= value[2] <= 1):
            err("x1 and x2 must be within [0, 1]")
    elif ttype == "fontFamily":
        if not (isinstance(value, str) or (isinstance(value, list) and value and all(isinstance(v, str) for v in value))):
            err("must be a string or a non-empty list of strings")
    elif ttype == "fontWeight":
        if not ((is_num(value) and 1 <= value <= 1000) or value in WEIGHT_NAMES):
            err("must be a number 1-1000 or a predefined weight name")
    elif ttype == "number":
        if not is_num(value):
            err("must be a JSON number")
    elif ttype is None:
        err("no $type on the token or any parent group")
    else:
        pass  # other spec types are not checked here


def main(path):
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    tokens = {}
    collect(data, [], data.get("$type"), tokens)
    errors, warnings = [], []
    for name, (ttype, value) in tokens.items():
        m = ALIAS.match(value) if isinstance(value, str) else None
        if m:
            target = m.group(1)
            if target not in tokens:
                errors.append(f"{name}: alias {{{target}}} does not point to a token")
            elif tokens[target][0] != ttype:
                errors.append(f"{name}: type {ttype} aliases {target} of type {tokens[target][0]}")
            continue
        check_value(name, ttype, value, errors)
        if name.startswith("component."):
            warnings.append(f"{name}: raw value in component tier; prefer an alias to a semantic token")
    for w in warnings:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    print(f"{len(tokens)} tokens checked, {len(errors)} errors, {len(warnings)} warnings")
    return 1 if errors else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    sys.exit(main(sys.argv[1]))
