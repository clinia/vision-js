import { Index } from '../widgets/index/index';
import {
  CliniaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  PlainSearchParameters,
} from '@clinia/search-helper';
import { Vision } from './vision';

export interface InitOptions {
  visionInstance: Vision;
  parent: Index | null;
  uiState: UiState;
  state: SearchParameters;
  helper: Helper;
  templatesConfig: object;
  createURL(state: SearchParameters): string;
}

export interface ScopedResult {
  indexId: string;
  results: SearchResults;
  helper: Helper;
}

export interface RenderOptions {
  visionInstance: Vision;
  templatesConfig: object;
  results: SearchResults;
  scopedResults: ScopedResult[];
  state: SearchParameters;
  helper: Helper;
  searchMetadata: {
    isSearchStalled: boolean;
  };
  createURL(state: SearchParameters): string;
}

export interface DisposeOptions {
  helper: Helper;
  state: SearchParameters;
}

export interface WidgetStateOptions {
  searchParameters: SearchParameters;
  helper: Helper;
}

export interface WidgetSearchParametersOptions {
  uiState: IndexUiState;
}

export type IndexUiState = {
  query?: string;
  refinementList?: {
    [property: string]: string[];
  };
  menu?: {
    [property: string]: string;
  };

  toggle?: {
    [property: string]: boolean;
  };
  geoSearch?: {
    /**
     * The rectangular area in geo coordinates.
     * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
     *
     * @example '47.3165,4.9665,47.3424,5.0201'
     */
    boundingBox: string;
  };
  page?: number;
  perPage?: number;
  configure?: PlainSearchParameters;
  places?: {
    query: string;
    /**
     * The central geolocation.
     *
     * @example '48.8546,2.3477'
     */
    position: string;
  };
};

export type UiState = {
  [indexId: string]: IndexUiState;
};

/**
 * Widgets are the building blocks of Visionjs. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export interface Widget {
  $$type?:
    | 'cvi.autocomplete'
    | 'cvi.breadcrumb'
    | 'cvi.clearRefinements'
    | 'cvi.configure'
    | 'cvi.configureRelatedItems'
    | 'cvi.currentRefinements'
    | 'cvi.geoSearch'
    | 'cvi.hierarchicalMenu'
    | 'cvi.records'
    | 'cvi.perPage'
    | 'cvi.index'
    | 'cvi.infiniteRecords'
    | 'cvi.menu'
    | 'cvi.numericMenu'
    | 'cvi.pagination'
    | 'cvi.places'
    | 'cvi.poweredBy'
    | 'cvi.queryRules'
    | 'cvi.queryRuleCustomData'
    | 'cvi.queryRuleContext'
    | 'cvi.range'
    | 'cvi.rangeInput'
    | 'cvi.rangeSlider'
    | 'cvi.ratingMenu'
    | 'cvi.refinementList'
    | 'cvi.searchBox'
    | 'cvi.sortBy'
    | 'cvi.stats'
    | 'cvi.toggleRefinement'
    | 'cvi.voiceSearch';
  /**
   * Called once before the first search
   */
  init?(options: InitOptions): void;
  /**
   * Called after each search response has been received
   */
  render?(options: RenderOptions): void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?(options: DisposeOptions): SearchParameters | void;
  /**
   * This function is required for a widget to be taken in account for routing.
   * It will derive a uiState for this widget based on the existing uiState and
   * the search parameters applied.
   * @param uiState current state
   * @param widgetStateOptions extra information to calculate uiState
   */
  getWidgetState?(
    uiState: IndexUiState,
    widgetStateOptions: WidgetStateOptions
  ): IndexUiState;
  /**
   * This function is required for a widget to behave correctly when a URL is
   * loaded via e.g. routing. It receives the current UiState and applied search
   * parameters, and is expected to return a new search parameters.
   * @param state applied search parameters
   * @param widgetSearchParametersOptions extra information to calculate next searchParameters
   */
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: WidgetSearchParametersOptions
  ): SearchParameters;
}

export type WidgetFactory<TWidgetParams> = (
  widgetParams: TWidgetParams
) => Widget;

export type Template<TTemplateData = void> =
  | string
  | ((data: TTemplateData) => string);
