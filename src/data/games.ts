/**
 * Ігри сайту. Каталог береться з платформи: файл src/data/games.generated.json створює команда
 * `npm run export:games` у репозиторії klitynka-platform (тексти, ціни, статуси й посилання «Замовити»
 * живуть там, у content/site/games.json). Тут лише те, що стосується вигляду сайту: колір і жанр
 * генетичного відбитка (dna) і заголовок для пошуку. Покроково: docs/ADD-GAME.md.
 *
 * Під час збірки файл перевіряється: якщо поля немає або воно неправильне, збірка падає з назвою гри
 * й поля. Заглушка (`mock: true`) завжди показується як «У розробці»: без «Пограти», покупки й калькулятора.
 */

import type { CustomerPrice, DemoWord, Game, GameDna, HexColor, PlanPhase, PromoChannel, ThemeExample } from '@/types';
import generated from './games.generated.json';

/** Вигляд гри на сайті: те, чого немає в платформі. Нова гра з платформи без запису тут зупинить збірку. */
const SITE: Readonly<Record<string, { readonly dna: GameDna; readonly searchTitle?: string }>> = {
  slovovyr: {
    dna: { genre: 'slova', color: '#ee8466' },
    searchTitle: 'Слововир — кросворди українською в Telegram під ключ',
  },
  skladayka: { dna: { genre: 'holovolomky', color: '#8fb8de' } },
  kulkopad: { dna: { genre: 'pamiat', color: '#f2c14e' } },
  duren: {
    dna: { genre: 'druzi', color: '#6fbf8f' },
    searchTitle: 'Дурень — карткова гра в Telegram під ключ',
  },
  tikai: { dna: { genre: 'pamiat', color: '#c79bf2' } },
};

type Raw = Record<string, unknown>;

function fail(game: string, field: string, why: string): never {
  throw new Error(`games.generated.json: гра «${game}», поле ${field}: ${why}`);
}

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const HEX = /^#[0-9a-f]{6}$/i;

function str(g: Raw, id: string, key: string): string {
  const v = g[key];
  if (typeof v !== 'string' || v.trim() === '') fail(id, key, 'потрібен непорожній рядок');
  return v;
}

function num(g: Raw, id: string, key: string): number {
  const v = g[key];
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) fail(id, key, 'потрібне невідʼємне число');
  return v;
}

function strings(g: Raw, id: string, key: string): string[] {
  const v = g[key];
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) fail(id, key, 'потрібен список рядків');
  return v as string[];
}

function range(g: Raw, id: string, key: string): readonly [number, number] {
  const v = g[key];
  if (!Array.isArray(v) || v.length !== 2 || !v.every((x) => typeof x === 'number')) fail(id, key, 'потрібно два числа');
  return [v[0] as number, v[1] as number];
}

function objects<T>(g: Raw, id: string, key: string, keys: readonly string[], optional = false): T[] {
  const v = g[key];
  if (v === undefined && optional) return [];
  if (!Array.isArray(v) || !v.every((x) => isObj(x) && keys.every((k) => k in x))) {
    fail(id, key, `потрібен список обʼєктів з полями ${keys.join(', ')}`);
  }
  return v as T[];
}

function parseGame(raw: unknown, index: number): Game {
  if (!isObj(raw)) fail(String(index), '(гра)', 'потрібен обʼєкт');
  const id = typeof raw['id'] === 'string' ? raw['id'] : fail(String(index), 'id', 'потрібен рядок');
  if (!/^[a-z0-9-]+$/.test(id)) fail(id, 'id', 'лише латиниця, цифри й дефіс');
  const status = raw['status'];
  if (status !== 'available' && status !== 'soon') fail(id, 'status', 'available або soon');
  const mock = raw['mock'] === true;
  const site = SITE[id] ?? fail(id, 'dna', 'додайте колір і жанр відбитка в SITE у src/data/games.ts');

  const theme = raw['theme'];
  if (!isObj(theme) || !['bg', 'ink', 'tile', 'tileInk'].every((k) => typeof theme[k] === 'string' && HEX.test(theme[k] as string))) {
    fail(id, 'theme', 'потрібні кольори bg, ink, tile, tileInk у форматі #rrggbb');
  }
  const economics = raw['economics'];
  if (!isObj(economics) || economics['kind'] !== 'stars') fail(id, 'economics', 'потрібна модель зірок (kind: stars)');
  const customerPrices = objects<CustomerPrice>(raw, id, 'customerPrices', ['label', 'price']);
  if (customerPrices.length === 0) fail(id, 'customerPrices', 'список порожній');

  const orderUrl = raw['orderUrl'];
  if (orderUrl !== undefined && (typeof orderUrl !== 'string' || !orderUrl.startsWith('https://t.me/'))) {
    fail(id, 'orderUrl', 'посилання має починатися з https://t.me/');
  }
  if (status === 'available' && !mock && orderUrl === undefined) fail(id, 'orderUrl', 'у гри, що працює, має бути посилання «Замовити»');
  const botUrl = raw['botUrl'];
  if (botUrl !== undefined && (typeof botUrl !== 'string' || !botUrl.startsWith('https://t.me/'))) {
    fail(id, 'botUrl', 'посилання має починатися з https://t.me/');
  }

  return {
    id,
    status,
    ...(mock ? { mock: true as const } : {}),
    name: str(raw, id, 'name'),
    ...(site.searchTitle ? { searchTitle: site.searchTitle } : {}),
    genre: str(raw, id, 'genre'),
    dna: site.dna,
    tagline: str(raw, id, 'tagline'),
    howItEarns: str(raw, id, 'howItEarns'),
    mechanics: strings(raw, id, 'mechanics'),
    theme: {
      bg: theme['bg'] as HexColor,
      ink: theme['ink'] as HexColor,
      tile: theme['tile'] as HexColor,
      tileInk: theme['tileInk'] as HexColor,
    },
    coverWord: str(raw, id, 'coverWord'),
    priceUah: num(raw, id, 'priceUah'),
    monthlyUah: num(raw, id, 'monthlyUah'),
    customerPrices,
    firstClientDays: range(raw, id, 'firstClientDays'),
    dailyMinutes: range(raw, id, 'dailyMinutes'),
    trafficSource: str(raw, id, 'trafficSource'),
    economics: {
      kind: 'stars',
      payerRate: num(economics, id, 'payerRate'),
      arppuStars: num(economics, id, 'arppuStars'),
      apiCostPerPayerUsd: num(economics, id, 'apiCostPerPayerUsd'),
    },
    includes: strings(raw, id, 'includes'),
    channels: objects<PromoChannel>(raw, id, 'channels', ['title', 'description', 'cost']),
    plan: objects<PlanPhase>(raw, id, 'plan', ['period', 'title', 'tasks']),
    ...(typeof botUrl === 'string' ? { botUrl } : {}),
    ...(Array.isArray(raw['demo']) ? { demo: objects<DemoWord>(raw, id, 'demo', ['clue', 'answer']) } : {}),
    ...(typeof raw['platformId'] === 'string' ? { platformId: raw['platformId'] } : {}),
    ...(typeof orderUrl === 'string' ? { orderUrl } : {}),
    earns: Array.isArray(raw['earns']) ? strings(raw, id, 'earns') : [],
    themeExamples: objects<ThemeExample>(raw, id, 'themeExamples', ['id', 'name', 'colors'], true),
  };
}

function parseCatalog(file: unknown): { cabinetBot: string; games: Game[] } {
  if (!isObj(file) || file['schemaVersion'] !== 1) throw new Error('games.generated.json: потрібна schemaVersion 1');
  const bot = file['cabinetBot'];
  if (typeof bot !== 'string' || !/^[A-Za-z0-9_]{5,32}$/.test(bot)) throw new Error('games.generated.json: cabinetBot — імʼя бота Кабінету');
  const list = file['games'];
  if (!Array.isArray(list) || list.length === 0) throw new Error('games.generated.json: games — непорожній список');
  const games = list.map(parseGame);
  const ids = new Set(games.map((g) => g.id));
  if (ids.size !== games.length) throw new Error('games.generated.json: id ігор повторюються');
  return { cabinetBot: bot, games };
}

const catalog = parseCatalog(generated);

export const GAMES: readonly Game[] = catalog.games;

/** Імʼя бота Кабінету в Telegram (без @): там клієнт замовляє гру й керує нею. */
export const CABINET_BOT: string = catalog.cabinetBot;
