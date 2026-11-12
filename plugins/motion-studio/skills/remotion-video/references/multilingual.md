# Multilingual text in video

Applies to Remotion (browser text), Manim (`Text` via Pango) and FFmpeg (`drawtext`/`subtitles`).

## Font per script

| Script | Languages | Remotion (@fontsource) | System font (Manim/FFmpeg) |
|--------|-----------|------------------------|----------------------------|
| Latin, Cyrillic, Greek | en, es, fr, de, ru… | `inter`, `rubik`, `montserrat` | Inter, DejaVu Sans |
| Hebrew | he | `heebo`, `rubik`, `assistant`, `frank-ruhl-libre` (serif) | Noto Sans Hebrew |
| Arabic, Persian, Urdu | ar, fa, ur | `noto-sans-arabic`, `cairo`, `tajawal`, `noto-naskh-arabic` | Noto Sans Arabic |
| Japanese | ja | `noto-sans-jp` | Noto Sans CJK JP |
| Chinese | zh | `noto-sans-sc` / `noto-sans-tc` | Noto Sans CJK SC/TC |
| Korean | ko | `noto-sans-kr` | Noto Sans CJK KR |
| Thai | th | `noto-sans-thai`, `prompt` | Noto Sans Thai |
| Devanagari | hi, mr | `noto-sans-devanagari` | Noto Sans Devanagari |

`Rubik`, `Heebo` and `Cairo` cover Latin too, so a mixed Hebrew/English video can use one family.
For CJK fonts, import only the weights you use — they are large.

Tofu (□□□) in a frame means the font lacks the glyphs. Fix the font, never the text.

## Direction (RTL)

- Set `dir="rtl"` on the container (or use `detectDir(text)`), and `textAlign` follows.
- **Mixed text** ("השקנו את Motion Studio 2.0"): the bidi algorithm handles plain
  text. Problems start when each word is its own `inline-block` for animation —
  then the browser treats each word as a neutral object and reverses English
  phrases. `KineticText` avoids this by grouping words into directional runs
  (`<span dir=… style="unicode-bidi:isolate">`). Reuse it, or do the same.
- Phone numbers, prices, dates and code: wrap in `<bdi>` or `<span dir="ltr">`.
- **Mirror motion**: RTL reading starts at the right, so slides/wipes enter from the
  left (`slide({direction: "from-left"})`), progress bars grow right-to-left, lists
  stagger right-to-left, arrows point left for "next".
- Don't mirror: logos, play icons, clocks, charts' numeric axes, video footage.

## Typography rules by script

- **Never** `letter-spacing` on Arabic (breaks letter joining) — keep it 0 for Hebrew too.
- Never animate Arabic letter-by-letter; joined forms break. Animate by word.
  Hebrew letter-by-letter is OK but word-by-word reads better.
- Arabic needs ~15–20% more line-height (`1.4`+) for diacritics; Thai and Devanagari too.
- CJK: no spaces between words — `text.split(/\s+/)` gives one "word". Split by
  character (`[...text]`) or by phrase, and use `word-break: keep-all` for Korean.
- Hebrew niqqud and Arabic tashkeel need fonts that support them (Noto does).
- Uppercase transforms do nothing for Hebrew/Arabic/CJK — don't rely on them for emphasis; use weight or color.

## Manim

`Text("שלום עולם", font="Noto Sans Hebrew")` shapes correctly (Pango).
`Tex`/`MathTex` go through LaTeX and do **not** handle Hebrew/Arabic — use them for math only,
and put words next to formulas as separate `Text` objects arranged with `next_to`.
`MarkupText` supports `<span foreground="...">` for highlighting a word.

## FFmpeg subtitles

For burned-in captions in any language use an `.ass`/`.srt` file with the `subtitles`
filter and `force_style='FontName=Noto Sans Hebrew'` — libass shapes RTL and Arabic.
`drawtext` does not do bidi reordering on most builds; avoid it for RTL text.
