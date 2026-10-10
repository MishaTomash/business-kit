/** Маршрут → сторінка. Спільне для браузера й prerender. */

import type { Route } from '@/types';
import type { View } from '@/views/view';
import { getGame } from '@/data';
import { getGuide } from '@/data/guides';
import { guideView } from '@/views/guide';
import { homeView } from '@/views/home';
import { gamesView } from '@/views/games';
import { gameView } from '@/views/game';
import { legalView } from '@/views/legal';
import { notFoundView } from '@/views/notFound';

export function resolveView(route: Route, opts: { morphId?: string; path?: string } = {}): View {
  switch (route.name) {
    case 'home':
      return homeView();
    case 'games':
      return gamesView(opts.morphId);
    case 'game': {
      const g = getGame(route.id);
      return g ? gameView(g) : notFoundView(opts.path);
    }
    case 'legal':
      return legalView(route.id);
    case 'guide': {
      const gd = getGuide(route.id);
      return gd ? guideView(gd) : notFoundView(opts.path);
    }
    case 'notFound':
      return notFoundView(opts.path);
  }
}
