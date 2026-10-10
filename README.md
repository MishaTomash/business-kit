# Клітинка: ігри в Telegram під ключ (Vite + Vanilla TypeScript)

Сайт продає ігри в Telegram (Mini App) під ключ для власників каналів, освітніх проєктів і спільнот.
Головна розповідає про бізнес, ігри живуть в окремій вкладці.

- `/` — головна: як заробляє власник гри, як заробляємо ми, чому це вигідно, що ми надаємо.
- `/games` — каталог ігор.
- `/games/<id>` — сторінка гри.
- `/offer` — публічна оферта, `/privacy` — політика конфіденційності (тексти в `content/legal/*.md`).
- `/guides/<id>` — довідкові статті (тексти в `content/guides/*.md`).

Дизайн «ДНК» (перенесення триває, гілка `dna`, план у `docs/DNA-STAGES.md`): темна палітра «Ґрунт / Слонова кістка / Корал», золото лише для зірок, шрифти Rubik 800 і Golos Text 400/600.

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # перевірка типів + збірка + prerender у dist/
npm run preview    # перегляд готової збірки
npm test           # тести генетичного відбитка (порівняння з design/ka-lib.cjs), Node 22.6+
```

Потрібен Node.js 20.19+. На хостинг завантажується вміст папки `dist/`.

## Адреси й prerender

Адреси звичайні, без `#`. Під час `npm run build` для кожної сторінки пишеться готовий HTML
(`dist/index.html`, `dist/games/index.html`, `dist/games/<id>/index.html`, `dist/offer/index.html`,
`dist/privacy/index.html`, `dist/404.html`) з власними
`<title>`, описом і og-мета. Тому:

- посилання на гру в Telegram показує прев'ю саме цієї гри;
- сайт читається повністю без JavaScript;
- пошуковики бачать вміст одразу (`sitemap.xml` і `robots.txt` теж генеруються).

Домен сайту: **https://klitynka.online**. Адреса береться зі змінної `VITE_SITE_URL` у `.env`
(запасне значення в коді: `DEFAULT_SITE_URL` у `src/data/brand.ts`) і використовується для `canonical`,
`og:url`, абсолютних адрес `og:image`, `sitemap.xml` і `robots.txt`. Після зміни адреси потрібна нова збірка.

nginx віддає ці файли через `try_files $uri $uri/index.html =404` і `error_page 404 /404.html`
(див. `deploy/nginx.conf.example`): адреса без слеша відповідає 200 одразу, адреса зі слешем веде на неї,
а невідома адреса отримує справжню сторінку 404 зі статусом 404.

Старі адреси перенаправляються самі: `#/` → `/`, `#/games…` → `/games…`, `#/p/<id>` → `/games/<id>`
(неіснуюча гра покаже 404), `#/c/<будь-що>` → `/games`.

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
cp .env.example .env && nano .env        # VITE_TELEGRAM_URL і VITE_SITE_URL
nvm install                               # Node з .nvmrc, якщо ще немає
./deploy/update.sh

# 3. nginx (вміст обох файлів — у deploy/nginx.conf.example)
sudo nano /etc/nginx/snippets/business-kit-security.conf
sudo nano /etc/nginx/sites-available/business-kit
sudo ln -s /etc/nginx/sites-available/business-kit /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 4. HTTPS
sudo certbot --nginx -d klitynka.online
```

Оновлення: зміни локально → `git push` → на сервері `~/apps/business-kit/deploy/update.sh`.
Скрипт сам видаляє `node_modules` і кеш після збірки, тож на сервері лишаються лише код і готовий сайт.

## SEO

План, аудит і запити для кожної сторінки: **[docs/SEO-PLAN.md](docs/SEO-PLAN.md)**, рішення й прогрес: `docs/SEO-PROGRESS.md`.

| Що | Де |
| --- | --- |
| `<title>` і description сторінок | `src/data/home.ts`, `src/data/pages.ts`, `searchTitle` гри в `src/data/games.ts` |
| Дати для `<lastmod>` у sitemap | `src/data/seo.ts` (міняйте лише при змістовній зміні сторінки) |
| Розмітка Schema.org (JSON-LD) | `src/lib/schema.ts`, підключення в `meta.jsonLd` кожної сторінки |
| Довідкові статті `/guides/<id>` | текст у `content/guides/*.md`, список і мета в `src/data/guides.ts` |

Числа в статтях не пишуться вручну: мітки `{{HOLD_DAYS}}`, `{{MIN_WITHDRAW}}`, `{{STAR_USD}}` та інші
підставляються з `src/data/site.ts`. Нова стаття: файл у `content/guides`, запис у `SOURCES` (`src/data/guides.ts`),
вона сама потрапить у prerender і sitemap.

## Як додати гру

Покроково, разом зі сторінкою гри й картинкою прев'ю: **[docs/ADD-GAME.md](docs/ADD-GAME.md)**.

## Дані: що де лежить

| Що | Де |
| --- | --- |
| Назва бренду | `src/data/brand.ts` (єдине місце) |
| Посилання на Telegram і адреса сайту | `.env` → `VITE_TELEGRAM_URL`, `VITE_SITE_URL` (запасна адреса: `DEFAULT_SITE_URL` у `brand.ts`) |
| Оферта й політика конфіденційності | `content/legal/offer.md`, `content/legal/privacy.md` |
| Ціни запуску й підтримки, відсоток зі зірок | `src/data/site.ts` → `PRICING`, `STARS_COMMISSION` |
| Строк запуску | `src/data/site.ts` → `DEPLOY_TIME` |
| Курс виплати зірок і гривні, правила виведення | `src/data/site.ts` → `RATES`, `STARS_RULES` |
| Ігри | `src/data/games.ts` |
| Вміст головної: «Шлях зірки», причини, що надаємо, для кого, запуск, FAQ, біжучий рядок | `src/data/business.ts` |
| Картинки прев'ю посилань | `public/og/` (генератор: `/lab/og.html`) |

Підтверджено власником: запуск 1 500 ₴ разово, підтримка 99 ₴ на місяць, відсоток зі зірок не беремо
(усі зірки йдуть на баланс бота клієнта, доступу до них у нас немає).

### ПІДТВЕРДИТИ

Ці факти позначені в коді коментарем `// ПІДТВЕРДИТИ`. Поки вони не підтверджені, сайт або показує
поточне значення з даних, або ховає питання.

| Що | Де | Що зараз на сайті |
| --- | --- | --- |
| Строк від оплати до запущеної гри | `site.ts` → `DEPLOY_TIME` | «до 2 днів» (рішення власника від 9 жовтня 2026) |
| Скільки часу відповідає підтримка | `business.ts` → FAQ | питання приховане (`answer: null`) |
| Чи робимо ігри на замовлення | `business.ts` → FAQ | питання приховане (`answer: null`) |
| Ціни, механіки й економіка чотирьох заглушок | `games.ts`, коментарі `// MOCK: замінити` | заглушки показані як «У розробці», ціни не показуються |

Щоб показати приховане питання FAQ, впишіть відповідь замість `null`.

### Юридичні тексти

`content/legal/*.md` — звичайний Markdown. Під час збірки його перетворює на HTML невеликий конвертер
(`src/lib/markdown.ts`): заголовки `#`–`###`, абзаци (рядок усередині абзацу стає переносом), списки `-` і `1.`,
таблиці, `**жирний**`, `[посилання](url)`, голі адреси й email. Будь-яка інша конструкція (цитата, код,
зображення, вкладений список) зупиняє збірку з номером рядка, щоб текст не зник мовчки.

Мітки в тексті: `{{BRAND}}` (Клітинка), `{{BRAND_OF}}` (Клітинки), `{{SITE_URL}}` (адреса з `VITE_SITE_URL`).
Дата редакції — рядок `**Редакція від 8 жовтня 2026 року**` під заголовком. Змінюєте текст — змініть дату.

Слово `ПІДТВЕРДИТИ` у цих файлах означає «ще не підтверджено». У режимі `npm run dev` консоль
попереджає про такі місця. **Вони потрапляють на сайт як є**, тож перед запуском замініть їх.
Зараз таких місць у текстах немає.

## Дизайн («ДНК»)

Джерело правди — `design/DESIGN-SPEC.md` і макети `design/pages/*.png` (індекс `design/PAGES.md`).
Живий огляд усіх токенів, компонентів і відбитків: `npm run dev` → `/lab/system.html`.

| Що | Де |
| --- | --- |
| Кольори, шкала тексту, відступи, тривалості руху | `src/styles/tokens.css` |
| Тони секцій (темна, «Шар», світла, коралова) | класи `.tone-layer`, `.tone-light`, `.tone-coral` у `tokens.css` |
| Шрифти: Rubik 800 (заголовки), Golos Text 400/600 (текст) | `src/styles/fonts.css`, пакети `@fontsource/*` |
| Генетичний відбиток гри | `src/lib/fingerprint.ts` (правило), `src/components/fingerprint.ts` (смужка й картка), поле `dna` у `src/data/games.ts` |
| Спіраль і «Шлях зірки» | `src/components/spiral.ts` + `src/lib/spiral.ts`, `src/components/starPath.ts` + `src/lib/star-path.ts` |
| Значки (зірка, стрілка, ≈, логотип) | SVG-спрайт в `index.html` |

### Як змінити колір

Змінюйте лише змінні в `:root` файлу `tokens.css` (`--ground`, `--layer`, `--ivory`, `--lichen`, `--coral`, `--star`…).
Компоненти беруть семантичні змінні (`--bg`, `--fg`, `--fg-muted`, `--accent`), які тони секцій перевизначають,
тож окремих правок у компонентах не треба. Біля кожного кольору в коментарі вказано контраст: новий колір
перевірте на AA (текст ≥ 4,5 : 1, рамки й значки ≥ 3 : 1). Золото `--star` — лише для ★ і сум у зірках.
Після зміни кольорів перегенеруйте прев'ю: `node lab/og-export.mjs` (кольори продубльовані в `lab/og/og.ts`).

### Як змінити шрифти

Шрифти лише локальні (CSP не пускає CDN). Новий шрифт: `npm i @fontsource/<назва>`, у `fonts.css` підключіть
лише потрібні ваги й підмножини latin і cyrillic (cyrillic-ext — тільки якщо потрібен ₴, через `unicode-range`),
оновіть `--font-display` / `--font-text` у `tokens.css` і регулярний вираз preload у `vite.config.ts`.

### Як змінити відбиток

Відбиток рахується з назви, жанру й кольору гри (`dna: { genre, color }`), нічого не зберігається.
Змінити вигляд конкретної гри — змініть `dna.color` (на сусідній відтінок) або жанр. Саме правило
(`src/lib/fingerprint.ts`) — точна копія `design/ka-lib.cjs`; міняйте його лише разом з еталоном.
Перевірка: `npm test` (контрольний приклад спеки, порівняння з ka-lib, унікальність відбитків ігор).
Кольори жанрів — `--genre-*` у `tokens.css` і `GENRE_COLORS` у `src/lib/fingerprint.ts` (тест стежить, щоб збігались).

### Рух

Спіраль ДНК у hero (один rAF-цикл, пауза поза екраном, слабкий режим за спекою: ≤ 4 ГБ пам'яті, ≤ 4 ядра
або < 45 FPS → 12 перекладин і рух лише від скролу), «Шлях зірки» з підсвічуванням кроків (IntersectionObserver),
переходи між сторінками (View Transitions). Лише `transform` і `opacity`. Скрол нативний.
З `prefers-reduced-motion` і без JS усе статичне й читається.

Папка `lab/` (дизайн-система, генератор прев'ю) у збірку не потрапляє.

## Структура коду

```
src/
├── main.ts            браузер: перший показ готового HTML, переходи без перезавантаження
├── router.ts          адреси, href-хелпери, перенаправлення старих hash-адрес
├── pages.ts           маршрут → сторінка (спільне для браузера й prerender)
├── prerender.ts       список сторінок для статичного HTML
├── types/index.ts     типи: Game, StarStep, Reason, FaqItem…
├── data/              brand, site, games, business + index.ts з пошуком
├── views/             home, games, game, legal, guide, notFound, common (спільна поведінка)
├── components/        spiral, starPath, fingerprint, faq, calculator, ui
tests/                 тести відбитка (npm test)
├── lib/               значки (icons), відбиток (fingerprint), рух (spiral, star-path, scroll),
│                      economics (калькулятор), format, theme, markdown (оферта й політика), dom (безпечні шаблони)
└── styles/            fonts → tokens → base → components → layout → fingerprint → spiral → path →
                       home/games/game/legal/calculator → motion
docs/ADD-GAME.md       як додати гру
content/legal/         оферта й політика конфіденційності (Markdown)
content/guides/        довідкові статті /guides/<id> (Markdown)
lab/                   system.html, og.html + og-export.mjs, tg-preview.mjs (макет прев'ю в Telegram) (не входить у збірку)
```
