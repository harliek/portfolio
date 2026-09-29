# Archive

Components the brief v16 redesign took out of the rendered site (the PNG
object carousel, the two-column case layout and its media stages, the old
players and phone group, the About cursor light). Kept here, outside `src/`
(not compiled, not linted, not deployed), until the redesign is stable, as
the brief asks. Restore a file by moving it back to the same path under `src/`.

Their assets that the live site does not use are no longer in
`public/media/`: the files only these components (or git stash@{0}) used were
removed on 2026-09-29 with Harlie's approval ("Delete archive-only media"),
together with the homepage room's files and the poster widths and formats no
page can request. Restoring a component means restoring its files from git
history first (for example
`git checkout fea1e19 -- public/media/img/ala-conversation-640.avif`); the
`scripts/prepare-media.mjs` steps that made them are in the same commit.

`media-registry-unplaced.ts` holds the media registry entries taken out of
`src/content/media.ts` and `src/content/crops/*.ts` on 2026-09-29 because
nothing on the site renders them, with their provenance notes (and, since the
same day, the homepage room's `STAGE_MEDIA.room` and posters). Restoring
`CaseScroll` with the `merch-console` recording (its documented example) or
`ConversationStage` (it shows `ala-conversation`) needs those entries pasted
back into the registry first.
