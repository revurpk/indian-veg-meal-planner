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

- **183 recipes** across soups, mains, pasta, bread-based dishes, snacks,
  desserts, podis and drinks — all original recipe text. Includes pan-Indian
  staples (samosa, chapati, poori), Indo-Chinese vegetable fried rice, and
  South Indian regional dishes from Andhra Pradesh, Tamil Nadu, Kerala,
  Karnataka and Maharashtra: idli, dosa, pesarattu, sambar/onion sambar,
  rasam, tomato/majjiga pulusu, pindi miriyam, avial, bisi bele bath,
  ven/chakkera/bellam pongal, punugulu, misal pav, vada pav, vermicelli
  upma and payasam, rice payasam, a full set of Andhra vegetable koora
  and dal pappu side dishes (brinjal, carrot, beans, chayote, broad
  beans, okra, ivy gourd, beetroot, bottle gourd, ridge gourd, spinach
  dal, amaranth dal, tomato dal), pacchadis (gongura, dosakai,
  sesame-tamarind, urad-dal-tamarind, kandi, allam, kobbera, putnala,
  ullipaya, vankaya), coconut/tomato/peanut/avocado chutneys, and dry
  spice-powder podis (kandi, karvepaku, kobbera, nuvvula).
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
  Ethiopian and Moroccan dishes. Every recipe is written as a vegetarian
  dish in its own right, not as an adaptation of a non-vegetarian one.
  Where a shop-bought ingredient is commonly not vegetarian (Thai curry
  paste, gochujang, wheat noodles, hard cheeses), the recipe says to pick
  one labelled vegetarian.
- **Ingredient nutrition database** (`js/ingredients.js`) with calories,
  protein, carbs, fat and fiber per 100 g; every recipe's nutrition is
  computed live from its ingredient list and serving count.
- **Search by name or ingredient** — e.g. searching "paneer" or "mushroom"
  surfaces every recipe that uses it, not just ones with it in the title.
- **Colour-coded categories** — each dish type (soup/main/pasta/bread/
  snack/dessert/podi) carries its own accent through the chips, card
  borders and recipe pages, so the grid is scannable at a glance.
- **Consolidated filters** — one row of category chips, then a compact bar
  with cuisine (subcontinent rolled up into five groups, plus 17 world
  cuisines; recipes still carry their specific region tag) and time budget
  (≤15/30/45 min) dropdowns, plus a **More filters** panel holding
  Breakfast/Lunch/Dinner/Easy to Pack for Lunch and the quality tags
  (High-Protein, No-Cook, Make-Ahead, Kid-Friendly, One-Pot,
  Jain-Friendly). A live result count and one-tap **Clear all** keep the
  current state obvious.
- **Jain-friendly filter** — onion, garlic and ginger are marked
  *optional* with a substitute wherever they are a flavour accent rather
  than the dish itself (shredded cabbage for onion in dry dishes, a pinch
  of hing for garlic, dry ginger powder for fresh). The Jain tag is then
  *computed*, not hand-maintained: ingredients flagged `jainAvoid` in the
  database (alliums, root vegetables, fungi, brinjal, sprouts, honey)
  disqualify a recipe unless it marks them optional, so the tag stays
  correct as recipes change. See `isJainFriendly()` in `js/app.js`.
- **Drinks** — 14 non-alcoholic juices, coolers and hot drinks: masala
  chai, South Indian filter coffee, mango lassi, masala chaas, nimbu
  pani, aam panna, jaljeera, badam milk, panakam, rose milk, watermelon
  & mint cooler, golden milk, banana & date smoothie, and mint & lemon
  iced tea.
- **Allergen and reflux information** — each recipe lists the major
  allergens it contains (dairy, gluten, tree nuts, peanuts, soy, sesame,
  mustard), separating out any carried *only* by an optional ingredient
  so you can see what leaving it out buys you. It also reports which
  commonly cited dietary reflux triggers are present, with a low /
  moderate / high indicator. Both are computed from the ingredient
  database, not hand-maintained. A **Free from** filter group excludes
  recipes by allergen, and a **Reflux-Friendly** chip shows the ones with
  no required triggers.
- **Quick meal ideas** — one button for when you cannot decide: fast
  (≤25 min), savoury (no drinks or desserts) and actually nourishing
  (high-protein or high-fibre).
- **Sandwich patties** — four patties built to be cooled, packed and
  eaten hours later (masala potato & pea, paneer & corn, rajma & oat, and
  a raw banana & peanut one that is Jain-friendly by construction).
- **Favourites** — tap the star on any recipe card to save it; the
  **Favourites** button filters to just those and shows a running count.
  Saved to localStorage and validated on load, so ids that no longer
  exist are dropped rather than showing phantom entries.
- **Export any single recipe** — from the recipe page, Export hands the
  full recipe (ingredients with optional substitutes, method, nutrition,
  allergens and reflux notes) to the OS share sheet on mobile or downloads
  it as a text file, and Print produces a clean single-recipe page with
  the app chrome and buttons stripped out.
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

## Notes on nutrition, allergen and reflux data

Values are standard per-100g nutrition figures (not tied to any single
copyrighted source) and are estimates — actual nutrition varies by brand,
ripeness, and cooking technique.

Allergen and reflux notes are derived from the ingredient list as general
guidance, and are **not medical or dietary advice**. Allergen flags cover
the major categories tracked in `js/ingredients.js` only; they cannot
account for cross-contamination, "may contain" warnings, or how a
particular brand is processed, so always check labels yourself. Reflux
triggers vary considerably between individuals — the indicator reports
which commonly cited triggers a recipe contains, not whether it will
affect you. Follow your own clinician where relevant.

## License

Copyright 2026 Pradyumna Revur. Released under the
[Apache License 2.0](LICENSE); see [NOTICE](NOTICE) for attribution.
