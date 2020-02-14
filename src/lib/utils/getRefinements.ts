import { SearchParameters, SearchResults } from '@clinia/search-helper';
import unescapeRefinement from './unescapeRefinement';

export interface FacetRefinement {
  type: 'facet' | 'exclude' | 'disjunctive' | 'query';
  property: string;
  name: string;
  count?: number;
  exhaustive?: boolean;
}

export interface QueryRefinement
  extends Pick<FacetRefinement, 'type' | 'property' | 'name'> {
  type: 'query';
  query: string;
}

export interface FacetExcludeRefinement extends FacetRefinement {
  type: 'exclude';
  exclude: boolean;
}

export type Refinement =
  | FacetRefinement
  | QueryRefinement
  | FacetExcludeRefinement;

function getRefinement(
  state: SearchParameters,
  type: Refinement['type'],
  property: Refinement['property'],
  name: Refinement['name'],
  resultsFacets: SearchResults['facets'] = []
): Refinement {
  const res: Refinement = { type, property, name };
  const facet: any = resultsFacets.find(
    resultsFacet => resultsFacet.name === property
  );

  const count: number = facet && facet.data && facet.data[res.name];

  const exhaustive = facet && facet.exhaustive;

  if (count !== undefined) {
    res.count = count;
  }

  if (exhaustive !== undefined) {
    res.exhaustive = exhaustive;
  }

  return res;
}

function getRefinements(
  results: SearchResults,
  state: SearchParameters,
  clearsQuery: boolean = false
): Refinement[] {
  const refinements: Refinement[] = [];
  const {
    facetsRefinements = {},
    facetsExcludes = {},
    disjunctiveFacetsRefinements = {},
  } = state;

  Object.keys(facetsRefinements).forEach(property => {
    const refinementNames = facetsRefinements[property];

    refinementNames.forEach(refinementName => {
      refinements.push(
        getRefinement(state, 'facet', property, refinementName, results.facets)
      );
    });
  });

  Object.keys(facetsExcludes).forEach(property => {
    const refinementNames = facetsExcludes[property];

    refinementNames.forEach(refinementName => {
      refinements.push({
        type: 'exclude',
        property,
        name: refinementName,
        exclude: true,
      });
    });
  });

  Object.keys(disjunctiveFacetsRefinements).forEach(property => {
    const refinementNames = disjunctiveFacetsRefinements[property];

    refinementNames.forEach(refinementName => {
      refinements.push(
        getRefinement(
          state,
          'disjunctive',
          property,
          // We unescape any disjunctive refined values with `unescapeRefinement` because
          // they can be escaped on negative numeric values with `escapeRefinement`.
          unescapeRefinement(refinementName),
          results.disjunctiveFacets
        )
      );
    });
  });

  if (clearsQuery && state.query && state.query.trim()) {
    refinements.push({
      property: 'query',
      type: 'query',
      name: state.query,
      query: state.query,
    });
  }

  return refinements;
}

export default getRefinements;
