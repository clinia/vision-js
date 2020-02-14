import { Records } from '../../types';

export const addQueryID = (records: Records, queryID: string): Records => {
  if (!queryID) {
    return records;
  }
  return records.map(record => ({
    ...record,
    __queryID: queryID,
  }));
};
