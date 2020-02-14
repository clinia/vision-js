import searchHelper, {
  SearchResults,
  SearchParameters,
} from '@clinia/search-helper';
import { Client } from '../../../types';
import { createVision } from '../../../../test/mock/createVision';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectInfiniteRecords from '../connectInfiniteRecords';
import { createSearchClient } from '../../../../test/mock/createSearchClient';

jest.mock('../../../lib/utils/records-absolute-position', () => ({
  // The real implementation creates a new array instance, which can cause bugs,
  // especially with the __escaped mark, we thus make sure the mock also has the
  // same behavior regarding the array.
  addAbsolutePosition: records => records.map(x => x),
}));

describe('connectInfiniteRecords', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore: test connectInfiniteRecords with invalid parameters
      connectInfiniteRecords()({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.clinia.com/doc/api-reference/widgets/infinite-records/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customInfiniteRecords = connectInfiniteRecords(render, unmount);
    const widget = customInfiniteRecords({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'cvi.infiniteRecords',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),

        getWidgetState: expect.any(Function),
        getWidgetSearchParameters: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const visionInstance = createVision();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({
      escapeHTML: true,
    });

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        visionInstance,
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        visionInstance,
        records: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: undefined,
        isFirstPage: true,
        isLastPage: true,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      true
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ records: [] }),
        ]),
        state: helper.state,
        visionInstance,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        visionInstance,
        records: [],
        showPrevious: expect.any(Function),
        showMore: expect.any(Function),
        results: expect.any(Object),
        isFirstPage: true,
        isLastPage: true,
        widgetParams: {
          escapeHTML: true,
        },
      }),
      false
    );
  });

  it('Provides the records and accumulates results on next page', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.records).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const records = [
      { fake: 'data', id: '1' },
      { sample: 'infos', id: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showMore } = secondRenderOptions;
    expect(secondRenderOptions.records).toEqual(records);
    expect(secondRenderOptions.results).toEqual(results);
    showMore();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should accumulate if there is an increment in page
    const otherRecords = [
      { fake: 'data 2', id: '1' },
      { sample: 'infos 2', id: '2' },
    ];
    const otherResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ records: otherRecords }),
    ]);

    widget.render!(
      createRenderOptions({
        results: otherResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.records).toEqual([...records, ...otherRecords]);
    expect(thirdRenderOptions.results).toEqual(otherResults);
  });

  it('Provides the records and prepends results on previous page', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({} as Client, '', {});
    helper.setPage(1);
    helper.search = jest.fn();
    helper.emit = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.records).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const records = [
      { fake: 'data', id: '1' },
      { sample: 'infos', id: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { showPrevious } = secondRenderOptions;
    expect(secondRenderOptions.records).toEqual(records);
    expect(secondRenderOptions.results).toEqual(results);
    showPrevious();
    expect(helper.state.page).toBe(0);
    expect(helper.emit).not.toHaveBeenCalled();
    expect(helper.search).toHaveBeenCalledTimes(1);

    // the results should be prepended if there is an decrement in page
    const previousRecords = [
      { fake: 'data 2', id: '1' },
      { sample: 'infos 2', id: '2' },
    ];
    const previousResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ records: previousRecords }),
    ]);

    widget.render!(
      createRenderOptions({
        results: previousResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.records).toEqual([
      ...previousRecords,
      ...records,
    ]);
    expect(thirdRenderOptions.results).toEqual(previousResults);
  });

  it('Provides the records and flush hists cache on query changes', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.records).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const records = [
      { fake: 'data', id: '1' },
      { sample: 'infos', id: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.records).toEqual(records);
    expect(secondRenderOptions.results).toEqual(results);

    helper.setQuery('data');

    // If the query changes, the records cache should be flushed
    const otherRecords = [
      { fake: 'data 2', id: '1' },
      { sample: 'infos 2', id: '2' },
    ];
    const otherResults = new SearchResults(helper.state, [
      createSingleSearchResponse({ records: otherRecords }),
    ]);

    widget.render!(
      createRenderOptions({
        results: otherResults,
        state: helper.state,
        helper,
      })
    );

    const thirdRenderOptions = renderFn.mock.calls[2][0];
    expect(thirdRenderOptions.records).toEqual(otherRecords);
    expect(thirdRenderOptions.results).toEqual(otherResults);
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.records).toEqual([]);
    expect(firstRenderOptions.results).toBe(undefined);

    const records = [
      {
        name: 'name 1',
        id: '1',
      },
      {
        name: 'name 2',
        id: '2',
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    const transformedRecords = [
      {
        name: 'transformed',
      },
      {
        name: 'transformed',
      },
    ];

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.records).toEqual(transformedRecords);
    expect(secondRenderOptions.results).toEqual(results);
  });

  it('adds queryID if provided to results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    const records = [
      {
        name: 'name 1',
        id: '1',
      },
      {
        name: 'name 2',
        id: '2',
      },
    ];

    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records, queryID: 'theQueryID' }),
    ]);

    widget.render!(
      createRenderOptions({
        state: helper.state,
        results,
        helper,
      })
    );

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        records: [
          {
            name: 'name 1',
            id: '1',
            __queryID: 'theQueryID',
          },
          {
            name: 'name 2',
            id: '2',
            __queryID: 'theQueryID',
          },
        ],
      }),
      false
    );
  });

  it('does not render the same page twice', () => {
    const renderFn = jest.fn();
    const makeWidget = connectInfiniteRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({} as Client, '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        state: helper.state,
        helper,
      })
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            records: [{ id: 'a' }],
            page: 0,
            numPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    helper.setPage(1);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            records: [{ id: 'b' }],
            page: 1,
            numPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(3);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        records: [{ id: 'a' }, { id: 'b' }],
      }),
      false
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            records: [{ id: 'b' }],
            page: 1,
            numPages: 4,
          }),
        ]),
        state: helper.state,
        helper,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(4);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        records: [{ id: 'a' }, { id: 'b' }],
      }),
      false
    );
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = searchHelper({} as Client, '', {});

      const renderFn = (): void => {};
      const unmountFn = jest.fn();
      const makeWidget = connectInfiniteRecords(renderFn, unmountFn);
      const widget = makeWidget({});

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = searchHelper({} as Client, '', {});

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteRecords(renderFn);
      const widget = makeWidget({});

      expect(() =>
        widget.dispose!({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const helper = searchHelper({} as Client, '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteRecords(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      const nextState = widget.dispose!({
        helper,
        state: helper.state,
      }) as SearchParameters;

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });

    it('removes the `page` from the `SearchParameters`', () => {
      const helper = searchHelper({} as Client, '', {
        page: 5,
      });

      const renderFn = (): void => {};
      const makeWidget = connectInfiniteRecords(renderFn);
      const widget = makeWidget({});

      expect(helper.state.page).toBe(5);

      const nextState = widget.dispose!({
        helper,
        state: helper.state,
      }) as SearchParameters;

      expect(nextState.page).toBeUndefined();
    });
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty without `showPrevious` option', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({});

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` empty with `showPrevious` option on first page', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName', {
        page: 0,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` containing `page` with `showPrevious` option', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName', {
        page: 1,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        page: 2,
      });
    });

    test('returns the `uiState` containing a page number incremented by one with `showPrevious` option and `page` search parameter', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName', {
        page: 3,
      });
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        page: 4,
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('return Search Parameters without highlighted tags when `escapeHTML` is `false`', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        escapeHTML: false,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.highlightPreTag).toBeUndefined();
      expect(actual.highlightPostTag).toBeUndefined();
    });

    test('return Search Parameters with resetted page when `showPrevious` without `page` in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.page).toEqual(0);
    });

    test('return Search Parameters with resetted page when `showPrevious` and `page` is 0 in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          page: 0,
        },
      });

      expect(actual.page).toEqual(0);
    });

    test('return Search Parameters with page decreased when `showPrevious` and `page` in the UI state', () => {
      const render = jest.fn();
      const makeWidget = connectInfiniteRecords(render);
      const helper = searchHelper(createSearchClient(), 'indexName');
      const widget = makeWidget({
        showPrevious: true,
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          page: 3,
        },
      });

      expect(actual.page).toEqual(2);
    });
  });
});
