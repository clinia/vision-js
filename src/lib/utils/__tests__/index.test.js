import searchHelper from '@clinia/search-helper';
import * as utils from '..';

describe('capitalize', () => {
  it('should capitalize the first character only', () => {
    expect(utils.capitalize('hello')).toBe('Hello');
  });
});

describe('utils.getContainerNode', () => {
  it('should be able to get a node from a node', () => {
    const d = document.body;
    expect(utils.getContainerNode(d)).toEqual(d);
  });

  it('should be able to retrieve an element from a css selector', () => {
    const d = document.createElement('div');
    d.className = 'test';
    document.body.appendChild(d);

    expect(utils.getContainerNode('.test')).toEqual(d);
  });

  it('should throw for other types of object', () => {
    expect(utils.getContainerNode.bind(utils, undefined)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, null)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, {})).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, 42)).toThrow(Error);
    expect(utils.getContainerNode.bind(utils, [])).toThrow(Error);
  });

  it('should throw when not a correct selector', () => {
    expect(utils.getContainerNode.bind(utils, '.not-in-dom')).toThrow(Error);
  });
});

describe('utils.isDomElement', () => {
  it('should return true for dom element', () => {
    expect(utils.isDomElement(document.body)).toBe(true);
  });

  it('should return false for dom element', () => {
    expect(utils.isDomElement()).toBe(false);
    expect(utils.isDomElement(undefined)).toBe(false);
    expect(utils.isDomElement(null)).toBe(false);
    expect(utils.isDomElement([])).toBe(false);
    expect(utils.isDomElement({})).toBe(false);
    expect(utils.isDomElement('')).toBe(false);
    expect(utils.isDomElement(42)).toBe(false);
  });
});

describe('utils.prepareTemplateProps', () => {
  const defaultTemplates = {
    foo: 'toto',
    bar: 'tata',
  };
  const templatesConfig = [];

  it('should return the default templates and set useCustomCompileOptions to false when using the defaults', () => {
    const defaultsPrepared = utils.prepareTemplateProps({
      defaultTemplates,
      undefined,
      templatesConfig,
    });

    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: false,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual(defaultTemplates);
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should return the missing default templates and set useCustomCompileOptions for the custom template', () => {
    const templates = { foo: 'baz' };
    const defaultsPrepared = utils.prepareTemplateProps({
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(defaultsPrepared.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
    });
    expect(defaultsPrepared.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(defaultsPrepared.templatesConfig).toBe(templatesConfig);
  });

  it('should add also the templates that are not in the defaults', () => {
    const templates = {
      foo: 'something else',
      baz: 'Of course!',
    };

    const preparedProps = utils.prepareTemplateProps({
      defaultTemplates,
      templates,
      templatesConfig,
    });

    expect(preparedProps.useCustomCompileOptions).toEqual({
      foo: true,
      bar: false,
      baz: true,
    });
    expect(preparedProps.templates).toEqual({
      ...defaultTemplates,
      ...templates,
    });
    expect(preparedProps.templatesConfig).toBe(templatesConfig);
  });
});

describe('utils.renderTemplate', () => {
  it('expect to process templates as string', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with {{type}}' };
    const data = { type: 'strings' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with strings';

    expect(actual).toBe(expectation);
  });

  it('expect to process templates as function', () => {
    const templateKey = 'test';
    const templates = { test: data => `it works with ${data.type}` };
    const data = { type: 'functions' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
    });

    const expectation = 'it works with functions';

    expect(actual).toBe(expectation);
  });

  it('expect to use custom compiler options', () => {
    const templateKey = 'test';
    const templates = { test: 'it works with <%options%>' };
    const data = { options: 'custom delimiter' };
    const compileOptions = { delimiters: '<% %>' };

    const actual = utils.renderTemplate({
      templateKey,
      templates,
      data,
      compileOptions,
    });

    const expectation = 'it works with custom delimiter';

    expect(actual).toBe(expectation);
  });

  it('expect to compress templates', () => {
    expect(
      utils.renderTemplate({
        templateKey: 'message',
        templates: {
          message: ` <h1> hello</h1>
        <p>message</p> `,
        },
      })
    ).toMatchSnapshot();
  });

  it('expect to throw when the template is not a function or a string', () => {
    const actual0 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: {},
      });

    const actual1 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: { test: null },
      });

    const actual2 = () =>
      utils.renderTemplate({
        templateKey: 'test',
        templates: { test: 10 },
      });

    const expectation0 = `Template must be 'string' or 'function', was 'undefined' (key: test)`;
    const expectation1 = `Template must be 'string' or 'function', was 'object' (key: test)`;
    const expectation2 = `Template must be 'string' or 'function', was 'number' (key: test)`;

    expect(() => actual0()).toThrow(expectation0);
    expect(() => actual1()).toThrow(expectation1);
    expect(() => actual2()).toThrow(expectation2);
  });

  describe('with helpers', () => {
    it('expect to call the relevant function', () => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis: (text, render) => `<em>${render(text)}</em>`,
      };

      const actual = utils.renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '<em>helpers</em>';

      expect(actual).toBe(expectation);
    });

    it('expect to set the context (`this`) to the template `data`', done => {
      const templateKey = 'test';
      const templates = {
        test: '{{#helpers.emphasis}}{{feature}}{{/helpers.emphasis}}',
      };

      const data = {
        feature: 'helpers',
      };

      const helpers = {
        emphasis() {
          // context will be different when using arrow function (lexical scope used)
          expect(this).toBe(data);
          done();
        },
      };

      const actual = utils.renderTemplate({
        templateKey,
        templates,
        data,
        helpers,
      });

      const expectation = '';

      expect(actual).toBe(expectation);
    });
  });
});

describe('utils.getRefinements', () => {
  let helper;
  let results;

  beforeEach(() => {
    helper = searchHelper({}, 'my_index', {
      facets: ['facet1', 'facet2', 'numericFacet1'],
      disjunctiveFacets: [
        'disjunctiveFacet1',
        'disjunctiveFacet2',
        'numericDisjunctiveFacet',
      ],
    });
    results = {};
  });

  it('should retrieve one facetRefinement', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');
    const expected = [
      { type: 'facet', property: 'facet1', name: 'facet1val1' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve one query refinement when `clearsQuery` is true', () => {
    helper.setQuery('a query');
    const expected = [
      {
        type: 'query',
        property: 'query',
        name: 'a query',
        query: 'a query',
      },
    ];
    const clearsQuery = true;
    expect(
      utils.getRefinements(results, helper.state, clearsQuery)
    ).toContainEqual(expected[0]);
  });

  it('should not retrieve any query refinements if `clearsQuery` if false', () => {
    helper.setQuery('a query');
    const expected = [];
    const clearsQuery = false;
    expect(utils.getRefinements(results, helper.state, clearsQuery)).toEqual(
      expected
    );
  });

  it('should retrieve multiple facetsRefinements on one facet', () => {
    helper
      .toggleFacetRefinement('facet1', 'facet1val1')
      .toggleFacetRefinement('facet1', 'facet1val2');
    const expected = [
      { type: 'facet', property: 'facet1', name: 'facet1val1' },
      { type: 'facet', property: 'facet1', name: 'facet1val2' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
  });

  it('should retrieve multiple facetsRefinements on multiple facets', () => {
    helper
      .toggleFacetRefinement('facet1', 'facet1val1')
      .toggleFacetRefinement('facet1', 'facet1val2')
      .toggleFacetRefinement('facet2', 'facet2val1');
    const expected = [
      { type: 'facet', property: 'facet1', name: 'facet1val1' },
      { type: 'facet', property: 'facet1', name: 'facet1val2' },
      { type: 'facet', property: 'facet2', name: 'facet2val1' },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
  });

  it('should have a count for a facetRefinement if available', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          data: {
            facet1val1: 4,
          },
        },
      ],
    };
    const expected = [
      { type: 'facet', property: 'facet1', name: 'facet1val1', count: 4 },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should have exhaustive for a facetRefinement if available', () => {
    helper.toggleFacetRefinement('facet1', 'facet1val1');
    results = {
      facets: [
        {
          name: 'facet1',
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'facet',
        property: 'facet1',
        name: 'facet1val1',
        exhaustive: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve one facetExclude', () => {
    helper.toggleFacetExclusion('facet1', 'facet1exclude1');
    const expected = [
      {
        type: 'exclude',
        property: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve multiple facetsExcludes on one facet', () => {
    helper
      .toggleFacetExclusion('facet1', 'facet1exclude1')
      .toggleFacetExclusion('facet1', 'facet1exclude2');
    const expected = [
      {
        type: 'exclude',
        property: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        property: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
  });

  it('should retrieve multiple facetsExcludes on multiple facets', () => {
    helper
      .toggleFacetExclusion('facet1', 'facet1exclude1')
      .toggleFacetExclusion('facet1', 'facet1exclude2')
      .toggleFacetExclusion('facet2', 'facet2exclude1');
    const expected = [
      {
        type: 'exclude',
        property: 'facet1',
        name: 'facet1exclude1',
        exclude: true,
      },
      {
        type: 'exclude',
        property: 'facet1',
        name: 'facet1exclude2',
        exclude: true,
      },
      {
        type: 'exclude',
        property: 'facet2',
        name: 'facet2exclude1',
        exclude: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
  });

  it('should retrieve one disjunctiveFacetRefinement', () => {
    helper.addDisjunctiveFacetRefinement(
      'disjunctiveFacet1',
      'disjunctiveFacet1val1'
    );
    const expected = [
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on one facet', () => {
    helper
      .addDisjunctiveFacetRefinement(
        'disjunctiveFacet1',
        'disjunctiveFacet1val1'
      )
      .addDisjunctiveFacetRefinement(
        'disjunctiveFacet1',
        'disjunctiveFacet1val2'
      );
    const expected = [
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
  });

  it('should retrieve multiple disjunctiveFacetsRefinements on multiple facets', () => {
    helper
      .toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1')
      .toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val2')
      .toggleFacetRefinement('disjunctiveFacet2', 'disjunctiveFacet2val1');
    const expected = [
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
      },
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val2',
      },
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet2',
        name: 'disjunctiveFacet2val1',
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[1]
    );
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[2]
    );
  });

  it('should have a count for a disjunctiveFacetRefinement if available', () => {
    helper.toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          data: {
            disjunctiveFacet1val1: 4,
          },
        },
      ],
    };
    const expected = [
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        count: 4,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });

  it('should have exhaustive for a disjunctiveFacetRefinement if available', () => {
    helper.toggleFacetRefinement('disjunctiveFacet1', 'disjunctiveFacet1val1');
    results = {
      disjunctiveFacets: [
        {
          name: 'disjunctiveFacet1',
          exhaustive: true,
        },
      ],
    };
    const expected = [
      {
        type: 'disjunctive',
        property: 'disjunctiveFacet1',
        name: 'disjunctiveFacet1val1',
        exhaustive: true,
      },
    ];
    expect(utils.getRefinements(results, helper.state)).toContainEqual(
      expected[0]
    );
  });
});

describe('utils.deprecate', () => {
  const sum = (...args) => args.reduce((acc, _) => acc + _, 0);

  it('expect to call initial function and print message', () => {
    const warn = jest.spyOn(global.console, 'warn');
    const fn = utils.deprecate(sum, 'message');

    const expectation = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation);
    expect(warn).toHaveBeenCalledWith('[VisionJS]: message');

    warn.mockReset();
    warn.mockRestore();
  });

  it('expect to call initial function twice and print message once', () => {
    const warn = jest.spyOn(global.console, 'warn');
    const fn = utils.deprecate(sum, 'message');

    const expectation0 = fn(1, 2, 3);
    const expectation1 = fn(1, 2, 3);
    const actual = 6;

    expect(actual).toBe(expectation0);
    expect(actual).toBe(expectation1);
    expect(warn).toHaveBeenCalledTimes(1);

    warn.mockReset();
    warn.mockRestore();
  });
});

describe('utils.warning', () => {
  let warn;

  beforeEach(() => {
    warn = jest.spyOn(global.console, 'warn');
  });

  afterEach(() => {
    warn.mockReset();
    warn.mockRestore();
    utils.warning.cache = {};
  });

  it('prints a warning message with a false condition', () => {
    utils.warning(false, 'message');

    expect(warn).toHaveBeenCalledWith('[VisionJS]: message');
  });

  it('does not print a warning message with a true condition', () => {
    utils.warning(true, 'message');

    expect(warn).toHaveBeenCalledTimes(0);
  });

  it('prints the same warning message only once', () => {
    utils.warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);

    utils.warning(false, 'message');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});

describe('utils.aroundLatLngToPosition', () => {
  it.each([
    ['10,12', { lat: 10, lng: 12 }],
    ['10,    12', { lat: 10, lng: 12 }],
    ['10.15,12', { lat: 10.15, lng: 12 }],
    ['10,12.15', { lat: 10, lng: 12.15 }],
  ])('expect to return a Position from a string: %j', (input, expectation) => {
    expect(utils.aroundLatLngToPosition(input)).toEqual(expectation);
  });

  it.each([['10a,12'], ['10.    12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => utils.aroundLatLngToPosition(input)).toThrow(
        `Invalid value for "aroundLatLng" parameter: "${input}"`
      );
    }
  );
});

describe('utils.insideBoundingBoxToBoundingBox', () => {
  it.each([
    [
      '10,12,12,14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10,   12    ,12      ,    14',
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      '10.15,12.15,12.15,14.15',
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from a string: %j',
    (input, expectation) => {
      expect(utils.insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([
    [
      [[10, 12, 12, 14]],
      {
        northEast: { lat: 10, lng: 12 },
        southWest: { lat: 12, lng: 14 },
      },
    ],
    [
      [[10.15, 12.15, 12.15, 14.15]],
      {
        northEast: { lat: 10.15, lng: 12.15 },
        southWest: { lat: 12.15, lng: 14.15 },
      },
    ],
  ])(
    'expect to return a BoundingBox from an array: %j',
    (input, expectation) => {
      expect(utils.insideBoundingBoxToBoundingBox(input)).toEqual(expectation);
    }
  );

  it.each([[''], ['10'], ['10,12'], ['10,12,12'], ['10.  15,12,12']])(
    'expect to throw an error with: %j',
    input => {
      expect(() => utils.insideBoundingBoxToBoundingBox(input)).toThrow(
        `Invalid value for "insideBoundingBox" parameter: "${input}"`
      );
    }
  );

  it.each([[[]], [[[]]]])('expect to throw an error with: %j', input => {
    expect(() => utils.insideBoundingBoxToBoundingBox(input)).toThrow(
      `Invalid value for "insideBoundingBox" parameter: [${input}]`
    );
  });
});

describe('utils.getPropertyByPath', () => {
  it('should be able to get a property', () => {
    const object = {
      name: 'name',
    };

    expect(utils.getPropertyByPath(object, 'name')).toBe('name');
  });

  it('should be able to get a nested property', () => {
    const object = {
      nested: {
        name: 'name',
      },
    };

    expect(utils.getPropertyByPath(object, 'nested.name')).toBe('name');
  });

  it('returns undefined if does not exist', () => {
    const object = {};

    expect(utils.getPropertyByPath(object, 'random')).toBe(undefined);
  });

  it('should stop traversing when property is not an object', () => {
    const object = {
      nested: {
        names: ['name'],
      },
    };

    expect(utils.getPropertyByPath(object, 'nested.name')).toBe(undefined);
  });
});

describe('utils.addAbsolutePosition', () => {
  it('should equal index + 1 on first page (page 0)', () => {
    const records = utils.addAbsolutePosition([{ id: 1 }, { id: 2 }], 0, 2);
    expect(records[0].__position).toEqual(1);
    expect(records[1].__position).toEqual(2);
  });
  it('should add offset of 2 on second page (page 1)', () => {
    const records = utils.addAbsolutePosition([{ id: 1 }, { id: 2 }], 1, 2);
    expect(records[0].__position).toEqual(3);
    expect(records[1].__position).toEqual(4);
  });
});

describe('utils.addQueryID', () => {
  it('should add __queryID to every record', () => {
    const records = utils.addQueryID([{ id: 1 }, { id: 2 }], 'theQueryID');
    expect(records[0].__queryID).toEqual('theQueryID');
    expect(records[1].__queryID).toEqual('theQueryID');
  });
});
