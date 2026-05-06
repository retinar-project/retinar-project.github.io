#!/usr/bin/env python3
import argparse
import json
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
ES_DIR = ROOT / "_recursos_es"
EN_DIR = ROOT / "_resources_en"

STOPWORDS = {
    "a", "al", "and", "annual", "ante", "como", "con", "cómo", "de", "del",
    "diabetes", "el", "en", "for", "how", "in", "la", "las", "los", "of",
    "para", "por", "que", "retina", "retinal", "screening", "teleophthalmology",
    "teleoftalmologia", "teleoftalmología", "the", "to", "una", "what", "why", "with",
    "without", "y",
}


def strip_accents(value: str) -> str:
    return "".join(
        ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch)
    )


def normalize_text(value: str) -> str:
    lowered = strip_accents(value).lower()
    lowered = re.sub(r"[^a-z0-9\s-]", " ", lowered)
    lowered = re.sub(r"\s+", " ", lowered).strip()
    return lowered


def tokenize(value: str):
    return [
        token for token in normalize_text(value).split()
        if len(token) > 2 and token not in STOPWORDS
    ]


def parse_frontmatter(path: Path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    parts = text.split("---\n", 2)
    if len(parts) < 3:
        return {}

    frontmatter = {}
    current_list_key = None
    for raw_line in parts[1].splitlines():
        if raw_line.startswith("  - ") and current_list_key:
            frontmatter.setdefault(current_list_key, []).append(raw_line[4:].strip().strip('"'))
            continue
        if raw_line.startswith("- ") and current_list_key:
            frontmatter.setdefault(current_list_key, []).append(raw_line[2:].strip().strip('"'))
            continue

        current_list_key = None
        if ":" not in raw_line:
            continue
        key, value = raw_line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"')
        if value == "":
            current_list_key = key
            frontmatter[key] = []
        else:
            frontmatter[key] = value
    return frontmatter


def load_posts(directory: Path, lang: str):
    posts = []
    for path in sorted(directory.glob("*.md")):
        fm = parse_frontmatter(path)
        title = fm.get("title", path.stem)
        description = fm.get("description", "")
        category = fm.get("category", "")
        tags = fm.get("tags", [])
        excerpt = fm.get("excerpt", "")
        tokens = tokenize(" ".join([title, description, category, excerpt, " ".join(tags)]))
        posts.append({
            "lang": lang,
            "path": str(path.relative_to(ROOT)),
            "title": title,
            "description": description,
            "category": category,
            "tags": tags,
            "date": fm.get("date", ""),
            "permalink": fm.get("permalink", ""),
            "tokens": tokens,
        })
    return posts


def jaccard_similarity(tokens_a, tokens_b):
    set_a = set(tokens_a)
    set_b = set(tokens_b)
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def build_inventory():
    es_posts = load_posts(ES_DIR, "es")
    en_posts = load_posts(EN_DIR, "en")
    all_posts = es_posts + en_posts

    token_counts = Counter()
    category_counts = Counter()
    for post in all_posts:
        token_counts.update(post["tokens"])
        if post["category"]:
            category_counts[post["category"]] += 1

    recent_es = sorted(
        es_posts,
        key=lambda post: (post["date"], post["title"]),
        reverse=True,
    )[:5]

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "post_count": len(all_posts),
        "es_post_count": len(es_posts),
        "en_post_count": len(en_posts),
        "top_categories": category_counts.most_common(),
        "top_tokens": token_counts.most_common(25),
        "recent_es_posts": recent_es,
        "posts": all_posts,
    }


def markdown_report(inventory):
    lines = []
    lines.append("# Inventario editorial Retinar")
    lines.append("")
    lines.append(f"- Generado: `{inventory['generated_at']}`")
    lines.append(f"- Posts ES: `{inventory['es_post_count']}`")
    lines.append(f"- Posts EN: `{inventory['en_post_count']}`")
    lines.append("")
    lines.append("## Categorías")
    for category, count in inventory["top_categories"]:
        lines.append(f"- `{category}`: {count}")
    lines.append("")
    lines.append("## Tópicos frecuentes")
    for token, count in inventory["top_tokens"][:12]:
        lines.append(f"- `{token}`: {count}")
    lines.append("")
    lines.append("## Últimos posts ES")
    for post in inventory["recent_es_posts"]:
        lines.append(f"- `{post['date']}` {post['title']} ({post['path']})")
    return "\n".join(lines)


def compare_candidate(inventory, candidate):
    candidate_tokens = tokenize(candidate)
    scored = []
    for post in inventory["posts"]:
        score = jaccard_similarity(candidate_tokens, post["tokens"])
        if score > 0:
            scored.append({
                "score": round(score, 3),
                "title": post["title"],
                "lang": post["lang"],
                "path": post["path"],
                "date": post["date"],
                "permalink": post["permalink"],
            })
    scored.sort(key=lambda item: item["score"], reverse=True)
    return scored[:10]


def main():
    parser = argparse.ArgumentParser(description="Inventario editorial del blog de Retinar.")
    parser.add_argument("--format", choices=["json", "markdown"], default="json")
    parser.add_argument("--compare", help="Título o tema candidato para comparar similitud.")
    args = parser.parse_args()

    inventory = build_inventory()
    if args.compare:
        result = {
            "candidate": args.compare,
            "matches": compare_candidate(inventory, args.compare),
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return

    if args.format == "markdown":
        print(markdown_report(inventory))
        return

    print(json.dumps(inventory, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
