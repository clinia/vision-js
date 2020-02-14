/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import { SearchResults } from '@clinia/search-helper';
import { Records } from '../../types';
import { InfiniteRecordsTemplates } from '../../widgets/infinite-records/infinite-records';

type InfiniteRecordsCSSClasses = {
  root: string;
  emptyRoot: string;
  list: string;
  item: string;
  loadPrevious: string;
  disabledLoadPrevious: string;
  loadMore: string;
  disabledLoadMore: string;
};

type InfiniteRecordsProps = {
  cssClasses: InfiniteRecordsCSSClasses;
  records: Records;
  results: SearchResults;
  hasShowPrevious: boolean;
  showPrevious: () => void;
  showMore: () => void;
  templateProps: {
    [key: string]: any;
    templates: InfiniteRecordsTemplates;
  };
  isFirstPage: boolean;
  isLastPage: boolean;
};

const InfiniteRecords = ({
  results,
  records,
  hasShowPrevious,
  showPrevious,
  showMore,
  isFirstPage,
  isLastPage,
  cssClasses,
  templateProps,
}: InfiniteRecordsProps) => {
  if (results.records.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
        }}
        data={results}
      />
    );
  }

  return (
    <div className={cssClasses.root}>
      {hasShowPrevious && (
        <Template
          {...templateProps}
          templateKey="showPreviousText"
          rootTagName="button"
          rootProps={{
            className: cx(cssClasses.loadPrevious, {
              [cssClasses.disabledLoadPrevious]: isFirstPage,
            }),
            disabled: isFirstPage,
            onClick: showPrevious,
          }}
        />
      )}

      <ol className={cssClasses.list}>
        {records.map((record, position) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={record.id}
            data={{
              ...record,
              __recordIndex: position,
            }}
          />
        ))}
      </ol>

      <Template
        {...templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={{
          className: cx(cssClasses.loadMore, {
            [cssClasses.disabledLoadMore]: isLastPage,
          }),
          disabled: isLastPage,
          onClick: showMore,
        }}
      />
    </div>
  );
};

export default InfiniteRecords;
