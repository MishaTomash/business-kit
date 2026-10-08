/**
 * Напрями (категорії) на головній сторінці.
 * Порядок у масиві = порядок на сайті.
 * Категорія без проєктів показується з позначкою «Скоро».
 */

import type { Category } from '@/types';

export const CATEGORIES: readonly Category[] = [
  {
    id: 'media',
    art: 'media',
    name: 'Медіа та контент',
    description: 'Боти, що допомагають людям зберігати відео з TikTok та Instagram.',
    icon: 'download',
    accent: '#3b82f6',
  },
  {
    id: 'ai',
    art: 'ai',
    name: 'AI-сервіси',
    description: 'Нейромережі для голосу, фото й текстів. Розпізнавання й обробка за секунди.',
    icon: 'sparkles',
    accent: '#a78bfa',
  },
  {
    id: 'education',
    art: 'education',
    name: 'Навчання',
    description: 'Курси, квізи й підписки на корисний контент. Дохід щомісяця.',
    icon: 'brain',
    accent: '#f59e0b',
  },
  {
    id: 'shops',
    art: 'shop',
    name: 'Магазини',
    description: 'Продаж товарів прямо в Telegram, без сайту й складних налаштувань.',
    icon: 'bag',
    accent: '#10b981',
  },
  {
    id: 'games',
    art: 'games',
    name: 'Ігри та розваги',
    description: 'Міні-ігри й розважальні боти з платними бонусами.',
    icon: 'star',
    accent: '#f472b6',
  },
];
