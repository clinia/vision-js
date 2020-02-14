import { SearchResults } from '@clinia/search-helper';
import { uniq, createDocumentationMessageGenerator } from '../utils';
import {
  Records,
  InsightsClient,
  InsightsClientMethod,
  InsightsClientPayload,
  InsightsClientWrapper,
  Renderer,
  RendererOptions,
  Unmounter,
  WidgetFactory,
} from '../../types';

const getSelectedRecords = (
  records: Records,
  selectedIDs: string[]
): Records => {
  return selectedIDs.map(id => {
    const record = records.find(h => h.id === id);
    if (typeof record === 'undefined') {
      throw new Error(
        `Could not find id "${id}" passed to \`clickedIdsAfterSearch\` in the returned records. This is necessary to infer the absolute position and the query id.`
      );
    }
    return record;
  });
};

const getQueryID = (selectedRecords: Records): string => {
  const queryIDs = uniq(selectedRecords.map(record => record.__queryID));
  if (queryIDs.length > 1) {
    throw new Error(
      'Insights currently allows a single `queryID`. The `IDs` provided map to multiple `queryID`s.'
    );
  }
  const queryID = queryIDs[0];
  if (typeof queryID !== 'string') {
    throw new Error(
      `Could not infer \`queryID\`. Ensure Vision \`clickAnalytics: true\` was added with the Configure widget.`
    );
  }
  return queryID;
};

const getPositions = (selectedRecords: Records): number[] =>
  selectedRecords.map(record => record.__position);

export const inferPayload = ({
  method,
  results,
  records,
  ids,
}: {
  method: InsightsClientMethod;
  results: SearchResults;
  records: Records;
  ids: string[];
}): Omit<InsightsClientPayload, 'eventName'> => {
  const { index } = results;
  const selectedRecords = getSelectedRecords(records, ids);
  const queryID = getQueryID(selectedRecords);

  switch (method) {
    case 'clickedRecordIDsAfterSearch': {
      const positions = getPositions(selectedRecords);
      return { index, queryID, ids, positions };
    }

    case 'convertedRecordIDsAfterSearch':
      return { index, queryID, ids };

    default:
      throw new Error(`Unsupported method passed to insights: "${method}".`);
  }
};

const wrapInsightsClient = (
  aa: InsightsClient | null,
  results: SearchResults,
  records: Records
): InsightsClientWrapper => (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => {
  if (!aa) {
    const withVisionUsage = createDocumentationMessageGenerator({
      name: 'vision',
    });
    throw new Error(
      withVisionUsage(
        'The `insightsClient` option has not been provided to `vision`.'
      )
    );
  }
  if (!Array.isArray(payload.ids)) {
    throw new TypeError('Expected `ids` to be an array.');
  }
  const inferredPayload = inferPayload({
    method,
    results,
    records,
    ids: payload.ids,
  });
  aa(method, { ...inferredPayload, ...payload } as any);
};

type Connector<TWidgetParams> = (
  renderFn: Renderer<any>,
  unmountFn: Unmounter
) => WidgetFactory<TWidgetParams>;

export default function withInsights(
  connector: Connector<any>
): Connector<unknown> {
  const wrapRenderFn = (
    renderFn: Renderer<RendererOptions<unknown>>
  ): Renderer<RendererOptions<unknown>> => (
    renderOptions: RendererOptions,
    isFirstRender: boolean
  ) => {
    const { results, records, visionInstance } = renderOptions;
    if (results && records && visionInstance) {
      const insights = wrapInsightsClient(
        visionInstance.insightsClient,
        results,
        records
      );
      return renderFn({ ...renderOptions, insights }, isFirstRender);
    }
    return renderFn(renderOptions, isFirstRender);
  };

  return (renderFn: Renderer<RendererOptions<unknown>>, unmountFn: Unmounter) =>
    connector(wrapRenderFn(renderFn), unmountFn);
}
