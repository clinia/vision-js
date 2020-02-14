/** @jsx h */

import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import withInsightsListener from '../insights/listener';

describe('withInsightsListener', () => {
  it('should capture clicks performed on inner elements with data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ ids: ['1'], eventName: 'Add to Cart' })
    );

    const Records = () => (
      <div>
        <button
          data-insights-method="clickedRecordIDsAfterSearch"
          data-insights-payload={payload}
        >
          Add to Cart
        </button>
      </div>
    );

    const insights = jest.fn();

    const records = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ];

    const results = {
      index: 'theIndex',
      queryID: 'theQueryID',
      perPage: 2,
      page: 1,
    };

    const visionInstance = {
      insightsClient: jest.fn(),
    };
    const RecordsWithInsightsListener: any = withInsightsListener(Records);
    const { container } = render(
      <RecordsWithInsightsListener
        records={records}
        results={results}
        visionInstance={visionInstance}
        insights={insights}
      />
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);

    expect(insights).toHaveBeenCalledTimes(1);
    expect(insights).toHaveBeenCalledWith('clickedRecordIDsAfterSearch', {
      eventName: 'Add to Cart',
      ids: ['1'],
    });
  });

  it('should capture clicks performed on inner elements whose parents have data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ ids: ['1'], eventName: 'Product Clicked' })
    );

    const Records = () => (
      <div>
        <a
          data-insights-method="clickedRecordIDsAfterSearch"
          data-insights-payload={payload}
        >
          <h1> Product 1 </h1>
        </a>
      </div>
    );

    const insights = jest.fn();

    const records = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ];

    const results = {
      index: 'theIndex',
      queryID: 'theQueryID',
      perPage: 2,
      page: 1,
    };

    const visionInstance = {
      insightsClient: jest.fn(),
    };
    const RecordsWithInsightsListener: any = withInsightsListener(Records);
    const { container } = render(
      <RecordsWithInsightsListener
        records={records}
        results={results}
        visionInstance={visionInstance}
        insights={insights}
      />
    );
    const innerChild = container.querySelector('h1') as HTMLElement;

    fireEvent.click(innerChild);

    expect(insights).toHaveBeenCalledTimes(1);
    expect(insights).toHaveBeenCalledWith('clickedRecordIDsAfterSearch', {
      eventName: 'Product Clicked',
      ids: ['1'],
    });
  });

  it('should not capture clicks performed on inner elements with no data-insights-method defined', () => {
    const payload = btoa(
      JSON.stringify({ ids: ['1'], eventName: 'Add to Cart' })
    );

    const Records = () => (
      <div>
        <button data-insights-payload={payload}>Add to Cart</button>
      </div>
    );

    const insights = jest.fn();

    const records = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
    ];

    const results = {
      index: 'theIndex',
      queryID: 'theQueryID',
      perPage: 2,
      page: 1,
    };

    const visionInstance = {
      insightsClient: jest.fn(),
    };
    const RecordsWithInsightsListener: any = withInsightsListener(Records);
    const { container } = render(
      <RecordsWithInsightsListener
        records={records}
        results={results}
        visionInstance={visionInstance}
        insights={insights}
      />
    );
    const button = container.querySelector('button') as HTMLButtonElement;

    fireEvent.click(button);

    expect(insights).toHaveBeenCalledTimes(0);
  });
});
