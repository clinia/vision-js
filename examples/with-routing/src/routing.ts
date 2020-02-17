/* eslint @typescript-eslint/camelcase: ["error", { allow: ["free_shipping"] }], complexity: off */

import { history as historyRouter } from '@clinia/vision/es/lib/routers';

interface RouteState {
  query?: string;
  page?: string;
  perPage?: string;
}

interface UiState {
  query?: string;
  page?: string;
  perPage?: number;
}

const routeStateDefaultValues = {
  query: '',
  page: '1',
  perPage: '20',
};

const originalWindowTitle = document.title;

const router = historyRouter({
  windowTitle({ category, query }) {
    const queryTitle = query ? `Results for "${query}"` : '';

    return [queryTitle, category, originalWindowTitle]
      .filter(Boolean)
      .join(' | ');
  },

  createURL({ qsModule, routeState, location }): string {
    const { protocol, hostname, port = '', pathname, hash } = location;
    const portWithPrefix = port === '' ? '' : `:${port}`;
    const urlParts = location.href.match(/^(.*?)\/search/);
    const baseUrl =
      (urlParts && urlParts[0]) ||
      `${protocol}//${hostname}${portWithPrefix}${pathname}search`;

    const queryParameters: Partial<RouteState> = {};

    if (
      routeState.query &&
      routeState.query !== routeStateDefaultValues.query
    ) {
      queryParameters.query = encodeURIComponent(routeState.query);
    }
    if (routeState.page && routeState.page !== routeStateDefaultValues.page) {
      queryParameters.page = routeState.page;
    }
    if (
      routeState.perPage &&
      routeState.perPage !== routeStateDefaultValues.perPage
    ) {
      queryParameters.perPage = routeState.perPage;
    }

    const queryString = qsModule.stringify(queryParameters, {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    });

    return `${baseUrl}/${queryString}${hash}`;
  },

  parseURL({ qsModule, location }): RouteState {
    const queryParameters = qsModule.parse(location.search.slice(1));
    const { query = '', page = 1 } = queryParameters;
    // `qs` does not return an array when there's a single value.
    // const perPage = getFallbackRecordsPerPageRoutingValue(
    //   queryParameters.perPage
    // );
    return {
      query: decodeURIComponent(query),
      page,
      // perPage,
    };
  },
});

const getStateMapping = ({ indexName }) => ({
  stateToRoute(uiState: UiState): RouteState {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: indexUiState.page,
      perPage:
        (indexUiState.perPage && String(indexUiState.perPage)) || undefined,
    };
  },

  routeToState(routeState: RouteState): UiState {
    return {
      [indexName]: {
        query: routeState.query,
        page: routeState.page,
        perPage: Number(routeState.perPage),
      },
    };
  },
});

const getRouting = ({ indexName }) => ({
  router,
  stateMapping: getStateMapping({ indexName }),
});

export default getRouting;
