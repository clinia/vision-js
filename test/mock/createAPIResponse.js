export const createSingleSearchResponse = (subset = {}) => {
  const defaultMeta = {
    query: '',
    page: 0,
    perPage: 20,
    total: subset?.records?.length ?? 0,
    numPages: 1,
    params: '',
    exhaustiveTotalRecords: true,
    exhaustiveFacetsCount: true,
    processingTimeMS: 0,
  };

  const mergedMeta = { ...defaultMeta, ...subset.meta };
  mergedMeta.numPages = Math.ceil(mergedMeta.total / mergedMeta.perPage);

  const { records = [], meta, ...rest } = subset;

  return {
    meta: mergedMeta,
    records,
    ...rest,
  };
};

export const createMultiSearchResponse = (...args) => {
  if (!args.length) {
    return {
      results: [createSingleSearchResponse()],
    };
  }

  return {
    results: args.map(createSingleSearchResponse),
  };
};
