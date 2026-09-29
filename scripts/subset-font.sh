#!/bin/sh
# Subsets the site's two web fonts to the characters the site uses: Latin,
# Latin-1, Latin Extended-A (kept for names visitors type into the contact
# form), general punctuation (dashes, quotes, ellipsis), euro, trade mark,
# arrows, minus, ≈ ≠ ≤ ≥. Re-run after adding copy with characters outside
# these ranges: a character missing from a subset falls back, on its own, to
# the next font in the stack.
#
# 1. Inter (variable, wght + opsz axes). Keeps only the OpenType features the
#    site can use (2026-09-29, performance audit G4): the browser defaults kern,
#    calt, locl and ccmp; cv11 and ss01 (font-feature-settings, base.css);
#    tnum (font-variant-numeric: tabular-nums, base.css and about.css); and, to
#    stay on the safe side, frac/numr/dnom (applied automatically around a
#    typed U+2044 fraction slash), case and cpsp. The unused alternates (cv01-
#    cv13 except cv11, ss02-ss08, aalt, salt, dlig, ordn, pnum, sinf, subs,
#    sups, zero) go, with the glyphs only they reach: 81,964 bytes, from
#    112,284 with every feature kept (the full font is 352,240). If the CSS
#    ever turns on another Inter feature (e.g. 'zero', 'ss02', 'cv05', sups via
#    font-variant-position), add it to --layout-features below and re-run, or
#    it silently has no effect.
#    Source: scripts/fonts/InterVariable.full.woff2 (Inter 4, SIL OFL, see
#    scripts/fonts/Inter-LICENSE.txt). Output: public/fonts/InterVariable.woff2.
#
# 2. Playfair Display Regular, the editorial face (PORTFOLIO, tile, case and
#    About titles). Every OpenType feature kept; drops the Cyrillic, Vietnamese
#    and other Latin Extended letters the site never sets (2026-09-29, audit
#    G3): 27,192 bytes, from 42,404. Two options keep it rendering exactly as
#    the full file did (checked pixel for pixel on macOS in Chromium, WebKit
#    and Firefox): it also keeps the combining accents (U+0300-036F), whose
#    'mark' rules make Firefox kern the spaces between words as before
#    (without them Firefox set Playfair's word spaces slightly wider); and
#    --glyph-names, without which macOS drew its glyphs very slightly
#    differently. --notdef-outline keeps the missing-glyph box as it was.
#    Source: scripts/fonts/PlayfairDisplay-Regular.full.woff2 (Playfair Display
#    1.203, SIL OFL, see public/fonts/PlayfairDisplay-LICENSE.txt).
#    Output: public/fonts/PlayfairDisplay-Regular.woff2.
#
# Metric options stay at pyftsubset's defaults (no --recalc-* flags), so the
# hhea/OS/2 line metrics, and the metric-matched fallbacks in tokens.css, stay
# the same.
#
# /fonts/* is served immutable for a year under these unhashed names
# (netlify.toml), so after regenerating either file bump its ?v= query on the
# @font-face url in index.html, or returning visitors keep the old file.
#
# Requires fonttools and brotli for the python3 on PATH
# (pip install fonttools brotli). To keep them out of the system Python, use a
# virtualenv and put it first on PATH for the run:
#   python3 -m venv /tmp/fonttools-venv
#   /tmp/fonttools-venv/bin/pip install fonttools brotli
#   PATH="/tmp/fonttools-venv/bin:$PATH" scripts/subset-font.sh
set -e
cd "$(dirname "$0")/.."
UNICODES="U+0020-007E,U+00A0-017F,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2248,U+2260,U+2264-2265"
python3 -m fontTools.subset scripts/fonts/InterVariable.full.woff2 \
  --unicodes="$UNICODES" \
  --layout-features='kern,calt,locl,ccmp,cv11,ss01,tnum,frac,numr,dnom,case,cpsp' \
  --flavor=woff2 \
  --output-file=public/fonts/InterVariable.woff2
python3 -m fontTools.subset scripts/fonts/PlayfairDisplay-Regular.full.woff2 \
  --unicodes="$UNICODES,U+0300-036F" \
  --layout-features='*' --glyph-names --notdef-outline --flavor=woff2 \
  --output-file=public/fonts/PlayfairDisplay-Regular.woff2
