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
  ];
  const CATEGORY_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.emoji]));

  const TIME_FILTERS = [
    { id: "all", label: "⏱ Any time", max: Infinity },
    { id: "15", label: "≤ 15 min", max: 15 },
    { id: "30", label: "≤ 30 min", max: 30 },
    { id: "45", label: "≤ 45 min", max: 45 },
  ];

  const QUICK_FILTERS = [
    { id: "high-protein", label: "💪 High-Protein", test: (r) => r.tags.includes("high-protein") },
    { id: "no-cook", label: "🧊 No-Cook", test: (r) => r.tags.some((t) => t.startsWith("no-cook")) },
    { id: "make-ahead", label: "📦 Make-Ahead", test: (r) => r.tags.includes("make-ahead") },
    { id: "kids-friendly", label: "🧒 Kids-Friendly", test: (r) => r.tags.includes("kids-friendly") },
    { id: "one-pot", label: "🍳 One-Pot", test: (r) => r.tags.includes("one-pot") },
  ];

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const SLOTS = ["Breakfast", "Lunch", "Snack", "Dinner"];

  const STORAGE_PLAN = "mealPlanner.plan.v1";
  const STORAGE_CHECKED = "mealPlanner.shoppingChecked.v1";

  const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

  let activeCategory = "all";
  let activeTimeFilter = "all";
  let activeTagFilters = new Set();
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
  function loadPlan() {
    try {
      const raw = localStorage.getItem(STORAGE_PLAN);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore corrupt storage */ }
    const plan = {};
    DAYS.forEach((d) => {
      plan[d] = {};
      SLOTS.forEach((s) => (plan[d][s] = null));
    });
    return plan;
  }
  let plan = loadPlan();
  function savePlan() {
    localStorage.setItem(STORAGE_PLAN, JSON.stringify(plan));
  }

  function loadChecked() {
    try {
      const raw = localStorage.getItem(STORAGE_CHECKED);
      if (raw) return new Set(JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return new Set();
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
    return RECIPES.filter((r) => {
      if (activeCategory !== "all" && r.category !== activeCategory) return false;
      if (timeFilter && r.time.prep + r.time.cook > timeFilter.max) return false;
      if (!recipeMatchesSearch(r, searchQuery)) return false;
      for (const tagId of activeTagFilters) {
        const filter = QUICK_FILTERS.find((f) => f.id === tagId);
        if (filter && !filter.test(r)) return false;
      }
      return true;
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
      btn.innerHTML = `<span class="chip-emoji">${c.emoji}</span>${c.label}`;
      btn.addEventListener("click", () => {
        activeCategory = c.id;
        renderCategoryFilters();
        renderRecipeGrid();
      });
      el.appendChild(btn);
    });
  }

  function renderTimeFilters() {
    const el = document.getElementById("timeFilters");
    el.innerHTML = "";
    TIME_FILTERS.forEach((f) => {
      const btn = document.createElement("button");
      btn.className = "chip" + (activeTimeFilter === f.id ? " active" : "");
      btn.type = "button";
      btn.textContent = f.label;
      btn.addEventListener("click", () => {
        activeTimeFilter = f.id;
        renderTimeFilters();
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
  function buildRecipeCard(recipe, onClick) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "recipe-card";
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
        <div class="recipe-card-tags">${recipe.tags.slice(0, 3).map((t) => `<span class="tag-pill">${t}</span>`).join("")}</div>
        <div class="recipe-card-kcal">${fmt(nutrition.perServing.kcal)} kcal / serving</div>
      </div>`;
    card.addEventListener("click", () => onClick(recipe));
    return card;
  }

  function renderRecipeGrid() {
    const grid = document.getElementById("recipeGrid");
    const noResults = document.getElementById("noResults");
    const list = getFilteredRecipes();
    grid.innerHTML = "";
    list.forEach((r) => grid.appendChild(buildRecipeCard(r, openRecipeModal)));
    noResults.hidden = list.length > 0;
  }

  // ---------------- Recipe detail modal ----------------
  function openRecipeModal(recipe) {
    const modal = document.getElementById("recipeModal");
    const body = document.getElementById("modalBody");
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
      <div class="recipe-detail-tags">${recipe.tags.map((t) => `<span class="tag-pill">${t}</span>`).join("")}</div>

      <div class="section-title">Ingredients</div>
      <ul class="ingredient-list">
        ${recipe.ingredients.map((ing) => {
          const data = INGREDIENTS[ing.id];
          return `<li><span>${data ? data.name : ing.id}</span><span class="ing-qty">${ing.qty}</span></li>`;
        }).join("")}
      </ul>

      <div class="section-title">Steps</div>
      <ol class="steps-list">${recipe.steps.map((s) => `<li>${s}</li>`).join("")}</ol>

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
    `;

    document.getElementById("addToPlanBtn").addEventListener("click", () => openPlanPicker(recipe));
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
      plan[day][slot] = recipe.id;
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
          plan[day][slot] = recipe.id;
          savePlan();
          document.getElementById("cellPicker").hidden = true;
          showToast(`Added "${recipe.name}" to ${day} ${slot}`);
          renderPlanner();
          renderShoppingList();
        })
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
        const recipeId = plan[day][slot];
        if (recipeId && RECIPE_BY_ID[recipeId]) {
          dayKcal += computeNutrition(RECIPE_BY_ID[recipeId]).perServing.kcal;
        }
      });
      weekKcal += dayKcal;

      const slotsHtml = SLOTS.map((slot) => {
        const recipeId = plan[day][slot];
        const recipe = recipeId ? RECIPE_BY_ID[recipeId] : null;
        return `
          <div>
            <div class="planner-slot-label">${slot}</div>
            <div class="planner-cell ${recipe ? "filled" : ""}" data-day="${day}" data-slot="${slot}">
              ${
                recipe
                  ? `<div class="planner-cell-recipe">
                      <span class="planner-cell-recipe-name" data-action="view" data-recipe="${recipe.id}">${CATEGORY_EMOJI[recipe.category] || ""} ${recipe.name}</span>
                      <div class="planner-cell-recipe-row">
                        <span class="recipe-card-kcal">${fmt(computeNutrition(recipe).perServing.kcal)} kcal</span>
                        <button class="remove-btn" type="button" data-action="remove" data-day="${day}" data-slot="${slot}">Remove ✕</button>
                      </div>
                    </div>`
                  : `<button class="planner-cell-add" type="button" data-action="add" data-day="${day}" data-slot="${slot}">+ Add</button>`
              }
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
        plan[btn.dataset.day][btn.dataset.slot] = null;
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
    plan = loadPlan();
    DAYS.forEach((d) => SLOTS.forEach((s) => (plan[d][s] = null)));
    savePlan();
    renderPlanner();
    renderShoppingList();
  });

  // ---------------- Shopping list ----------------
  function getPlannedRecipes() {
    const items = [];
    DAYS.forEach((day) =>
      SLOTS.forEach((slot) => {
        const id = plan[day][slot];
        if (id && RECIPE_BY_ID[id]) items.push(RECIPE_BY_ID[id]);
      })
    );
    return items;
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

    const aggregate = {}; // id -> {grams, recipes:Set}
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

    Object.keys(byCategory).sort().forEach((cat) => {
      const group = document.createElement("div");
      group.className = "shopping-group";
      const itemsHtml = byCategory[cat]
        .sort((a, b) => (INGREDIENTS[a.id].name > INGREDIENTS[b.id].name ? 1 : -1))
        .map((item) => {
          const data = INGREDIENTS[item.id];
          const checked = checkedItems.has(item.id);
          const qtyLabel = item.grams >= 1000 ? `${fmt(item.grams / 1000, 2)} kg` : `${fmt(item.grams)} g`;
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
  renderTimeFilters();
  renderTagFilters();
  renderRecipeGrid();
  renderPlanner();
  renderShoppingList();
})();
