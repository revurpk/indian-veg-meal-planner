/* Copyright 2026 Pradyumna Revur — Apache-2.0 (see LICENSE)
   Ingredient nutrition database. Values are per 100 g (or 100 ml for
   liquids) of the raw/base ingredient as typically purchased — commonly
   published nutrition-table figures, not tied to any single copyrighted
   source. kcal/protein/carbs/fat/fiber are grams unless kcal. */
const INGREDIENTS = {
  // Grains, flours, starches
  rice_basmati_raw: { name: "Basmati rice (raw)", cat: "Grains", kcal: 360, protein: 7.9, carbs: 78, fat: 0.9, fiber: 1.3 },
  rice_cooked: { name: "Cooked rice", cat: "Grains", kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  wheat_flour: { name: "Whole-wheat flour (atta)", cat: "Grains", kcal: 340, protein: 12, carbs: 72, fat: 1.7, fiber: 11 },
  maida: { name: "Refined flour (maida)", cat: "Grains", kcal: 350, protein: 10, carbs: 76, fat: 1, fiber: 2.5 },
  rava: { name: "Semolina (rava/sooji)", cat: "Grains", kcal: 360, protein: 12.7, carbs: 72.8, fat: 1.1, fiber: 3.9 },
  poha: { name: "Flattened rice (poha)", cat: "Grains", kcal: 356, protein: 6.6, carbs: 77, fat: 1.2, fiber: 2.3 },
  vermicelli: { name: "Vermicelli (semiya)", cat: "Grains", kcal: 348, protein: 10, carbs: 74, fat: 1.5, fiber: 2.7 },
  bread_white: { name: "White bread", cat: "Grains", kcal: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  bread_wheat: { name: "Whole-wheat bread", cat: "Grains", kcal: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
  pasta_dry: { name: "Pasta (dry)", cat: "Grains", kcal: 371, protein: 13, carbs: 75, fat: 1.5, fiber: 3.2 },
  oats: { name: "Rolled oats", cat: "Grains", kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },
  sabudana: { name: "Sabudana (tapioca pearls)", cat: "Grains", kcal: 358, protein: 0.2, carbs: 88.7, fat: 0.02, fiber: 0.9 },
  besan: { name: "Chickpea flour (besan)", cat: "Grains", kcal: 387, protein: 22, carbs: 58, fat: 6.7, fiber: 10.8 },
  poha_thick: { name: "Thick poha", cat: "Grains", kcal: 356, protein: 6.6, carbs: 77, fat: 1.2, fiber: 2.3 },
  murmura: { name: "Puffed rice (murmura)", cat: "Grains", kcal: 353, protein: 7.5, carbs: 80, fat: 0.5, fiber: 2.2 },
  bread_crumbs: { name: "Bread crumbs", cat: "Grains", kcal: 395, protein: 13, carbs: 72, fat: 5.3, fiber: 4.5 },
  cornflour: { name: "Cornflour/cornstarch", cat: "Grains", kcal: 381, protein: 0.3, carbs: 91, fat: 0.1, fiber: 0.9 },
  custard_powder: { name: "Custard powder", cat: "Grains", kcal: 357, protein: 0.5, carbs: 87, fat: 0.5, fiber: 0.5 },

  // Lentils, pulses, sprouts
  moong_dal: { name: "Split moong dal", cat: "Pulses", kcal: 347, protein: 24, carbs: 59, fat: 1.2, fiber: 16.3 },
  toor_dal: { name: "Toor/arhar dal", cat: "Pulses", kcal: 343, protein: 22.3, carbs: 57.6, fat: 1.5, fiber: 15.5 },
  chana_dal: { name: "Chana dal", cat: "Pulses", kcal: 364, protein: 22.4, carbs: 61, fat: 5.3, fiber: 17 },
  masoor_dal: { name: "Masoor dal (red lentils)", cat: "Pulses", kcal: 352, protein: 25.8, carbs: 60, fat: 1.1, fiber: 11 },
  urad_dal: { name: "Urad dal", cat: "Pulses", kcal: 341, protein: 25.2, carbs: 58.9, fat: 1.6, fiber: 18 },
  rajma_cooked: { name: "Rajma (kidney beans), cooked", cat: "Pulses", kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },
  chickpeas_cooked: { name: "Chickpeas (chana), cooked", cat: "Pulses", kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  moong_sprouts: { name: "Moong sprouts", cat: "Pulses", kcal: 30, protein: 3, carbs: 6.4, fat: 0.2, fiber: 1.8 },
  peanuts: { name: "Peanuts", cat: "Pulses", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },

  // Vegetables
  onion: { name: "Onion", cat: "Vegetables", kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  tomato: { name: "Tomato", cat: "Vegetables", kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  potato: { name: "Potato", cat: "Vegetables", kcal: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  carrot: { name: "Carrot", cat: "Vegetables", kcal: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8 },
  peas: { name: "Green peas", cat: "Vegetables", kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.7 },
  capsicum: { name: "Capsicum (bell pepper)", cat: "Vegetables", kcal: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7 },
  cauliflower: { name: "Cauliflower", cat: "Vegetables", kcal: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  cabbage: { name: "Cabbage", cat: "Vegetables", kcal: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  spinach: { name: "Spinach (palak)", cat: "Vegetables", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  green_beans: { name: "French beans", cat: "Vegetables", kcal: 31, protein: 1.8, carbs: 7, fat: 0.2, fiber: 3.4 },
  corn: { name: "Sweet corn", cat: "Vegetables", kcal: 86, protein: 3.2, carbs: 19, fat: 1.2, fiber: 2.7 },
  cucumber: { name: "Cucumber", cat: "Vegetables", kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  beetroot: { name: "Beetroot", cat: "Vegetables", kcal: 43, protein: 1.6, carbs: 10, fat: 0.2, fiber: 2.8 },
  garlic: { name: "Garlic", cat: "Vegetables", kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1 },
  ginger: { name: "Ginger", cat: "Vegetables", kcal: 80, protein: 1.8, carbs: 18, fat: 0.8, fiber: 2 },
  green_chili: { name: "Green chili", cat: "Vegetables", kcal: 40, protein: 2, carbs: 9, fat: 0.2, fiber: 1.5 },
  coriander_leaves: { name: "Coriander leaves", cat: "Vegetables", kcal: 23, protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8 },
  mint_leaves: { name: "Mint leaves", cat: "Vegetables", kcal: 44, protein: 3.3, carbs: 8.4, fat: 0.7, fiber: 6.8 },
  curry_leaves: { name: "Curry leaves", cat: "Vegetables", kcal: 108, protein: 6.1, carbs: 18.7, fat: 1, fiber: 6.4 },
  lemon: { name: "Lemon", cat: "Vegetables", kcal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 },
  sweet_potato: { name: "Sweet potato", cat: "Vegetables", kcal: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
  mushroom: { name: "Mushroom", cat: "Vegetables", kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  spring_onion: { name: "Spring onion", cat: "Vegetables", kcal: 32, protein: 1.8, carbs: 7.3, fat: 0.2, fiber: 2.6 },
  pumpkin: { name: "Pumpkin", cat: "Vegetables", kcal: 26, protein: 1, carbs: 6.5, fat: 0.1, fiber: 0.5 },
  bottle_gourd: { name: "Bottle gourd (lauki)", cat: "Vegetables", kcal: 14, protein: 0.6, carbs: 3.4, fat: 0, fiber: 0.5 },

  // Dairy
  paneer: { name: "Paneer", cat: "Dairy", kcal: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0 },
  milk: { name: "Full-cream milk", cat: "Dairy", kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  curd: { name: "Curd/yogurt (plain)", cat: "Dairy", kcal: 60, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0 },
  hung_curd: { name: "Hung curd", cat: "Dairy", kcal: 110, protein: 7, carbs: 5, fat: 7, fiber: 0 },
  ghee: { name: "Ghee", cat: "Dairy", kcal: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  butter: { name: "Butter", cat: "Dairy", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  cheese_cheddar: { name: "Cheddar cheese", cat: "Dairy", kcal: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  cream: { name: "Fresh cream", cat: "Dairy", kcal: 340, protein: 2.1, carbs: 3, fat: 35, fiber: 0 },
  khoya: { name: "Khoya (milk solids)", cat: "Dairy", kcal: 421, protein: 14.6, carbs: 27, fat: 31, fiber: 0 },

  // Oils & fats
  oil: { name: "Cooking oil", cat: "Fats", kcal: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  coconut_grated: { name: "Fresh coconut, grated", cat: "Fats", kcal: 354, protein: 3.3, carbs: 15.2, fat: 33.5, fiber: 9 },

  // Nuts, seeds, dried fruit
  cashew: { name: "Cashew nuts", cat: "Nuts", kcal: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3 },
  almond: { name: "Almonds", cat: "Nuts", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  raisins: { name: "Raisins", cat: "Nuts", kcal: 299, protein: 3.1, carbs: 79, fat: 0.5, fiber: 3.7 },
  dates: { name: "Dates", cat: "Nuts", kcal: 277, protein: 1.8, carbs: 75, fat: 0.2, fiber: 6.7 },
  makhana: { name: "Makhana (fox nuts)", cat: "Nuts", kcal: 347, protein: 9.7, carbs: 76.9, fat: 0.1, fiber: 14.5 },
  sesame_seeds: { name: "Sesame seeds", cat: "Nuts", kcal: 573, protein: 17.7, carbs: 23.4, fat: 49.7, fiber: 11.8 },
  walnut: { name: "Walnuts", cat: "Nuts", kcal: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },

  // Sweeteners
  sugar: { name: "Sugar", cat: "Sweeteners", kcal: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  jaggery: { name: "Jaggery", cat: "Sweeteners", kcal: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 },
  honey: { name: "Honey", cat: "Sweeteners", kcal: 304, protein: 0.3, carbs: 82.4, fat: 0, fiber: 0.2 },
  cocoa_powder: { name: "Cocoa powder", cat: "Sweeteners", kcal: 228, protein: 19.6, carbs: 57.9, fat: 13.7, fiber: 33.2 },

  // Spices & condiments (small quantities; nutrition contribution is minor)
  turmeric: { name: "Turmeric powder", cat: "Spices", kcal: 312, protein: 9.7, carbs: 67, fat: 3.3, fiber: 22.7 },
  chili_powder: { name: "Red chili powder", cat: "Spices", kcal: 282, protein: 12, carbs: 50, fat: 14, fiber: 28.7 },
  cumin_seeds: { name: "Cumin seeds (jeera)", cat: "Spices", kcal: 375, protein: 17.7, carbs: 44.2, fat: 22.3, fiber: 10.5 },
  mustard_seeds: { name: "Mustard seeds", cat: "Spices", kcal: 508, protein: 26.1, carbs: 28.1, fat: 36.2, fiber: 12.2 },
  coriander_powder: { name: "Coriander powder", cat: "Spices", kcal: 298, protein: 12.4, carbs: 55, fat: 17.8, fiber: 41.9 },
  garam_masala: { name: "Garam masala", cat: "Spices", kcal: 379, protein: 13.7, carbs: 55, fat: 14.6, fiber: 27 },
  black_pepper: { name: "Black pepper", cat: "Spices", kcal: 251, protein: 10.4, carbs: 64, fat: 3.3, fiber: 25.3 },
  chaat_masala: { name: "Chaat masala", cat: "Spices", kcal: 300, protein: 8, carbs: 60, fat: 4, fiber: 20 },
  hing: { name: "Asafoetida (hing)", cat: "Spices", kcal: 297, protein: 4, carbs: 68, fat: 1.1, fiber: 4.1 },
  salt: { name: "Salt", cat: "Spices", kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  baking_soda: { name: "Baking soda / eno", cat: "Spices", kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  tamarind_pulp: { name: "Tamarind pulp", cat: "Spices", kcal: 239, protein: 2.8, carbs: 62.5, fat: 0.6, fiber: 5.1 },
  soy_sauce: { name: "Soy sauce", cat: "Spices", kcal: 53, protein: 8, carbs: 4.9, fat: 0.6, fiber: 0.8 },
  tomato_ketchup: { name: "Tomato ketchup", cat: "Spices", kcal: 101, protein: 1.2, carbs: 24, fat: 0.2, fiber: 0.9 },
  vinegar: { name: "Vinegar", cat: "Spices", kcal: 18, protein: 0, carbs: 0.4, fat: 0, fiber: 0 },
  tomato_puree: { name: "Tomato puree", cat: "Spices", kcal: 32, protein: 1.6, carbs: 7.2, fat: 0.2, fiber: 1.9 },

  // Fruits
  banana: { name: "Banana", cat: "Fruits", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  mango: { name: "Mango", cat: "Fruits", kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  apple: { name: "Apple", cat: "Fruits", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  pomegranate: { name: "Pomegranate", cat: "Fruits", kcal: 83, protein: 1.7, carbs: 18.7, fat: 1.2, fiber: 4 },
  orange: { name: "Orange", cat: "Fruits", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  grapes: { name: "Grapes", cat: "Fruits", kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
};
