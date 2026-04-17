import { config } from 'dotenv';
config({ path: '.env.local' });
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create Canteens
  const kuksi = await prisma.canteen.upsert({
    where: { id: 'kuksi-canteen' },
    update: {},
    create: {
      id: 'kuksi-canteen',
      name: 'Kuksi Canteen',
      location: 'North Campus – Block A',
      openTime: '08:00',
      closeTime: '22:00',
      rating: 4.5,
    },
  });

  const mrc = await prisma.canteen.upsert({
    where: { id: 'mrc-canteen' },
    update: {},
    create: {
      id: 'mrc-canteen',
      name: 'MRC Canteen',
      location: 'South Campus – Block C',
      openTime: '07:30',
      closeTime: '23:00',
      rating: 4.2,
    },
  });

  console.log('✅ Created canteens:', kuksi.name, '|', mrc.name);

  // Seed menu items
  const menuItems = [
    // Kuksi Canteen – Breakfast
    { canteenId: kuksi.id, name: 'Masala Dosa', description: 'Crispy rice crepe with spiced potato filling, served with chutney & sambar', price: 40, category: 'breakfast', isVeg: true, preparationTime: 12, tags: ['popular', 'south-indian'] },
    { canteenId: kuksi.id, name: 'Idli Sambar', description: 'Soft steamed rice cakes with sambar and coconut chutney', price: 30, category: 'breakfast', isVeg: true, preparationTime: 8, tags: ['healthy', 'south-indian'] },
    { canteenId: kuksi.id, name: 'Poha', description: 'Light flattened rice with onions, mustard seeds and curry leaves', price: 25, category: 'breakfast', isVeg: true, preparationTime: 5, tags: ['light', 'quick'] },

    // Kuksi Canteen – Lunch/Dinner
    { canteenId: kuksi.id, name: 'Veg Thali', description: 'Complete meal with roti, dal, rice, sabji, curd and papad', price: 80, category: 'lunch', isVeg: true, preparationTime: 10, tags: ['popular', 'filling', 'recommended'] },
    { canteenId: kuksi.id, name: 'Chicken Biryani', description: 'Fragrant basmati rice slow-cooked with tender chicken and aromatic spices', price: 120, category: 'dinner', isVeg: false, preparationTime: 20, tags: ['non-veg', 'spicy', 'popular'] },

    // Kuksi Canteen – Beverages
    { canteenId: kuksi.id, name: 'Cold Coffee', description: 'Chilled coffee blended with milk and ice cream', price: 35, category: 'beverages', isVeg: true, preparationTime: 5, tags: ['refreshing', 'cold'] },

    // MRC Canteen – Breakfast
    { canteenId: mrc.id, name: 'Aloo Paratha', description: 'Whole wheat flatbread stuffed with spiced mashed potatoes, served with butter and pickle', price: 25, category: 'breakfast', isVeg: true, preparationTime: 10, tags: ['north-indian', 'buttery'] },

    // MRC Canteen – Lunch/Dinner
    { canteenId: mrc.id, name: 'Egg Fried Rice', description: 'Wok-tossed rice with scrambled eggs, vegetables and soy sauce', price: 70, category: 'lunch', isVeg: false, preparationTime: 12, tags: ['chinese', 'popular'] },
    { canteenId: mrc.id, name: 'Paneer Butter Masala', description: 'Rich creamy tomato-based curry with soft paneer cubes', price: 110, category: 'dinner', isVeg: true, preparationTime: 15, tags: ['recommended', 'rich', 'popular'] },

    // MRC Canteen – Snacks
    { canteenId: mrc.id, name: 'Samosa', description: 'Golden fried pastry filled with spiced potatoes and peas', price: 15, category: 'snacks', isVeg: true, preparationTime: 3, tags: ['crispy', 'quick', 'popular'] },
    { canteenId: mrc.id, name: 'Veg Sandwich', description: 'Toasted sandwich with fresh veggies, cheese and green chutney', price: 40, category: 'snacks', isVeg: true, preparationTime: 7, tags: ['healthy', 'quick'] },

    // MRC Canteen – Beverages
    { canteenId: mrc.id, name: 'Masala Chai', description: 'Freshly brewed spiced milk tea with ginger and cardamom', price: 10, category: 'beverages', isVeg: true, preparationTime: 3, tags: ['hot', 'popular', 'recommended'] },
  ];

  let count = 0;
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
    count++;
  }

  console.log(`✅ Created ${count} menu items`);

  // Create a Canteen Admin for testing
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@kuksi.com" },
    update: {},
    create: {
      email: "admin@kuksi.com",
      password: adminPassword,
      name: "Kuksi Admin",
      role: "CANTEEN_ADMIN",
      managedCanteenId: kuksi.id,
    },
  });

  // Create a Student for testing
  const studentPassword = await bcrypt.hash("student123", 10);
  await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      password: studentPassword,
      name: "Test Student",
      role: "STUDENT",
      tokenBalance: 500,
      dailyBudget: 150,
      savingsGoal: 2000,
    },
  });

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
