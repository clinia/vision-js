import { withInsights, inferInsightsPayload } from '../insights';
import { Widget, WidgetFactory } from '../../types';

const connectRecords = (
  renderFn: any,
  unmountFn: any
): WidgetFactory<unknown> => (widgetParams = {}): Widget => ({
  init() {},
  render({ results, visionInstance }) {
    const records = results.records;
    renderFn({ records, results, visionInstance, widgetParams }, false);
  },
  dispose() {
    unmountFn();
  },
});

const createWidgetWithInsights = ({
  renderFn,
  visionInstance,
  results,
}): Widget => {
  const connectRecordsWithInsights = withInsights(connectRecords as any);
  const widget = connectRecordsWithInsights(renderFn, jest.fn())({});
  (widget as any).render({ results, visionInstance } as any);
  return widget;
};

describe('withInsights', () => {
  describe('when applied on connectRecords', () => {
    it('should call the passed renderFn', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      expect(renderFn).toHaveBeenCalledTimes(1);
    });

    it('should not remove any renderProps passed by connectRecords', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toEqual(
        expect.objectContaining({
          visionInstance,
          results,
          widgetParams: {},
        })
      );
    });

    it('should expose the insights client wrapper to renderOptions if passed to visionInstance', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toHaveProperty('insights');
      expect(renderProps.insights).toBeInstanceOf(Function);
    });
    it('should expose the insights client wrapper even when insightsClient was not provided', () => {
      const renderFn = jest.fn();
      const visionInstance = {
        /* insightsClient was not passed */
      };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toHaveProperty('insights');
      expect(renderProps.insights).toBeInstanceOf(Function);
    });
    it('should expose the insights client wrapper that throws when insightsClient was not provided', () => {
      const renderFn = jest.fn();
      const visionInstance = {
        /* insightsClient was not passed */
      };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedRecordIDsAfterSearch', {
          eventName: 'add to favorites',
          ids: ['1'],
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('exposed insights client wrapper', () => {
    it('should call the insights client under the hood', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('clickedRecordIDsAfterSearch', {
        ids: ['3'],
        eventName: 'Add to basket',
      });
      expect(visionInstance.insightsClient).toHaveBeenCalledTimes(1);
    });

    it('should pass it the correct parameters', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('clickedRecordIDsAfterSearch', {
        ids: ['3'],
        eventName: 'Add to basket',
      });
      const [method, payload] = visionInstance.insightsClient.mock.calls[0];
      expect(method).toEqual('clickedRecordIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to basket',
        index: 'theIndex',
        queryID: 'theQueryID',
        ids: ['3'],
        positions: [11],
      });
    });

    it('should not infer or pass the positions if method is `convertedRecordIDsAfterSearch`', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('convertedRecordIDsAfterSearch', {
        ids: ['1'],
        eventName: 'Add to basket',
      });
      const [method, payload] = visionInstance.insightsClient.mock.calls[0];
      expect(method).toEqual('convertedRecordIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to basket',
        index: 'theIndex',
        queryID: 'theQueryID',
        ids: ['1'],
      });
    });

    it('should reject non-existing ids', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedRecordIDsAfterSearch', {
          ids: ['xxxxxx'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Could not find id \\"xxxxxx\\" passed to \`clickedIdsAfterSearch\` in the returned records. This is necessary to infer the absolute position and the query id."`
      );
    });

    it('should reject if ids provided have different queryIDs', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __position: 1, __queryID: 'theQueryID_1' },
          { id: '2', __position: 2, __queryID: 'theQueryID_2' },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedRecordIDsAfterSearch', {
          ids: ['1', '2'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Insights currently allows a single \`queryID\`. The \`IDs\` provided map to multiple \`queryID\`s."`
      );
    });

    it('should reject if no queryID found (clickAnalytics was not set to true)', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __position: 1 },
          { id: '2', __position: 2 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedRecordIDsAfterSearch', {
          ids: ['1', '2'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Could not infer \`queryID\`. Ensure Vision \`clickAnalytics: true\` was added with the Configure widget."`
      );
    });

    it('should reject unknown method name', () => {
      const renderFn = jest.fn();
      const visionInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        records: [
          { id: '1', __queryID: 'theQueryID', __position: 9 },
          { id: '2', __queryID: 'theQueryID', __position: 10 },
          { id: '3', __queryID: 'theQueryID', __position: 11 },
          { id: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, visionInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('unknow_method', {
          ids: ['3'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Unsupported method passed to insights: \\"unknow_method\\"."`
      );
    });
  });
});

describe('inferInsightsPayload', () => {
  const records: any = [
    { id: '1', __queryID: 'theQueryID', __position: 9 },
    { id: '2', __queryID: 'theQueryID', __position: 10 },
    { id: '3', __queryID: 'theQueryID', __position: 11 },
    { id: '4', __queryID: 'theQueryID', __position: 12 },
  ];
  const results: any = {
    index: 'theIndex',
    records,
  };

  describe('payload inferring', () => {
    it('should infer queryID from results', () => {
      const payload = inferInsightsPayload({
        method: 'clickedRecordIDsAfterSearch',
        results,
        records,
        ids: ['3'],
      });
      expect(payload.queryID).toEqual('theQueryID');
    });

    it('should infer index name from results', () => {
      const payload = inferInsightsPayload({
        method: 'clickedRecordIDsAfterSearch',
        results,
        records,
        ids: ['3'],
      });
      expect(payload.index).toEqual(results.index);
    });

    it('should inject passed ids', () => {
      const payload = inferInsightsPayload({
        method: 'clickedRecordIDsAfterSearch',
        results,
        records,
        ids: ['3', '4'],
      });
      expect(payload.ids).toEqual(['3', '4']);
    });

    it('should compute and inject hit positions', () => {
      const payload = inferInsightsPayload({
        method: 'clickedRecordIDsAfterSearch',
        results,
        records,
        ids: ['3', '4'],
      });
      expect(payload.positions).toEqual([11, 12]);
    });
  });
});
