/* eslint-disable @typescript-eslint/strict-void-return */
/* eslint-disable no-unused-vars */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// 1. Создаем адаптер, передавая ему URL базы данных из .env
const adapter = new PrismaPg({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  connectionString: process.env.DATABASE_URL!,
})

// 2. Передаем адаптер в PrismaClient
const prisma = new PrismaClient({ adapter })

async function main() {
  // ============================================================
  // 1. СПРАВОЧНИКИ
  // ============================================================

  // Отрасли
  const trade = await prisma.industry.upsert({
    where: { slug: 'trade' },
    update: {},
    create: {
      name: 'Торговля',
      slug: 'trade',
      description: 'Ритейл, склады, распределительные центры',
      iconUrl: '/icons/trade.svg',
    },
  })

  const logistics = await prisma.industry.upsert({
    where: { slug: 'logistics' },
    update: {},
    create: {
      name: 'Логистика',
      slug: 'logistics',
      description: 'Аэропорты, вокзалы, транспортные хабы',
      iconUrl: '/icons/logistics.svg',
    },
  })

  const social = await prisma.industry.upsert({
    where: { slug: 'social' },
    update: {},
    create: {
      name: 'Социальная сфера',
      slug: 'social',
      description: 'Медицина, образование, госучреждения',
      iconUrl: '/icons/social.svg',
    },
  })

  // Типы объектов
  const warehouse = await prisma.objectType.upsert({
    where: { slug: 'warehouse' },
    update: {},
    create: {
      industryId: trade.id,
      name: 'Склад',
      slug: 'warehouse',
      description: 'Складские помещения, распределительные центры',
    },
  })

  const airport = await prisma.objectType.upsert({
    where: { slug: 'airport' },
    update: {},
    create: {
      industryId: logistics.id,
      name: 'Аэропорт',
      slug: 'airport',
      description: 'Пассажирские и грузовые терминалы',
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hospital = await prisma.objectType.upsert({
    where: { slug: 'hospital' },
    update: {},
    create: {
      industryId: social.id,
      name: 'Медучреждение',
      slug: 'hospital',
      description: 'Больницы, поликлиники, диагностические центры',
    },
  })

  // Категории решений
  const agvCategory = await prisma.solutionCategory.upsert({
    where: { slug: 'agv' },
    update: {},
    create: {
      name: 'AGV',
      slug: 'agv',
      description: 'Автоматические тележки с направляющими',
    },
  })

  const amrCategory = await prisma.solutionCategory.upsert({
    where: { slug: 'amr' },
    update: {},
    create: {
      name: 'AMR',
      slug: 'amr',
      description: 'Автономные мобильные роботы',
    },
  })

  const manipulatorCategory = await prisma.solutionCategory.upsert({
    where: { slug: 'manipulator' },
    update: {},
    create: {
      name: 'Манипулятор',
      slug: 'manipulator',
      description: 'Промышленные роботы-манипуляторы',
    },
  })

  // Теги
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'lidar-navigation' },
      update: {},
      create: { name: 'Навигация LiDAR', slug: 'lidar-navigation' },
    }),
    prisma.tag.upsert({
      where: { slug: 'qr-navigation' },
      update: {},
      create: { name: 'Навигация QR', slug: 'qr-navigation' },
    }),
    prisma.tag.upsert({
      where: { slug: 'outdoor' },
      update: {},
      create: { name: 'Работает на улице', slug: 'outdoor' },
    }),
    prisma.tag.upsert({
      where: { slug: 'has-api' },
      update: {},
      create: { name: 'Есть API', slug: 'has-api' },
    }),
  ])

  // ============================================================
  // 2. ВЕНДОРЫ И РЕШЕНИЯ
  // ============================================================

  // Вендоры
  const vendor1 = await prisma.vendor.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'RoboTech Solutions',
      website: 'https://robotech.example.com',
      country: 'Россия',
      description: 'Разработчик автономных мобильных роботов',
      logoUrl: '/vendors/robotech.png',
    },
  })

  const vendor2 = await prisma.vendor.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'AutoLogistics',
      website: 'https://autologistics.example.com',
      country: 'Китай',
      description: 'Производитель AGV и складской автоматизации',
      logoUrl: '/vendors/autologistics.png',
    },
  })

  // Решения
  const solution1 = await prisma.robotSolution.upsert({
    where: { slug: 'amr-500-pro' },
    update: {},
    create: {
      vendorId: vendor1.id,
      categoryId: amrCategory.id,
      name: 'AMR-500 Pro',
      slug: 'amr-500-pro',
      description: 'Автономный мобильный робот для складских операций с грузоподъёмностью 500 кг',
      priceMin: 2500000,
      priceMax: 3000000,
      currency: 'RUB',
      pricingModel: 'purchase',
      imageUrl: '/solutions/amr-500-pro.jpg',
      documentationUrl: 'https://docs.example.com/amr-500-pro',
    },
  })

  const solution2 = await prisma.robotSolution.upsert({
    where: { slug: 'agv-300-basic' },
    update: {},
    create: {
      vendorId: vendor2.id,
      categoryId: agvCategory.id,
      name: 'AGV-300 Basic',
      slug: 'agv-300-basic',
      description: 'Базовая AGV тележка для транспортировки грузов до 300 кг',
      priceMin: 1500000,
      priceMax: 1800000,
      currency: 'RUB',
      pricingModel: 'purchase',
      imageUrl: '/solutions/agv-300-basic.jpg',
    },
  })

  const solution3 = await prisma.robotSolution.upsert({
    where: { slug: 'robot-arm-6x' },
    update: {},
    create: {
      vendorId: vendor1.id,
      categoryId: manipulatorCategory.id,
      name: 'Robot Arm 6X',
      slug: 'robot-arm-6x',
      description: '6-осевой промышленный манипулятор для сборки и паллетирования',
      priceMin: 4000000,
      priceMax: 5000000,
      currency: 'RUB',
      pricingModel: 'purchase',
      imageUrl: '/solutions/robot-arm-6x.jpg',
    },
  })

  // Характеристики решений
  // Почему guard по count: createMany не умеет upsert, повторный seed иначе дублирует specs.
  if ((await prisma.solutionSpec.count()) === 0) {
    await prisma.solutionSpec.createMany({
      data: [
        // AMR-500 Pro
        { solutionId: solution1.id, specName: 'Грузоподъёмность', specValue: '500', specUnit: 'кг', sortOrder: 1 },
        { solutionId: solution1.id, specName: 'Скорость', specValue: '1.5', specUnit: 'м/с', sortOrder: 2 },
        {
          solutionId: solution1.id,
          specName: 'Время работы от батареи',
          specValue: '8',
          specUnit: 'часов',
          sortOrder: 3,
        },
        { solutionId: solution1.id, specName: 'Тип навигации', specValue: 'LiDAR + SLAM', sortOrder: 4 },
        { solutionId: solution1.id, specName: 'Габариты', specValue: '1200x800x300', specUnit: 'мм', sortOrder: 5 },

        // AGV-300 Basic
        { solutionId: solution2.id, specName: 'Грузоподъёмность', specValue: '300', specUnit: 'кг', sortOrder: 1 },
        { solutionId: solution2.id, specName: 'Скорость', specValue: '1.0', specUnit: 'м/с', sortOrder: 2 },
        {
          solutionId: solution2.id,
          specName: 'Время работы от батареи',
          specValue: '6',
          specUnit: 'часов',
          sortOrder: 3,
        },
        { solutionId: solution2.id, specName: 'Тип навигации', specValue: 'QR-коды', sortOrder: 4 },

        // Robot Arm 6X
        { solutionId: solution3.id, specName: 'Количество осей', specValue: '6', sortOrder: 1 },
        { solutionId: solution3.id, specName: 'Грузоподъёмность', specValue: '10', specUnit: 'кг', sortOrder: 2 },
        { solutionId: solution3.id, specName: 'Радиус действия', specValue: '1400', specUnit: 'мм', sortOrder: 3 },
        { solutionId: solution3.id, specName: 'Повторяемость', specValue: '±0.05', specUnit: 'мм', sortOrder: 4 },
      ],
    })
  }

  // Применимость решений
  // Почему skipDuplicates: связка solution+industry+objectType уникальна, seed должен быть идемпотентен.
  await prisma.solutionApplicability.createMany({
    skipDuplicates: true,
    data: [
      { solutionId: solution1.id, industryId: trade.id, objectTypeId: warehouse.id, suitabilityScore: 0.95 },
      { solutionId: solution1.id, industryId: logistics.id, objectTypeId: airport.id, suitabilityScore: 0.7 },
      { solutionId: solution2.id, industryId: trade.id, objectTypeId: warehouse.id, suitabilityScore: 0.85 },
      { solutionId: solution3.id, industryId: trade.id, suitabilityScore: 0.6 }, // NULL objectTypeId = вся отрасль
    ],
  })

  // Теги решений
  await prisma.solutionTag.createMany({
    skipDuplicates: true,
    data: [
      { solutionId: solution1.id, tagId: tags[0].id }, // LiDAR
      { solutionId: solution1.id, tagId: tags[3].id }, // API
      { solutionId: solution2.id, tagId: tags[1].id }, // QR
      { solutionId: solution3.id, tagId: tags[3].id }, // API
    ],
  })

  // ============================================================
  // 3. ЭТАЛОННЫЕ ОБЪЕКТЫ
  // ============================================================

  if ((await prisma.benchmarkObject.count()) === 0) {
    await prisma.benchmarkObject.create({
      data: {
        objectTypeId: warehouse.id,
        name: 'Типовой склад 5000 м²',
        description: 'Средний склад для e-commerce с 2 сменами',
        data: {
          area_sqm: 5000,
          employee_count: 40,
          shifts: 2,
          operating_hours: 16,
          processes: [
            { name: 'Приёмка товара', hours_day: 8, workers: 5, cost_month: 350000 },
            { name: 'Комплектация заказов', hours_day: 12, workers: 15, cost_month: 900000 },
            { name: 'Инвентаризация', hours_day: 4, workers: 3, cost_month: 120000 },
          ],
        },
      },
    })
  }

  // ============================================================
  // 4. ПОЛЬЗОВАТЕЛИ И ПРОЕКТЫ
  // ============================================================

  // Тестовый пользователь
  // Почему bcrypt-хеш вместо плейсхолдера: логин test@example.com должен реально работать.
  const testPasswordHash = await bcrypt.hash('Test1234!', 10)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: testPasswordHash,
      name: 'Иван Петров',
      company: 'ООО Логистик',
      role: 'user',
    },
  })

  // Проект пользователя
  // Почему guard: иначе каждый seed плодит «Мой склад в Казани».
  let project = await prisma.userProject.findFirst({
    where: { userId: user.id, name: 'Мой склад в Казани' },
  })
  project ||= await prisma.userProject.create({
    data: {
      userId: user.id,
      objectTypeId: warehouse.id,
      name: 'Мой склад в Казани',
      description: 'Автоматизация склада для ускорения обработки заказов',
      areaSqm: 3000,
      employeeCount: 25,
      shiftCount: 2,
      operatingHours: 14,
      monthlyFund: 1200000,
    },
  })

  // Бизнес-процессы проекта
  // Почему guard: createMany без skipDuplicates плодил бы процессы при каждом seed.
  if ((await prisma.userProjectProcess.count({ where: { projectId: project.id } })) === 0) {
    await prisma.userProjectProcess.createMany({
      data: [
        {
          projectId: project.id,
          processName: 'Комплектация заказов',
          currentCost: 600000,
          currentHours: 10,
          employeeCount: 10,
          frequency: 'daily',
          description: 'Сборка заказов по накладным',
          sortOrder: 1,
        },
        {
          projectId: project.id,
          processName: 'Транспортировка грузов',
          currentCost: 300000,
          currentHours: 8,
          employeeCount: 5,
          frequency: 'daily',
          description: 'Перемещение товаров между зонами',
          sortOrder: 2,
        },
      ],
    })
  }

  // ============================================================
  // 5. КЕЙСЫ И РЕЙТИНГИ
  // ============================================================

  // Кейсы внедрения
  // Почему guard: кейсы без уникального ключа, повторный seed дублировал бы их.
  if ((await prisma.caseStudy.count()) === 0) {
    await prisma.caseStudy.createMany({
      data: [
        {
          solutionId: solution1.id,
          companyName: 'X5 Retail Group',
          industryId: trade.id,
          objectTypeId: warehouse.id,
          title: 'Автоматизация склада в Москве',
          description: 'Внедрение 20 роботов AMR-500 Pro на распределительном центре',
          results: {
            roi_months: 14,
            savings_pct: 35,
            productivity_increase_pct: 45,
          },
          publishedAt: new Date('2024-03-15'),
        },
        {
          solutionId: solution2.id,
          companyName: 'Wildberries',
          industryId: trade.id,
          objectTypeId: warehouse.id,
          title: 'AGV для сортировочного центра',
          description: 'Развёртывание 50 AGV тележек для автоматизации сортировки',
          results: {
            roi_months: 18,
            savings_pct: 28,
          },
          publishedAt: new Date('2024-01-20'),
        },
      ],
    })
  }

  // Рейтинги
  await prisma.solutionRating.createMany({
    skipDuplicates: true,
    data: [
      {
        solutionId: solution1.id,
        userId: user.id,
        rating: 5,
        review: 'Отличный робот, очень помогает на складе',
      },
    ],
  })

  // ============================================================
  // 6. ЗАГЛУШКИ ДЛЯ ЭКОНОМИКИ
  // ============================================================

  // Подбор решений (заглушка)
  await prisma.projectSolutionMatch.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        solutionId: solution1.id,
        matchScore: 85,
        estimatedCost: 2700000,
        estimatedSavings: 0, // Заглушка
        roiMonths: 0, // Заглушка
        notes: 'Подходит для комплектации заказов',
      },
      {
        projectId: project.id,
        solutionId: solution2.id,
        matchScore: 70,
        estimatedCost: 1600000,
        estimatedSavings: 0, // Заглушка
        roiMonths: 0, // Заглушка
        notes: 'Более бюджетный вариант',
      },
    ],
  })

  // Экономические расчёты (заглушка)
  // Почему upsert: у расчёта уникальная связка project+solution, create дублировал бы при повторе.
  await prisma.economicCalculation.upsert({
    where: { projectId_solutionId: { projectId: project.id, solutionId: solution1.id } },
    update: {},
    create: {
      projectId: project.id,
      solutionId: solution1.id,
      initialInvestment: 2700000,
      annualMaintenance: 200000,
      annualEnergyCost: 50000,
      annualSavings: 0, // Заглушка
      paybackMonths: 0, // Заглушка
      roi3yr: 0, // Заглушка
      roi5yr: 0, // Заглушка
      npv: 0, // Заглушка
      irr: 0, // Заглушка
      assumptions: {
        note: 'Расчёт будет добавлен позже',
      },
    },
  })
}

main()
  // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
  .catch((e) => {
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
