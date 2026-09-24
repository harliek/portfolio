#!/bin/sh
# Subsets Inter (variable, wght + opsz axes, every OpenType feature kept, e.g.
# tnum for tabular numbers) to the characters the site uses: Latin, Latin-1,
# Latin Extended-A, general punctuation (dashes, quotes, ellipsis), euro,
# trade mark, arrows, minus, ≈ ≠ ≤ ≥. 344KB → about 112KB.
#
# Source: scripts/fonts/InterVariable.full.woff2 (Inter 4, SIL OFL, see
# scripts/fonts/Inter-LICENSE.txt). Output: public/fonts/InterVariable.woff2
# (preloaded by index.html). Requires fonttools and brotli
# (pip install fonttools brotli). Re-run after adding copy with characters
# outside these ranges.
set -e
cd "$(dirname "$0")/.."
python3 -m fontTools.subset scripts/fonts/InterVariable.full.woff2 \
  --unicodes="U+0020-007E,U+00A0-017F,U+2000-206F,U+20AC,U+2122,U+2190-2199,U+2212,U+2248,U+2260,U+2264-2265" \
  --layout-features='*' --flavor=woff2 \
  --output-file=public/fonts/InterVariable.woff2
