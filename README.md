# 🦆 TovarkaDuck — Telegram Mini App

Преміальний магазин у вигляді Telegram Mini App. Next.js 15 (App Router) + TypeScript +
Tailwind CSS + Prisma/PostgreSQL для основного застосунку, окремий легкий сервіс на
Node.js/Express для Telegram-бота (вебхук + сповіщення).

---

## 1. Структура проєкту

```
tovarkaduck/
├── .env.example                 # приклад змінних середовища (без реальних токенів)
├── docker-compose.yml           # локальний PostgreSQL для розробки
├── package.json                 # Next.js застосунок
├── next.config.mjs
├── tailwind.config.ts           # преміальна кольорова палітра + Telegram theme tokens
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma             # повна схема БД (товари, категорії, замовлення, юзери...)
│   └── seed.ts                   # демо-дані + створення першого адміна
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # root layout, підключення Telegram WebApp SDK
│   │   ├── globals.css            # глобальні стилі, CSS-змінні теми Telegram
│   │   ├── page.tsx                # Головна сторінка
│   │   ├── catalog/page.tsx        # Каталог (пошук, фільтри, категорії)
│   │   ├── product/[id]/page.tsx   # Сторінка товару
│   │   ├── cart/page.tsx           # Кошик
│   │   ├── checkout/page.tsx       # Оформлення замовлення
│   │   ├── profile/page.tsx        # Профіль (замовлення, адреси, налаштування)
│   │   ├── favorites/page.tsx      # Обране
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx          # захист адмін-розділу (перевірка JWT)
│   │   │   ├── login/page.tsx      # вхід адміністратора
│   │   │   ├── page.tsx            # дашборд/статистика
│   │   │   ├── products/           # список / створення / редагування товарів
│   │   │   ├── categories/page.tsx # керування категоріями
│   │   │   └── orders/page.tsx     # перегляд і зміна статусу замовлень
│   │   │
│   │   └── api/                    # Backend: Next.js Route Handlers (REST API)
│   │       ├── auth/telegram/route.ts     # валідація initData, upsert User
│   │       ├── admin/login/route.ts       # логін адміна → JWT
│   │       ├── products/route.ts          # GET список / POST створення (admin)
│   │       ├── products/[id]/route.ts     # GET / PATCH / DELETE товару
│   │       ├── categories/route.ts        # GET / POST категорій
│   │       ├── categories/[id]/route.ts   # PATCH / DELETE категорії
│   │       ├── orders/route.ts            # POST створення замовлення, GET список (admin)
│   │       ├── orders/[id]/route.ts       # GET / PATCH статусу (admin)
│   │       ├── promo/validate/route.ts    # перевірка промокоду
│   │       ├── favorites/route.ts         # серверна синхронізація обраного
│   │       ├── user/orders/route.ts       # історія замовлень юзера
│   │       └── stats/route.ts             # статистика для адмін-дашборду
│   │
│   ├── components/                 # ProductCard, Banner, BottomNav, Header, ...
│   │   └── admin/ProductForm.tsx   # спільна форма створення/редагування товару
│   ├── context/                    # TelegramContext, CartContext, FavoritesContext
│   ├── lib/                        # prisma, jwt, telegramAuth, telegramNotify, validation...
│   └── types/                      # спільні TypeScript-типи
│
└── bot/                            # ОКРЕМИЙ сервіс Node.js + Express для Telegram-бота
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── server.ts               # Express-сервер, /webhook/telegram, /health
        ├── bot.ts                  # обробка апдейтів, /start з кнопкою Mini App
        └── setWebhook.ts           # одноразовий скрипт реєстрації вебхука
```

**Чому два сервіси?** Next.js Route Handlers (`src/app/api/**`) — це і є backend
застосунку (заміна класичного Express-сервера, з тими самими можливостями: валідація,
Prisma, JWT). Окремий `bot/` на чистому Express обробляє вхідні апдейти від Telegram
(вебхук) та надсилає користувачу кнопку "Відкрити магазин" — це те місце, де класичний
Express явно доречний, оскільки Telegram стукає саме на нього напряму.
Сповіщення адміну про нове замовлення надсилаються прямо з Next.js API (`lib/telegramNotify.ts`)
через Telegram Bot API — це не потребує окремого сервера і працює одразу.

---

## 2. Технології

- **Next.js 15** (App Router, Route Handlers, Server/Client Components)
- **TypeScript** — строгий режим
- **Tailwind CSS** — кастомна преміальна палітра (`duck-gold`, `duck-ink`, ...) + CSS-змінні,
  що підхоплюють `Telegram.WebApp.themeParams` (світла/темна тема синхронізується автоматично)
- **Telegram Mini Apps SDK** — офіційний `telegram-web-app.js`, обгорнутий у `TelegramContext`
  (MainButton, BackButton, HapticFeedback, ThemeParams, initData)
- **PostgreSQL + Prisma ORM** — вся робота з БД лише через Prisma (параметризовані запити →
  захист від SQL-ін’єкцій "з коробки")
- **Node.js + Express** — окремий сервіс `bot/` для Telegram-вебхука
- **JWT (jsonwebtoken + bcryptjs)** — авторизація адмін-панелі
- **Zod** — валідація всіх вхідних даних API

---

## 3. Встановлення та запуск (локально)

### 3.1. Передумови
- Node.js 20+
- PostgreSQL (локально або через Docker)

### 3.2. Клонування та встановлення залежностей

```bash
cd tovarkaduck
npm install

cd bot
npm install
cd ..
```

### 3.3. Налаштування бази даних

```bash
# Запустити локальний PostgreSQL через Docker
docker compose up -d

# Скопіювати приклад змінних середовища
cp .env.example .env
```

Відкрийте `.env` і заповніть реальні значення (детально — розділ 5 нижче).
**Ніколи не комітьте `.env` у git.**

```bash
# Застосувати схему БД
npx prisma migrate dev --name init

# Заповнити демо-даними + створити першого адміна (логін/пароль з .env)
npm run db:seed
```

### 3.4. Запуск застосунку

```bash
npm run dev
```

Застосунок буде доступний на `http://localhost:3000`.
Адмін-панель: `http://localhost:3000/admin/login` (логін/пароль — `ADMIN_LOGIN` /
`ADMIN_PASSWORD` з `.env`, застосовані під час `db:seed`).

### 3.5. Запуск бот-сервісу (окремо)

```bash
cd bot
cp ../.env.example .env   # або створіть окремий .env з тими самими TELEGRAM_* змінними
npm run dev
```

Сервіс підніметься на порту з `BOT_SERVICE_PORT` (за замовчуванням `4000`) і слухатиме
`POST /webhook/telegram`.

Для локальної розробки Telegram не може достукатись до `localhost` — використайте тунель
(наприклад `ngrok http 4000`) і зареєструйте отриманий публічний URL:

```bash
npm run set-webhook -- https://your-ngrok-url.ngrok-free.app
```

У продакшені виконайте цю ж команду один раз після деплою бот-сервісу, вказавши реальний
публічний домен.

---

## 4. Деплой (коротко)

1. **PostgreSQL** — будь-який керований хостинг (Neon, Supabase, RDS, Railway тощо).
2. **Next.js застосунок** — Vercel / будь-який Node-хостинг. Обов'язково виставте всі
   змінні з `.env.example` у налаштуваннях середовища хостингу.
3. **bot/** — окремий невеликий Node-процес (Railway, Render, Fly.io, VPS з PM2 тощо),
   слухає `/webhook/telegram`. Виставте `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`,
   `NEXT_PUBLIC_APP_URL`, `BOT_SERVICE_PORT`.
4. Після деплою: `npm run set-webhook -- https://ваш-бот-домен` в директорії `bot/`.
5. У `@BotFather`: `/setmenubutton` → вкажіть URL вашого Next.js застосунку, щоб кнопка
   меню бота відкривала Mini App.

---

## 5. Підключення Telegram-бота через змінні середовища

**Токен бота ніколи не вбудовується у код.** Він читається виключно з
`process.env.TELEGRAM_BOT_TOKEN` у двох місцях:
- `src/lib/telegramNotify.ts` (Next.js) — надсилання сповіщень адміну про нові замовлення;
- `bot/src/bot.ts` (Express-сервіс) — обробка `/start` та вебхука.

### Кроки:

1. Створіть бота через [@BotFather](https://t.me/BotFather) командою `/newbot`.
2. Скопіюйте виданий токен у `TELEGRAM_BOT_TOKEN` у вашому `.env` (і `bot/.env`).
3. Дізнайтесь свій `chat_id` (або `chat_id` групи адмінів) через
   [@userinfobot](https://t.me/userinfobot) і вкажіть його в `TELEGRAM_ADMIN_CHAT_ID`.
4. Придумайте випадковий рядок і вкажіть у `TELEGRAM_WEBHOOK_SECRET` — Telegram
   надсилатиме його в заголовку `X-Telegram-Bot-Api-Secret-Token`, а `bot/src/server.ts`
   перевіряє його на кожному запиті, щоб ніхто сторонній не міг слати фейкові апдейти.
5. Вкажіть `NEXT_PUBLIC_APP_URL` — публічний URL вашого Mini App (потрібен, щоб кнопка
   "Відкрити магазин" у боті відкривала саме ваш застосунок).
6. У `@BotFather`: `/mybots` → ваш бот → `Bot Settings` → `Menu Button` → вкажіть той
   самий `NEXT_PUBLIC_APP_URL`.

Приклад `.env` — див. файл `.env.example` у корені проєкту (там усі змінні з коментарями
українською).

---

## 6. Безпека — що вже реалізовано

- **JWT** для адмін-сесій (`src/lib/jwt.ts`), з обов'язковим `JWT_SECRET` (застосунок не
  запуститься без нього — немає "тихого" підпису undefined-секретом).
- **Валідація всіх вхідних даних** через Zod (`src/lib/validation.ts`) на кожному API-роуті.
- **Перевірка підпису Telegram initData** (`src/lib/telegramAuth.ts`) — HMAC-SHA256 за
  офіційною специфікацією Telegram, з перевіркою `auth_date` проти replay-атак.
- **Захист від SQL-ін'єкцій** — весь доступ до БД виключно через Prisma Client
  (параметризовані запити, жодних сирих SQL-рядків з інтерпольованими значеннями).
- **Ціни та наявність товару перераховуються на сервері** при оформленні замовлення
  (`src/app/api/orders/route.ts`) — клієнт не може підмінити суму замовлення.
- **Списання складу відбувається в Prisma-транзакції** — виключає race condition при
  одночасних замовленнях останньої одиниці товару.
- **Перевірка секретного токена вебхука** (`bot/src/server.ts`) — сторонні запити на
  `/webhook/telegram` без правильного `X-Telegram-Bot-Api-Secret-Token` відхиляються.
- **Немає hard-coded токенів/секретів** у коді — усі беруться з `process.env.*`.

---

## 7. Дизайн

Кольорова палітра побудована навколо фірмового "duck-gold" (#F5B301) на глибокому
темному тлі (#0E1116) — преміальний, дорогий вигляд, що добре читається і в світлій, і в
темній темі Telegram. Кольори автоматично підлаштовуються під `Telegram.WebApp.themeParams`
через CSS-змінні `--tg-*` (див. `TelegramContext.tsx` і `globals.css`), тож інтерфейс
одразу відповідає обраній користувачем темі Telegram.

> **Примітка щодо стилю каналу @tovarkaduck:** у мене немає доступу до реального вмісту
> цього приватного/невідомого каналу, тому кольори й фірмовий стиль (золото + антрацит,
> заокруглені картки, "качина" плашка знижки) — це моя дизайнерська інтерпретація
> преміального бренду з качкою в основі. Якщо у вас є фірмові кольори/логотип каналу —
> надішліть HEX-коди або скріншот, і я миттєво підправлю `tailwind.config.ts` та
> `globals.css` під них.

---

## 8. Що можна розширити далі

- Реальне завантаження фото (зараз адмінка приймає URL зображення; легко додати
  завантаження у S3/Cloudinary й підставляти отриманий URL).
- Push-повідомлення користувачам про зміну статусу замовлення (той самий `bot/` сервіс,
  просто ще один виклик `sendMessage` при `PATCH /api/orders/:id`).
- Ролі адміністраторів (`Admin.role` вже є в схемі — `OWNER` / `MANAGER`) для розмежування
  прав у самій адмінці.
