/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import { SearchResults } from '@clinia/search-helper';
import InfiniteRecords from '../../components/InfiniteRecords/InfiniteRecords';
import connectInfiniteRecords, {
  InfiniteRecordsRenderer,
} from '../../connectors/infinite-records/connectInfiniteRecords';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { withInsights, withInsightsListener } from '../../lib/insights';
import {
  WidgetFactory,
  Template,
  Record,
  InsightsClientWrapper,
} from '../../types';
import defaultTemplates from './defaultTemplates';

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-records',
});
const suit = component('InfiniteRecords');
const InfiniteRecordsWithInsightsListener = withInsightsListener(
  InfiniteRecords
);

export type InfiniteRecordsCSSClasses = {
  /**
   * The root element of the widget.
   */
  root: string | string[];
  /**
   * The root container without results.
   */
  emptyRoot: string | string[];
  /**
   * The list of results.
   */
  list: string | string[];
  /**
   * The list item.
   */
  item: string | string[];
  /**
   * The “Show previous” button.
   */
  loadPrevious: string | string[];
  /**
   * The disabled “Show previous” button.
   */
  disabledLoadPrevious: string | string[];
  /**
   * The “Show more” button.
   */
  loadMore: string | string[];
  /**
   * The disabled “Show more” button.
   */
  disabledLoadMore: string | string[];
};

export type InfiniteRecordsTemplates = {
  /**
   * The template to use when there are no results.
   */
  empty: Template<{ results: SearchResults }>;
  /**
   * The template to use for the “Show previous” label.
   */
  showPreviousText: Template;
  /**
   * The template to use for the “Show more” label.
   */
  showMoreText: Template;
  /**
   * The template to use for each result.
   */
  item: Template<Record>;
};

export type InfiniteRecordsRendererWidgetParams = {
  /**
   * Escapes HTML entities from records string values.
   *
   * @default `true`
   */
  escapeHTML?: boolean;
  /**
   * Enable the button to load previous results.
   *
   * @default `false`
   */
  showPrevious?: boolean;
  /**
   * Receives the items, and is called before displaying them.
   * Useful for mapping over the items to transform, and remove or reorder them.
   */
  transformItems?: (items: any[]) => any[];
};

interface InfiniteRecordsWidgetParams
  extends InfiniteRecordsRendererWidgetParams {
  /**
   * The CSS Selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;
  /**
   * The CSS classes to override.
   */
  cssClasses?: Partial<InfiniteRecordsCSSClasses>;
  /**
   * The templates to use for the widget.
   */
  templates?: Partial<InfiniteRecordsTemplates>;
}

type InfiniteRecords = WidgetFactory<InfiniteRecordsWidgetParams>;

const renderer = ({
  cssClasses,
  containerNode,
  renderState,
  templates,
  showPrevious: hasShowPrevious,
}): InfiniteRecordsRenderer<Required<InfiniteRecordsRendererWidgetParams>> => (
  {
    records,
    results,
    showMore,
    showPrevious,
    isFirstPage,
    isLastPage,
    visionInstance,
    insights,
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: visionInstance.templatesConfig,
      templates,
    });
    return;
  }

  render(
    <InfiniteRecordsWithInsightsListener
      cssClasses={cssClasses}
      records={records}
      results={results}
      hasShowPrevious={hasShowPrevious}
      showPrevious={showPrevious}
      showMore={showMore}
      templateProps={renderState.templateProps}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      insights={insights as InsightsClientWrapper}
    />,
    containerNode
  );
};

const infiniteRecords: InfiniteRecords = (
  {
    container,
    escapeHTML,
    transformItems,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    showPrevious,
  } = {} as InfiniteRecordsWidgetParams
) => {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    loadPrevious: cx(
      suit({ descendantName: 'loadPrevious' }),
      userCssClasses.loadPrevious
    ),
    disabledLoadPrevious: cx(
      suit({ descendantName: 'loadPrevious', modifierName: 'disabled' }),
      userCssClasses.disabledLoadPrevious
    ),
    loadMore: cx(suit({ descendantName: 'loadMore' }), userCssClasses.loadMore),
    disabledLoadMore: cx(
      suit({ descendantName: 'loadMore', modifierName: 'disabled' }),
      userCssClasses.disabledLoadMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    showPrevious,
    renderState: {},
  });

  const makeInfiniteRecords = withInsights(
    connectInfiniteRecords
  )(specializedRenderer, () => render(null, containerNode));

  return makeInfiniteRecords({ escapeHTML, transformItems, showPrevious });
};

export default infiniteRecords;
