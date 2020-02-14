import {
  checkRendering,
  createDocumentationMessageGenerator,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'records',
  connector: true,
});

/**
 * @typedef {Object} RecordsRenderingOptions
 * @property {Object[]} records The matched records from Clinia API.
 * @property {Object} results The complete results response from Clinia API.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomRecordsWidgetOptions
 * @property {function(Object[]):Object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **Records** connector provides the logic to create custom widgets that will render the results retrieved from Clinia.
 * @type {Connector}
 * @param {function(RecordsRenderingOptions, boolean)} renderFn Rendering function for the custom **Records** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomRecordsWidgetOptions)} Re-usable widget factory for a custom **Records** widget.
 * @example
 * // custom `renderFn` to render the custom Records widget
 * function renderFn(RecordsRenderingOptions) {
 *   RecordsRenderingOptions.widgetParams.containerNode.html(
 *     RecordsRenderingOptions.records.map(function(record) {
 *       return '<div>' + records._highlightResult.name.value + '</div>';
 *     })
 *   );
 * }
 *
 * // connect `renderFn` to Records logic
 * var customRecords = vision.connectors.connectRecords(renderFn);
 *
 * // mount widget on the page
 * search.addWidgets([
 *   customRecords({
 *     containerNode: $('#custom-records-container'),
 *   })
 * ]);
 */
export default function connectRecords(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { transformItems = items => items } = widgetParams;

    return {
      $$type: 'cvi.records',

      init({ visionInstance }) {
        renderFn(
          {
            records: [],
            results: undefined,
            visionInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, visionInstance }) {
        const initialEscaped = results.records.__escaped;

        results.records = addAbsolutePosition(
          results.records,
          results.page,
          results.perPage
        );

        results.records = addQueryID(results.records, results.queryId);

        results.records = transformItems(results.records);

        // Make sure the escaped tag stays, even after mapping over the records.
        // This prevents the records from being double-escaped if there are multiple
        // records widgets mounted on the page.
        results.records.__escaped = initialEscaped;

        renderFn(
          {
            records: results.records,
            results,
            visionInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state;
      },

      getWidgetSearchParameters(state) {
        return state;
      },
    };
  };
}
