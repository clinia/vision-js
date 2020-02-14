import clearRefinements from '../clearRefinements';
import searchHelper, { SearchParameters } from '@clinia/search-helper';
import { Client } from '../../../types';

const initHelperWithRefinements = () => {
  const helper = searchHelper({} as Client, 'index', {
    facets: ['conjFacet'],
    disjunctiveFacets: ['disjFacet'],
  });

  helper.toggleFacetRefinement('conjFacet', 'value');
  helper.toggleFacetRefinement('disjFacet', 'otherValue');

  helper.setQuery('a query');

  return helper;
};

describe('clearRefinements', () => {
  test('with disjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: searchHelper({} as Client, '', {
          disjunctiveFacets: ['attr'],
          disjunctiveFacetsRefinements: {
            attr: ['text'],
          },
        }),
        propertiesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        disjunctiveFacetsRefinements: { attr: [] },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty disjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: searchHelper({} as Client, '', {
          disjunctiveFacets: ['attr'],
          disjunctiveFacetsRefinements: {
            attr: [],
          },
        }),
        propertiesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        disjunctiveFacets: ['attr'],
        disjunctiveFacetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with conjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: searchHelper({} as Client, '', {
          facets: ['attr'],
          facetsRefinements: {
            attr: ['text'],
          },
        }),
        propertiesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        facets: ['attr'],
        facetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('with empty conjunctive refinements', () => {
    expect(
      clearRefinements({
        helper: searchHelper({} as Client, '', {
          facets: ['attr'],
          facetsRefinements: {
            attr: [],
          },
        }),
        propertiesToClear: ['attr'],
      })
    ).toEqual(
      new SearchParameters({
        facets: ['attr'],
        facetsRefinements: {
          attr: [],
        },
        index: '',
        page: 0,
      })
    );
  });

  test('does not clear anything without properties', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
  });

  test('can clear all the parameters defined in the list', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
      propertiesToClear: ['conjFacet'],
    });

    expect(finalState.query).toBe(helper.state.query);
    expect(finalState.facetsRefinements).toEqual({
      conjFacet: [],
    });
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
  });

  test('can clear the query alone', () => {
    const helper = initHelperWithRefinements();

    const finalState = clearRefinements({
      helper,
      propertiesToClear: ['query'],
    });

    expect(finalState.query).toBe('');
    expect(finalState.facetsRefinements).toEqual(
      helper.state.facetsRefinements
    );
    expect(finalState.disjunctiveFacetsRefinements).toEqual(
      helper.state.disjunctiveFacetsRefinements
    );
  });
});
