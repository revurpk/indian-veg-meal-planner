# Veg Meal Planner

A standalone, installable weekly meal planner built around quick, nutritious
Indian vegetarian recipes for busy professionals. No meat, fish, or egg —
dairy is used freely. No build step, no external runtime dependencies.

## Quick start

```
python -m http.server 8811
```

Then open `http://localhost:8811`. Or just open `index.html` directly in a
browser (the service worker and "Add to Home Screen" install prompt need a
real HTTP origin, so `http://` is recommended over `file://`).

## Features

- **44 recipes** across soups, mains, pasta, bread-based dishes, snacks and
  desserts — all original recipe text.
- **Ingredient nutrition database** (`js/ingredients.js`) with calories,
  protein, carbs, fat and fiber per 100 g; every recipe's nutrition is
  computed live from its ingredient list and serving count.
- **Search by name or ingredient** — e.g. searching "paneer" or "mushroom"
  surfaces every recipe that uses it, not just ones with it in the title.
- **Category and quick filters** (Quick ≤20 min, High-Protein, No-Cook,
  Make-Ahead, Kids-Friendly, One-Pot).
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
