"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MENU_ITEMS, MenuItem, Review } from '@/lib/data';
import { useAuth } from './AuthContext';


export interface LogItem extends MenuItem {
    isManual: boolean;
    timestamp: string;
    originalItem?: MenuItem;
    loggedFromSlot?: string; // Which slot (Breakfast/Lunch/Dinner) this was logged from
    quantity?: number;
}

// Staged item with slot info
export interface StagedItem extends MenuItem {
    stagedFromSlot?: string;
    quantity: number;
}

interface MenuContextType {
    items: MenuItem[];
    reviews: Review[];
    loggedMeals: LogItem[];
    stagedItems: StagedItem[]; // Temporary cart before confirming
    dailySpend: number;
    remainingBudget: number; // Daily budget - daily spend
    currentSavings: number; // What user actually saved today
    todaysSavings: number; // Daily limit - daily spend (can be negative if overspent)
    totalBudgetLeft: number; // Remaining budget across all remaining days
    savingsGoal: number;
    selectedCanteen: string | null; // null = all canteens
    setSelectedCanteen: (canteenId: string | null) => void;
    priceSort: 'none' | 'low-high' | 'high-low';
    setPriceSort: (sort: 'none' | 'low-high' | 'high-low') => void;
    addReview: (review: Review) => void;
    getItemRating: (itemId: string) => number;
    stageItem: (item: MenuItem, slot?: string) => void; // Add to temporary cart with optional slot
    unstageItem: (id: string, slot?: string) => void; // Remove from cart
    updateStagedQuantity: (id: string, change: number, slot?: string) => void; // Increment/Decrement quantity
    confirmStagedItems: () => void; // Move staged items to permanent log
    logMeal: (item: MenuItem, slot?: string) => void; // Direct log with optional slot
    removeLogItem: (id: string) => void;
    setSavingsGoal: (goal: number) => void;
    addItem: (item: MenuItem) => void;
    updateItem: (id: string, item: Partial<MenuItem>) => void;
    deleteItem: (id: string) => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loggedMeals, setLoggedMeals] = useState<LogItem[]>([]);
    const [stagedItems, setStagedItems] = useState<StagedItem[]>([]); // Temporary cart with slot info
    const [savingsGoal, setSavingsGoal] = useState(500);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isLogsLoaded, setIsLogsLoaded] = useState(false);

    // Load menu items from server API on mount
    useEffect(() => {
        async function fetchMenuItems() {
            try {
                const response = await fetch('/api/menu');
                if (response.ok) {
                    const serverItems: MenuItem[] = await response.json();
                    if (serverItems && serverItems.length > 0) {
                        // Merge: use server items, but keep any new default items
                        const serverIds = new Set(serverItems.map(i => i.id));
                        const newDefaults = MENU_ITEMS.filter(i => !serverIds.has(i.id));
                        setItems([...serverItems, ...newDefaults]);
                    } else {
                        // No items on server, initialize with defaults and save
                        setItems(MENU_ITEMS);
                        await fetch('/api/menu', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(MENU_ITEMS)
                        });
                    }
                }
            } catch (e) {
                console.error("Failed to fetch menu items from server", e);
            }
            setIsLoaded(true);
        }
        fetchMenuItems();
    }, []);

    // Save menu items to server API whenever they change (after initial load)
    useEffect(() => {
        if (!isLoaded) return;

        async function saveMenuItems() {
            try {
                await fetch('/api/menu', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(items)
                });
            } catch (e) {
                console.error("Failed to save menu items to server", e);
            }
        }
        saveMenuItems();
    }, [items, isLoaded]);

    // Load reviews from server API on mount
    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await fetch('/api/reviews');
                if (response.ok) {
                    const serverReviews: Review[] = await response.json();
                    if (serverReviews && serverReviews.length > 0) {
                        setReviews(serverReviews);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch reviews from server", e);
            }
        }
        fetchReviews();
    }, []);

    // Save reviews to server API whenever they change
    useEffect(() => {
        if (reviews.length === 0) return;

        async function saveReviews() {
            try {
                await fetch('/api/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reviews)
                });
            } catch (e) {
                console.error("Failed to save reviews to server", e);
            }
        }
        saveReviews();
    }, [reviews]);


    // Load logged meals from server API whenever user changes
    useEffect(() => {
        if (!user) {
            setLoggedMeals([]);
            setIsLogsLoaded(false);
            return;
        }

        async function fetchLoggedMeals() {
            try {
                const response = await fetch(`/api/logged-meals?userId=${encodeURIComponent(user!.email)}`);
                if (response.ok) {
                    const serverMeals: LogItem[] = await response.json();
                    setLoggedMeals(serverMeals || []);
                }
            } catch (e) {
                console.error("Failed to fetch logged meals from server", e);
            }
            setIsLogsLoaded(true);
        }
        fetchLoggedMeals();
    }, [user?.email]);

    // Save logged meals to server API whenever they change
    useEffect(() => {
        if (!user || !isLogsLoaded) return;

        async function saveLoggedMeals() {
            try {
                await fetch(`/api/logged-meals?userId=${encodeURIComponent(user!.email)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(loggedMeals)
                });
            } catch (e) {
                console.error("Failed to save logged meals to server", e);
            }
        }
        saveLoggedMeals();
    }, [loggedMeals, user?.email, isLogsLoaded]);

    // Selected canteen filter (null = all canteens)
    const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);

    // Price sort preference
    const [priceSort, setPriceSort] = useState<'none' | 'low-high' | 'high-low'>('none');

    // Load filter preferences on mount
    useEffect(() => {
        const savedCanteen = localStorage.getItem('campusbite_selected_canteen');
        const savedPriceSort = localStorage.getItem('campusbite_price_sort');

        if (savedCanteen) setSelectedCanteen(savedCanteen === 'all' ? null : savedCanteen);
        if (savedPriceSort) setPriceSort(savedPriceSort as any);
    }, []);

    // Save filter preferences whenever they change
    useEffect(() => {
        localStorage.setItem('campusbite_selected_canteen', selectedCanteen || 'all');
        localStorage.setItem('campusbite_price_sort', priceSort);
    }, [selectedCanteen, priceSort]);

    const dailySpend = loggedMeals
        .filter(item => new Date(item.timestamp).toDateString() === new Date().toDateString())
        .reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

    // Get daily limit from user's budget
    const dailyLimit = user?.budget?.dailyLimit || 200;

    // Remaining budget = daily limit - what's been logged
    const remainingBudget = Math.max(0, dailyLimit - dailySpend);

    // Current savings = daily limit - daily spend (what user saved by not spending full budget)
    const currentSavings = Math.max(0, dailyLimit - dailySpend);

    // Today's savings = daily limit - daily spend (can be negative if overspent)
    const todaysSavings = dailyLimit - dailySpend;

    // Total budget left = (daily limit × remaining days) + today's remaining budget
    const remainingDays = user?.budget?.remainingDays || 0;
    const totalBudgetLeft = (dailyLimit * remainingDays) + remainingBudget;

    const { updateUser } = useAuth();

    const processDayTransition = () => {
        if (!user || !user.budget || user.budget.isCycleCompleted) return;

        const today = new Date().toDateString();
        const lastLogDateString = user.budget.lastRedistributionDate;

        if (lastLogDateString && lastLogDateString !== today) {
            // New day detected - process previous day's leftovers
            const prevDaySpend = loggedMeals
                .filter(item => new Date(item.timestamp).toDateString() === lastLogDateString)
                .reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

            let newDailyLimit = user.budget.dailyLimit;
            let newRemainingDays = user.budget.remainingDays || 0;
            let newDaysUsed = user.budget.daysUsed || 0;
            let additionalSavings = user.budget.additionalSavings || 0;

            // Calculate difference: positive = saved, negative = overspent
            const difference = newDailyLimit - prevDaySpend;

            if (newRemainingDays > 0) {
                // Redistribute the difference across ALL remaining days
                // If saved (positive): increases future daily limits
                // If overspent (negative): decreases future daily limits
                const redistributionPerDay = difference / newRemainingDays;
                newDailyLimit = user.budget.baseDailyBudget! + redistributionPerDay;

                // Ensure daily limit doesn't go below a minimum (e.g., 50 rupees)
                newDailyLimit = Math.max(50, newDailyLimit);
            } else if (difference > 0 && newRemainingDays === 0) {
                // Last day and saved money
                additionalSavings += difference;
            }

            // Update cycle state
            newDaysUsed += 1;
            newRemainingDays = (user.budget.totalPlannedDays || 0) - newDaysUsed;

            const isCompleted = newRemainingDays < 0;

            console.log('📅 Day Transition:', {
                previousDay: lastLogDateString,
                today,
                prevDaySpend,
                prevDailyLimit: user.budget.dailyLimit,
                difference,
                newDailyLimit,
                remainingDays: newRemainingDays
            });

            updateUser({
                budget: {
                    ...user.budget,
                    dailyLimit: newDailyLimit,
                    remainingDays: Math.max(0, newRemainingDays),
                    daysUsed: newDaysUsed,
                    lastRedistributionDate: today,
                    spentToday: 0,
                    isCycleCompleted: isCompleted,
                    additionalSavings: isCompleted ? (user.budget.additionalSavings || 0) + Math.max(0, difference) : additionalSavings,
                    hasSeenCompletionPopup: false
                }
            });
        } else if (!lastLogDateString && loggedMeals.length > 0) {
            // First time logging in the cycle
            updateUser({
                budget: {
                    ...user.budget,
                    lastRedistributionDate: today,
                    daysUsed: 1,
                    remainingDays: (user.budget.totalPlannedDays || 1) - 1
                }
            });
        }
    };

    // Auto-process day transition on mount/load
    useEffect(() => {
        if (isLogsLoaded && user) {
            processDayTransition();
        }
    }, [isLogsLoaded, user?.id]);

    // Stage an item (add to temporary cart) with optional slot info
    const stageItem = (item: MenuItem, slot?: string) => {
        setStagedItems(prev => {
            // Check if item already exists in staged items (same id and same slot)
            const existingIndex = prev.findIndex(i => i.id === item.id && i.stagedFromSlot === slot);

            if (existingIndex !== -1) {
                // Item exists, increment quantity
                const updatedItems = [...prev];
                updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    quantity: (updatedItems[existingIndex].quantity || 1) + 1
                };
                return updatedItems;
            } else {
                // New item, add with quantity 1
                return [...prev, {
                    ...item,
                    stagedFromSlot: slot,
                    quantity: 1
                }];
            }
        });
    };

    // Unstage an item (remove from cart) - matches by id AND slot if provided
    const unstageItem = (id: string, slot?: string) => {
        setStagedItems(prev => prev.filter(i => {
            if (slot) {
                // If slot provided, keep if ID doesn't match OR slot doesn't match
                return !(i.id === id && i.stagedFromSlot === slot);
            }
            // If no slot provided, remove all instances of this ID
            return i.id !== id;
        }));
    };

    // Update staged item quantity
    const updateStagedQuantity = (id: string, change: number, slot?: string) => {
        setStagedItems(prev => {
            const index = prev.findIndex(i => i.id === id && i.stagedFromSlot === slot);
            if (index === -1) return prev;

            const updatedItems = [...prev];
            const currentQty = updatedItems[index].quantity || 1;
            const newQty = currentQty + change;

            // If quantity becomes 0 or less, remove item
            if (newQty <= 0) {
                return prev.filter((_, idx) => idx !== index);
            }

            // Update quantity
            updatedItems[index] = { ...updatedItems[index], quantity: newQty };
            return updatedItems;
        });
    };

    // Confirm all staged items to permanent log
    const confirmStagedItems = () => {
        const newLogs: LogItem[] = [];

        stagedItems.forEach(item => {
            // Create separate log entry for each quantity unit
            // This preserves the simple data structure for logged meals
            const qty = item.quantity || 1;
            for (let i = 0; i < qty; i++) {
                newLogs.push({
                    ...item, // extends MenuItem
                    isManual: false,
                    timestamp: new Date().toISOString(),
                    originalItem: item, // reference to base item
                    loggedFromSlot: item.stagedFromSlot,
                    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}` // Unique ID for each unit
                });
            }
        });

        processDayTransition();
        setLoggedMeals(prev => [...prev, ...newLogs]);
        setStagedItems([]); // Clear the cart
    };

    // Direct log with optional slot info
    const logMeal = (item: MenuItem, slot?: string) => {
        processDayTransition();
        const newLog: LogItem = {
            ...item,
            isManual: false,
            timestamp: new Date().toISOString(),
            originalItem: item,
            loggedFromSlot: slot,
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        setLoggedMeals(prev => [...prev, newLog]);
    };

    const removeLogItem = (id: string) => {
        setLoggedMeals(prev => prev.filter(item => item.id !== id));
    };

    const addReview = (review: Review) => {
        setReviews(prev => [...prev, review]);

        // Recalculate item rating
        const itemReviews = [...reviews, review].filter(r => r.itemId === review.itemId);
        const newRating = itemReviews.reduce((acc, r) => acc + r.rating, 0) / itemReviews.length;

        setItems(prev => prev.map(item =>
            item.id === review.itemId
                ? { ...item, rating: Number(newRating.toFixed(1)) }
                : item
        ));
    };

    const getItemRating = (itemId: string) => {
        const item = items.find(i => i.id === itemId);
        return item?.rating || 0;
    };

    const addItem = (item: MenuItem) => {
        setItems(prev => [...prev, item]);
    };

    const updateItem = (id: string, updatedItem: Partial<MenuItem>) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, ...updatedItem } : item
        ));
    };

    const deleteItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    return (
        <MenuContext.Provider value={{
            items, reviews, loggedMeals, stagedItems, dailySpend, savingsGoal,
            remainingBudget, currentSavings, todaysSavings, totalBudgetLeft,
            selectedCanteen, setSelectedCanteen,
            priceSort, setPriceSort,
            addReview, getItemRating,
            stageItem, unstageItem, updateStagedQuantity, confirmStagedItems, logMeal, removeLogItem,
            setSavingsGoal, addItem, updateItem, deleteItem
        }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
}
