/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import connectRecords from '../../connectors/records/connectRecords';
import Records from '../../components/Records/Records';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { withInsights, withInsightsListener } from '../../lib/insights';

const withUsage = createDocumentationMessageGenerator({ name: 'records' });
const suit = component('Records');
const RecordsWithInsightsListener = withInsightsListener(Records);

const renderer = ({ renderState, cssClasses, containerNode, templates }) => (
  { records: receivedRecords, results, visionInstance, insights },
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
    <RecordsWithInsightsListener
      cssClasses={cssClasses}
      records={receivedRecords}
      results={results}
      templateProps={renderState.templateProps}
      insights={insights}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} RecordsCSSClasses
 * @property {string|string[]} [root] CSS class to add to the wrapping element.
 * @property {string|string[]} [emptyRoot] CSS class to add to the wrapping element when no results.
 * @property {string|string[]} [list] CSS class to add to the list of results.
 * @property {string|string[]} [item] CSS class to add to each result.
 */

/**
 * @typedef {Object} RecordsTemplates
 * @property {string|function(object):string} [empty=''] Template to use when there are no results.
 * @property {string|function(object):string} [item=''] Template to use for each result. This template will receive an object containing a single record. The record will have a new property `__recordIndex` for the position of the record in the list of displayed records.
 */

/**
 * @typedef {Object} RecordsWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {RecordsTemplates} [templates] Templates to use for the widget.
 * @property {RecordsCSSClasses} [cssClasses] CSS classes to add.
 * @property {boolean} [escapeHTML = true] Escape HTML entities from records string values.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * Display the list of results (records) from the current search.
 *
 * This is a traditional display of the records. It has to be implemented
 * together with a pagination widget, to let the user browse the results
 * beyond the first page.
 * @type {WidgetFactory}
 * @devNovel Records
 * @category basic
 * @param {RecordsWidgetOptions} $0 Options of the Records widget.
 * @return {Widget} A new instance of Records widget.
 * @example
 * search.addWidgets([
 *   vision.widgets.records({
 *     container: '#records-container',
 *     templates: {
 *       empty: 'No results',
 *       item: '<strong>Record {{id}}</strong>: {{{_highlightResult.name.value}}}'
 *     },
 *     transformItems: items => items.map(item => item),
 *   })
 * ]);
 */
export default function records({
  container,
  escapeHTML,
  transformItems,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
}) {
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeRecords = withInsights(connectRecords)(specializedRenderer, () =>
    render(null, containerNode)
  );

  return makeRecords({ escapeHTML, transformItems });
}
