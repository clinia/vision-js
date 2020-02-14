import searchHelper, { SearchResults } from '@clinia/search-helper';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createVision } from '../../../../test/mock/createVision';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import { Vision, InitOptions, RenderOptions } from '../../../types';
import connectInfiniteRecordsWithInsights from '../connectInfiniteRecordsWithInsights';

jest.mock('../../../lib/utils/records-absolute-position', () => ({
  addAbsolutePosition: records => records,
}));

describe('connectInfiniteRecordsWithInsights', () => {
  const createVisionWithInsights = (): Vision =>
    createVision({
      insightsClient() {},
    });

  const createInitOptionsWithInsights = (
    args: Partial<InitOptions>
  ): InitOptions =>
    createInitOptions({
      visionInstance: createVisionWithInsights(),
      ...args,
    });

  const createRenderOptionsWithInsights = (
    args: Partial<RenderOptions>
  ): RenderOptions =>
    createRenderOptions({
      visionInstance: createVisionWithInsights(),
      ...args,
    });

  it('should expose `insights` props', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteRecordsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = searchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptionsWithInsights({
        state: helper.state,
        helper,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.insights).toBeUndefined();

    const records = [
      { fake: 'data', id: '1' },
      { sample: 'infos', id: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptionsWithInsights({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });

  it('should preserve props exposed by connectInfiniteRecords', () => {
    const rendering = jest.fn();
    const makeWidget = connectInfiniteRecordsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = searchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptionsWithInsights({
        state: helper.state,
        helper,
      })
    );

    const records = [
      { fake: 'data', id: '1' },
      { sample: 'infos', id: '2' },
    ];
    const results = new SearchResults(helper.state, [
      createSingleSearchResponse({ records }),
    ]);

    widget.render!(
      createRenderOptionsWithInsights({
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.records).toEqual(
      expect.objectContaining(records)
    );
    expect(secondRenderingOptions.results).toEqual(results);
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    // @ts-ignore:next-line
    const makeWidget = connectInfiniteRecordsWithInsights(rendering);
    const helper = searchHelper(createSearchClient(), '', {});
    const widget = makeWidget({});
    expect(() =>
      widget.dispose!({ helper, state: helper.state })
    ).not.toThrow();
  });
});
