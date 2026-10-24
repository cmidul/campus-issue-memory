# AI limitations

What the AI in Campus Issue Memory can do, what it cannot, and which models we
are allowed to use. This file is the contract the implementation in M6/M7 must
keep to.

## Principles

1. **AI is optional.** Every feature works with zero AI keys. No key, no
   suggestion — never an error.
2. **AI suggests, humans decide.** Output is a pre-fill the author can edit or
   discard, and a hint a moderator can weigh. Nothing is auto-rejected,
   auto-hidden, or auto-deprioritised.
3. **Open weights only.** Models must be openly licensed (Apache-2.0/MIT-class)
   and their licence verified _before_ adoption; results recorded below.
4. **Minimum data.** Requests carry only what the step needs — sampled frames,
   never whole videos; never student names or e-mail addresses.

## Planned models and licences

| Component                    | Purpose                                  | Licence         | Status                                                                                      |
| ---------------------------- | ---------------------------------------- | --------------- | ------------------------------------------------------------------------------------------- |
| Qwen2.5-VL-7B-Instruct       | photo / frame description, category hint | Apache-2.0      | ✅ verified — free tier via OpenRouter (`qwen/qwen2.5-vl-7b-instruct:free`)                 |
| all-MiniLM-L6-v2             | local embeddings, similar-report lookup  | Apache-2.0      | ✅ verified — runs locally, no data leaves the device                                       |
| CLIP ViT-B/32 (planned)      | rough media/content typing aid           | MIT             | ✅ verified                                                                                 |
| `c2pa` Rust bindings         | content-credentials verification (M7)    | **NOASSERTION** | ⚠️ licence not asserted upstream — re-check before shipping                                 |
| GenImage (AI-image detector) | detecting synthetic photos (M7)          | **link 404**    | ⛔ repository unreachable at last check — re-locate and re-verify, or pick another detector |

If any row cannot be cleared, the feature ships **without** that component —
we do not adopt unclear licences "temporarily".

## Video identification: frame sampling

Free-tier vision models accept a small number of images per request and have
token limits, so a short clip (up to 60 s) is **never sent as a file**. Instead
the server:

1. Extracts a handful of frames (first frame + evenly spaced key frames, target
   **4–8 frames** depending on clip length).
2. Down-scales and re-encodes each frame (≈ 768–1024 px, JPEG) to bound tokens.
3. Sends only those frames in one request with a "these are frames from a
   video, in order" instruction.
4. Merges the per-frame readings into a single suggestion with the frame
   timestamps, shown to the author for confirmation.

### What frame sampling loses

- **Motion and audio**: silent, static frames cannot show a squeaking door,
  a flicker pattern over time, or anything heard in the clip.
- **Between-frames events**: anything shorter than the sampling interval may be
  missed entirely (a person appearing for half a second between two samples).
- **Ordering nuance**: frames are ordered, but duration and pacing are
  approximated, not measured.
- **Whole-clip metadata**: container metadata is not part of the AI request
  (provenance checks in M7 handle that separately).

### Operational limits

- **Free-tier quota and rate limits**: OpenRouter free models have request
  quotas and can be throttled or retired without notice. On quota exhaustion we
  fail gracefully: one retry, then a plain-language "suggestion unavailable"
  message — the form still submits normally.
- **Model drift**: free-tier model versions can change; suggestions are not
  reproducible and must never be logged as evidence.
- **Cost control**: sampling keeps every request bounded; no streaming, no
  full-video uploads.

## General limitations (photo _and_ video)

- **Hallucination**: the model can describe things that are not in the frame or
  miss obvious problems, especially in low light, glare, blur, or unusual
  angles. Suggestions are always editable and never trusted as fact.
- **Bias in image quality**: poorly lit or cheap-camera photos from basements
  and night stairwells — exactly where campus problems live — get worse
  suggestions than daylight photos. This can systematically disadvantage some
  locations; moderators must not treat suggestion quality as report quality.
- **No safety authority**: AI output must never be the sole reason to reject,
  hide, or deprioritise a report. A student's words always stand on their own.
- **Privacy**: sampled frames may contain people. Frames go server-side only
  (keys never reach the browser), providers are told nothing about the author,
  and — once real uploads exist — the AI step should skip frames with obvious
  faces/plates unless the reporter consents.
- **No personal data in prompts**: no names, e-mails, or account ids are ever
  included in an AI request.
- **Content policy**: the provider may refuse some inputs; refusal surfaces as
  a friendly "no suggestion available", never as a report error.

## Fallback matrix

| Situation                     | Behaviour                                                  |
| ----------------------------- | ---------------------------------------------------------- |
| No `OPENROUTER_API_KEY`       | AI step skipped entirely; form unchanged                   |
| Quota / rate limited          | one retry → "Suggestion unavailable right now"             |
| Provider refused the input    | same message; report submission unaffected                 |
| Model returned nonsense/empty | suggestion dropped; user sees the plain form               |
| Video longer than limit       | rejected by the composer's own `LIMITS` before any AI call |

## Before enabling anything new

Checklist for every added model or service:

- [ ] Licence text verified at the source (not a search snippet) and recorded
      in the table above.
- [ ] Runs with a free tier or locally; costs bounded per request.
- [ ] Works offline/no-key fallback proven by a test.
- [ ] PII policy: what leaves the device, and what never does.
- [ ] Documented in `docs/ROADMAP.md` milestone notes and this file.
