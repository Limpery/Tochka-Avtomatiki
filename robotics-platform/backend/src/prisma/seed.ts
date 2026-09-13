/**
 * Seed тестовых данных. Идемпотентен: повторный запуск не плодит дубликаты
 * (upsert по slug/email, createMany с skipDuplicates, guard по count там, где нет unique-ключа).
 */
import { prisma } from './client'
import { hashPassword } from '../shared/utils/password'

async function seedIndustries() {
  const industries = [
    { slug: 'trade', name: 'Торговля', description: 'Ритейл, склады, распределительные центры', iconUrl: '/icons/trade.svg' },
    { slug: 'logistics', name: 'Логистика', description: 'Аэропорты, вокзалы, транспортные хабы', iconUrl: '/icons/logistics.svg' },
    { slug: 'social', name: 'Социальная сфера', description: 'Медицина, образование, госучреждения', iconUrl: '/icons/social.svg' },
    { slug: 'other', name: 'Другое', description: 'Произвольный объект на усмотрение пользователя', iconUrl: '/icons/other.svg' },
  ]
  const result: Record<string, number> = {}
  for (const industry of industries) {
    const row = await prisma.industry.upsert({ where: { slug: industry.slug }, update: {}, create: industry })
    result[industry.slug] = row.id
  }
  return result
}

async function seedObjectTypes(industries: Record<string, number>) {
  const objectTypes = [
    { slug: 'warehouse', industry: 'trade', name: 'Склад', description: 'Складские помещения, распределительные центры' },
    { slug: 'retail-store', industry: 'trade', name: 'Магазин / гипермаркет', description: 'Торговые залы, инвентаризация полок' },
    { slug: 'airport', industry: 'logistics', name: 'Аэропорт', description: 'Пассажирские и грузовые терминалы' },
    { slug: 'sorting-center', industry: 'logistics', name: 'Сортировочный центр', description: 'Хабы курьерских и почтовых служб' },
    { slug: 'hospital', industry: 'social', name: 'Медучреждение', description: 'Больницы, поликлиники, диагностические центры' },
    { slug: 'custom', industry: 'other', name: 'Другой объект', description: 'Объект, не попадающий в стандартные категории' },
  ]
  const result: Record<string, number> = {}
  for (const { industry, ...objectType } of objectTypes) {
    const industryId = industries[industry]
    if (!industryId) {
      throw new Error(`Не найдена отрасль ${industry}`)
    }
    const row = await prisma.objectType.upsert({
      where: { slug: objectType.slug },
      update: {},
      create: { ...objectType, industryId },
    })
    result[objectType.slug] = row.id
  }
  return result
}

async function seedCategories() {
  const categories = [
    { slug: 'agv', name: 'AGV', description: 'Автоматические тележки с направляющими (магнитная лента, QR-коды)' },
    { slug: 'amr', name: 'AMR', description: 'Автономные мобильные роботы со свободной навигацией' },
    { slug: 'manipulator', name: 'Манипулятор', description: 'Промышленные и коллаборативные роботы-манипуляторы' },
    { slug: 'drone', name: 'Дрон', description: 'Беспилотные летательные аппараты для инвентаризации и мониторинга' },
    { slug: 'service', name: 'Сервисный робот', description: 'Роботы для уборки, дезинфекции, доставки и навигации людей' },
  ]
  const result: Record<string, number> = {}
  for (const category of categories) {
    const row = await prisma.solutionCategory.upsert({ where: { slug: category.slug }, update: {}, create: category })
    result[category.slug] = row.id
  }
  return result
}

async function seedTags() {
  const tags = [
    { slug: 'lidar-navigation', name: 'Навигация LiDAR' },
    { slug: 'qr-navigation', name: 'Навигация QR' },
    { slug: 'outdoor', name: 'Работает на улице' },
    { slug: 'has-api', name: 'Есть API' },
    { slug: 'auto-charging', name: 'Автозарядка' },
    { slug: 'fleet-management', name: 'Управление флотом' },
    { slug: 'made-in-russia', name: 'Российское производство' },
    { slug: 'collaborative', name: 'Коллаборативный' },
  ]
  const result: Record<string, number> = {}
  for (const tag of tags) {
    const row = await prisma.tag.upsert({ where: { slug: tag.slug }, update: {}, create: tag })
    result[tag.slug] = row.id
  }
  return result
}

async function seedVendors() {
  const vendors = [
    { name: 'RoboTech Solutions', website: 'https://robotech.example.com', country: 'Россия', description: 'Разработчик автономных мобильных роботов для складов и производств' },
    { name: 'AutoLogistics', website: 'https://autologistics.example.com', country: 'Китай', description: 'Производитель AGV и систем складской автоматизации' },
    { name: 'SkyInventory', website: 'https://skyinventory.example.com', country: 'Россия', description: 'Дроны для инвентаризации складов и торговых залов' },
    { name: 'MediBot Systems', website: 'https://medibot.example.com', country: 'Германия', description: 'Сервисные роботы для медицинских учреждений' },
    { name: 'CleanMatic', website: 'https://cleanmatic.example.com', country: 'Южная Корея', description: 'Роботы для уборки коммерческих помещений и терминалов' },
  ]
  // Почему по name: у вендоров нет slug, а имя в тестовых данных уникально.
  const result: Record<string, number> = {}
  for (const vendor of vendors) {
    const existing = await prisma.vendor.findFirst({ where: { name: vendor.name }, select: { id: true } })
    const row = existing ?? (await prisma.vendor.create({ data: vendor, select: { id: true } }))
    result[vendor.name] = row.id
  }
  return result
}

interface SolutionSeed {
  slug: string
  name: string
  vendor: string
  category: string
  description: string
  priceMin: number
  priceMax: number
  pricingModel: 'purchase' | 'lease' | 'raas'
  specs: Array<{ name: string; value: string; unit?: string }>
  // [отрасль, тип объекта | null (вся отрасль), оценка пригодности 0..1]
  applicability: Array<[string, string | null, number]>
  tags: string[]
}

const SOLUTIONS: SolutionSeed[] = [
  {
    slug: 'amr-500-pro', name: 'AMR-500 Pro', vendor: 'RoboTech Solutions', category: 'amr',
    description: 'Автономный мобильный робот для складских операций с грузоподъёмностью 500 кг. SLAM-навигация, работа во флоте до 50 единиц.',
    priceMin: 2500000, priceMax: 3000000, pricingModel: 'purchase',
    specs: [
      { name: 'Грузоподъёмность', value: '500', unit: 'кг' },
      { name: 'Скорость', value: '1.5', unit: 'м/с' },
      { name: 'Время работы от батареи', value: '8', unit: 'ч' },
      { name: 'Время зарядки', value: '1.5', unit: 'ч' },
      { name: 'Тип навигации', value: 'LiDAR + SLAM' },
      { name: 'Габариты', value: '1200x800x300', unit: 'мм' },
    ],
    applicability: [['trade', 'warehouse', 0.95], ['logistics', 'sorting-center', 0.85], ['logistics', 'airport', 0.7]],
    tags: ['lidar-navigation', 'has-api', 'auto-charging', 'fleet-management', 'made-in-russia'],
  },
  {
    slug: 'agv-300-basic', name: 'AGV-300 Basic', vendor: 'AutoLogistics', category: 'agv',
    description: 'Базовая AGV-тележка для транспортировки грузов до 300 кг по QR-разметке. Минимальная стоимость внедрения.',
    priceMin: 1500000, priceMax: 1800000, pricingModel: 'purchase',
    specs: [
      { name: 'Грузоподъёмность', value: '300', unit: 'кг' },
      { name: 'Скорость', value: '1.0', unit: 'м/с' },
      { name: 'Время работы от батареи', value: '6', unit: 'ч' },
      { name: 'Время зарядки', value: '2', unit: 'ч' },
      { name: 'Тип навигации', value: 'QR-коды' },
      { name: 'Габариты', value: '1000x700x280', unit: 'мм' },
    ],
    applicability: [['trade', 'warehouse', 0.85], ['logistics', 'sorting-center', 0.8]],
    tags: ['qr-navigation', 'fleet-management'],
  },
  {
    slug: 'agv-1500-heavy', name: 'AGV-1500 Heavy', vendor: 'AutoLogistics', category: 'agv',
    description: 'Тяжёлая AGV-платформа для паллет до 1500 кг. Подходит для распределительных центров и грузовых терминалов.',
    priceMin: 4200000, priceMax: 5100000, pricingModel: 'purchase',
    specs: [
      { name: 'Грузоподъёмность', value: '1500', unit: 'кг' },
      { name: 'Скорость', value: '1.2', unit: 'м/с' },
      { name: 'Время работы от батареи', value: '10', unit: 'ч' },
      { name: 'Тип навигации', value: 'Магнитная лента + QR' },
      { name: 'Габариты', value: '1800x1100x350', unit: 'мм' },
    ],
    applicability: [['trade', 'warehouse', 0.8], ['logistics', 'airport', 0.75], ['logistics', 'sorting-center', 0.7]],
    tags: ['qr-navigation', 'has-api', 'fleet-management'],
  },
  {
    slug: 'robot-arm-6x', name: 'Robot Arm 6X', vendor: 'RoboTech Solutions', category: 'manipulator',
    description: '6-осевой промышленный манипулятор для паллетирования и сборки. Интеграция с конвейерными линиями.',
    priceMin: 4000000, priceMax: 5000000, pricingModel: 'purchase',
    specs: [
      { name: 'Количество осей', value: '6' },
      { name: 'Грузоподъёмность', value: '10', unit: 'кг' },
      { name: 'Радиус действия', value: '1400', unit: 'мм' },
      { name: 'Повторяемость', value: '±0.05', unit: 'мм' },
      { name: 'Потребляемая мощность', value: '2.5', unit: 'кВт' },
    ],
    applicability: [['trade', null, 0.6], ['logistics', 'sorting-center', 0.65]],
    tags: ['has-api', 'made-in-russia'],
  },
  {
    slug: 'cobot-lite-5', name: 'Cobot Lite 5', vendor: 'RoboTech Solutions', category: 'manipulator',
    description: 'Коллаборативный манипулятор для работы рядом с людьми без защитных ограждений. Упаковка, сортировка мелких товаров.',
    priceMin: 2200000, priceMax: 2600000, pricingModel: 'lease',
    specs: [
      { name: 'Количество осей', value: '6' },
      { name: 'Грузоподъёмность', value: '5', unit: 'кг' },
      { name: 'Радиус действия', value: '900', unit: 'мм' },
      { name: 'Повторяемость', value: '±0.1', unit: 'мм' },
      { name: 'Класс безопасности', value: 'ISO/TS 15066' },
    ],
    applicability: [['trade', 'warehouse', 0.7], ['trade', 'retail-store', 0.5], ['social', 'hospital', 0.4]],
    tags: ['collaborative', 'has-api', 'made-in-russia'],
  },
  {
    slug: 'skyscan-inventory', name: 'SkyScan Inventory', vendor: 'SkyInventory', category: 'drone',
    description: 'Автономный дрон для инвентаризации высотных стеллажей. Сканирует штрихкоды и RFID без остановки склада.',
    priceMin: 1200000, priceMax: 1600000, pricingModel: 'raas',
    specs: [
      { name: 'Время полёта', value: '25', unit: 'мин' },
      { name: 'Высота сканирования', value: '12', unit: 'м' },
      { name: 'Скорость инвентаризации', value: '400', unit: 'паллет/ч' },
      { name: 'Тип навигации', value: 'Визуальная SLAM' },
      { name: 'Точность распознавания', value: '99.5', unit: '%' },
    ],
    applicability: [['trade', 'warehouse', 0.9], ['trade', 'retail-store', 0.6], ['logistics', 'sorting-center', 0.5]],
    tags: ['auto-charging', 'has-api', 'made-in-russia'],
  },
  {
    slug: 'medicart-delivery', name: 'MediCart Delivery', vendor: 'MediBot Systems', category: 'service',
    description: 'Робот-курьер для доставки лекарств, анализов и белья внутри больницы. Ездит на лифтах, открывает двери.',
    priceMin: 3100000, priceMax: 3600000, pricingModel: 'purchase',
    specs: [
      { name: 'Грузоподъёмность', value: '60', unit: 'кг' },
      { name: 'Скорость', value: '1.2', unit: 'м/с' },
      { name: 'Время работы от батареи', value: '12', unit: 'ч' },
      { name: 'Тип навигации', value: 'LiDAR + 3D-камеры' },
      { name: 'Интеграция с лифтами', value: 'Да' },
    ],
    applicability: [['social', 'hospital', 0.95], ['logistics', 'airport', 0.4]],
    tags: ['lidar-navigation', 'auto-charging', 'has-api'],
  },
  {
    slug: 'uv-guard-disinfection', name: 'UV Guard', vendor: 'MediBot Systems', category: 'service',
    description: 'Мобильный робот УФ-дезинфекции палат и операционных. Автономный обход по расписанию.',
    priceMin: 1900000, priceMax: 2300000, pricingModel: 'lease',
    specs: [
      { name: 'Мощность УФ-ламп', value: '320', unit: 'Вт' },
      { name: 'Время обработки палаты', value: '10', unit: 'мин' },
      { name: 'Время работы от батареи', value: '3', unit: 'ч' },
      { name: 'Тип навигации', value: 'LiDAR' },
    ],
    applicability: [['social', 'hospital', 0.9], ['logistics', 'airport', 0.5]],
    tags: ['lidar-navigation', 'auto-charging'],
  },
  {
    slug: 'cleanmatic-t40', name: 'CleanMatic T40', vendor: 'CleanMatic', category: 'service',
    description: 'Поломоечный робот для больших площадей: терминалы, торговые залы, больничные холлы. До 4000 м² за цикл.',
    priceMin: 1700000, priceMax: 2100000, pricingModel: 'raas',
    specs: [
      { name: 'Производительность', value: '2000', unit: 'м²/ч' },
      { name: 'Ширина уборки', value: '70', unit: 'см' },
      { name: 'Время работы от батареи', value: '4', unit: 'ч' },
      { name: 'Объём бака', value: '40', unit: 'л' },
      { name: 'Тип навигации', value: 'LiDAR + 3D-камеры' },
    ],
    applicability: [['logistics', 'airport', 0.95], ['trade', 'retail-store', 0.85], ['social', 'hospital', 0.8], ['other', null, 0.5]],
    tags: ['lidar-navigation', 'auto-charging', 'fleet-management'],
  },
  {
    slug: 'airguide-concierge', name: 'AirGuide Concierge', vendor: 'CleanMatic', category: 'service',
    description: 'Робот-навигатор для пассажиров: подсказывает маршрут к выходу, сопровождает, показывает расписание.',
    priceMin: 2400000, priceMax: 2800000, pricingModel: 'purchase',
    specs: [
      { name: 'Языки интерфейса', value: '12' },
      { name: 'Скорость', value: '0.8', unit: 'м/с' },
      { name: 'Время работы от батареи', value: '10', unit: 'ч' },
      { name: 'Диагональ экрана', value: '21', unit: 'дюйм' },
    ],
    applicability: [['logistics', 'airport', 0.9], ['social', 'hospital', 0.6], ['trade', 'retail-store', 0.5]],
    tags: ['lidar-navigation', 'has-api', 'auto-charging'],
  },
]

async function seedSolutions(
  vendors: Record<string, number>,
  categories: Record<string, number>,
  industries: Record<string, number>,
  objectTypes: Record<string, number>,
  tags: Record<string, number>,
) {
  const result: Record<string, number> = {}

  for (const seed of SOLUTIONS) {
    const vendorId = vendors[seed.vendor]
    const categoryId = categories[seed.category]
    if (!vendorId || !categoryId) {
      throw new Error(`Не найден вендор или категория для ${seed.slug}`)
    }

    const solution = await prisma.robotSolution.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        name: seed.name,
        vendorId,
        categoryId,
        description: seed.description,
        priceMin: seed.priceMin,
        priceMax: seed.priceMax,
        currency: 'RUB',
        pricingModel: seed.pricingModel,
        imageUrl: `/solutions/${seed.slug}.jpg`,
        documentationUrl: `https://docs.example.com/${seed.slug}`,
      },
    })
    result[seed.slug] = solution.id

    // Почему guard по count: у specs нет unique-ключа, createMany без него дублировал бы строки.
    if ((await prisma.solutionSpec.count({ where: { solutionId: solution.id } })) === 0) {
      await prisma.solutionSpec.createMany({
        data: seed.specs.map((spec, index) => ({
          solutionId: solution.id,
          specName: spec.name,
          specValue: spec.value,
          specUnit: spec.unit,
          sortOrder: index + 1,
        })),
      })
    }

    await prisma.solutionApplicability.createMany({
      skipDuplicates: true,
      data: seed.applicability.map(([industrySlug, objectTypeSlug, score]) => {
        const industryId = industries[industrySlug]
        if (!industryId) {
          throw new Error(`Не найдена отрасль ${industrySlug}`)
        }
        const objectTypeId = objectTypeSlug ? objectTypes[objectTypeSlug] : null
        if (objectTypeSlug && !objectTypeId) {
          throw new Error(`Не найден тип объекта ${objectTypeSlug}`)
        }
        return { solutionId: solution.id, industryId, objectTypeId, suitabilityScore: score }
      }),
    })

    await prisma.solutionTag.createMany({
      skipDuplicates: true,
      data: seed.tags.map((tagSlug) => {
        const tagId = tags[tagSlug]
        if (!tagId) {
          throw new Error(`Не найден тег ${tagSlug}`)
        }
        return { solutionId: solution.id, tagId }
      }),
    })
  }

  return result
}

async function seedBenchmarks(objectTypes: Record<string, number>) {
  if ((await prisma.benchmarkObject.count()) > 0) {
    return
  }
  const warehouse = objectTypes['warehouse']
  const airport = objectTypes['airport']
  const hospital = objectTypes['hospital']
  if (!warehouse || !airport || !hospital) {
    throw new Error('Не найдены типы объектов для эталонов')
  }
  await prisma.benchmarkObject.createMany({
    data: [
      {
        objectTypeId: warehouse,
        name: 'Типовой склад 5000 м²',
        description: 'Средний склад e-commerce, 2 смены, ~40 сотрудников',
        data: {
          area_sqm: 5000, employee_count: 40, shifts: 2, operating_hours: 16, monthly_fund: 2400000,
          processes: [
            { name: 'Приёмка товара', hours_day: 8, workers: 5, cost_month: 350000 },
            { name: 'Комплектация заказов', hours_day: 12, workers: 15, cost_month: 900000 },
            { name: 'Инвентаризация', hours_day: 4, workers: 3, cost_month: 120000 },
          ],
        },
      },
      {
        objectTypeId: airport,
        name: 'Региональный аэропорт, 2 млн пасс./год',
        description: 'Один терминал 25 000 м², круглосуточная работа',
        data: {
          area_sqm: 25000, employee_count: 120, shifts: 3, operating_hours: 24, monthly_fund: 7200000,
          processes: [
            { name: 'Уборка терминала', hours_day: 24, workers: 30, cost_month: 1500000 },
            { name: 'Обработка багажа', hours_day: 20, workers: 40, cost_month: 2400000 },
            { name: 'Навигация пассажиров', hours_day: 18, workers: 12, cost_month: 700000 },
          ],
        },
      },
      {
        objectTypeId: hospital,
        name: 'Городская больница на 400 коек',
        description: 'Стационар с 6 корпусами, внутренняя логистика на санитарах',
        data: {
          area_sqm: 18000, employee_count: 350, shifts: 3, operating_hours: 24, monthly_fund: 14000000,
          processes: [
            { name: 'Доставка лекарств и анализов', hours_day: 16, workers: 20, cost_month: 1000000 },
            { name: 'Дезинфекция помещений', hours_day: 8, workers: 12, cost_month: 550000 },
            { name: 'Уборка коридоров', hours_day: 16, workers: 25, cost_month: 1100000 },
          ],
        },
      },
    ],
  })
}

async function seedUsersAndProjects(objectTypes: Record<string, number>, solutions: Record<string, number>) {
  // Почему реальный bcrypt-хеш: логин test@example.com / Test1234! должен работать сразу после seed.
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: await hashPassword('Test1234!'),
      name: 'Иван Петров',
      company: 'ООО «Логистик»',
      role: 'user',
    },
  })

  const warehouse = objectTypes['warehouse']
  if (!warehouse) {
    throw new Error('Не найден тип объекта warehouse')
  }

  let project = await prisma.userProject.findFirst({ where: { userId: user.id, name: 'Склад в Казани' } })
  project ??= await prisma.userProject.create({
    data: {
      userId: user.id,
      objectTypeId: warehouse,
      name: 'Склад в Казани',
      description: 'Автоматизация комплектации и внутренней транспортировки',
      areaSqm: 3000,
      employeeCount: 25,
      shiftCount: 2,
      operatingHours: 14,
      monthlyFund: 1200000,
    },
  })

  if ((await prisma.userProjectProcess.count({ where: { projectId: project.id } })) === 0) {
    await prisma.userProjectProcess.createMany({
      data: [
        { projectId: project.id, processName: 'Комплектация заказов', currentCost: 600000, currentHours: 10, employeeCount: 10, frequency: 'daily', description: 'Сборка заказов по накладным', sortOrder: 1 },
        { projectId: project.id, processName: 'Транспортировка грузов', currentCost: 300000, currentHours: 8, employeeCount: 5, frequency: 'daily', description: 'Перемещение товаров между зонами', sortOrder: 2 },
      ],
    })
  }

  const amr = solutions['amr-500-pro']
  const agv = solutions['agv-300-basic']
  if (amr && agv) {
    await prisma.solutionRating.createMany({
      skipDuplicates: true,
      data: [
        { solutionId: amr, userId: user.id, rating: 5, review: 'Отличная навигация, быстро внедрили' },
        { solutionId: agv, userId: user.id, rating: 4, review: 'Дёшево, но требует разметки' },
      ],
    })
  }
}

async function seedCaseStudies(industries: Record<string, number>, objectTypes: Record<string, number>, solutions: Record<string, number>) {
  if ((await prisma.caseStudy.count()) > 0) {
    return
  }
  const cases = [
    { solution: 'amr-500-pro', industry: 'trade', objectType: 'warehouse', companyName: 'X5 Retail Group', title: 'Автоматизация РЦ в Подмосковье', description: 'Внедрение 20 роботов AMR-500 Pro на распределительном центре', results: { roi_months: 14, savings_pct: 35, robots_count: 20 }, publishedAt: '2025-03-15' },
    { solution: 'agv-300-basic', industry: 'trade', objectType: 'warehouse', companyName: 'Ozon', title: 'Пилот AGV на складе в Твери', description: 'Пилотное внедрение 10 AGV-тележек для внутренней логистики', results: { roi_months: 18, savings_pct: 25, robots_count: 10 }, publishedAt: '2025-06-01' },
    { solution: 'cleanmatic-t40', industry: 'logistics', objectType: 'airport', companyName: 'Аэропорт Казань', title: 'Роботизированная уборка терминала', description: '4 робота CleanMatic T40 заменили ночную смену уборки', results: { roi_months: 12, savings_pct: 40, robots_count: 4 }, publishedAt: '2025-09-10' },
    { solution: 'medicart-delivery', industry: 'social', objectType: 'hospital', companyName: 'ГКБ №1', title: 'Внутрибольничная доставка', description: '6 роботов MediCart доставляют анализы и лекарства между корпусами', results: { roi_months: 20, savings_pct: 22, robots_count: 6 }, publishedAt: '2026-01-20' },
  ]
  await prisma.caseStudy.createMany({
    data: cases.map((c) => {
      const solutionId = solutions[c.solution]
      if (!solutionId) {
        throw new Error(`Не найдено решение ${c.solution}`)
      }
      return {
        solutionId,
        industryId: industries[c.industry] ?? null,
        objectTypeId: objectTypes[c.objectType] ?? null,
        companyName: c.companyName,
        title: c.title,
        description: c.description,
        results: c.results,
        publishedAt: new Date(c.publishedAt),
      }
    }),
  })
}

async function main() {
  console.info('Seed: справочники...')
  const industries = await seedIndustries()
  const objectTypes = await seedObjectTypes(industries)
  const categories = await seedCategories()
  const tags = await seedTags()

  console.info('Seed: вендоры и решения...')
  const vendors = await seedVendors()
  const solutions = await seedSolutions(vendors, categories, industries, objectTypes, tags)

  console.info('Seed: эталонные объекты, пользователи, кейсы...')
  await seedBenchmarks(objectTypes)
  await seedUsersAndProjects(objectTypes, solutions)
  await seedCaseStudies(industries, objectTypes, solutions)

  console.info('Seed завершён. Тестовый пользователь: test@example.com / Test1234!')
}

main()
  .catch((error: unknown) => {
    console.error('Seed завершился с ошибкой:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
