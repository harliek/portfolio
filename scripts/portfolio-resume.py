#!/usr/bin/env python3
"""
Portfolio copy of Harlie's résumé (public/resume/harlie-katz-resume.pdf).

The site links a résumé from About and from every footer. The original
(personal assets/Harlie Katz Resume PDF copy.pdf, never modified) contains two
things the site's standing rules exclude:

  * a personal phone number (no phone number anywhere on the site), and
  * "reducing response time by 95%" on the Valiance line (no response-time
    claim is ever published; docs/content-provenance.md).

This script removes exactly those two items and nothing else. Every other
word is Harlie's own. The remaining text is moved as vector copies of the
original page (show_pdf_page with a clip), so fonts, spacing and colours are
unchanged and the text stays selectable. Everything else in the résumé is
listed for Harlie's review in docs/content-provenance.md (Q1).

Usage: python3 scripts/portfolio-resume.py <source.pdf> <out.pdf>
Requires PyMuPDF (fitz).
"""
import sys

import fitz  # PyMuPDF


def isolate(src_path: str, keep: fitz.Rect) -> fitz.Document:
    """A copy of the page with everything outside `keep` redacted, so a clipped
    vector copy of `keep` carries no hidden text from the rest of the page."""
    iso = fitz.open(src_path)
    pg = iso[0]
    r = pg.rect
    for rect in (
        fitz.Rect(r.x0, r.y0, r.x1, keep.y0),
        fitz.Rect(r.x0, keep.y1, r.x1, r.y1),
        fitz.Rect(r.x0, keep.y0, keep.x0, keep.y1),
        fitz.Rect(keep.x1, keep.y0, r.x1, keep.y1),
    ):
        if not rect.is_empty:
            pg.add_redact_annot(rect)
    pg.apply_redactions(images=fitz.PDF_REDACT_IMAGE_REMOVE, graphics=fitz.PDF_REDACT_LINE_ART_REMOVE_IF_COVERED)
    return iso


def main(src_path: str, out_path: str) -> None:
    original = fitz.open(src_path)
    doc = fitz.open(src_path)
    page = doc[0]

    # 1. Contact line: remove " | +1 (…)" and close the gap.
    phone = page.search_for('+1 (813) 765-2936')
    if len(phone) != 1:
        raise SystemExit('phone number not found exactly once; review the source résumé')
    line = None
    for block in page.get_text('dict')['blocks']:
        for ln in block.get('lines', []):
            text = ''.join(s['text'] for s in ln['spans'])
            if '813' in text:
                line = ln
    spans = line['spans']
    idx = next(i for i, s in enumerate(spans) if '813' in s['text'])
    sep_before = spans[idx - 1]  # the " |" before the number
    cut_x0 = sep_before['bbox'][0]
    cut_x1 = spans[idx]['bbox'][2]
    tail_x1 = spans[-1]['bbox'][2] + 2
    y0, y1 = line['bbox'][1] - 1, line['bbox'][3] + 1
    shift = cut_x1 - cut_x0

    # 2. Valiance line: remove ", reducing response time by 95%" and keep the full stop.
    claim = page.search_for('reducing response time by 95%.')
    props = page.search_for('18 properties')
    if len(claim) != 1 or len(props) != 1:
        raise SystemExit('Valiance line not found exactly once; review the source résumé')
    claim_rect = claim[0]
    comma_x0 = props[0].x1
    # A full stop in the same font, size and colour, from the end of another bullet.
    donor = page.search_for('merchandising gaps and opportunities.')
    if len(donor) != 1:
        raise SystemExit('full-stop donor line not found')
    period = fitz.Rect(donor[0].x1 - 3.0, donor[0].y0, donor[0].x1 + 0.2, donor[0].y1)

    links_before = [ln for ln in page.get_links() if ln['from'].x0 >= cut_x0 - 1 and abs(ln['from'].y0 - y0) < 6]
    page.add_redact_annot(fitz.Rect(cut_x0, y0, tail_x1, y1), fill=(1, 1, 1))
    page.add_redact_annot(fitz.Rect(comma_x0, claim_rect.y0, claim_rect.x1 + 1, claim_rect.y1), fill=(1, 1, 1))
    page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)

    # Vector copies of the original's own text (isolated, so no hidden text comes along).
    tail_clip = fitz.Rect(cut_x1, y0, tail_x1, y1)
    page.show_pdf_page(fitz.Rect(cut_x0, y0, cut_x0 + tail_clip.width, y1), isolate(src_path, tail_clip), 0, clip=tail_clip)
    dy = claim_rect.y0 - period.y0
    page.show_pdf_page(fitz.Rect(comma_x0, period.y0 + dy, comma_x0 + period.width, period.y1 + dy), isolate(src_path, period), 0, clip=period)

    # Links: redaction drops the ones under the removed text. Re-add the two
    # that follow the phone number (moved left with their text); the
    # telephone link is not re-added.
    page = doc.reload_page(page)
    present = {ln.get('uri') for ln in page.get_links()}
    for link in links_before:
        uri = link.get('uri', '')
        if uri.startswith('tel:') or uri in present:
            continue
        r = link['from']
        page.insert_link({'kind': fitz.LINK_URI, 'uri': uri, 'from': fitz.Rect(r.x0 - shift, r.y0, r.x1 - shift, r.y1)})

    text = page.get_text()
    for banned in ('813', '765-2936', '95%', 'response time'):
        if banned in text:
            raise SystemExit(f'"{banned}" is still in the text layer')

    doc.set_metadata({**original.metadata, 'title': 'Harlie Katz Resume', 'subject': 'Portfolio copy'})
    doc.save(out_path, garbage=4, deflate=True)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
