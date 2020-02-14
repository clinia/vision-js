/** @jsx h */

import { h } from 'preact';
import { render } from '@testing-library/preact';
import { SearchResults } from '@clinia/search-helper';
import InfiniteRecords from '../InfiniteRecords';
import { Records } from '../../../types';

describe('InfiniteRecrods', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
    loadPrevious: 'loadPrevious',
    disabledLoadPrevious: 'disabledLoadPrevious',
    loadMore: 'loadMore',
    disabledLoadMore: 'disabledLoadMore',
  };

  describe('markup', () => {
    it('should render <InfiniteRecords /> on first page', () => {
      const records: Records = [
        {
          id: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          id: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { records },
        records,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteRecords /> on last page', () => {
      const records: Records = [
        {
          id: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          id: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { records } as SearchResults,
        records,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteRecords /> without records on first page', () => {
      const records: Records = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { records } as SearchResults,
        records,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteRecords /> without records on last page', () => {
      const records: Records = [];

      const props = {
        hasShowPrevious: false,
        showPrevious: () => {},
        showMore: () => {},
        results: { records } as SearchResults,
        records,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteRecords /> with "Show previous" button on first page', () => {
      const records: Records = [
        {
          id: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          id: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: { records } as SearchResults,
        records,
        isFirstPage: true,
        isLastPage: false,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).toHaveClass('disabledLoadPrevious');
      expect(previousButton).toBeDisabled();
      expect(container).toMatchSnapshot();
    });

    it('should render <InfiniteRecords /> with "Show previous" button on last page', () => {
      const records: Records = [
        {
          id: 'one',
          foo: 'bar',
          __position: 0,
        },
        {
          id: 'two',
          foo: 'baz',
          __position: 1,
        },
      ];

      const props = {
        hasShowPrevious: true,
        showPrevious: () => {},
        showMore: () => {},
        results: { records } as SearchResults,
        records,
        isFirstPage: false,
        isLastPage: true,
        templateProps: {
          templates: {
            empty: 'empty',
            showPreviousText: 'showPreviousText',
            showMoreText: 'showMoreText',
            item: 'item',
          },
        },
        cssClasses,
      };

      const { container } = render(<InfiniteRecords {...props} />);

      const previousButton = container.querySelector('.loadPrevious');

      expect(previousButton).toBeInTheDocument();
      expect(previousButton).not.toHaveClass('disabledLoadPrevious');
      expect(previousButton).not.toBeDisabled();
      expect(container).toMatchSnapshot();
    });
  });
});
