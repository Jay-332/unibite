
export type Role = 'student' | 'vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  canteenId?: string; // Links vendor to a specific canteen
  isOnboardingComplete?: boolean;
  budget?: {
    dailyLimit: number;
    monthlyLimit: number;
    savingGoal?: number; // Target savings
    spentToday: number;
    spentMonth: number;
    // Budget Cycle State
    totalPlannedDays?: number;
    daysUsed?: number;
    remainingDays?: number;
    baseDailyBudget?: number;
    lastRedistributionDate?: string;
    isCycleCompleted?: boolean;
    additionalSavings?: number;
    hasSeenCompletionPopup?: boolean;
  };
  preferences?: string[];
  messPass?: {
    isActive: boolean;
    startDate: string;
    endDate: string;
    totalDays: number;
    dailyRate: number;
    totalFee: number;
    appliedDate: string;
  };
}

export interface Canteen {
  id: string;
  name: string;
  location: string;
  isOpen: boolean;
  image: string;
  lastUpdated: string;
}

export type MealPeriod = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks' | 'Beverages';

export interface MenuItem {
  id: string;
  canteenId: string;
  name: string;
  price: number;
  category: string;
  mealPeriod: MealPeriod[];
  type: 'veg' | 'non-veg';
  isHealthy: boolean;
  isDaily: boolean; // True if item is a daily special, False if default
  rating: number;
  prepTime: string;
  image: string;
  description?: string;
  isAvailable: boolean; // True if in stock, False if out of stock
}

export interface Review {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Feedback {
  id: string;
  studentId: string;
  type: 'query' | 'suggestion';
  target: 'all' | string; // 'all' or vendorId (canteenId)
  message: string;
  timestamp: string;
}

export const FEEDBACKS: Feedback[] = [];

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Rahul Sharma',
    email: 'student@campus.edu',
    role: 'student',
    isOnboardingComplete: true, // Existing user, onboarding already done
    budget: {
      dailyLimit: 200,
      monthlyLimit: 5000,
      savingGoal: 500, // Demo savings goal
      spentToday: 45,
      spentMonth: 1200,
    },
    preferences: ['Healthy', 'North Indian'],
  },
  {
    id: 'v1',
    name: 'Kuksi Manager',
    email: 'Kuksi@campus.edu',
    role: 'vendor',
    canteenId: 'c1', // Links to Kuksi Canteen
  },
  {
    id: 'v2',
    name: 'MRC Manager',
    email: 'mrc@campus.edu',
    role: 'vendor',
    canteenId: 'c2', // Links to MRC
  },
];

export const CANTEENS: Canteen[] = [
  { id: 'c1', name: 'Kuksi Canteen', location: 'Block A', isOpen: true, image: 'https://images.unsplash.com/photo-1554679665-f5537f187268?auto=format&fit=crop&q=80&w=1000', lastUpdated: new Date().toISOString() },
  { id: 'c2', name: 'MRC', location: 'Block C', isOpen: true, image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=1000', lastUpdated: new Date().toISOString() },
];

export const MENU_ITEMS: MenuItem[] = [
  // Kuksi Canteen
  { id: 'm1', canteenId: 'c1', name: 'Veg Thali', price: 80, category: 'Main Course', mealPeriod: ['Lunch', 'Dinner'], type: 'veg', isHealthy: true, isDaily: false, rating: 4.5, prepTime: '10m', image: 'https://images.unsplash.com/photo-1546833999-b9f58160293e?auto=format&fit=crop&q=80&w=1000', description: 'Complete meal with roti, dal, rice, and seasonal vegetables.', isAvailable: true },
  { id: 'm2', canteenId: 'c1', name: 'Masala Dosa', price: 60, category: 'Breakfast', mealPeriod: ['Breakfast', 'Snacks'], type: 'veg', isHealthy: true, isDaily: false, rating: 4.8, prepTime: '15m', image: 'https://images.unsplash.com/photo-1668236368031-482086c2e36b?auto=format&fit=crop&q=80&w=1000', description: 'Crispy rice crepe filled with spiced potato mix, served with chutney.', isAvailable: true },
  { id: 'm3', canteenId: 'c1', name: 'Samosa', price: 15, category: 'Snacks', mealPeriod: ['Snacks'], type: 'veg', isHealthy: false, isDaily: true, rating: 4.2, prepTime: '5m', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&q=80&w=1000', description: 'Fried pastry with savory potato filling.', isAvailable: true },

  // MRC
  { id: 'm4', canteenId: 'c2', name: 'Chicken Sandwich', price: 90, category: 'Snacks', mealPeriod: ['Lunch', 'Snacks'], type: 'non-veg', isHealthy: true, isDaily: false, rating: 4.6, prepTime: '10m', image: 'https://images.unsplash.com/photo-1606756819851-e40df1458e0a?auto=format&fit=crop&q=80&w=1000', description: 'Grilled chicken breast with fresh veggies in brown bread.', isAvailable: true },
  { id: 'm5', canteenId: 'c2', name: 'Cold Coffee', price: 50, category: 'Beverages', mealPeriod: ['Beverages', 'Snacks'], type: 'veg', isHealthy: false, isDaily: true, rating: 4.7, prepTime: '5m', image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&q=80&w=1000', description: 'Chilled coffee blended with ice cream.', isAvailable: true },
  { id: 'm6', canteenId: 'c2', name: 'Fruit Salad', price: 70, category: 'Dessert', mealPeriod: ['Breakfast', 'Snacks'], type: 'veg', isHealthy: true, isDaily: false, rating: 4.9, prepTime: '5m', image: 'https://images.unsplash.com/photo-1519996529931-28324d1a630e?auto=format&fit=crop&q=80&w=1000', description: 'Fresh seasonal fruits bowl.', isAvailable: true },
  { id: 'm7', canteenId: 'c2', name: 'Oats & Milk', price: 60, category: 'Breakfast', mealPeriod: ['Breakfast'], type: 'veg', isHealthy: true, isDaily: false, rating: 4.8, prepTime: '5m', image: 'https://images.unsplash.com/photo-1542152011-3e4bda0c9780?auto=format&fit=crop&q=80&w=1000', description: 'Warm oatmeal cooked in milk, topped with honey.', isAvailable: true },
];
