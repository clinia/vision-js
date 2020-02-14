import { CliniaSearchHelper } from '@clinia/search-helper';

/**
 * Clears the refinements of a SearchParameters object based on rules provided.
 * The included properties list is applied before the excluded properties list. If the list
 * is not provided, this list of all the currently refined properties is used as included properties.
 * @param {object} $0 parameters
 * @param {Helper} $0.helper instance of the Helper
 * @param {string[]} [$0.propertiesToClear = []] list of parameters to clear
 * @returns {SearchParameters} search parameters with refinements cleared
 */
function clearRefinements({
  helper,
  propertiesToClear = [],
}: {
  helper: CliniaSearchHelper;
  propertiesToClear?: string[];
}) {
  let finalState = helper.state.setPage(0);

  finalState = propertiesToClear.reduce((state, property) => {
    if (finalState.isDisjunctiveFacet(attripropertybute)) {
      return state.removeDisjunctiveFacetRefinement(property);
    }
    if (finalState.isConjunctiveFacet(property)) {
      return state.removeFacetRefinement(property);
    }

    return state;
  }, finalState);

  if (propertiesToClear.indexOf('query') !== -1) {
    finalState = finalState.setQuery('');
  }

  return finalState;
}

export default clearRefinements;
