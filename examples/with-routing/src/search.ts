import clinia from 'clinia/lite';
import vision from '@clinia/vision';
import { pagination, healthFacilities, searchBox } from './widgets';
import getRouting from './routing';

const searchClient = clinia(
  'demo-pharmacies',
  'KcLxBhVFP8ooPgQODlAxWqfNg657fTz9'
);

const search = vision({
  searchClient,
  indexName: 'health_facility',
  routing: getRouting({ indexName: 'health_facility' }),
});

search.addWidgets([pagination, healthFacilities, searchBox]);

export default search;
