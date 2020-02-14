import { SearchClient as SearchClientV2 } from 'clinia';
import { SearchResponse as SearchResponseV2 } from '@clinia/client-search';

export type Client = SearchClientV2;

export interface MultiResponse<TRecord = any> {
  results: Array<SearchResponse<TRecord>>;
}

export type SearchResponse<TRecord> = SearchResponseV2<TRecord>;
