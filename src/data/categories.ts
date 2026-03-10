export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string[];
  mealCount: number;
}

export const MEAL_CATEGORIES: Category[] = [
  {
    id: 'c1',
    name: 'Quick & Easy',
    emoji: '⚡',
    color: '#F5A623',
    gradient: ['#F5C842', '#F5A623'],
    mealCount: 48,
  },
  {
    id: 'c2',
    name: 'Healthy',
    emoji: '🥗',
    color: '#22C55E',
    gradient: ['#4ADE80', '#22C55E'],
    mealCount: 64,
  },
  {
    id: 'c3',
    name: 'Date Night',
    emoji: '🕯️',
    color: '#E8704A',
    gradient: ['#FF8C5A', '#E8704A'],
    mealCount: 32,
  },
  {
    id: 'c4',
    name: 'Comfort Food',
    emoji: '🍜',
    color: '#8B5CF6',
    gradient: ['#A78BFA', '#8B5CF6'],
    mealCount: 56,
  },
  {
    id: 'c5',
    name: 'Meal Prep',
    emoji: '📦',
    color: '#0EA5E9',
    gradient: ['#38BDF8', '#0EA5E9'],
    mealCount: 40,
  },
  {
    id: 'c6',
    name: 'Vegan',
    emoji: '🌱',
    color: '#2D6A4F',
    gradient: ['#52B788', '#2D6A4F'],
    mealCount: 38,
  },
];

export const SEARCH_SUGGESTIONS = [
  'Pasta carbonara',
  'Chicken tikka masala',
  'Avocado toast',
  'Beef tacos',
  'Mushroom risotto',
  'Salmon bowl',
  'Thai green curry',
  'Lentil soup',
  'Shakshuka',
  'Buddha bowl',
];

export const POPULAR_SEARCHES = [
  'Quick dinner',
  'High protein',
  'Vegan',
  'Italian',
  'Under 30 min',
  'Batch cooking',
];

export const CUISINES = [
  { name: 'Italian', emoji: '🇮🇹' },
  { name: 'Japanese', emoji: '🇯🇵' },
  { name: 'Mexican', emoji: '🇲🇽' },
  { name: 'Thai', emoji: '🇹🇭' },
  { name: 'Mediterranean', emoji: '🫙' },
  { name: 'Indian', emoji: '🇮🇳' },
  { name: 'French', emoji: '🇫🇷' },
  { name: 'American', emoji: '🇺🇸' },
];
