import { Records } from '../../types';

export const addAbsolutePosition = (
  records: Records,
  page: number,
  perPage: number
): Records => {
  return records.map((record, idx) => ({
    ...record,
    __position: perPage * page + idx + 1,
  }));
};
