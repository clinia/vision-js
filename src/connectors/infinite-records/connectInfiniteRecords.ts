import {
  CliniaSearchHelper as Helper,
  SearchParameters,
} from '@clinia/search-helper';
import {
  Renderer,
  RendererOptions,
  WidgetFactory,
  Records,
  Unmounter,
} from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  isEqual,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';
import { InfiniteRecordsRendererWidgetParams } from '../../widgets/infinite-records/infinite-records';

export type InfiniteRecordsConnectorParams = Partial<
  InfiniteRecordsRendererWidgetParams
>;

export interface InfiniteRecordsRendererOptions<TInfiniteRecordsWidgetParams>
  extends RendererOptions<TInfiniteRecordsWidgetParams> {
  showPrevious: () => void;
  showMore: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export type InfiniteRecordsRenderer<TInfiniteRecordsWidgetParams> = Renderer<
  InfiniteRecordsRendererOptions<
    InfiniteRecordsConnectorParams & TInfiniteRecordsWidgetParams
  >
>;

export type InfiniteRecordsWidgetFactory<
  TInfiniteRecordsWidgetParams
> = WidgetFactory<
  InfiniteRecordsConnectorParams & TInfiniteRecordsWidgetParams
>;

export type InfiniteRecordsConnector = <TInfiniteRecordsWidgetParams>(
  render: InfiniteRecordsRenderer<TInfiniteRecordsWidgetParams>,
  unmount?: Unmounter
) => InfiniteRecordsWidgetFactory<TInfiniteRecordsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-records',
  connector: true,
});

const connectInfiniteRecords: InfiniteRecordsConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      transformItems = (items: any[]) => items,
      showPrevious: hasShowPrevious = false,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    } = widgetParams || ({} as typeof widgetParams);
    let recordsCache: Records = [];
    let firstReceivedPage = Infinity;
    let lastReceivedPage = -1;
    let prevState: Partial<SearchParameters>;
    let showPrevious: () => void;
    let showMore: () => void;

    const getShowPrevious = (helper: Helper): (() => void) => () => {
      // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
      // avoid updating the browser URL when the user displays the previous page.
      helper
        .overrideStateWithoutTriggeringChangeEvent({
          ...helper.state,
          page: firstReceivedPage - 1,
        })
        .search();
    };
    const getShowMore = (helper: Helper): (() => void) => () => {
      helper.setPage(lastReceivedPage + 1).search();
    };
    const filterEmptyRefinements = (refinements = {}) => {
      return Object.keys(refinements)
        .filter(key =>
          Array.isArray(refinements[key])
            ? refinements[key].length
            : Object.keys(refinements[key]).length
        )
        .reduce((obj, key) => {
          obj[key] = refinements[key];
          return obj;
        }, {});
    };

    return {
      $$type: 'cvi.infiniteRecords',

      init({ visionInstance, helper }) {
        showPrevious = getShowPrevious(helper);
        showMore = getShowMore(helper);
        firstReceivedPage = helper.state.page || 0;
        lastReceivedPage = helper.state.page || 0;

        renderFn(
          {
            records: recordsCache,
            results: undefined,
            showPrevious,
            showMore,
            isFirstPage: firstReceivedPage === 0,
            isLastPage: true,
            visionInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, visionInstance }) {
        // Reset cache and received pages if anything changes in the
        // search state, except for the page.
        //
        // We're doing this to "reset" the widget if a refinement or the
        // query changes between renders, but we want to keep it as is
        // if we only change pages.
        const {
          page = 0,
          facets,
          disjunctiveFacets,
          maxValuesPerFacet,
          ...currentState
        } = state;

        currentState.facetsRefinements = filterEmptyRefinements(
          currentState.facetsRefinements
        );
        currentState.disjunctiveFacetsRefinements = filterEmptyRefinements(
          currentState.disjunctiveFacetsRefinements
        );

        if (!isEqual(currentState, prevState)) {
          recordsCache = [];
          firstReceivedPage = page;
          lastReceivedPage = page;
          prevState = currentState;
        }

        results.records = addAbsolutePosition(
          results.records,
          results.page,
          results.perPage
        );

        results.records = addQueryID(results.records, results.queryID);

        results.records = transformItems(results.records);

        if (lastReceivedPage < page || !recordsCache.length) {
          recordsCache = [...recordsCache, ...results.records];
          lastReceivedPage = page;
        } else if (firstReceivedPage > page) {
          recordsCache = [...results.records, ...recordsCache];
          firstReceivedPage = page;
        }

        const isFirstPage = firstReceivedPage === 0;
        const isLastPage = results.numPages <= results.page + 1;

        renderFn(
          {
            records: recordsCache,
            results,
            showPrevious,
            showMore,
            isFirstPage,
            isLastPage,
            visionInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        const stateWithoutPage = state.setQueryParameter('page', undefined);

        return stateWithoutPage;
      },

      getWidgetState(uiState, { searchParameters }) {
        const page = searchParameters.page || 0;

        if (!hasShowPrevious || !page) {
          return uiState;
        }

        return {
          ...uiState,
          // The page in the UI state is incremented by one
          // to expose the user value (not `0`).
          page: page + 1,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const widgetSearchParameters = searchParameters;

        // The page in the search parameters is decremented by one
        // to get to the actual parameter value from the UI state.
        const page = uiState.page ? uiState.page - 1 : 0;

        return widgetSearchParameters.setQueryParameter('page', page);
      },
    };
  };
};

export default connectInfiniteRecords;
