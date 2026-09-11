"""Check that the latest post's title appears on the front page.

Used by both .github/workflows/pr.yaml and the smoke job in ci.yaml, so the
check only lives in one place.

The title is compared after HTML-entity decoding and whitespace
normalisation: Vue SSR escapes ' & < > " on the way out, so a literal match
fails on any title containing them.

Usage: curl -sf http://localhost:3000/ | python3 scripts/check-front-page.py
"""

import html
import re
import sys
from pathlib import Path

posts = sorted(
    str(p) for p in Path("content").rglob("*.md") if re.match(r"content/\d{4}/", str(p))
)
if not posts:
    print("No posts found under content/")
    sys.exit(1)

latest = posts[-1]
print(f"Latest post file: {latest}")

title = None
with open(latest, encoding="utf-8") as fh:
    for line in fh:
        if line.startswith("title:"):
            title = line[len("title:") :].strip().strip("\"'")
            break

if not title:
    print("No title found in front matter")
    sys.exit(1)

page = html.unescape(sys.stdin.read())
if not page:
    print("Empty front page response")
    sys.exit(1)


def norm(s):
    return re.sub(r"\s+", " ", s)


print(f"Checking for title: {title}")

if norm(title) in norm(page):
    print("Latest article found on front page")
else:
    print("Latest article NOT found on front page")
    sys.exit(1)
