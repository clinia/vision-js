import searchHelper, {
  SearchParameters,
  SearchResults,
} from '@clinia/search-helper';
import connectRecords from '../connectRecords';

jest.mock('../../../lib/utils/records-absolute-position', () => ({
  // The real implementation creates a new array instance, which can cause bugs,
  // especially with the __escaped mark, we thus make sure the mock also has the
  // same behavior regarding the array.
  addAbsolutePosition: records => records.map(x => x),
}));

describe('connectRecords', () => {
  it('throws without render function', () => {
    expect(() => {
      connectRecords()({});
    }).toThrowErrorMatchingSnapshot();
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customRecords = connectRecords(render, unmount);
    const widget = customRecords({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'cvi.records',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectRecords(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = searchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{ records: [], meta: {} }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { escapeHTML: true } }),
      false
    );
  });

  it('Provides the records and the whole results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        records: [],
        results: undefined,
      }),
      expect.anything()
    );

    const records = [{ fake: 'data' }, { sample: 'infos' }];

    const results = new SearchResults(helper.state, [
      { records: [].concat(records), meta: {} },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        records,
        results,
      }),
      expect.anything()
    );
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectRecords(renderFn);
    const widget = makeWidget({
      transformItems: items => items.map(() => ({ name: 'transformed' })),
    });

    const helper = searchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ records: [], results: undefined }),
      expect.anything()
    );

    const records = [{ name: 'name 1' }, { name: 'name 2' }];

    const results = new SearchResults(helper.state, [{ records, meta: {} }]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const expectedRecords = [{ name: 'transformed' }, { name: 'transformed' }];

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        records: expectedRecords,
        results,
      }),
      expect.anything()
    );
  });

  it('adds queryID if provided to results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectRecords(renderFn);
    const widget = makeWidget({});

    const helper = searchHelper({}, '', {});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const records = [{ name: 'name 1' }, { name: 'name 2' }];

    const results = new SearchResults(helper.state, [
      { records, meta: { queryID: 'theQueryID' } },
    ]);
    widget.render({
      results,
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const expectedRecords = [
      { name: 'name 1', __queryID: 'theQueryID' },
      { name: 'name 2', __queryID: 'theQueryID' },
    ];

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        records: expectedRecords,
      }),
      expect.anything()
    );
  });

  describe('getWidgetSearchParameters', () => {
    it('does not add the TAG_PLACEHOLDER to the `SearchParameters` with `escapeHTML` disabled', () => {
      const render = () => {};
      const makeWidget = connectRecords(render);
      const widget = makeWidget({
        escapeHTML: false,
      });

      const actual = widget.getWidgetSearchParameters(new SearchParameters());

      expect(actual).toEqual(new SearchParameters());
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = searchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectRecords(renderFn, unmountFn);
      const widget = makeWidget();

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = searchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectRecords(renderFn);
      const widget = makeWidget();

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });
  });
});
