# Business Kit (Vite + Vanilla TypeScript)

Сайт готових Telegram-ботів з планом заробітку.
Структура: **напрями → проєкти → сторінка проєкту**.

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

Справжні проєкти: **Голос → Текст** (`voice-to-text`) та **Instagram / TikTok Downloader**
(`social-downloader`). Решта (AI Photo Studio, Edu Platform, Mini App Store) є заглушками
зі статусом `'soon'`: їх видно з позначкою «Скоро», але не можна відкрити. Видаліть їх,
якщо не плануєте.

### Коли бот запрацює: фото й посилання (3 кроки)

1. Покладіть скріншоти в папку проєкту:
   `public/images/projects/voice-to-text/` або `public/images/projects/social-downloader/`.
   Формат `.webp` або `.png`, вертикальні скріншоти телефона (приблизно 590×1280).
2. У `src/data/projects.ts` у потрібному проєкті розкоментуйте рядки й поставте свої значення:
   ```ts
   botUrl: 'https://t.me/your_voice_bot',
   image: '/images/projects/voice-to-text/main.webp',
   screenshots: [
     { src: '/images/projects/voice-to-text/1.webp', alt: 'Розпізнаний текст голосового' },
   ],
   ```
3. `npm run build` і завантажте `dist/` на хостинг.

Що з'явиться на сайті:
- `botUrl`: зелена позначка «Бот працює: відкрити в Telegram» під назвою і кнопка «Спробувати бота»;
- `image`: справжній скріншот замість телефона-макета й мініатюри в списку;
- `screenshots`: блок «Як виглядає бот» з галереєю, яку можна гортати.

Кожне поле незалежне: можна додати лише посилання, а фото пізніше.

## Як додати напрям

`src/data/categories.ts`: додайте об'єкт:

```ts
{ id: 'finance', name: 'Фінанси', description: '…', icon: 'coins', accent: '#22d3ee' }
```

`id` пишеться латиницею й потрапляє в адресу (`#/c/finance`). Напрям без проєктів
показується як «Скоро» з кнопкою «Повідомити мене».

## Як додати проєкт

`src/data/projects.ts`: скопіюйте один об'єкт і заповніть поля:

| Поле | Що це |
|---|---|
| `id`, `categoryId` | адреса проєкту та id напряму, до якого він належить |
| `status` | `'available'` (можна купити) або `'soon'` |
| `name`, `tagline`, `howItEarns` | назва, один рядок опису, як бот заробляє |
| `priceUah`, `monthlyUah` | ціна запуску й щомісячна плата |
| `firstClientDays` | орієнтир днів до першого клієнта, напр. `[3, 10]` |
| `dailyMinutes` | скільки хвилин на день працювати за планом, напр. `[30, 60]` |
| `trafficSource` | звідки люди (для тексту калькулятора) |
| `economics` | припущення калькулятора: частка покупців, середній чек |
| `channels` | де шукати клієнтів (`cost: 'free'` або `'paid'`) |
| `plan` | короткий огляд плану розвитку по етапах |
| `directions` | куди рости далі |
| `includes` | що входить у бота |
| `customerPrices` | ціни для клієнтів усередині бота (таблиця на сторінці проєкту) |
| `demo` | демо-чат у телефоні-макеті |
| `botUrl`, `image`, `screenshots` | посилання на живого бота й справжні фото (див. вище) |

Порожні `channels`, `plan` чи `directions` просто не показуються.
TypeScript підкаже, якщо якесь поле пропущене.

## Картинки

Зараз на сайті власні ілюстрації, намальовані кодом (`src/lib/art.ts`) і в CSS
(телефон з чатом, картки плану й оплати). Вони не потребують файлів і самі
підлаштовуються під колір напряму.

**Демо-чат проєкту:** поле `demo` у `projects.ts`:

```ts
demo: [
  { from: 'user', text: 'vm.tiktok.com/…' },
  { from: 'bot', text: 'Знайшов відео ✓', button: 'Завантажити за 15 ⭐' },
  { from: 'system', text: 'Оплачено 15 ⭐' },
],
```

**Ваші справжні картинки:** покладіть файл у `public/images/` і вкажіть шлях:

- у напрямі: `image: '/images/media.webp'` замінить ілюстрацію на картці;
- у проєкті: `image: '/images/media-bot.webp'` замінить телефон на сторінці проєкту
  справжнім скріншотом бота і стане мініатюрою в списку.

Найкраще працюють скріншоти справжніх ботів: вони одразу додають довіри.
Формат `.webp`, ширина 800–1200 px. Для карток напрямів пропорція 16:9.

**Інші ілюстрації:** `art` у напрямі/проєкті: `'media' | 'ai' | 'voice' | 'education' | 'shop' | 'games'`.

## Інші налаштування

| Що | Де |
|---|---|
| Посилання на Telegram | `.env` → `VITE_TELEGRAM_URL` |
| Термін запуску (показується як обіцянка) | `src/data/site.ts` → `DEPLOY_TIME` |
| Курс виплати Stars і курс гривні | `src/data/site.ts` → `RATES` |
| Кількість людей для прогнозів у списках | `src/data/site.ts` → `PREVIEW_TRAFFIC` |
| Блок «Що ви отримуєте», кроки, FAQ | `src/data/site.ts` |
| Доступні іконки | `src/lib/icons.ts` |

## Структура коду

```
src/
├── main.ts            маршрутизація → рендер сторінки → анімації
├── router.ts          хеш-маршрути та href-хелпери
├── types/index.ts     типи: Category, Project, PlanPhase…
├── data/              увесь контент (categories, projects, site) + index.ts з пошуком
├── views/             сторінки: home, category, project, notFound
├── components/        cards, calculator, faq, navbar, ui
├── store/store.ts     маленький типізований стор (свій у кожного калькулятора)
├── lib/               dom (безпечні шаблони), economics, анімації, іконки, формати
└── styles/            tokens → base → components/*
```
