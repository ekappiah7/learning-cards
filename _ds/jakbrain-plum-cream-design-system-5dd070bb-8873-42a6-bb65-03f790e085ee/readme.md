# JAKBRAIN Consult — Plum & Cream Design System (v2)

Replaces the v1 JAKBRAIN Consult system (navy/charcoal + gold). Same company, same fonts, same voice — new colour logic.

**Company:** JAKBRAIN Consult runs an online school at ekappiah.online/school with academic courses for BSc level and above. The flagship is a 14–16 week Research Methods course in 8 modules.

**Imported from:** Claude Design project `fdec4598-9a4c-4e41-ad25-8ccf70f424e6` ("Plum & Cream design system").

**Sources:** v1 design system (project `6b36593e-…`, tokens in `colors_and_type.css`), a plum colour swatch the user supplied (sampled flat at `#5A0B4D`, not a blend), and the user's brief: plum replaces navy, gold becomes lines/geometry only, text that was gold becomes cream, black text stays black, fonts unchanged.

## Index
- `styles.css` — entry point (imports only)
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `base.css`
- `components/core/` — Button, Badge, Card, Eyebrow
- `components/forms/` — Input
- `components/feedback/` — ProgressBar
- `guidelines/` — specimen cards (colour, type, spacing, brand)
- `assets/logo-cream.png` (on plum), `assets/logo-plum.png` (on cream), `assets/logo-ink.png` (on white) — transparent brain + JAKBRAIN wordmark
- `assets/logo.png` — original v1 artwork with taglines (source only; don't use)
- `assets/flyers/` — four Thesis Support flyer PNGs (reference for the system in use)
- `thumbnail.html` — homepage tile
- `SKILL.md`

## CONTENT FUNDAMENTALS
Unchanged from v1. Academic but accessible; it talks *to* the student.
- "You" for the student ("By the end of this module, you will…"), "we" for shared work ("In this module, we explore…").
- Sentence case for headings. British spelling (analyse, recognise, practise).
- No emoji. The occasional rhetorical question: "What is knowledge, really?"
- Labels are numbered and specific: Module 1, Week 1, Lesson 1A; "Research proposal", not "Assignment 1".

## VISUAL FOUNDATIONS
**Two base colours.** Plum `#5A0B4D` (dark theme, the default) and cream `#F6EFDF` (light theme, `data-theme="cream"`). There's no navy or charcoal anywhere.

**Gold is line, never type.** `#D4A843` on plum, `#A8781A` on cream. Use it for hairline borders, 1px rules, the 32px eyebrow rule, dot grids, graph-paper grids, outline circles, progress fills on plum, and secondary-button outlines. Never use gold for text or large fills.

**Text.**
- On plum: cream `#F6EFDF` for primary text (everything that used to be gold is now cream), mist `#DCC8D2` for secondary text, `#B898AD` for muted text.
- On cream: plum `#5A0B4D` for headings, ink `#1C1119` for body text, `#5B4855` for secondary text.

**Depth.** On plum, raised cards step lighter (`#6C1A5E`). Footers, inputs and overlays step deeper (800–950). On cream, cards sit on `#FCF8EF` and inputs on `#ECE1C9`. Shadows are plum-tinted, never neutral black.

**Type.** Playfair Display for display and module titles (italic for one emphasised word). DM Sans for headings, labels and UI. Source Serif 4 for body text. JetBrains Mono for data. Scale: 12/14/16/20/24/32/48/64/80/96.

**Backgrounds.** Flat plum or cream with gold geometry layered at low opacity: 24px dot grids, 40px graph paper, large outline circles bleeding off the edges. No gradients, no photography, no noise.

**Cards.** 12px radius, 1px gold border at 55% (22% for a subtle border), `shadow-md`. Hover lifts by 2px and uses `shadow-lg`.

**Radii.** 4 for tags, 8 for inputs, 12 for cards, 20 for panels and modals, full for buttons and pills.

**Buttons.** Primary is a cream pill with plum text on plum, and a plum pill with cream text on cream. Secondary is a transparent pill with a gold outline and cream or ink text.

**Motion.** `cubic-bezier(0.4,0,0.2,1)` easing. Text fades in with a 100–200ms stagger, and sections dissolve rather than cut.

**Hover/press.** Links fade to 0.8 opacity. Buttons lighten by one step (dark theme) or deepen by one step (light theme). Secondary buttons get a faint gold wash. Inputs get a stronger gold border and a 3px gold halo on focus.

**Module colours.** These are unchanged from v1 and used only for fills and geometry. Rose and indigo sit close to plum, so check them in context.

## ICONOGRAPHY
- Lucide (CDN `https://unpkg.com/lucide@latest`) with a 1.5px stroke. Icons are drawn in cream on plum, plum on cream, or gold when used purely as decoration.
- No emoji. Unicode is used sparingly (→, ·, —).
- The logo is the brain plus the JAKBRAIN wordmark, with no taglines. Use the transparent PNGs: `logo-cream.png` on plum and `logo-plum.png` on cream. They were cut from `logo.png`, so the brain interior is see-through and only the outlines show.

## Intentional additions
- **Eyebrow:** formalises the gold-rule + uppercase label motif that the brief puts at the centre of the system.
- **ProgressBar:** a core LMS pattern that shows gold used as a line on plum.
