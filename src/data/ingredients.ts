export interface IngredientItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  popular?: boolean;
}

export const INGREDIENT_CATEGORIES = [
  'All',
  'Proteins',
  'Vegetables',
  'Grains',
  'Dairy',
  'Herbs & Spices',
  'Pantry',
  'Fruits',
];

export const ALL_INGREDIENTS: IngredientItem[] = [
  // Proteins
  { id: 'i1', name: 'Chicken', emoji: '🍗', category: 'Proteins', popular: true },
  { id: 'i2', name: 'Salmon', emoji: '🐟', category: 'Proteins', popular: true },
  { id: 'i3', name: 'Ground Beef', emoji: '🥩', category: 'Proteins', popular: true },
  { id: 'i4', name: 'Shrimp', emoji: '🦐', category: 'Proteins', popular: true },
  { id: 'i5', name: 'Tofu', emoji: '⬜', category: 'Proteins', popular: false },
  { id: 'i6', name: 'Eggs', emoji: '🥚', category: 'Proteins', popular: true },
  { id: 'i7', name: 'Tuna', emoji: '🐟', category: 'Proteins', popular: false },
  { id: 'i8', name: 'Pork', emoji: '🥩', category: 'Proteins', popular: false },
  { id: 'i9', name: 'Turkey', emoji: '🦃', category: 'Proteins', popular: false },
  { id: 'i10', name: 'Lentils', emoji: '🫘', category: 'Proteins', popular: true },
  { id: 'i11', name: 'Chickpeas', emoji: '🫘', category: 'Proteins', popular: true },

  // Vegetables
  { id: 'v1', name: 'Garlic', emoji: '🧄', category: 'Vegetables', popular: true },
  { id: 'v2', name: 'Onion', emoji: '🧅', category: 'Vegetables', popular: true },
  { id: 'v3', name: 'Tomatoes', emoji: '🍅', category: 'Vegetables', popular: true },
  { id: 'v4', name: 'Spinach', emoji: '🥬', category: 'Vegetables', popular: true },
  { id: 'v5', name: 'Bell Pepper', emoji: '🫑', category: 'Vegetables', popular: true },
  { id: 'v6', name: 'Mushrooms', emoji: '🍄', category: 'Vegetables', popular: true },
  { id: 'v7', name: 'Zucchini', emoji: '🥒', category: 'Vegetables', popular: false },
  { id: 'v8', name: 'Broccoli', emoji: '🥦', category: 'Vegetables', popular: true },
  { id: 'v9', name: 'Carrot', emoji: '🥕', category: 'Vegetables', popular: true },
  { id: 'v10', name: 'Potatoes', emoji: '🥔', category: 'Vegetables', popular: true },
  { id: 'v11', name: 'Sweet Potato', emoji: '🍠', category: 'Vegetables', popular: false },
  { id: 'v12', name: 'Cauliflower', emoji: '🥦', category: 'Vegetables', popular: false },
  { id: 'v13', name: 'Asparagus', emoji: '🌿', category: 'Vegetables', popular: false },
  { id: 'v14', name: 'Eggplant', emoji: '🍆', category: 'Vegetables', popular: false },
  { id: 'v15', name: 'Corn', emoji: '🌽', category: 'Vegetables', popular: true },

  // Grains
  { id: 'g1', name: 'Pasta', emoji: '🍝', category: 'Grains', popular: true },
  { id: 'g2', name: 'Rice', emoji: '🍚', category: 'Grains', popular: true },
  { id: 'g3', name: 'Quinoa', emoji: '🌾', category: 'Grains', popular: false },
  { id: 'g4', name: 'Bread', emoji: '🍞', category: 'Grains', popular: true },
  { id: 'g5', name: 'Flour', emoji: '🌾', category: 'Grains', popular: false },
  { id: 'g6', name: 'Oats', emoji: '🌾', category: 'Grains', popular: false },
  { id: 'g7', name: 'Couscous', emoji: '🍚', category: 'Grains', popular: false },
  { id: 'g8', name: 'Tortillas', emoji: '🫓', category: 'Grains', popular: true },

  // Dairy
  { id: 'd1', name: 'Butter', emoji: '🧈', category: 'Dairy', popular: true },
  { id: 'd2', name: 'Parmesan', emoji: '🧀', category: 'Dairy', popular: true },
  { id: 'd3', name: 'Cream Cheese', emoji: '🧀', category: 'Dairy', popular: false },
  { id: 'd4', name: 'Feta', emoji: '🧀', category: 'Dairy', popular: true },
  { id: 'd5', name: 'Milk', emoji: '🥛', category: 'Dairy', popular: true },
  { id: 'd6', name: 'Yogurt', emoji: '🥛', category: 'Dairy', popular: false },
  { id: 'd7', name: 'Heavy Cream', emoji: '🥛', category: 'Dairy', popular: false },
  { id: 'd8', name: 'Mozzarella', emoji: '🧀', category: 'Dairy', popular: true },

  // Herbs & Spices
  { id: 'h1', name: 'Basil', emoji: '🌿', category: 'Herbs & Spices', popular: true },
  { id: 'h2', name: 'Oregano', emoji: '🌿', category: 'Herbs & Spices', popular: true },
  { id: 'h3', name: 'Cumin', emoji: '🌰', category: 'Herbs & Spices', popular: true },
  { id: 'h4', name: 'Paprika', emoji: '🌶️', category: 'Herbs & Spices', popular: true },
  { id: 'h5', name: 'Turmeric', emoji: '🟡', category: 'Herbs & Spices', popular: false },
  { id: 'h6', name: 'Cilantro', emoji: '🌿', category: 'Herbs & Spices', popular: true },
  { id: 'h7', name: 'Rosemary', emoji: '🌿', category: 'Herbs & Spices', popular: false },
  { id: 'h8', name: 'Chili Flakes', emoji: '🌶️', category: 'Herbs & Spices', popular: true },

  // Pantry
  { id: 'p1', name: 'Olive Oil', emoji: '🫙', category: 'Pantry', popular: true },
  { id: 'p2', name: 'Soy Sauce', emoji: '🫙', category: 'Pantry', popular: true },
  { id: 'p3', name: 'Canned Tomatoes', emoji: '🥫', category: 'Pantry', popular: true },
  { id: 'p4', name: 'Coconut Milk', emoji: '🥥', category: 'Pantry', popular: false },
  { id: 'p5', name: 'Vegetable Broth', emoji: '🫙', category: 'Pantry', popular: false },
  { id: 'p6', name: 'Honey', emoji: '🍯', category: 'Pantry', popular: true },
  { id: 'p7', name: 'Vinegar', emoji: '🫙', category: 'Pantry', popular: false },
  { id: 'p8', name: 'Tahini', emoji: '🫙', category: 'Pantry', popular: false },

  // Fruits
  { id: 'f1', name: 'Lemon', emoji: '🍋', category: 'Fruits', popular: true },
  { id: 'f2', name: 'Lime', emoji: '🍈', category: 'Fruits', popular: true },
  { id: 'f3', name: 'Avocado', emoji: '🥑', category: 'Fruits', popular: true },
  { id: 'f4', name: 'Apple', emoji: '🍎', category: 'Fruits', popular: false },
  { id: 'f5', name: 'Mango', emoji: '🥭', category: 'Fruits', popular: false },
  { id: 'f6', name: 'Cherry', emoji: '🍒', category: 'Fruits', popular: false },
];

export const POPULAR_INGREDIENTS = ALL_INGREDIENTS.filter(i => i.popular);

export const RECENT_INGREDIENTS = [
  ALL_INGREDIENTS.find(i => i.id === 'i1')!,
  ALL_INGREDIENTS.find(i => i.id === 'v1')!,
  ALL_INGREDIENTS.find(i => i.id === 'g1')!,
  ALL_INGREDIENTS.find(i => i.id === 'v3')!,
  ALL_INGREDIENTS.find(i => i.id === 'd1')!,
  ALL_INGREDIENTS.find(i => i.id === 'f1')!,
];
