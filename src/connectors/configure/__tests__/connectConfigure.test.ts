import searchHelper, {
  SearchParameters,
  CliniaSearchHelper,
} from '@clinia/search-helper';

import { createSearchClient } from '../../../../test/mock/createSearchClient';
import connectConfigure from '../connectConfigure';
import {
  createInitOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';

describe('connectConfigure', () => {
  let helper: CliniaSearchHelper;

  beforeEach(() => {
    helper = searchHelper(createSearchClient(), '', {});
  });

  describe('Usage', () => {
    it('throws without searchParameters', () => {
      // @ts-ignore wrong options
      expect(() => connectConfigure()()).toThrowErrorMatchingSnapshot();
    });

    it('throws when you pass it a non-plain object', () => {
      expect(() => {
        // @ts-ignore wrong options
        connectConfigure()(new Date());
      }).toThrowErrorMatchingSnapshot();

      expect(() => {
        // @ts-ignore wrong options
        connectConfigure()(() => {});
      }).toThrowErrorMatchingSnapshot();
    });

    it('does not throw with a render function but without an unmount function', () => {
      expect(() => connectConfigure(jest.fn(), undefined)).not.toThrow();
    });

    it('with a unmount function but no render function does not throw', () => {
      // @ts-ignore wrong options
      expect(() => connectConfigure(undefined, jest.fn())).not.toThrow();
    });

    it('does not throw without render and unmount functions', () => {
      // @ts-ignore wrong options
      expect(() => connectConfigure(undefined, undefined)).not.toThrow();
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customConfigure = connectConfigure(render, unmount);
    const widget = customConfigure({ searchParameters: {} });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'cvi.configure',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('should apply searchParameters', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        perPage: 20,
      },
    });

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        perPage: 20,
      })
    );
  });

  it('should apply searchParameters with a higher priority', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        perPage: 20,
      },
    });

    expect(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          perPage: 20,
        }),
        { uiState: { configure: { perPage: 20 } } }
      )
    ).toEqual(
      new SearchParameters({
        perPage: 20,
      })
    );

    expect(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          perPage: 20,
          queryType: 'prefix_last',
        }),
        { uiState: { configure: { perPage: 20 } } }
      )
    ).toEqual(
      new SearchParameters({
        perPage: 20,
        queryType: 'prefix_last',
      })
    );
  });

  it('should apply new searchParameters on refine()', () => {
    const renderFn = jest.fn();
    const makeWidget = connectConfigure(renderFn, jest.fn());
    const widget = makeWidget({
      searchParameters: {
        perPage: 20,
      },
    });

    helper.setState(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          // This facet is added outside of the widget params
          // so it shouldn't be overridden when calling `refine`.
          facets: ['brand'],
        }),
        { uiState: { configure: { perPage: 20 } } }
      )
    );
    widget.init!(createInitOptions({ helper }));

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: { configure: { perPage: 20 } },
      })
    ).toEqual(
      new SearchParameters({
        perPage: 20,
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        perPage: 20,
        facets: ['brand'],
      })
    );

    const { refine } = renderFn.mock.calls[0][0];

    refine({ perPage: 3, facets: ['rating'] });

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: { configure: { perPage: 3, facets: ['rating'] } },
      })
    ).toEqual(
      new SearchParameters({
        perPage: 3,
        facets: ['rating'],
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        perPage: 3,
        facets: ['brand', 'rating'],
      })
    );
  });

  it('should dispose only the state set by configure', () => {
    const makeWidget = connectConfigure();
    const widget = makeWidget({
      searchParameters: {
        perPage: 20,
      },
    });

    helper.setState(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          queryType: 'prefix_last',
        }),
        { uiState: { configure: { perPage: 20 } } }
      )
    );
    widget.init!(createInitOptions({ helper }));

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: { configure: { perPage: 20 } },
      })
    ).toEqual(
      new SearchParameters({
        perPage: 20,
      })
    );
    expect(helper.state).toEqual(
      new SearchParameters({
        perPage: 20,
        queryType: 'prefix_last',
      })
    );

    const nextState = widget.dispose!(
      createDisposeOptions({ state: helper.state })
    );

    expect(nextState).toEqual(
      new SearchParameters({
        queryType: 'prefix_last',
      })
    );
  });

  describe('getWidgetState', () => {
    it('adds default parameters', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      expect(
        widget.getWidgetState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        configure: { perPage: 20 },
      });
    });

    it('adds refined parameters', () => {
      const renderFn = jest.fn();
      const makeWidget = connectConfigure(renderFn);
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = renderFn.mock.calls[0][0];

      refine({ analytics: false });

      expect(
        widget.getWidgetState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        configure: { analytics: false },
      });
    });

    it('adds refined (new) parameters', () => {
      const renderFn = jest.fn();
      const makeWidget = connectConfigure(renderFn);
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = renderFn.mock.calls[0][0];

      refine({ query: 'unsafe toys' });

      expect(
        widget.getWidgetState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        configure: { query: 'unsafe toys' },
      });
    });

    it('merges with existing configuration', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      expect(
        widget.getWidgetState!(
          { configure: { queryType: 'prefix_last' } },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        configure: { perPage: 20, queryType: 'prefix_last' },
      });
    });

    it('overwrites existing configuration', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      expect(
        widget.getWidgetState!(
          { configure: { perPage: 20 } },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        configure: { perPage: 20 },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('returns parameters set by default', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(sp).toEqual(new SearchParameters({ perPage: 20 }));
    });

    it('returns parameters set by uiState', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({ searchParameters: {} });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {
          configure: {
            perPage: 20,
          },
        },
      });

      expect(sp).toEqual(new SearchParameters({ perPage: 20 }));
    });

    it('overrides parameters set by uiState', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          perPage: 20,
        },
      });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {
          configure: {
            perPage: 20,
          },
        },
      });

      expect(sp).toEqual(new SearchParameters({ perPage: 20 }));
    });

    it('merges parameters set by uiState', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          queryType: 'prefix_last',
        },
      });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {
          configure: {
            perPage: 20,
          },
        },
      });

      expect(sp).toEqual(
        new SearchParameters({
          perPage: 20,
          queryType: 'prefix_last',
        })
      );
    });

    it('merges with the previous parameters', () => {
      const makeWidget = connectConfigure();
      const widget = makeWidget({
        searchParameters: {
          disjunctiveFacets: ['brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple'],
          },
        },
      });

      const sp = widget.getWidgetSearchParameters!(
        new SearchParameters({
          disjunctiveFacets: ['categories'],
          disjunctiveFacetsRefinements: {
            categories: ['Phone'],
          },
        }),
        {
          uiState: {},
        }
      );

      expect(sp).toEqual(
        new SearchParameters({
          disjunctiveFacets: ['categories', 'brand'],
          disjunctiveFacetsRefinements: {
            brand: ['Apple'],
            categories: ['Phone'],
          },
        })
      );
    });

    it('stores refined state', () => {
      const renderFn = jest.fn();
      const makeWidget = connectConfigure(renderFn);
      const widget = makeWidget({
        searchParameters: {
          queryType: 'prefix_last',
        },
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = renderFn.mock.calls[0][0];

      refine({ queryType: 'prefix_none' });

      const sp = widget.getWidgetSearchParameters!(new SearchParameters(), {
        uiState: {},
      });

      expect(sp).toEqual(
        new SearchParameters({
          queryType: 'prefix_none',
        })
      );
    });
  });
});
