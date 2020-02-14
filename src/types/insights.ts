export type InsightsClientMethod =
  | 'clickedRecordIDsAfterSearch'
  | 'convertedRecordIDsAfterSearch';

export type InsightsClientPayload = {
  eventName: string;
  queryID: string;
  index: string;
  ids: string[];
  positions?: number[];
};

export type InsightsClient = (
  method: InsightsClientMethod,
  payload: InsightsClientPayload
) => void;

export type InsightsClientWrapper = (
  method: InsightsClientMethod,
  payload: Partial<InsightsClientPayload>
) => void;
