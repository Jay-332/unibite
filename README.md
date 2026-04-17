# 🍔 UniBites: Smart Meal Planner & Dashboard

UniBites is a comprehensive smart budgeting platform designed to help university students manage their food expenses effortlessly while working towards their monthly savings goals. By moving away from rigid budgeting logic, UniBites adapts intelligently day-by-day to a student's actual spending and dining habits!

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (v16.1.1, App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Language**: TypeScript
- **AI Integration**: Google Generative AI (`@google/generative-ai` v0.24.1)

---

## ✨ Core Features

### 🍽️ 1. Smart Meal Planner
Organize your daily budget across four slots: **Breakfast, Lunch, Snacks, and Dinner**.
- **AI-Based Recommendations**: Find out the "Best Value" and "Treat Yourself" options tailored safely to your adjusted budget.
- **Dynamic Allocation**: Skip a meal (e.g., Breakfast), and the planner instantly redistributes those funds to upgrade your remaining meals for the day!

### 💰 2. Day-by-Day Smart Budgeting
- **Surplus Rollover**: If you save money on one day, the surplus is divided by the remaining days in your goal cycle and *added* to your future daily limit.
- **Spend Corrections**: Overspend dynamically reduces future budgets gently while preserving a safe minimum daily allowance (₹50) to ensure you still eat.
- **Monthly Savings Tracker**: Monitor your trajectory against your monthly monetary targets in real-time.

### 🤖 3. "AI Compass" Chatbot
An embedded virtual assistant explicitly tuned into the platform:
- Suggests customized meal routines securely calculated against your active data context.
- Helps explain platform functionality (e.g., Mess Pass integration, Meal Logging, features).
- Accurately knows all menu item prices, canteen locations (Kuksi / MRC), ratings, and details.

### 📱 4. Interactive Student Dashboard
- **Visual Budget Cards**: See your active financial health represented visually (Green = Safe, Red = Running Low).
- **Comprehensive Log Book**: Timestamped accountability of what you’ve eaten and spent daily.
- **Mess Pass Support**: Need a break from budgeting? Simply toggle the Mess Pass application to pause budget reduction temporarily for ₹150 daily.
- **Daily Summary Notifications**: Receive dynamic wrap-up alerts at 8 PM providing tips adjusting your budgeting behavior for tomorrow.

---

## 💻 Getting Started

First, make sure you install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The platform can be edited by modifying `app/page.tsx`. 

## 🗺️ How it Works

For an in-depth, feature-by-feature understanding, review the [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) file included in the repository. It contains comprehensive scenarios concerning smart planner metrics, budgeting redistribution logic, and the UI's color system mapping!
