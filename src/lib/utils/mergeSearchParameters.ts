import { SearchParameters } from '@clinia/search-helper';
import uniq from './uniq';

type Merger = (
  left: SearchParameters,
  right: SearchParameters
) => SearchParameters;

const mergeWithRest: Merger = (left, right) => {
  const {
    facets,
    disjunctiveFacets,
    facetsRefinements,
    facetsExcludes,
    disjunctiveFacetsRefinements,
    ruleContexts,
    ...rest
  } = right;

  return left.setQueryParameters(rest);
};

// Merge facets
const mergeFacets: Merger = (left, right) =>
  right.facets!.reduce((_, name) => _.addFacet(name), left);

const mergeDisjunctiveFacets: Merger = (left, right) =>
  right.disjunctiveFacets!.reduce(
    (_, name) => _.addDisjunctiveFacet(name),
    left
  );

// Merge facet refinements

const mergeFacetRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    facetsRefinements: {
      ...left.facetsRefinements,
      ...right.facetsRefinements,
    },
  });

const mergeFacetsExcludes: Merger = (left, right) =>
  left.setQueryParameters({
    facetsExcludes: {
      ...left.facetsExcludes,
      ...right.facetsExcludes,
    },
  });

const mergeDisjunctiveFacetsRefinements: Merger = (left, right) =>
  left.setQueryParameters({
    disjunctiveFacetsRefinements: {
      ...left.disjunctiveFacetsRefinements,
      ...right.disjunctiveFacetsRefinements,
    },
  });

const mergeRuleContexts: Merger = (left, right) => {
  const ruleContexts: string[] = uniq(
    ([] as any)
      .concat(left.ruleContexts)
      .concat(right.ruleContexts)
      .filter(Boolean)
  );

  if (ruleContexts.length > 0) {
    return left.setQueryParameters({
      ruleContexts,
    });
  }

  return left;
};

const merge = (...parameters: SearchParameters[]): SearchParameters =>
  parameters.reduce((left, right) => {
    const disjunctiveFacetsRefinementsMerged = mergeDisjunctiveFacetsRefinements(
      left,
      right
    );
    const facetsExcludesMerged = mergeFacetsExcludes(
      disjunctiveFacetsRefinementsMerged,
      right
    );
    const facetRefinementsMerged = mergeFacetRefinements(
      facetsExcludesMerged,
      right
    );
    const disjunctiveFacetsMerged = mergeDisjunctiveFacets(
      facetRefinementsMerged,
      right
    );
    const ruleContextsMerged = mergeRuleContexts(
      disjunctiveFacetsMerged,
      right
    );
    const facetsMerged = mergeFacets(ruleContextsMerged, right);

    return mergeWithRest(facetsMerged, right);
  });

export default merge;
