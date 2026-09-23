# Film transcripts

Record of how the transcripts in `src/content/transcripts.tsx` were produced for the three published Shift films. They appear in the Transcript disclosure under each film. No WebVTT `<track>` captions were added, and the burned-in subtitles are not described anywhere as selectable captions.

Prepared 2026-09-23.

## Result

| Film | Transcript published | Main source of the words | Confidence |
| --- | --- | --- | --- |
| Aristocracy (87.6 s) | Yes | Burned-in subtitles, checked with speech recognition (ASR) | High for the subtitled voiceover. Moderate for the three short, unsubtitled off-screen calls |
| Nickleby Capital, Video 1 (100.3 s) | Yes | Burned-in subtitles and on-screen question cards, checked with ASR | High. One line, the self-introduction, has no subtitle and comes from ASR, where all six runs agree |
| The Night Club / HECK (37.2 s) | Yes | ASR only (the film has no subtitles) | Moderate to high. One word is unresolved and marked `[inaudible]` |

No film was left out. Nickleby Capital Video 2 was not used or opened.

**Main limitation:** nobody has listened to the soundtracks by ear. Words were read from the films' own subtitles and checked with several ASR models, forced-alignment scoring and an audio-event classifier. Before relying on the transcripts, Harlie should play each film once with its transcript open. The five points to listen for are listed under "Points for a listening check" below.

## Tools and versions

All tools were installed in an isolated virtual environment at `.media-cache/asr/`. Nothing was installed system-wide and `sudo` was not used. The originals in `Shift Content/` were only read. Their modification times are unchanged: Aristocracy 2026-03-05, Heck 2026-02-15, Nickleby 2026-09-22 01:20.

- ffmpeg 8.0.1 (Homebrew). Used to extract audio as 16 kHz mono PCM WAV and to pull frames, subtitle-band crops and spectrograms. This build has no `drawtext`, so contact sheets were labelled with Pillow.
- Python 3.9.6 (system `python3`, used only to create the venv).
- faster-whisper 1.2.1 with CTranslate2 4.8.2, running on CPU with int8. Models: `small.en`, `medium.en` and `large-v3` (Systran CTranslate2 conversions). Each model ran with the VAD filter on and with it off (beam 5, word timestamps, `condition_on_previous_text=False`), which gives six ASR runs per film.
- Forced-alignment scoring: CTranslate2 `Whisper.align` via faster-whisper (`.media-cache/transcripts/score.py`). It gives the log-probability of each candidate wording given the audio, so a disputed word can be tested directly instead of trusting one free-running decode.
- Audio-event tagging: `MIT/ast-finetuned-audioset-10-10-0.4593` (Audio Spectrogram Transformer, AudioSet labels) through transformers 4.57.6 and torch 2.8.0. It was run on 4 s windows with a 2 s hop, and on 2 s windows with a 1 s hop near boundaries. This is the only basis for the `[Music]` notes.
- Speaker-embedding comparison: `speechbrain/spkrec-ecapa-voxceleb` (ECAPA-TDNN) through speechbrain 1.1.1 and torchaudio 2.8.0. It was used only to check whether lines share a voice, never to identify anyone.
- Pillow 11.3.0 and numpy 2.0.2 for the contact sheets and for de-duplicating subtitle frames.

## Method

1. **Subtitle extraction.** For Aristocracy (from `aristocracy-1440.mp4`) and Nickleby (from `nickleby-640.mp4`), the subtitle band was cropped at 5 fps. Consecutive frames were de-duplicated by comparing masks of near-white text pixels, and the remaining frames were tiled into contact sheets with their timestamps. The sheets were read by eye. Doubtful words were re-read from full-resolution crops of the originals, for example "Coast", "pressed", "will.", "Vapor", "in Cardiff." The same frame timeline was used for full-frame sheets at 1 fps, to read title cards, question cards, lower thirds and end cards.
2. **ASR cross-check.** Audio was extracted from the originals and run through the six ASR configurations. Subtitle text was then compared line by line with the ASR output.
3. **Disagreements.** The rule was that the burned-in subtitle wins for words and every disagreement is recorded (below). Each disagreement was also scored with forced alignment, so the strength of the audio evidence is on record.
4. **Unsubtitled speech.** A line with no subtitle was included only when independent models agreed on it. Where needed, the audio was isolated with 1 s of silence padding and re-run, and the teacher-forced scores and spectrogram were checked.
5. **Sound descriptions.** `[Music]` notes are included only where the AudioSet tagger scored Music consistently high (usually 0.4–0.75). Weaker or implausible tags were not transcribed. These included train, vehicle and steam-whistle tags in Aristocracy (at most 0.2–0.45 in isolated windows), and "meow", "frog", "croak" and "oink" tags that were clearly misfires on the voice or music.
6. **Speaker labels.** A name is used only when the film shows it on screen. Otherwise the label is neutral ("Unnamed speaker", "Off-screen voice", "Voiceover", "Announcement", "Question"). Voice embeddings were used only to check whether lines belong to the same voice as a speaker named on screen.

## Aristocracy

**Words:** from the burned-in subtitles, which cover the announcement and the whole poem (1.8 s–83.8 s). Line and stanza breaks follow the subtitle punctuation and the pauses between subtitles. The subtitle's own punctuation is kept, including "Time shifts shape learns when to pause." and "This was never just a ride somewhere new." Commas were not added to these lines because doing so would change how they read. "Vapor" keeps the subtitle's US spelling.

**Voices:** ECAPA similarity to the average narrator voice is 0.81–0.89 across all poem sections, so the poem is one voice, labelled "Voiceover". The opening railway announcement scores 0.15, which suggests a different voice or a heavily processed one, so it is labelled "Announcement". Nobody is named on screen.

**Unsubtitled calls (moderate confidence):**
- "Turning over. Lights!" (0–1.9 s): heard by all six full-track runs, and again by small.en and medium.en on an isolated, padded 0–2.4 s clip. The word probability for "Turning" is low (0.05–0.51), while "over" (0.96–0.99) and "Lights" (0.64–0.99) are high. In teacher-forced scoring, dropping only one of the two calls scores worse in every model (3.8–10.6 nats). Dropping both is worse for medium.en (2.3 nats) and large-v3 (3.2 nats), but slightly better for small.en (0.9 nats).
- "Action!" (about 6.0 s, roughly 0.2 s long): heard by large-v3 in both full-track runs, and by all three models on an isolated 5.0–8.8 s clip, with word probabilities of 0.24–0.75. The spectrogram shows a distinct, loud voiced burst at 6.00–6.10 s, after "Manchester" ends and before steady musical tones appear in the spectrogram at about 7.7 s. With the following poem line in context, all three models score the version with "Action!" higher: by 3.0 nats (small.en), 2.9 (medium.en) and 0.3 (large-v3).
- The ECAPA similarity of "Turning over" and "Lights!" to the narrator is about 0 ("Action!" is too short to measure), so the calls are labelled "Off-screen voice". This is not a claim that all three come from one person.

**Music:** the tagger's Music score is low until about 6 s, and the spectrogram shows steady musical tones from about 7.7 s. It stays mostly at 0.45–0.76 under the voiceover until about 84 s, then falls away, with a "sound effect" tag near the end. There is one dip at about 19–26 s (0.06–0.25), where the tagger also reports low rumble-type sounds. This is transcribed as "[Music begins and plays under most of the voiceover.]" and "[Music ends.]". The dip is not narrated, because the tagger cannot tell whether the music stops there or is only masked.

**Subtitle vs ASR disagreements (subtitle kept):**

| Time | Subtitle (published) | ASR | Audio evidence |
| --- | --- | --- | --- |
| 20.2 s | "prepared for will." | "wind" in all six runs | Forced alignment prefers "wind" by 1.3 nats (medium.en) and 2.2 nats (large-v3). A listening check is recommended |
| 16.6–18.6 s | "settled, pressed and still," | small.en with VAD: "pressed in steel"; the other five runs: "pressed and still" | "and still" preferred by 4.4 nats (medium.en) and 5.4 nats (large-v3) |
| 36.0 s | "Time shifts shape learns when to pause." | "Time shifts shape, learns when to pause." | Same words. Only punctuation differs |

**Not transcribed:** large-v3 without VAD produced "Thank you." at 86.1–87.5 s with no-speech probability 0.82. This is a well-known Whisper hallucination on trailing silence or music. The VAD run did not produce it, and no other model did.

## Nickleby Capital, Video 1

**Words:** from the burned-in subtitles and the full-screen question cards. Apart from the points in the table and a few slips by the smaller models (for example "experienced economy"), the ASR runs agree with the subtitles.

**On-screen text used for labels:** the lower third at about 12–14.5 s reads "ROBIN SHERRY / CEO & Co-founder, Seat Unique", and the transcript uses that name and title. He also says it aloud: "I'm Robin Sherry, CEO and founder of Seat Unique." This line has no subtitle. All six runs hear "CEO and founder", and forced alignment prefers it over "CEO and co-founder" by about 11–13 nats. So the spoken words differ from the on-screen title, and the transcript keeps both as they appear.

**Attributing the answers to Robin Sherry:** the answer segments' ECAPA similarity to the self-introduction is 0.51–0.69, and to the average answer voice 0.68–0.93. That is one consistent voice throughout, matching the speaker named on screen. The questions are shown as title cards and read aloud. On screen, the interviewee is reading from a card during each question, and the question audio has the same voice (0.61–0.80 to the answer average). The questions are still labelled only "Question", so no speaker claim is needed.

**Opening clips (2–7 s):** "This is a stitch up." / "Get that on camera." / "Okay, let's go with the first question." These are subtitled. People in the chair change between shots, and none is named on screen. The three lines score only 0.03–0.20 against each other and 0.12–0.30 against the main speaker. The segments are short and have music under them, so these scores are not proof, but they do not match the main speaker. Each line is labelled "Unnamed speaker", with no claim about how many people speak.

**Title cards:** the opening card, at about 0–1.5 s, is written **"NICKELBY PRESENTS"** in the video itself. The logo, the subtitles and the end card all read "Nickleby". The transcript does not reproduce the card's spelling and describes it only as "Opening title card". This conflicts with the site rule to spell "Nickleby" as the video does, so it is reported for `docs/content-provenance.md`. A second card at about 8–12 s reads "MEET THE MAKERS", written in the transcript as "Meet the Makers". The end card shows the nickleby capital logo and "See more at nicklebycapital.com".

**Subtitle vs ASR disagreements (subtitle kept):**

| Time | Subtitle (published) | ASR | Audio evidence |
| --- | --- | --- | --- |
| 20.2 s | "when they got back together in Cardiff." | "at Cardiff" in all six runs | Forced alignment strongly prefers "at" (4.6 nats large-v3, 6.9 nats medium.en). The subtitle was kept as the brief requires, but the spoken word is very likely "at" |
| 92.8 s | "a bit cheesy" | small.en (both runs) and medium.en with VAD: "choosy"; medium.en without VAD and both large-v3 runs: "cheesy" | Subtitle confirmed by the stronger models |
| throughout | "Seat Unique" | garbled in some small and medium runs ("CENEAT", "CUNY", "Seatenique", "Seatunix") | Subtitle confirmed by large-v3 and by the lower third |
| various | "Nickleby" | often "Nickelby" / "Nickelbee" | ASR spelling only. The on-screen spelling is used |

**Small edits:** the subtitle "Firstly, the most important the governance of the business." has a comma added after "important", which all three models also punctuate. Straight apostrophes are typeset as ’.

**Music:** the tagger scores Music at about 0.5–0.7 for most of the film. It dips at about 22–26 s, 40–44 s and 54–68 s (0.01–0.34). This is transcribed as "[Music plays under most of the film.]", not "throughout".

## The Night Club / HECK

**Speech:** yes, at about 3–13.5 s. There are no subtitles or captions in the film.

- "Welcome to the Night Club Global Tour, powered by Gymshark." Four of six runs have this wording. large-v3 without VAD heard "Dimshark", and small.en without VAD heard "Dim shot"; the rest of the sentence is the same in all six. Forced alignment clearly prefers "powered" over "presented" or "hosted" (about 8–13 nats) and "Global" over "World" (about 8–10 nats). "Gymshark" and "Night Club" are spelled as they appear in the film's own branding: the Gymshark store sign and "NIGHT CLUB / GYMSHARK" flags and clothing.
- "Thank you to HECK for [inaudible] us, but enjoy yourselves and have fun!" The runs split on the unresolved word: "fueling" (medium.en without VAD, large-v3 with VAD) or "viewing" (small.en with VAD, medium.en with VAD, large-v3 without VAD, and small.en without VAD as "Thank you so much for viewing us"). Forced alignment cannot separate them: large-v3 −15.91 vs −15.92, and medium.en −13.08 vs −13.22. Because the audio does not decide it, the word is marked `[inaudible]` rather than guessed from context. "Thank you to HECK" is clearly preferred over "Thank you so much" (3.3–6.3 nats). "but" is in five of six runs, and removing it lowers the score slightly.
- This is the only `[inaudible]` in any of the three transcripts, within the brief's limit of one or two.
- The two sentences score only 0.30–0.38 against each other, which is inconclusive with the loud background. Nobody is named on screen, so each sentence is labelled "Unnamed speaker", with no claim about whether one or two people speak.

**After 13.5 s:** all three VAD runs find no speech. Without VAD, all three models produced a short sung-sounding fragment at about 30–34 s with low confidence. The tagger rates Singing at 0.05 or less there, and the picture shows a DJ at about 28–29 s. This fragment is treated as part of the music. It is not transcribed, and song lyrics are not reproduced in any case. The tagger scores Music at about 0.4–0.6 from about 13.5 s to 36 s, with a sound effect at the very end. This is transcribed as "[Music continues to the end. No further spoken dialogue.]"

**On-screen text noted:** Gymshark and Night Club branding, HECK food packaging, "Run Sausage Run" signs (checked in both the original and the 1080p derivative at 18 s), and the closing HECK logo (about 34–37 s).

## Points for a listening check

1. Aristocracy about 0–6 s: "Turning over. Lights!" and "Action!" (unsubtitled, moderate confidence).
2. Aristocracy 20 s: the subtitle says "will"; the audio sounds more like "wind" to every model.
3. Nickleby 20 s: the subtitle says "in Cardiff"; the audio is very likely "at Cardiff".
4. Nickleby 12 s: "CEO and founder" (spoken) vs "CEO & Co-founder" (lower third). Both are kept as they are.
5. HECK 8.5–10 s: the word after "for" ("fuelling" or "viewing"). If a listener can decide it, replace `[inaudible]`.

## Work files

Everything lives under `.media-cache/`, which is ignored by git:

- `.media-cache/asr/`: the Python venv.
- `.media-cache/transcripts/audio/`: 16 kHz WAVs and the isolated clips.
- `.media-cache/transcripts/asr/`: raw ASR JSON with word timings and probabilities for every run, the logs `small.en.log`, `medium.en.log` and `large-v3.log`, and the tagger output `*.tags.json`.
- `.media-cache/transcripts/frames/` and `sheets/`: subtitle crops, contact sheets, zooms and spectrograms.
- Scripts: `asr.py`, `score.py` (forced-alignment scoring), `tag.py` (AudioSet tagging), `spk.py` and `spk2.py` (voice-embedding checks), `dedupe.py`, `sheets.py`, `sheet_kept.py`.
- `.media-cache/transcripts/models/` and `hf/` hold about 5 GB of downloaded model weights. They can be deleted safely. Deleting them only means the models download again if the checks are re-run.

To reproduce the ASR runs:

```sh
T=.media-cache/transcripts
ffmpeg -i "Shift Content/Aristocracy.mp4" -vn -ac 1 -ar 16000 -c:a pcm_s16le $T/audio/aristocracy.wav   # same for the other two films
HF_HOME=$PWD/$T/hf .media-cache/asr/bin/python $T/asr.py large-v3 aristocracy nickleby heck
HF_HOME=$PWD/$T/hf .media-cache/asr/bin/python $T/score.py large-v3 $T/audio/heck.wav 2.5 14.5 $T/heck_cands.txt
```
