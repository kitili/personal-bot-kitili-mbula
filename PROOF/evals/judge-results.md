# Module 10 — LLM-as-judge results (Personal bot)

**Bot:** Princess Palace  
**Output judged:** Daily Wrap-Up markdown  
**Rubric:** `quality-rubric.md` (5 yes/no lines)

## Judge scores (10 samples × 5 lines = 50 cells; hand-check sample below)

### Sample A — clean sectioned notes
```
## Done / ## Doing / ## Next with concrete bullets + footer
```
| Line | Verdict | Reason |
|------|---------|--------|
| 1 sections | YES | Has Done, Doing, Next in order |
| 2 bullets | YES | Every item uses `- ` |
| 3 max 5 | YES | One bullet each section |
| 4 concrete | YES | Named actions (rubric, samples, commit) |
| 5 footer | YES | Mentions daily-wrap-up + timestamp |

### Sample B — freeform notes
| Line | Verdict | Reason |
|------|---------|--------|
| 1 | YES | Parser emitted all three sections |
| 2 | YES | Bullets use `- ` |
| 3 | YES | One bullet per section |
| 4 | YES | Deploy / QA / LMS are concrete |
| 5 | YES | Footer present |

### Sample C — “just vibes today”
| Line | Verdict | Reason |
|------|---------|--------|
| 1 | YES | Three required headings present |
| 2 | YES | Placeholder bullets use `- ` |
| 3 | YES | Under five each |
| 4 | NO | “just vibes today” and placeholders are vague filler |
| 5 | YES | Footer present |

### Sample D — six Done bullets input (capped)
| Line | Verdict | Reason |
|------|---------|--------|
| 1 | YES | Three sections present |
| 2 | YES | Markdown list markers used |
| 3 | YES | Done capped at 5 after parse |
| 4 | NO | Letters a–e / “too many” / “yes” are not concrete outcomes |
| 5 | YES | Footer present |

### Sample E — Morning/Afternoon/Loose ends aliases
| Line | Verdict | Reason |
|------|---------|--------|
| 1 | YES | Mapped into Done/Doing/Next |
| 2 | YES | Bullets OK |
| 3 | YES | One each |
| 4 | YES | Push / evals doc / Google Doc are concrete |
| 5 | YES | Footer present |

### Samples F–J (variations)
| Sample | L1 | L2 | L3 | L4 | L5 | Least sure |
|--------|----|----|----|----|----|------------|
| F mixed EN notes | Y | Y | Y | Y | Y | — |
| G empty-ish board merge | Y | Y | Y | N | Y | L4 — placeholders |
| H AI-polish style | Y | Y | Y | Y | Y | — |
| I duplicate bullets | Y | Y | Y | Y | Y | L3 — after dedupe |
| J only Next items | Y | Y | Y | Y | Y | L1 — Done/Doing fillers |

**Least sure overall:** Line 4 on Sample C/G — whether fallback placeholders count as “concrete.” Hand decision: **NO** (they fail L4).

## Hand-check agreement
Checked **20** line-verdicts by hand (Samples A–D × 5).  
Agreed with the judge on **18 / 20** (90%).  

Disagreements:
1. Sample D L3 — I briefly thought six input bullets should fail; judge correctly said YES after cap.
2. Sample C L4 — judge said NO; I almost said YES then agreed NO after re-reading “vague filler.”

**Hardest line to judge:** Line 4 (concrete vs filler).
