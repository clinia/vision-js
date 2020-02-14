import searchHelper from '@clinia/search-helper';
import merge from '../mergeSearchParameters';

describe('mergeSearchParameters', () => {
  it('overrides non-managed parameters', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        // Inherit
        perPage: 2,
        // Overridden
        query: 'Familiprix',
      }),
      searchHelper.SearchParameters.make({
        // perPage: 2,
        query: 'Jean',
      }),
      searchHelper.SearchParameters.make({
        // perPage: 2,
        query: 'Jean Coutu',
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        perPage: 2,
        query: 'Jean Coutu',
      })
    );
  });

  it('merges `facets` parameters', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        facets: ['type'],
      }),
      searchHelper.SearchParameters.make({
        facets: ['services'],
      }),
      searchHelper.SearchParameters.make({
        facets: ['type', 'private'],
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        facets: ['type', 'services', 'private'],
      })
    );
  });

  it('merges `disjunctiveFacets` parameters', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type'],
      }),
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['services'],
      }),
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type', 'private'],
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type', 'services', 'private'],
      })
    );
  });

  it('merges `facetsRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        facets: ['type'],
        facetsRefinements: {
          type: ['Pharmacy'],
        },
      }),
      searchHelper.SearchParameters.make({
        facets: ['services'],
        facetsRefinements: {
          services: ['Vaccination'],
        },
      }),
      searchHelper.SearchParameters.make({
        facets: ['type', 'private'],
        facetsRefinements: {
          type: ['Clsc'],
          private: ['true'],
        },
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        facets: ['type', 'services', 'private'],
        facetsRefinements: {
          type: ['Clsc'],
          services: ['Vaccination'],
          private: ['true'],
        },
      })
    );
  });

  it('merges `facetsExcludes` parameters, overrides conflicts', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        facets: ['type'],
        facetsExcludes: {
          type: ['Pharmacy'],
        },
      }),
      searchHelper.SearchParameters.make({
        facets: ['services'],
        facetsExcludes: {
          services: ['Vaccination'],
        },
      }),
      searchHelper.SearchParameters.make({
        facets: ['type', 'private'],
        facetsExcludes: {
          type: ['Clsc'],
          private: ['true'],
        },
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        facets: ['type', 'services', 'private'],
        facetsExcludes: {
          type: ['Clsc'],
          services: ['Vaccination'],
          private: ['true'],
        },
      })
    );
  });

  it('merges `disjunctiveFacetsRefinements` parameters, overrides conflicts', () => {
    const actual = merge(
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type'],
        disjunctiveFacetsRefinements: {
          type: ['Pharmacy'],
        },
      }),
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['services'],
        disjunctiveFacetsRefinements: {
          services: ['Vaccination'],
        },
      }),
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type', 'private'],
        disjunctiveFacetsRefinements: {
          type: ['Clsc'],
          private: ['true'],
        },
      })
    );

    expect(actual).toEqual(
      searchHelper.SearchParameters.make({
        disjunctiveFacets: ['type', 'services', 'private'],
        disjunctiveFacetsRefinements: {
          type: ['Clsc'],
          services: ['Vaccination'],
          private: ['true'],
        },
      })
    );
  });
});
