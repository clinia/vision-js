import { render } from 'preact';
import defaultTemplates from '../defaultTemplates';
import records from '../records';

jest.mock('preact', () => {
  const module = require.requireActual('preact');

  module.render = jest.fn();

  return module;
});

describe('Usage', () => {
  it('throws without container', () => {
    expect(() => {
      // @ts-ignore
      records({ container: undefined });
    }).toThrowErrorMatchingSnapshot();
  });
});

describe('records()', () => {
  let container;
  let templateProps;
  let widget;
  let results;

  beforeEach(() => {
    render.mockClear();

    container = document.createElement('div');
    templateProps = {
      templatesConfig: undefined,
      templates: defaultTemplates,
      useCustomCompileOptions: { item: false, empty: false },
    };
    widget = records({ container, cssClasses: { root: ['root', 'cx'] } });
    widget.init({ visionInstance: { templateProps } });
    results = {
      records: [{ first: 'hit', second: 'hit' }],
      perPage: 4,
      page: 2,
    };
  });

  it('calls twice render(<Records props />, container)', () => {
    widget.render({ results });
    widget.render({ results });

    const [firstRender, secondRender] = render.mock.calls;

    expect(render).toHaveBeenCalledTimes(2);
    expect(firstRender[0].props).toMatchSnapshot();
    expect(firstRender[1]).toEqual(container);
    expect(secondRender[0].props).toMatchSnapshot();
    expect(secondRender[1]).toEqual(container);
  });

  it('renders transformed items', () => {
    widget = records({
      container,
      transformItems: items =>
        items.map(item => ({ ...item, transformed: true })),
    });

    widget.init({ visionInstance: {} });
    widget.render({ results });

    const [firstRender] = render.mock.calls;

    expect(firstRender[0].props).toMatchSnapshot();
  });

  it('should add __position key with absolute position', () => {
    results = { ...results, page: 4, perPage: 10 };
    const state = { page: results.page };

    widget.render({ results, state });

    expect(results.records[0].__position).toEqual(41);
  });
});
