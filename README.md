# Veg Meal Planner

A standalone, installable weekly meal planner built around quick, nutritious
vegetarian recipes for busy professionals — rooted in Indian home cooking
and extended across the subcontinent and around the world. No meat, fish,
or egg — dairy is used freely. No build step, no external runtime
dependencies.

Binding project rules (vegetarian-only, safety/security review before every
commit, licensing) are in [CONSTITUTION.md](CONSTITUTION.md).

## Quick start

```
python -m http.server 8811
```

Then open `http://localhost:8811`. Or just open `index.html` directly in a
browser (the service worker and "Add to Home Screen" install prompt need a
real HTTP origin, so `http://` is recommended over `file://`).

## Features

- **156 recipes** across soups, mains, pasta, bread-based dishes, snacks,
  desserts and podis — all original recipe text. Includes pan-Indian
  staples (samosa, chapati, poori), Indo-Chinese vegetable fried rice, and
  South Indian regional dishes from Andhra Pradesh, Tamil Nadu, Kerala,
  Karnataka and Maharashtra: idli, dosa, pesarattu, sambar/onion sambar,
  rasam, pulusu, avial, bisi bele bath, ven/chakkera/bellam pongal,
  punugulu, misal pav, vada pav, vermicelli upma and payasam, rice
  payasam, a full set of Andhra vegetable koora and dal pappu side
  dishes (brinjal, carrot, beans, chayote, broad beans, okra, ivy gourd,
  beetroot, bottle gourd, ridge gourd, spinach dal, amaranth dal, tomato
  dal), gongura/dosakai/sesame-tamarind/urad-dal-tamarind pacchadis,
  coconut/tomato/peanut chutneys, and dry spice-powder podis (kandi,
  karvepaku, kobbera, nuvvula).
- **Across the subcontinent** — Bengali (aloo posto, cholar dal, shukto,
  beguni, labra), Gujarati (khaman dhokla, thepla, khandvi, undhiyu),
  Punjabi (dal makhani, sarson da saag, baingan bharta, bhatura, aloo
  palak), Rajasthani (gatte ki sabzi, panchmel dal), Kashmiri (dum aloo,
  nadru yakhni), Bihari (litti chokha), Odia (dalma), Sindhi (kadhi),
  Nepali (momo, aloo tama) and Sri Lankan (parippu, cashew curry).
- **Around the world** — Middle Eastern (hummus, falafel, mujadara,
  tabbouleh, baba ganoush, baklava), Greek, Italian (minestrone, risotto,
  margherita, pesto), French ratatouille, Spanish (patatas bravas,
  churros), Turkish and Ukrainian soups, Mexican (guacamole, quesadilla,
  tacos, elote), Japanese, Thai, Chinese, Korean, Vietnamese, Indonesian,
  Ethiopian and Moroccan dishes. Dishes normally made with fish sauce,
  shrimp paste, dashi or egg (Thai green curry, gado-gado, miso soup,
  churros, falafel) carry explicit notes on keeping them vegetarian, and
  cheeses are specified as vegetarian-rennet.
- **Ingredient nutrition database** (`js/ingredients.js`) with calories,
  protein, carbs, fat and fiber per 100 g; every recipe's nutrition is
  computed live from its ingredient list and serving count.
- **Search by name or ingredient** — e.g. searching "paneer" or "mushroom"
  surfaces every recipe that uses it, not just ones with it in the title.
- **Colour-coded categories** — each dish type (soup/main/pasta/bread/
  snack/dessert/podi) carries its own accent through the chips, card
  borders and recipe pages, so the grid is scannable at a glance.
- **Consolidated filters** — one row of category chips, then a compact bar
  with cuisine (33 regions, Andhra to Ethiopian) and time budget
  (≤15/30/45 min) dropdowns, plus a **More filters** panel holding
  Breakfast/Lunch/Dinner/Easy to Pack for Lunch and the quality tags
  (High-Protein, No-Cook, Make-Ahead, Kids-Friendly, One-Pot). A live
  result count and one-tap **Clear all** keep the current state obvious.
- **Weekly planner** — assign recipes to Breakfast/Lunch/Snack/Dinner across
  the week, with per-day and per-week calorie totals. Saved to
  `localStorage`.
- **Shopping list** — auto-aggregated from everything in the weekly plan,
  grouped by ingredient category, with checkable items.
- **Installable PWA** — manifest, app icons (including maskable/apple-touch),
  and a service worker for offline use on iPhone and Android.

## Layout

```
index.html          app shell
css/style.css        styling (light/dark aware, mobile-first)
js/ingredients.js     nutrition database
js/recipes.js         recipe database
js/app.js             all app logic (search, planner, shopping list, PWA)
manifest.webmanifest  PWA manifest
sw.js                 offline service worker
icons/                source SVG + generated PNG icons (icons/generate_icons.py regenerates them)
```

## Regenerating icons

Icons are drawn programmatically with Pillow (no SVG rasterizer dependency
needed on Windows):

```
python -m uv venv .venv
python -m uv pip install --python .venv/Scripts/python.exe pillow
.venv/Scripts/python.exe icons/generate_icons.py
```

## Notes on nutrition data

Values are standard per-100g nutrition figures (not tied to any single
copyrighted source) and are estimates — actual nutrition varies by brand,
ripeness, and cooking technique.

## License

Copyright 2026 Pradyumna Revur. Released under the
[Apache License 2.0](LICENSE); see [NOTICE](NOTICE) for attribution.
