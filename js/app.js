/* Copyright 2026 Pradyumna Revur — Apache-2.0 (see LICENSE) */
(function () {
  "use strict";

  const CATEGORIES = [
    { id: "all", label: "All", emoji: "🍽️" },
    { id: "soup", label: "Soups", emoji: "🍲" },
    { id: "main", label: "Mains", emoji: "🍛" },
    { id: "pasta", label: "Pasta", emoji: "🍝" },
    { id: "bread", label: "Bread", emoji: "🥪" },
    { id: "snack", label: "Snacks", emoji: "🥗" },
    { id: "dessert", label: "Desserts", emoji: "🍮" },
    { id: "podi", label: "Podis", emoji: "🧂" },
    { id: "drink", label: "Drinks", emoji: "🥤" },
  ];
  const CATEGORY_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]));
  const CATEGORY_ORDER = CATEGORIES.map((c) => c.id);

  // Cuisine options. Each entry maps to one *or more* recipe tags: the
  // subcontinent regions are rolled up into broad groups here so the dropdown
  // stays short, while the recipes keep their specific tag (andhra, bengali,
  // …) for display on the cards.
  const CUISINES = [
    { id: "all", label: "🌍 All cuisines", tags: [] },

    { id: "south-indian", label: "South Indian", group: "Indian subcontinent",
      tags: ["south-indian", "andhra", "tamil-nadu", "kerala", "karnataka"] },
    { id: "north-indian", label: "North Indian", group: "Indian subcontinent",
      tags: ["punjabi", "kashmiri"] },
    { id: "east-indian", label: "East Indian", group: "Indian subcontinent",
      tags: ["bengali", "odia", "bihari"] },
    { id: "west-indian", label: "West Indian", group: "Indian subcontinent",
      tags: ["gujarati", "maharashtra", "rajasthani", "sindhi"] },
    { id: "himalayan-lankan", label: "Nepali & Sri Lankan", group: "Indian subcontinent",
      tags: ["nepali", "sri-lankan"] },

    { id: "middle-eastern", label: "Middle Eastern", group: "Around the world", tags: ["middle-eastern"] },
    { id: "turkish", label: "Turkish", group: "Around the world", tags: ["turkish"] },
    { id: "greek", label: "Greek", group: "Around the world", tags: ["greek"] },
    { id: "italian", label: "Italian", group: "Around the world", tags: ["italian"] },
    { id: "french", label: "French", group: "Around the world", tags: ["french"] },
    { id: "spanish", label: "Spanish", group: "Around the world", tags: ["spanish"] },
    { id: "ukrainian", label: "Ukrainian", group: "Around the world", tags: ["ukrainian"] },
    { id: "mexican", label: "Mexican", group: "Around the world", tags: ["mexican"] },
    { id: "chinese", label: "Chinese", group: "Around the world", tags: ["chinese"] },
    { id: "indo-chinese", label: "Indo-Chinese", group: "Around the world", tags: ["indo-chinese"] },
    { id: "japanese", label: "Japanese", group: "Around the world", tags: ["japanese"] },
    { id: "korean", label: "Korean", group: "Around the world", tags: ["korean"] },
    { id: "thai", label: "Thai", group: "Around the world", tags: ["thai"] },
    { id: "vietnamese", label: "Vietnamese", group: "Around the world", tags: ["vietnamese"] },
    { id: "indonesian", label: "Indonesian", group: "Around the world", tags: ["indonesian"] },
    { id: "ethiopian", label: "Ethiopian", group: "Around the world", tags: ["ethiopian"] },
    { id: "moroccan", label: "Moroccan", group: "Around the world", tags: ["moroccan"] },
  ];

  const TIME_FILTERS = [
    { id: "all", label: "⏱ Any time", max: Infinity },
    { id: "15", label: "≤ 15 min", max: 15 },
    { id: "30", label: "≤ 30 min", max: 30 },
    { id: "45", label: "≤ 45 min", max: 45 },
  ];

  // Meal-time chips use OR logic (any selected tag matches) since a recipe
  // rarely belongs to more than one meal at once — unlike QUICK_FILTERS
  // below, which uses AND logic for independent quality tags.
  const MEAL_FILTERS = [
    { id: "breakfast", label: "🌅 Breakfast" },
    { id: "lunch", label: "☀️ Lunch" },
    { id: "dinner", label: "🌙 Dinner" },
    { id: "lunchbox-friendly", label: "🥡 Easy to Pack for Lunch" },
  ];

  // A recipe is Jain-friendly when nothing a strict Jain diet excludes is
  // *required* — ingredients flagged jainAvoid in the database (alliums, root
  // vegetables, fungi, brinjal, sprouts, honey) are acceptable only when the
  // recipe marks them optional and offers a substitute. Computed rather than
  // hand-tagged so it stays correct as recipes change.
  function isJainFriendly(recipe) {
    return recipe.ingredients.every((ing) => {
      const data = INGREDIENTS[ing.id];
      return !data || !data.jainAvoid || ing.optional;
    });
  }

  // Allergens come from the ingredient database. An allergen carried only by
  // an ingredient the recipe marks optional is reported separately, since the
  // dish can still be made free of it by leaving that ingredient out.
  function recipeAllergens(recipe) {
    const required = new Set();
    const optionalOnly = new Set();
    recipe.ingredients.forEach((ing) => {
      const data = INGREDIENTS[ing.id];
      if (!data || !data.allergens) return;
      data.allergens.forEach((a) => (ing.optional ? optionalOnly : required).add(a));
    });
    required.forEach((a) => optionalOnly.delete(a));
    return { required: [...required].sort(), optionalOnly: [...optionalOnly].sort() };
  }

  // Commonly cited dietary reflux triggers. Individual tolerance varies a great
  // deal, so this reports which triggers are present rather than pretending to
  // be a verdict — see the disclaimer shown alongside it.
  function refluxTriggers(recipe) {
    return recipe.ingredients
      .filter((ing) => (INGREDIENTS[ing.id] || {}).gerdTrigger)
      .map((ing) => ({ name: INGREDIENTS[ing.id].name, optional: !!ing.optional }));
  }

  function refluxLevel(recipe) {
    const required = refluxTriggers(recipe).filter((t) => !t.optional).length;
    if (required === 0) return "low";
    if (required <= 2) return "moderate";
    return "high";
  }

  const ALLERGEN_LABELS = {
    dairy: "Dairy", gluten: "Gluten", "tree-nut": "Tree nuts",
    peanut: "Peanuts", soy: "Soy", sesame: "Sesame", mustard: "Mustard",
  };

  const ALLERGEN_FILTERS = Object.keys(ALLERGEN_LABELS).map((id) => ({
    id, label: "No " + ALLERGEN_LABELS[id].toLowerCase(),
  }));

  const QUICK_FILTERS = [
    { id: "high-protein", label: "💪 High-Protein", test: (r) => r.tags.includes("high-protein") },
    { id: "no-cook", label: "🧊 No-Cook", test: (r) => r.tags.some((t) => t.startsWith("no-cook")) },
    { id: "make-ahead", label: "📦 Make-Ahead", test: (r) => r.tags.includes("make-ahead") },
    { id: "kid-friendly", label: "🧒 Kid-Friendly", test: (r) => r.tags.includes("kid-friendly") },
    { id: "one-pot", label: "🍳 One-Pot", test: (r) => r.tags.includes("one-pot") },
    { id: "jain-friendly", label: "🪷 Jain-Friendly", test: isJainFriendly },
    { id: "reflux-friendly", label: "🫀 Reflux-Friendly", test: (r) => refluxLevel(r) === "low" },
  ];

  // "Quick meal ideas": fast, savoury and actually nourishing — deliberately
  // excludes drinks and desserts, which are quick but not a meal.
  const SAVOURY_CATEGORIES = ["soup", "main", "pasta", "bread", "snack"];
  function isQuickMealIdea(r) {
    return (
      r.time.prep + r.time.cook <= 25 &&
      SAVOURY_CATEGORIES.indexOf(r.category) !== -1 &&
      (r.tags.includes("high-protein") || r.tags.includes("high-fiber"))
    );
  }

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"];

  const STORAGE_PLAN = "mealPlanner.plan.v1";
  const STORAGE_CHECKED = "mealPlanner.shoppingChecked.v1";
  const STORAGE_FAVOURITES = "mealPlanner.favourites.v1";

  const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

  let activeCategory = "all";
  let activeCuisine = "all";
  let activeTimeFilter = "all";
  let activeMealFilters = new Set();
  let activeTagFilters = new Set();
  let activeAllergenFilters = new Set();
  let quickIdeasOn = false;
  let favouritesOnly = false;
  let searchQuery = "";
  let cellPickerTarget = null; // {day, slot}

  // ---------------- Nutrition ----------------
  function computeNutrition(recipe) {
    const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    recipe.ingredients.forEach((ing) => {
      const data = INGREDIENTS[ing.id];
      if (!data) return;
      const factor = ing.grams / 100;
      totals.kcal += data.kcal * factor;
      totals.protein += data.protein * factor;
      totals.carbs += data.carbs * factor;
      totals.fat += data.fat * factor;
      totals.fiber += data.fiber * factor;
    });
    const perServing = {};
    Object.keys(totals).forEach((k) => (perServing[k] = totals[k] / recipe.servings));
    return { total: totals, perServing };
  }

  function fmt(n, decimals) {
    return n.toLocaleString(undefined, { maximumFractionDigits: decimals == null ? 0 : decimals });
  }

  // ---------------- Storage ----------------
  // plan[day][slot] is an array of recipe ids — a slot can hold more than one dish.
  function emptyPlan() {
    const plan = {};
    DAYS.forEach((d) => {
      plan[d] = {};
      SLOTS.forEach((s) => (plan[d][s] = []));
    });
    return plan;
  }

  // Rebuilds onto a known-good shape so a missing/corrupted/hand-edited
  // localStorage value can't leave `plan[day][slot]` undefined at render time,
  // and only recipe ids that actually exist in RECIPES are ever accepted.
  // Also migrates the older one-recipe-per-slot format (a plain string,
  // or null) into the current array-per-slot format.
  function loadPlan() {
    const plan = emptyPlan();
    try {
      const raw = localStorage.getItem(STORAGE_PLAN);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        DAYS.forEach((d) => {
          SLOTS.forEach((s) => {
            const val = parsed[d] && parsed[d][s];
            const ids = Array.isArray(val) ? val : val ? [val] : [];
            plan[d][s] = ids.filter((id) => typeof id === "string" && RECIPE_BY_ID[id]);
          });
        });
      }
    } catch (e) { /* ignore corrupt storage, fall back to empty plan */ }
    return plan;
  }
  let plan = loadPlan();
  function savePlan() {
    localStorage.setItem(STORAGE_PLAN, JSON.stringify(plan));
  }

  function loadChecked() {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKED);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((id) => typeof id === "string" && INGREDIENTS[id]));
      }
    } catch (e) { /* ignore corrupt storage */ }
    return new Set();
  }
  // Same defensive shape as the plan and shopping list: only ids that still
  // exist in RECIPES survive a load, so a stale or hand-edited value cannot
  // put a phantom recipe in the favourites.
  function loadFavourites() {
    try {
      const raw = localStorage.getItem(STORAGE_FAVOURITES);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        return new Set(parsed.filter((id) => typeof id === "string" && RECIPE_BY_ID[id]));
      }
    } catch (e) { /* ignore corrupt storage */ }
    return new Set();
  }
  let favourites = loadFavourites();
  function saveFavourites() {
    localStorage.setItem(STORAGE_FAVOURITES, JSON.stringify([...favourites]));
  }
  function toggleFavourite(id) {
    if (favourites.has(id)) favourites.delete(id);
    else favourites.add(id);
    saveFavourites();
  }

  let checkedItems = loadChecked();
  function saveChecked() {
    localStorage.setItem(STORAGE_CHECKED, JSON.stringify([...checkedItems]));
  }

  // ---------------- Search / filter ----------------
  function recipeMatchesSearch(recipe, q) {
    if (!q) return true;
    q = q.toLowerCase();
    if (recipe.name.toLowerCase().includes(q)) return true;
    return recipe.ingredients.some((ing) => {
      const data = INGREDIENTS[ing.id];
      return data && data.name.toLowerCase().includes(q);
    });
  }

  function getFilteredRecipes() {
    const timeFilter = TIME_FILTERS.find((f) => f.id === activeTimeFilter);
    const cuisine = CUISINES.find((c) => c.id === activeCuisine);
    return RECIPES.filter((r) => {
      if (activeCategory !== "all" && r.category !== activeCategory) return false;
      if (timeFilter && r.time.prep + r.time.cook > timeFilter.max) return false;
      if (cuisine && cuisine.tags.length && !cuisine.tags.some((t) => r.tags.includes(t))) return false;
      if (activeMealFilters.size > 0 && ![...activeMealFilters].some((tag) => r.tags.includes(tag))) return false;
      if (!recipeMatchesSearch(r, searchQuery)) return false;
      if (quickIdeasOn && !isQuickMealIdea(r)) return false;
      if (favouritesOnly && !favourites.has(r.id)) return false;
      for (const a of activeAllergenFilters) {
        if (recipeAllergens(r).required.indexOf(a) !== -1) return false;
      }
      for (const tagId of activeTagFilters) {
        const filter = QUICK_FILTERS.find((f) => f.id === tagId);
        if (filter && !filter.test(r)) return false;
      }
      return true;
    }).sort((a, b) => {
      // Keep the grid grouped by dish type regardless of position in RECIPES,
      // so appending new recipes to the file doesn't scramble the "All" view.
      const d = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
      return d !== 0 ? d : 0;
    });
  }

  // ---------------- Rendering: filters ----------------
  function renderCategoryFilters() {
    const el = document.getElementById("categoryFilters");
    el.innerHTML = "";
    CATEGORIES.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (activeCategory === c.id ? " active" : "");
      btn.type = "button";
      btn.dataset.cat = c.id;
      btn.innerHTML = `<span class="chip-emoji">${c.emoji}</span>${c.label}`;
      btn.addEventListener("click", () => {
        activeCategory = c.id;
        renderCategoryFilters();
        renderRecipeGrid();
      });
      el.appendChild(btn);
    });
  }

  // Cuisine and max-time are single-choice with many options, so they live in
  // compact dropdowns rather than long chip rows that dominated the page.
  function renderCuisineSelect() {
    const el = document.getElementById("cuisineSelect");
    // Only offer cuisines that actually have recipes, so the list can't go stale.
    const available = CUISINES.filter(
      (c) => !c.tags.length || RECIPES.some((r) => c.tags.some((t) => r.tags.includes(t)))
    );
    let html = "";
    let openGroup = null;
    available.forEach((c) => {
      const g = c.group || null;
      if (g !== openGroup) {
        if (openGroup) html += "</optgroup>";
        if (g) html += `<optgroup label="${g}">`;
        openGroup = g;
      }
      html += `<option value="${c.id}">${c.label}</option>`;
    });
    if (openGroup) html += "</optgroup>";
    el.innerHTML = html;
    el.value = activeCuisine;
    el.classList.toggle("is-set", activeCuisine !== "all");
  }

  function renderTimeSelect() {
    const el = document.getElementById("timeSelect");
    el.innerHTML = TIME_FILTERS.map((f) => `<option value="${f.id}">${f.label}</option>`).join("");
    el.value = activeTimeFilter;
    el.classList.toggle("is-set", activeTimeFilter !== "all");
  }

  function renderMealFilters() {
    const el = document.getElementById("mealFilters");
    el.innerHTML = "";
    MEAL_FILTERS.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (activeMealFilters.has(f.id) ? " active" : "");
      btn.type = "button";
      btn.textContent = f.label;
      btn.addEventListener("click", () => {
        if (activeMealFilters.has(f.id)) activeMealFilters.delete(f.id);
        else activeMealFilters.add(f.id);
        renderMealFilters();
        renderRecipeGrid();
      });
      el.appendChild(btn);
    });
  }

  function renderAllergenFilters() {
    const el = document.getElementById("allergenFilters");
    el.innerHTML = "";
    ALLERGEN_FILTERS.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (activeAllergenFilters.has(f.id) ? " active" : "");
      btn.type = "button";
      btn.textContent = f.label;
      btn.addEventListener("click", () => {
        if (activeAllergenFilters.has(f.id)) activeAllergenFilters.delete(f.id);
        else activeAllergenFilters.add(f.id);
        renderAllergenFilters();
        renderRecipeGrid();
      });
      el.appendChild(btn);
    });
  }

  function renderTagFilters() {
    const el = document.getElementById("tagFilters");
    el.innerHTML = "";
    QUICK_FILTERS.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (activeTagFilters.has(f.id) ? " active" : "");
      btn.type = "button";
      btn.textContent = f.label;
      btn.addEventListener("click", () => {
        if (activeTagFilters.has(f.id)) activeTagFilters.delete(f.id);
        else activeTagFilters.add(f.id);
        renderTagFilters();
        renderRecipeGrid();
      });
      el.appendChild(btn);
    });
  }

  // ---------------- Rendering: recipe cards ----------------
  function buildRecipeCard(recipe, onClick, showFav) {
    const wrap = document.createElement("div");
    wrap.className = "recipe-card-wrap";
    wrap.dataset.cat = recipe.category;

    const card = document.createElement("button");
    card.type = "button";
    card.className = "recipe-card";
    card.dataset.cat = recipe.category;
    const nutrition = computeNutrition(recipe);
    const totalTime = recipe.time.prep + recipe.time.cook;
    card.innerHTML = `
      <div class="recipe-card-hero">${CATEGORY_EMOJI[recipe.category] || "🍽️"}</div>
      <div class="recipe-card-body">
        <div class="recipe-card-title">${recipe.name}</div>
        <div class="recipe-card-meta">
          <span>⏱ ${totalTime} min${recipe.soakNote ? " *" : ""}</span>
          <span>🍽 ${recipe.servings} servings</span>
        </div>
        <div class="recipe-card-tags">${recipe.tags.slice(0, 3).map((t) => `<span class="tag-pill">${t}</span>`).join("")}${
          isJainFriendly(recipe) ? '<span class="tag-pill tag-pill-jain">🪷 jain</span>' : ""
        }</div>
        <div class="recipe-card-kcal">${fmt(nutrition.perServing.kcal)} kcal / serving</div>
      </div>`;
    card.addEventListener("click", () => onClick(recipe));
    wrap.appendChild(card);

    if (showFav !== false) {
      const fav = document.createElement("button");
      fav.type = "button";
      fav.className = "fav-btn" + (favourites.has(recipe.id) ? " is-fav" : "");
      const setLabel = () => {
        const on = favourites.has(recipe.id);
        fav.textContent = on ? "★" : "☆";
        fav.setAttribute("aria-pressed", String(on));
        fav.setAttribute("aria-label", (on ? "Remove " : "Add ") + recipe.name + (on ? " from" : " to") + " favourites");
        fav.title = on ? "Remove from favourites" : "Add to favourites";
      };
      setLabel();
      fav.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavourite(recipe.id);
        fav.classList.toggle("is-fav", favourites.has(recipe.id));
        setLabel();
        // Re-render only when the view would otherwise show a stale card.
        if (favouritesOnly) renderRecipeGrid();
        else renderFilterState();
      });
      wrap.appendChild(fav);
    }
    return wrap;
  }

  function renderRecipeGrid() {
    const grid = document.getElementById("recipeGrid");
    const noResults = document.getElementById("noResults");
    const list = getFilteredRecipes();
    grid.innerHTML = "";
    list.forEach((r) => grid.appendChild(buildRecipeCard(r, openRecipeModal)));
    noResults.hidden = list.length > 0;
    noResults.textContent =
      favouritesOnly && favourites.size === 0
        ? "No favourites yet — tap the ☆ on any recipe to save it here."
        : "No recipes match your search — try a different ingredient or clear the filters.";

    const count = document.getElementById("resultCount");
    count.textContent =
      list.length === RECIPES.length
        ? `${RECIPES.length} recipes`
        : `${list.length} of ${RECIPES.length} recipes`;
    renderFilterState();
  }

  // Keeps the "More filters" badge, the Clear all button and the dropdown
  // highlight in sync with whatever is currently selected.
  function activeFilterCount() {
    return (
      (activeCategory !== "all" ? 1 : 0) +
      (activeCuisine !== "all" ? 1 : 0) +
      (activeTimeFilter !== "all" ? 1 : 0) +
      activeMealFilters.size +
      activeTagFilters.size +
      activeAllergenFilters.size +
      (quickIdeasOn ? 1 : 0) +
      (favouritesOnly ? 1 : 0) +
      (searchQuery ? 1 : 0)
    );
  }

  function renderFilterState() {
    const advancedCount =
      activeMealFilters.size + activeTagFilters.size + activeAllergenFilters.size;
    document.getElementById("quickIdeasBtn").classList.toggle("active", quickIdeasOn);
    const favBtn = document.getElementById("favouritesBtn");
    favBtn.classList.toggle("active", favouritesOnly);
    favBtn.setAttribute("aria-pressed", String(favouritesOnly));
    favBtn.textContent = "★ Favourites" + (favourites.size ? " (" + favourites.size + ")" : "");
    const badge = document.getElementById("filterBadge");
    badge.textContent = advancedCount;
    badge.hidden = advancedCount === 0;
    document.getElementById("clearFiltersBtn").hidden = activeFilterCount() === 0;
    document.getElementById("cuisineSelect").classList.toggle("is-set", activeCuisine !== "all");
    document.getElementById("timeSelect").classList.toggle("is-set", activeTimeFilter !== "all");
  }

  function clearAllFilters() {
    activeCategory = "all";
    activeCuisine = "all";
    activeTimeFilter = "all";
    activeMealFilters = new Set();
    activeTagFilters = new Set();
    activeAllergenFilters = new Set();
    quickIdeasOn = false;
    favouritesOnly = false;
    searchQuery = "";
    document.getElementById("searchInput").value = "";
    renderCategoryFilters();
    renderCuisineSelect();
    renderTimeSelect();
    renderMealFilters();
    renderTagFilters();
    renderAllergenFilters();
    renderRecipeGrid();
  }

  // ---------------- Recipe detail modal ----------------
  function openRecipeModal(recipe) {
    const modal = document.getElementById("recipeModal");
    const body = document.getElementById("modalBody");
    body.dataset.cat = recipe.category;
    const nutrition = computeNutrition(recipe);
    const totalTime = recipe.time.prep + recipe.time.cook;

    body.innerHTML = `
      <div class="recipe-detail-header">
        <span class="recipe-detail-emoji">${CATEGORY_EMOJI[recipe.category] || "🍽️"}</span>
        <h2>${recipe.name}</h2>
      </div>
      <div class="recipe-detail-meta">
        <span>⏱ Prep ${recipe.time.prep} min + Cook ${recipe.time.cook} min${recipe.soakNote ? ` (${recipe.soakNote})` : ""}</span>
        <span>🍽 Serves ${recipe.servings}</span>
      </div>
      <div class="recipe-detail-tags">${recipe.tags.map((t) => `<span class="tag-pill">${t}</span>`).join("")}${
        isJainFriendly(recipe) ? '<span class="tag-pill tag-pill-jain">🪷 jain-friendly</span>' : ""
      }</div>
      ${isJainFriendly(recipe)
        ? '<p class="jain-note">Jain-friendly as written once the ingredients marked <em>optional</em> below are left out or swapped for the substitute given.</p>'
        : ""}

      <div class="section-title">Ingredients</div>
      <ul class="ingredient-list">
        ${recipe.ingredients.map((ing) => {
          const data = INGREDIENTS[ing.id];
          const name = data ? data.name : ing.id;
          const opt = ing.optional
            ? `<span class="ing-optional">optional${ing.sub ? ` — ${ing.sub}` : ""}</span>`
            : "";
          return `<li><span>${name}${opt}</span><span class="ing-qty">${ing.qty}</span></li>`;
        }).join("")}
      </ul>

      <div class="section-title">Steps</div>
      <ol class="steps-list">${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>

      <div class="section-title">Allergens &amp; sensitivities</div>
      ${(() => {
        const al = recipeAllergens(recipe);
        const trig = refluxTriggers(recipe);
        const level = refluxLevel(recipe);
        const rows = [];
        rows.push(
          `<p class="sens-row"><b>Contains:</b> ${
            al.required.length
              ? al.required.map((a) => `<span class="allergen-pill">${ALLERGEN_LABELS[a]}</span>`).join("")
              : "<span class=\"sens-none\">none of the major allergens tracked here</span>"
          }</p>`
        );
        if (al.optionalOnly.length) {
          rows.push(
            `<p class="sens-row"><b>Only from optional items:</b> ${al.optionalOnly
              .map((a) => `<span class="allergen-pill allergen-pill-opt">${ALLERGEN_LABELS[a]}</span>`)
              .join("")} — leave those out to avoid it.</p>`
          );
        }
        rows.push(
          `<p class="sens-row"><b>Acid reflux:</b> <span class="reflux-badge reflux-${level}">${level}</span> ${
            trig.length
              ? "— contains " + trig.map((t) => t.name.toLowerCase() + (t.optional ? " (optional)" : "")).join(", ")
              : "— none of the common dietary triggers"
          }</p>`
        );
        rows.push(
          '<p class="nutrition-note">Allergen and reflux notes are computed from the ingredient list as general guidance only. Reflux triggers vary a lot between individuals, and this is not medical or dietary advice — check labels yourself and follow your own clinician where relevant.</p>'
        );
        return rows.join("");
      })()}

      <div class="section-title">Nutrition per serving</div>
      <table class="nutrition-table">
        <tr><th>Calories</th><td>${fmt(nutrition.perServing.kcal)} kcal</td></tr>
        <tr><th>Protein</th><td>${fmt(nutrition.perServing.protein, 1)} g</td></tr>
        <tr><th>Carbohydrates</th><td>${fmt(nutrition.perServing.carbs, 1)} g</td></tr>
        <tr><th>Fat</th><td>${fmt(nutrition.perServing.fat, 1)} g</td></tr>
        <tr><th>Fiber</th><td>${fmt(nutrition.perServing.fiber, 1)} g</td></tr>
      </table>
      <p class="nutrition-note">Whole recipe (${recipe.servings} servings): ${fmt(nutrition.total.kcal)} kcal total. Estimates from standard ingredient nutrition values — actual values vary by brand and technique.</p>

      <button class="primary-btn" id="addToPlanBtn" type="button">+ Add to weekly plan</button>
      <div class="recipe-actions no-print">
        <button class="ghost-btn" id="exportRecipeBtn" type="button">⬇ Export recipe</button>
        <button class="ghost-btn" id="printRecipeBtn" type="button">🖨 Print recipe</button>
      </div>
    `;

    document.getElementById("addToPlanBtn").addEventListener("click", () => openPlanPicker(recipe));
    document.getElementById("exportRecipeBtn").addEventListener("click", () =>
      shareOrDownload(recipeFileName(recipe), recipe.name, buildRecipeExportText(recipe))
    );
    document.getElementById("printRecipeBtn").addEventListener("click", () => printRecipe());
    modal.hidden = false;
  }

  document.getElementById("closeModalBtn").addEventListener("click", () => {
    document.getElementById("recipeModal").hidden = true;
  });
  document.getElementById("recipeModal").addEventListener("click", (e) => {
    if (e.target.id === "recipeModal") document.getElementById("recipeModal").hidden = true;
  });

  // ---------------- Add-to-plan picker ----------------
  function openPlanPicker(recipe) {
    const modal = document.getElementById("planPicker");
    const body = document.getElementById("planPickerBody");
    body.innerHTML = `
      <p>${recipe.name}</p>
      <div class="plan-picker-row">
        <select id="pickDay">${DAYS.map((d) => `<option value="${d}">${d}</option>`).join("")}</select>
        <select id="pickSlot">${SLOTS.map((s) => `<option value="${s}">${s}</option>`).join("")}</select>
      </div>
      <button class="primary-btn" id="confirmAddToPlan" type="button">Add</button>
    `;
    document.getElementById("confirmAddToPlan").addEventListener("click", () => {
      const day = document.getElementById("pickDay").value;
      const slot = document.getElementById("pickSlot").value;
      plan[day][slot].push(recipe.id);
      savePlan();
      modal.hidden = true;
      document.getElementById("recipeModal").hidden = true;
      showToast(`Added "${recipe.name}" to ${day} ${slot}`);
      renderPlanner();
      renderShoppingList();
    });
    modal.hidden = false;
  }

  document.getElementById("closePlanPickerBtn").addEventListener("click", () => {
    document.getElementById("planPicker").hidden = true;
  });
  document.getElementById("planPicker").addEventListener("click", (e) => {
    if (e.target.id === "planPicker") document.getElementById("planPicker").hidden = true;
  });

  // ---------------- Cell picker (from planner) ----------------
  function openCellPicker(day, slot) {
    cellPickerTarget = { day, slot };
    document.getElementById("cellPickerTitle").textContent = `Choose a recipe — ${day}, ${slot}`;
    const searchInput = document.getElementById("cellPickerSearch");
    searchInput.value = "";
    renderCellPickerGrid("");
    document.getElementById("cellPicker").hidden = false;
    searchInput.focus();
  }

  function renderCellPickerGrid(query) {
    const grid = document.getElementById("cellPickerGrid");
    grid.innerHTML = "";
    const list = RECIPES.filter((r) => recipeMatchesSearch(r, query));
    list.forEach((r) =>
      grid.appendChild(
        buildRecipeCard(r, (recipe) => {
          const { day, slot } = cellPickerTarget;
          plan[day][slot].push(recipe.id);
          savePlan();
          document.getElementById("cellPicker").hidden = true;
          showToast(`Added "${recipe.name}" to ${day} ${slot}`);
          renderPlanner();
          renderShoppingList();
        }, false)
      )
    );
  }

  document.getElementById("cellPickerSearch").addEventListener("input", (e) => renderCellPickerGrid(e.target.value));
  document.getElementById("closeCellPickerBtn").addEventListener("click", () => {
    document.getElementById("cellPicker").hidden = true;
  });
  document.getElementById("cellPicker").addEventListener("click", (e) => {
    if (e.target.id === "cellPicker") document.getElementById("cellPicker").hidden = true;
  });

  // ---------------- Planner view ----------------
  function renderPlanner() {
    const grid = document.getElementById("plannerGrid");
    grid.innerHTML = "";
    let weekKcal = 0;

    DAYS.forEach((day) => {
      const dayEl = document.createElement("div");
      dayEl.className = "planner-day";

      let dayKcal = 0;
      SLOTS.forEach((slot) => {
        (plan[day][slot] || []).forEach((recipeId) => {
          if (RECIPE_BY_ID[recipeId]) dayKcal += computeNutrition(RECIPE_BY_ID[recipeId]).perServing.kcal;
        });
      });
      weekKcal += dayKcal;

      const slotsHtml = SLOTS.map((slot) => {
        const recipeIds = plan[day][slot] || [];
        const itemsHtml = recipeIds
          .map((recipeId, index) => {
            const recipe = RECIPE_BY_ID[recipeId];
            if (!recipe) return "";
            return `
              <div class="planner-cell-recipe">
                <span class="planner-cell-recipe-name" data-action="view" data-recipe="${recipe.id}">${CATEGORY_EMOJI[recipe.category] || ""} ${recipe.name}</span>
                <div class="planner-cell-recipe-row">
                  <span class="recipe-card-kcal">${fmt(computeNutrition(recipe).perServing.kcal)} kcal</span>
                  <button class="remove-btn" type="button" data-action="remove" data-day="${day}" data-slot="${slot}" data-index="${index}">Remove ✕</button>
                </div>
              </div>`;
          })
          .join("");
        const addLabel = recipeIds.length ? "+ Add another" : "+ Add";
        const addClass = recipeIds.length ? "planner-cell-add planner-cell-add-more" : "planner-cell-add";
        return `
          <div>
            <div class="planner-slot-label">${slot}</div>
            <div class="planner-cell ${recipeIds.length ? "filled" : ""}" data-day="${day}" data-slot="${slot}">
              ${itemsHtml}
              <button class="${addClass}" type="button" data-action="add" data-day="${day}" data-slot="${slot}">${addLabel}</button>
            </div>
          </div>`;
      }).join("");

      dayEl.innerHTML = `
        <div class="planner-day-title"><span>${day}</span><span class="planner-day-kcal">${dayKcal ? fmt(dayKcal) + " kcal" : ""}</span></div>
        <div class="planner-slots">${slotsHtml}</div>`;
      grid.appendChild(dayEl);
    });

    document.getElementById("weekNutritionSummary").innerHTML =
      `Week total: <b>${fmt(weekKcal)} kcal</b> across planned meals`;

    grid.querySelectorAll('[data-action="add"]').forEach((btn) =>
      btn.addEventListener("click", () => openCellPicker(btn.dataset.day, btn.dataset.slot))
    );
    grid.querySelectorAll('[data-action="remove"]').forEach((btn) =>
      btn.addEventListener("click", () => {
        plan[btn.dataset.day][btn.dataset.slot].splice(Number(btn.dataset.index), 1);
        savePlan();
        renderPlanner();
        renderShoppingList();
      })
    );
    grid.querySelectorAll('[data-action="view"]').forEach((el) =>
      el.addEventListener("click", () => {
        const recipe = RECIPE_BY_ID[el.dataset.recipe];
        if (recipe) openRecipeModal(recipe);
      })
    );
  }

  document.getElementById("clearPlanner").addEventListener("click", () => {
    if (!confirm("Clear the entire week's plan?")) return;
    plan = emptyPlan();
    savePlan();
    renderPlanner();
    renderShoppingList();
  });

  // ---------------- Shopping list ----------------
  function getPlannedRecipes() {
    const items = [];
    DAYS.forEach((day) =>
      SLOTS.forEach((slot) => {
        (plan[day][slot] || []).forEach((id) => {
          if (RECIPE_BY_ID[id]) items.push(RECIPE_BY_ID[id]);
        });
      })
    );
    return items;
  }

  // Shared by renderShoppingList and the text export so both stay in sync.
  function groupShoppingItemsByCategory(recipes) {
    const aggregate = {}; // id -> {grams, recipeNames:Set}
    recipes.forEach((r) =>
      r.ingredients.forEach((ing) => {
        if (!aggregate[ing.id]) aggregate[ing.id] = { grams: 0, recipeNames: new Set() };
        aggregate[ing.id].grams += ing.grams;
        aggregate[ing.id].recipeNames.add(r.name);
      })
    );

    const byCategory = {};
    Object.keys(aggregate).forEach((id) => {
      const data = INGREDIENTS[id];
      const cat = data ? data.cat : "Other";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push({ id, ...aggregate[id] });
    });
    Object.keys(byCategory).forEach((cat) => {
      byCategory[cat].sort((a, b) => (INGREDIENTS[a.id].name > INGREDIENTS[b.id].name ? 1 : -1));
    });
    return byCategory;
  }

  function qtyLabelFor(grams) {
    return grams >= 1000 ? `${fmt(grams / 1000, 2)} kg` : `${fmt(grams)} g`;
  }

  function renderShoppingList() {
    const container = document.getElementById("shoppingList");
    const empty = document.getElementById("shoppingEmpty");
    const recipes = getPlannedRecipes();
    container.innerHTML = "";

    if (recipes.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const byCategory = groupShoppingItemsByCategory(recipes);

    Object.keys(byCategory).sort().forEach((cat) => {
      const group = document.createElement("div");
      group.className = "shopping-group";
      const itemsHtml = byCategory[cat]
        .map((item) => {
          const data = INGREDIENTS[item.id];
          const checked = checkedItems.has(item.id);
          const qtyLabel = qtyLabelFor(item.grams);
          return `
            <label class="shopping-item ${checked ? "checked" : ""}">
              <input type="checkbox" data-ing="${item.id}" ${checked ? "checked" : ""}>
              <span class="shopping-item-name">${data.name}</span>
              <span class="shopping-item-qty">${qtyLabel}</span>
            </label>`;
        })
        .join("");
      group.innerHTML = `<div class="shopping-group-title">${cat}</div>${itemsHtml}`;
      container.appendChild(group);
    });

    container.querySelectorAll('input[type="checkbox"]').forEach((cb) =>
      cb.addEventListener("change", () => {
        const id = cb.dataset.ing;
        if (cb.checked) checkedItems.add(id);
        else checkedItems.delete(id);
        saveChecked();
        cb.closest(".shopping-item").classList.toggle("checked", cb.checked);
      })
    );
  }

  document.getElementById("clearShoppingChecks").addEventListener("click", () => {
    checkedItems = new Set();
    saveChecked();
    renderShoppingList();
  });

  // ---------------- Export ----------------
  function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildPlanExportText() {
    const lines = ["WEEKLY MEAL PLAN", `Exported ${new Date().toLocaleDateString()}`, ""];
    let weekKcal = 0;
    DAYS.forEach((day) => {
      lines.push(day.toUpperCase());
      let dayKcal = 0;
      SLOTS.forEach((slot) => {
        const recipes = (plan[day][slot] || []).map((id) => RECIPE_BY_ID[id]).filter(Boolean);
        if (recipes.length) {
          const kcals = recipes.map((r) => computeNutrition(r).perServing.kcal);
          dayKcal += kcals.reduce((a, b) => a + b, 0);
          const names = recipes.map((r, i) => `${r.name} (${fmt(kcals[i])} kcal)`).join(" + ");
          lines.push(`  ${slot}: ${names}`);
        } else {
          lines.push(`  ${slot}: —`);
        }
      });
      weekKcal += dayKcal;
      lines.push(`  Day total: ${fmt(dayKcal)} kcal`, "");
    });
    lines.push(`Week total: ${fmt(weekKcal)} kcal`);
    return lines.join("\n");
  }

  function recipeFileName(recipe) {
    return recipe.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".txt";
  }

  function buildRecipeExportText(recipe) {
    const n = computeNutrition(recipe);
    const al = recipeAllergens(recipe);
    const trig = refluxTriggers(recipe);
    const cat = (CATEGORIES.find((x) => x.id === recipe.category) || {}).label || recipe.category;
    const L = [];

    L.push(recipe.name.toUpperCase());
    L.push(
      `${cat} · ${recipe.time.prep + recipe.time.cook} min` +
        (recipe.soakNote ? ` (${recipe.soakNote})` : "") +
        ` · serves ${recipe.servings}`
    );
    if (recipe.tags.length) L.push("Tags: " + recipe.tags.join(", "));
    if (isJainFriendly(recipe)) {
      L.push("Jain-friendly once the optional items below are left out or substituted.");
    }

    L.push("", "INGREDIENTS");
    recipe.ingredients.forEach((ing) => {
      const data = INGREDIENTS[ing.id];
      const name = data ? data.name : ing.id;
      let line = `  ${name} — ${ing.qty}`;
      if (ing.optional) line += ing.sub ? `  [optional: ${ing.sub}]` : "  [optional]";
      L.push(line);
    });

    L.push("", "METHOD");
    recipe.steps.forEach((s, i) => L.push(`  ${i + 1}. ${s}`));

    L.push("", "NUTRITION (per serving)");
    L.push(`  Calories      ${fmt(n.perServing.kcal)} kcal`);
    L.push(`  Protein       ${fmt(n.perServing.protein, 1)} g`);
    L.push(`  Carbohydrates ${fmt(n.perServing.carbs, 1)} g`);
    L.push(`  Fat           ${fmt(n.perServing.fat, 1)} g`);
    L.push(`  Fiber         ${fmt(n.perServing.fiber, 1)} g`);
    L.push(`  Whole recipe (${recipe.servings} servings): ${fmt(n.total.kcal)} kcal`);

    L.push("", "ALLERGENS & SENSITIVITIES");
    L.push(
      "  Contains: " +
        (al.required.length
          ? al.required.map((a) => ALLERGEN_LABELS[a]).join(", ")
          : "none of the major allergens tracked here")
    );
    if (al.optionalOnly.length) {
      L.push(
        "  Only from optional items: " +
          al.optionalOnly.map((a) => ALLERGEN_LABELS[a]).join(", ") +
          " (leave those out to avoid it)"
      );
    }
    L.push(
      `  Acid reflux: ${refluxLevel(recipe)}` +
        (trig.length
          ? " — contains " + trig.map((t) => t.name.toLowerCase() + (t.optional ? " (optional)" : "")).join(", ")
          : " — none of the common dietary triggers")
    );
    L.push(
      "  Note: nutrition, allergen and reflux figures are computed from the",
      "  ingredient list as general guidance. They cannot account for brand or",
      "  cross-contamination, and are not medical or dietary advice."
    );

    L.push("", `Exported from Veg Meal Planner on ${new Date().toLocaleDateString()}.`);
    return L.join("\n");
  }

  // The print stylesheet hides modals so the planner and list print cleanly.
  // Printing a single recipe therefore needs its own mode: hide the page
  // behind and let the open modal through, then restore afterwards.
  function printRecipe() {
    document.body.classList.add("printing-recipe");
    const cleanup = () => {
      document.body.classList.remove("printing-recipe");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // afterprint is unreliable in some mobile browsers, so belt-and-braces.
    setTimeout(cleanup, 3000);
  }

  function buildShoppingExportText() {
    const recipes = getPlannedRecipes();
    const lines = ["SHOPPING LIST", `Exported ${new Date().toLocaleDateString()}`, ""];
    if (recipes.length === 0) {
      lines.push("Your weekly plan is empty — add recipes from the Planner tab first.");
      return lines.join("\n");
    }
    const byCategory = groupShoppingItemsByCategory(recipes);
    Object.keys(byCategory).sort().forEach((cat) => {
      lines.push(cat.toUpperCase());
      byCategory[cat].forEach((item) => {
        const data = INGREDIENTS[item.id];
        const box = checkedItems.has(item.id) ? "[x]" : "[ ]";
        lines.push(`  ${box} ${data.name} — ${qtyLabelFor(item.grams)}`);
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  // On mobile, handing text to the OS share sheet (Notes, Reminders, WhatsApp,
  // AirDrop, ...) is far more useful than a file dropped in Downloads. Falls
  // back to a plain download wherever Web Share isn't available.
  async function shareOrDownload(filename, title, text) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return; // user cancelled — don't also download
      }
    }
    downloadTextFile(filename, text);
  }

  document.getElementById("exportPlanner").addEventListener("click", () => {
    shareOrDownload("weekly-meal-plan.txt", "Weekly Meal Plan", buildPlanExportText());
  });
  document.getElementById("printPlanner").addEventListener("click", () => window.print());
  document.getElementById("exportShopping").addEventListener("click", () => {
    shareOrDownload("shopping-list.txt", "Shopping List", buildShoppingExportText());
  });
  document.getElementById("printShopping").addEventListener("click", () => window.print());

  // ---------------- Tabs ----------------
  document.getElementById("tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (!btn) return;
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b === btn));
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    document.getElementById("view-" + btn.dataset.view).classList.add("active");
  });

  // ---------------- Search ----------------
  document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value.trim();
    renderRecipeGrid();
  });

  // ---------------- Consolidated filter controls ----------------
  document.getElementById("cuisineSelect").addEventListener("change", (e) => {
    activeCuisine = e.target.value;
    renderRecipeGrid();
  });
  document.getElementById("timeSelect").addEventListener("change", (e) => {
    activeTimeFilter = e.target.value;
    renderRecipeGrid();
  });
  document.getElementById("moreFiltersBtn").addEventListener("click", (e) => {
    const panel = document.getElementById("advancedFilters");
    const open = panel.hidden;
    panel.hidden = !open;
    e.currentTarget.setAttribute("aria-expanded", String(open));
  });
  document.getElementById("clearFiltersBtn").addEventListener("click", clearAllFilters);
  document.getElementById("favouritesBtn").addEventListener("click", () => {
    favouritesOnly = !favouritesOnly;
    renderRecipeGrid();
  });
  document.getElementById("quickIdeasBtn").addEventListener("click", () => {
    quickIdeasOn = !quickIdeasOn;
    renderRecipeGrid();
  });

  // ---------------- Toast ----------------
  let toastTimer = null;
  function showToast(msg) {
    const toast = document.getElementById("toast");
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast.hidden = true), 2600);
  }

  // ---------------- PWA install prompt ----------------
  let deferredInstallPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    document.getElementById("installBtn").hidden = false;
  });
  document.getElementById("installBtn").addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    document.getElementById("installBtn").hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }

  // ---------------- Init ----------------
  renderCategoryFilters();
  renderCuisineSelect();
  renderTimeSelect();
  renderMealFilters();
  renderTagFilters();
  renderAllergenFilters();

  renderRecipeGrid();
  renderPlanner();
  renderShoppingList();
})();
