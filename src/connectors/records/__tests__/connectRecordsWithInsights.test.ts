import searchHelper, { SearchResults } from '@clinia/search-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createVision } from '../../../../test/mock/createVision';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectRecordsWithInsights from '../connectRecordsWithInsights';

jest.mock('../../../lib/utils/records-absolute-position', () => ({
  addAbsolutePosition: records => records,
}));

describe('connectRecordsWithInsights', () => {
  it('should expose `insights` props', () => {
    const visionInstance = createVision({
      insightsClient() {},
    });

    const rendering = jest.fn();
    const makeWidget = connectRecordsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = searchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        visionInstance,
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
      createRenderOptions({
        visionInstance,
        state: helper.state,
        results,
        helper,
      })
    );

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.insights).toBeInstanceOf(Function);
  });

  it('should preserve props exposed by connectRecords', () => {
    const rendering = jest.fn();
    const makeWidget = connectRecordsWithInsights(rendering, jest.fn());
    const widget = makeWidget({});

    const helper = searchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
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
      createRenderOptions({
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
    const makeWidget = connectRecordsWithInsights(rendering);
    const widget = makeWidget({});
    const helper = searchHelper(createSearchClient(), '', {});
    expect(() => {
      widget.dispose!({ helper, state: helper.state });
    }).not.toThrow();
  });
});
