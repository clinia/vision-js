import searchHelper from '@clinia/search-helper';
import {
  InitOptions,
  RenderOptions,
  DisposeOptions,
  Widget,
} from '../../src/types';
import { createMultiSearchResponse } from './createAPIResponse';
import { createVision } from './createVision';

export const createInitOptions = (
  args: Partial<InitOptions> = {}
): InitOptions => {
  const { visionInstance = createVision(), ...rest } = args;

  return {
    visionInstance,
    parent: visionInstance.mainIndex,
    uiState: visionInstance._initialUiState,
    templatesConfig: visionInstance.templatesConfig,
    helper: visionInstance.helper!,
    state: visionInstance.helper!.state,
    createURL: jest.fn(() => '#'),
    ...rest,
  };
};

export const createRenderOptions = (
  args: Partial<RenderOptions> = {}
): RenderOptions => {
  const { visionInstance = createVision(), ...rest } = args;
  const response = createMultiSearchResponse();
  const helper = args.helper || visionInstance.helper!;
  const results = new searchHelper.SearchResults(
    visionInstance.helper!.state,
    response.results
  );

  return {
    visionInstance,
    templatesConfig: visionInstance.templatesConfig,
    helper,
    state: helper.state,
    results,
    scopedResults: [
      {
        indexId: helper.state.index,
        helper,
        results,
      },
    ],
    searchMetadata: {
      isSearchStalled: false,
    },
    createURL: jest.fn(() => '#'),
    ...rest,
  };
};

export const createDisposeOptions = (
  args: Partial<DisposeOptions> = {}
): DisposeOptions => {
  const visionInstance = createVision();

  return {
    helper: visionInstance.helper!,
    state: visionInstance.helper!.state,
    ...args,
  };
};

export const createWidget = (args: Partial<Widget> = {}): Widget => ({
  init: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  ...args,
});
