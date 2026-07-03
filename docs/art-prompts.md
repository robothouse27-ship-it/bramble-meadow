# Art prompts — Bramble Meadow 🌿

Prompts for generating concept art (via ChatGPT / GPT image) that we can use in the
app now **and** rig in Rive later. See [ROADMAP.md](../ROADMAP.md) for the open art thread.

## The pipeline reality (read first)

ChatGPT gives you a **flat PNG** — one baked image, no layers, no clean vectors.
**Rive rigs and animates individual pieces** (head, each ear, each arm, eyes, mouth)
as separate layered shapes. So ChatGPT art is *never* directly riggable. Its job is:

1. **Nail the style + character design** (concept art / model sheet), and
2. Give clean reference to **redraw as vector layers** later (Figma/Illustrator/Rive),
   or cut apart.

The goal isn't "generate the final asset" — it's "generate art that's *designed to be
riggable*."

## Make-it-Rive-friendly rules (bake into every prompt)

- **Flat vector / storybook style** — flat colors, clean outlines, minimal gradients,
  no painterly texture or fuzzy shading (doesn't rig or vectorize cleanly).
- **Front-facing, symmetrical, neutral pose** — slight A-pose with **limbs separated
  from the body**, not tangled or crossed. Overlapping parts make rigging painful.
- **Distinct, separable parts** — clearly readable head, body, two arms, two legs/feet,
  two ears, eyes, nose, mouth as their own shapes.
- **Transparent or flat solid background** (so it keys out easily).
- **Simple, chunky shapes** — a Duolingo/character-mascot look, not fine detail.

## Prompts

### 1. Style + character model sheet (do this first)

> Create a character model sheet for "Pip," a cute, clever hedgehog mascot for a cozy
> woodland Sudoku game called *Bramble Meadow*. Flat vector storybook illustration
> style — clean outlines, flat warm colors, minimal gradients, no texture. Warm meadow
> palette (soft greens, honey gold, cream, berry accents). Show Pip **front-facing in a
> neutral standing A-pose with arms held slightly away from the body and legs apart**,
> plus a small color/palette swatch. Chunky, simple, appealing shapes suitable for
> animation. Plain flat background.

### 2. Turnaround (for consistent redrawing)

> Same Pip hedgehog, same flat vector style and colors. Show a character turnaround:
> front, 3/4, and side views, neutral pose, arms and legs separated from the body.
> Consistent proportions across all views. Plain flat background.

### 3. Expression / mood sheet — match the 5 game states

> Same Pip hedgehog, flat vector style. An expression sheet showing five distinct
> face/pose states, labeled: **idle** (calm, gentle smile), **thinking** (curious, one
> paw to chin), **happy** (bright cheerful grin), **worried** (nervous, slightly
> curled), **celebrate** (arms up, joyful, eyes closed). Keep the body consistent;
> mainly change face and pose. Plain flat background.

The five states map directly to Pip's mood enum in code:
`idle | thinking | happy | worried | celebrate`.

### 4. World / environment + props

> Flat vector storybook illustration, warm sunlit woodland meadow for a cozy Sudoku
> game. Rolling green hills, soft sun, gentle clouds, wildflowers, a cozy burrow. Same
> flat-color, clean-outline style as the Pip hedgehog character. Also generate matching
> small props: a berry (life icon), a leaf, a wooden sign, drifting pollen/firefly
> sparkles. Elements on plain flat backgrounds.

## Handing files back

When you drop files in, note: which mood is which, and what's foreground vs. background.
Then the art gets integrated as SVG/PNG in the app now, and doubles as reference to rig
in Rive later.

## Honest caveats

- GPT image output often **ignores "transparent background"** and gives a flat color
  you'll need to key out.
- It won't give **true layers** — separating parts into layers happens afterward in
  Figma/Illustrator/Rive.
- Keep the **character sheet image** around as the style anchor — feed it back into
  ChatGPT for consistency when generating new poses/props.
