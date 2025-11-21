import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@autotask.com' },
    update: {},
    create: {
      googleId: 'admin-google-id-12345',
      email: 'admin@autotask.com',
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create Test Users
  const users = [];
  for (let i = 1; i <= 3; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: {
        googleId: `user-google-id-${i}`,
        email: `user${i}@example.com`,
        name: `Test User ${i}`,
        role: 'USER',
        isActive: true,
        score: Math.floor(Math.random() * 100),
      },
    });
    users.push(user);
    console.log(`✅ Created test user: ${user.email}`);
  }

  // Create Sample Tasks
  const taskTitles = [
    'Hoàn thành báo cáo tháng',
    'Review code cho feature mới',
    'Cập nhật documentation',
    'Fix bug trong module authentication',
    'Thiết kế UI cho dashboard',
  ];

  for (let i = 0; i < taskTitles.length; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 14)); // Random 0-14 days

    const task = await prisma.task.create({
      data: {
        title: taskTitles[i],
        description: `Mô tả chi tiết cho task: ${taskTitles[i]}`,
        adminId: admin.id,
        assignedUserId: randomUser.id,
        deadline,
        status: 'PENDING',
      },
    });

    console.log(`✅ Created task: ${task.title} for ${randomUser.email}`);
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
