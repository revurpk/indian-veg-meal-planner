<!-- Copyright 2026 Pradyumna Revur — Apache-2.0 (see LICENSE) -->
# Project Constitution

These are the binding rules for all work on this project — by maintainers,
contributors, and AI assistants alike. A change that violates this
constitution must not be committed; a release that violates it must not be
published. Amendments require a commit that edits this file with the
rationale in the commit message.

## Article I — Purpose

This project is a standalone, installable weekly meal planner built around
quick, nutritious Indian vegetarian recipes for busy professionals, with a
built-in ingredient nutrition database and a shopping list generated from
the weekly plan. No build step, no server, no external runtime dependencies.

## Article II — Dietary integrity

1. **Every recipe MUST be vegetarian.** Meat, poultry, fish, shellfish, and
   eggs are forbidden in any recipe's ingredient list, in any suggested
   substitution, and in any ingredient added to the nutrition database.
2. **Dairy is permitted** (milk, curd/yogurt, paneer, cheese, ghee, butter,
   cream, khoya), as are honey and all plant-derived ingredients.
3. Every new or edited recipe MUST be checked against this article before
   it is committed. The check is a plain-text scan of the recipe's name,
   ingredient list, and steps for animal flesh or egg products — dairy and
   plant ingredients need no further justification.
4. If a traditional dish is normally made with meat, fish, or egg, it may
   still be included only as an explicitly vegetarian adaptation, and the
   recipe name or steps must not imply otherwise.

## Article III — Safety and security review

1. **A safety and security review MUST be run before every commit.** At
   minimum this means: re-scanning any new or changed `innerHTML`/render
   path for injection risk (interpolated values must come from static
   recipe/ingredient data, never from user input, unless explicitly
   escaped); confirming no secrets, credentials, or tracking/analytics
   code were introduced; confirming any new external resource (font,
   script, API) is justified and reviewed; and confirming `localStorage`
   reads still validate shape before use rather than trusting raw JSON.
2. **No telemetry, no tracking, no third-party runtime scripts.** The only
   permitted network access at runtime is same-origin (the app's own
   files); the service worker's cache MUST remain restricted to
   same-origin responses.
3. **Content-Security-Policy stays intact.** Any change that requires
   loosening the CSP meta tag in `index.html` (e.g. adding an external
   font or script) must document why in the commit message.
4. **Review record.** Note in the commit message that this article was
   checked, and call out anything skipped and why.

## Article IV — Licensing and content originality

1. All original work (code, recipe text, styling) is released under the
   **Apache License 2.0**; source files carry the license header, and
   `NOTICE` is kept current.
2. Recipe instructions are original text, not copied from any copyrighted
   source. Nutrition figures in `js/ingredients.js` are standard per-100g
   reference values, not reproduced from a single copyrighted table.
3. No third-party runtime JavaScript, fonts, or icon libraries ship with
   the app — everything renders from this repository's own files.

## Article V — Data integrity

1. Every ingredient referenced by a recipe MUST have a corresponding entry
   in `js/ingredients.js` — no recipe should silently degrade to a missing
   nutrition row.
2. Recipe ids MUST be unique across `js/recipes.js`.
3. New recipes should carry realistic per-serving nutrition; if a
   computed calorie figure looks roughly 1.5–2x what a normal serving of
   that dish would be, re-check the gram quantities or serving count
   before committing.
