# Business Kit (Vite + Vanilla TypeScript)

Сайт готових Telegram-ботів з планом заробітку.
Структура: **напрями → проєкти → сторінка проєкту**. Дизайн «Денний чат»: світла тема в мові Telegram,
кожен бот у власному кольоровому світі.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # перевірка типів + збірка в dist/
npm run preview    # перегляд готової збірки
```

Потрібен Node.js 20.19+. На хостинг завантажується вміст папки `dist/`.
Маршрути хешеві (`#/c/media`, `#/p/media-downloader`), тож сайт працює на будь-якому
статичному хостингу без додаткових налаштувань.

## Деплой на сервер (статичний сайт, nginx)

Сайт після збірки — лише файли (HTML, CSS, JS), тому на сервері немає Node-процесу й pm2:
nginx віддає папку `/var/www/business-kit`. Node 22 потрібен лише на час збірки.

Перший запуск (один раз):

```bash
# 1. Папка для сайту
sudo mkdir -p /var/www/business-kit && sudo chown deploy:deploy /var/www/business-kit

# 2. Код
git clone git@github-business-kit:MishaTomash/business-kit.git ~/apps/business-kit
cd ~/apps/business-kit
cp .env.example .env && nano .env        # VITE_TELEGRAM_URL=https://t.me/<ваш_нік>
nvm install                               # Node з .nvmrc, якщо ще немає
./deploy/update.sh

# 3. nginx (вміст обох файлів — у deploy/nginx.conf.example)
sudo nano /etc/nginx/snippets/business-kit-security.conf
sudo nano /etc/nginx/sites-available/business-kit
sudo ln -s /etc/nginx/sites-available/business-kit /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. HTTPS
sudo certbot --nginx -d business-kit.smartekua.store
```

Оновлення: зміни локально → `git push` → на сервері `~/apps/business-kit/deploy/update.sh`.
Скрипт сам видаляє `node_modules` і кеш після збірки, тож на сервері лишаються лише код і готовий сайт.

## Проєкти

Справжні проєкти (уже працюють у Telegram): **Голос → Текст** (`voice-to-text`),
**TikTok & Instagram Downloader** (`social-downloader`) і гра **Слововир** (`slovovyr`).
AI Photo Studio, Edu Platform і Mini App Store є заглушками зі статусом `'soon'`.

Як додати нового бота, покроково: **[docs/ADD-BOT.md](docs/ADD-BOT.md)**.
Новий об'єкт у `src/data/projects.ts` сам з'являється всюди без правок верстки:

- на головній: у плитці свого напряму, окремою кольоровою панеллю й у сцені телефонів hero
  (якщо в нього є `demo`, `screen` або `image`);
- на сторінці напряму: великою карткою з мініатюрою й прогнозом;
- на власній сторінці `#/p/<id>` з калькулятором, планом і карткою покупки.

Напрям без доступних проєктів на головній згортається в рядок «Готуємо: …» з кнопкою «Повідомити мене».

### Коли бот запрацює: фото й посилання

1. Покладіть скріншоти в `public/images/projects/<id>/` (вертикальні, приблизно 590×1280, `.webp` або `.png`).
2. У `src/data/projects.ts` розкоментуйте й заповніть:
   ```ts
   botUrl: 'https://t.me/your_voice_bot',
   image: '/images/projects/voice-to-text/main.webp',
   screenshots: [{ src: '/images/projects/voice-to-text/1.webp', alt: 'Розпізнаний текст голосового' }],
   ```
3. `npm run build`.

Що з'явиться: `botUrl` дає позначку «Працює в Telegram зараз» і кнопки «Спробувати бота»;
`image` замінює демо-екран справжнім скріншотом у всіх телефонах (без підпису «Демо»);
`screenshots` додає галерею «Як виглядає бот», яку на телефоні гортають пальцем.
Справжні скріншоти найкраще знімають страх «мене обдурять», тож додайте їх, щойно зможете.

## Блок реальної статистики (необов'язково)

У `src/data/site.ts` є масив `PROOF`. Поки він порожній, блок «Цифри наших ботів» на головній
не показується. Заповнюйте лише справжніми даними з адмін-панелі ботів, з періодом:

```ts
export const PROOF: readonly ProofStat[] = [
  { value: '1 240', label: 'людей скористалися «Голос → Текст» у вересні' },
  { value: '3 180 ⭐', label: 'заробили наші боти за вересень' },
];
```

## Дизайн: кольори, шрифти, кольорові світи

| Що | Де |
|---|---|
| Кольори сайту, розміри шрифтів, відступи, радіуси, тіні, рух | `src/styles/tokens.css` |
| Шрифти (файли й підмножини) | `src/styles/fonts.css` |
| Кольоровий світ бота | `theme` у проєкті (`src/data/projects.ts`), див. docs/ADD-BOT.md |
| Колір напряму (плитка й іконка) | `accent` у `src/data/categories.ts` |
| Знак логотипа | `public/favicon.svg`, `src/components/ui.ts` (`logoMark`) і шапка/футер в `index.html` |
| Огляд усієї системи | `npm run dev` → http://localhost:5173/lab/system.html |

**Змінити колір.** Усі кольори є змінними в `tokens.css`: наприклад, `--c-tg-deep` (кнопки й посилання)
або `--c-star` (золото Stars). Перевіряйте контраст тексту: щонайменше 4,5 : 1.

**Змінити шрифт.** Шрифти лише локальні (CSP забороняє зовнішні): встановіть пакет
`@fontsource-variable/<назва>`, замініть шляхи до файлів у `fonts.css` (лише `latin` і `cyrillic`)
і назви в `--f-display` / `--f-text` у `tokens.css`. Перевірте літери ґ, є, і, ї та апостроф.
Кириличні файли шрифтів сайт попередньо завантажує сам (плагін у `vite.config.ts`).

Папка `lab/` (сторінка дизайн-системи) у збірку сайту не потрапляє.

## Як додати напрям

`src/data/categories.ts`: додайте об'єкт:

```ts
{ id: 'finance', name: 'Фінанси', description: '…', icon: 'coins', accent: '#22d3ee', art: 'shop' }
```

`id` пишеться латиницею й потрапляє в адресу (`#/c/finance`).

## Інші налаштування

| Що | Де |
|---|---|
| Посилання на Telegram | `.env` → `VITE_TELEGRAM_URL` |
| Термін запуску (показується як обіцянка) | `src/data/site.ts` → `DEPLOY_TIME` |
| Курс виплати Stars і курс гривні | `src/data/site.ts` → `RATES` |
| Кількість людей для прогнозів у списках | `src/data/site.ts` → `PREVIEW_TRAFFIC` |
| «Що в коробці», FAQ | `src/data/site.ts` → `OFFERINGS`, `FAQ` |
| «Шлях за 30 днів», «Що потрібно від вас» | `src/data/site.ts` → `JOURNEY`, `REQUIREMENTS` |
| Доступні іконки | `src/lib/icons.ts` |

Діапазони «перший клієнт» і «хвилин на день» на головній рахуються самі з доступних ботів.

## Структура коду

```
src/
├── main.ts            маршрутизація → рендер сторінки → анімації
├── router.ts          хеш-маршрути та href-хелпери
├── types/index.ts     типи: Category, Project, ProjectTheme, JourneyStep…
├── data/              увесь контент (categories, projects, site) + index.ts з пошуком
├── views/             сторінки: home, category, project, notFound
├── components/        cards, phone, calculator, faq, navbar, ui
├── store/store.ts     маленький типізований стор (свій у кожного калькулятора)
├── lib/               dom (безпечні шаблони), economics, theme, rotator, анімації, іконки, формати
└── styles/            fonts → tokens → base → motion → components/*
docs/ADD-BOT.md        як додати бота
lab/system.html        огляд дизайн-системи (не входить у збірку)
```
