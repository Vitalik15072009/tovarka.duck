import { PrismaClient, StockStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🦆 Seeding TovarkaDuck database...");

  // --- Admin account -----------------------------------------------------
  const adminLogin = process.env.ADMIN_LOGIN || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "change-me-strong-password";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { login: adminLogin },
    update: {},
    create: { login: adminLogin, passwordHash, role: "OWNER" },
  });

  // --- Categories ----------------------------------------------------------
  const categories = [
    { name: "Одяг", slug: "clothing", icon: "👕", sortOrder: 1 },
    { name: "Взуття", slug: "shoes", icon: "👟", sortOrder: 2 },
    { name: "Аксесуари", slug: "accessories", icon: "🧢", sortOrder: 3 },
    { name: "Сумки", slug: "bags", icon: "🎒", sortOrder: 4 },
    { name: "Технології", slug: "tech", icon: "🎧", sortOrder: 5 },
  ];

  const createdCategories = [];
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    createdCategories.push(cat);
  }

  const [clothing, shoes, accessories, bags, tech] = createdCategories;

  // --- Products --------------------------------------------------------------
  const products = [
    {
      title: "Oversize худі TovarkaDuck Premium",
      description:
        "Щільне флісове худі преміальної щільності 380 г/м². Вільний крій, м'яка підкладка, вишита качка на грудях. Ідеально для холодної погоди та вуличного стилю.",
      specs: { Матеріал: "80% бавовна, 20% поліестер", Щільність: "380 г/м²", Виробництво: "Україна" },
      price: 1490,
      oldPrice: 1990,
      discountPct: 25,
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: [
        { name: "Чорний", hex: "#161a21" },
        { name: "Бежевий", hex: "#e8dcc8" },
      ],
      rating: 4.8,
      ratingCount: 214,
      stockStatus: StockStatus.IN_STOCK,
      stockQty: 42,
      isFeatured: true,
      isPromo: true,
      categoryId: clothing.id,
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
        "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800",
      ],
    },
    {
      title: "Кросівки TovarkaDuck Runner",
      description:
        "Легкі бігові кросівки з дихаючою сіткою та амортизуючою підошвою. Підходять для щоденного носіння та тренувань.",
      specs: { "Матеріал верху": "Текстильна сітка", "Підошва": "EVA + гума", "Вага": "260 г" },
      price: 2290,
      oldPrice: null,
      discountPct: null,
      sizes: ["38", "39", "40", "41", "42", "43", "44"],
      colors: [
        { name: "Білий", hex: "#f7f4ee" },
        { name: "Чорний", hex: "#161a21" },
        { name: "Золотий", hex: "#f5b301" },
      ],
      rating: 4.6,
      ratingCount: 98,
      stockStatus: StockStatus.LOW_STOCK,
      stockQty: 6,
      isFeatured: true,
      isNew: true,
      categoryId: shoes.id,
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      ],
    },
    {
      title: "Кепка TovarkaDuck Classic",
      description: "Класична кепка з вишитим логотипом качки. Регулюється застібкою ззаду.",
      specs: { Матеріал: "100% бавовна", Розмір: "Універсальний (56-60)" },
      price: 590,
      oldPrice: 790,
      discountPct: 25,
      sizes: [],
      colors: [
        { name: "Чорний", hex: "#161a21" },
        { name: "Хакі", hex: "#5c5a42" },
      ],
      rating: 4.9,
      ratingCount: 340,
      stockStatus: StockStatus.IN_STOCK,
      stockQty: 120,
      isPromo: true,
      categoryId: accessories.id,
      images: ["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800"],
    },
    {
      title: "Рюкзак TovarkaDuck Urban 20L",
      description:
        "Міський рюкзак з відділенням для ноутбука до 15.6\", водовідштовхувальна тканина, ергономічні лямки.",
      specs: { Обʼєм: "20 л", Матеріал: "Нейлон 900D", Відділення: "Ноутбук до 15.6\"" },
      price: 1690,
      oldPrice: null,
      discountPct: null,
      sizes: [],
      colors: [{ name: "Чорний", hex: "#161a21" }],
      rating: 4.7,
      ratingCount: 76,
      stockStatus: StockStatus.IN_STOCK,
      stockQty: 30,
      isNew: true,
      categoryId: bags.id,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800"],
    },
    {
      title: "Навушники TovarkaDuck Pulse TWS",
      description: "Бездротові навушники з активним шумозаглушенням та часом роботи до 30 годин з кейсом.",
      specs: { Тип: "TWS", ANC: "Так", "Час роботи": "8 год (30 год з кейсом)" },
      price: 1290,
      oldPrice: 1690,
      discountPct: 24,
      sizes: [],
      colors: [{ name: "Чорний", hex: "#161a21" }, { name: "Білий", hex: "#f7f4ee" }],
      rating: 4.5,
      ratingCount: 152,
      stockStatus: StockStatus.OUT_OF_STOCK,
      stockQty: 0,
      isPromo: true,
      categoryId: tech.id,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800"],
    },
    {
      title: "Футболка TovarkaDuck Basic",
      description: "Базова бавовняна футболка з мінімалістичним принтом качки на рукаві.",
      specs: { Матеріал: "100% бавовна", Щільність: "180 г/м²" },
      price: 490,
      oldPrice: null,
      discountPct: null,
      sizes: ["S", "M", "L", "XL"],
      colors: [
        { name: "Білий", hex: "#f7f4ee" },
        { name: "Чорний", hex: "#161a21" },
        { name: "Оливковий", hex: "#6b7a4f" },
      ],
      rating: 4.4,
      ratingCount: 88,
      stockStatus: StockStatus.IN_STOCK,
      stockQty: 200,
      isNew: true,
      categoryId: clothing.id,
      images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"],
    },
  ];

  for (const p of products) {
    const { images, colors, ...rest } = p;
    const existing = await prisma.product.findFirst({ where: { title: rest.title } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        ...rest,
        images: { create: images.map((url, i) => ({ url, sortOrder: i })) },
        colors: { create: colors },
      },
    });
  }

  console.log("✅ Seed complete. Admin login:", adminLogin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
