import searchHelper, {
  SearchParameters,
  PlainSearchParameters,
  CliniaSearchHelper,
} from '@clinia/search-helper';
import {
  Renderer,
  RendererOptions,
  Unmounter,
  WidgetFactory,
} from '../../types';
import {
  createDocumentationMessageGenerator,
  isPlainObject,
  mergeSearchParameters,
  noop,
} from '../../lib/utils';

type Refine = (searchParameters: PlainSearchParameters) => void;

export interface ConfigureConnectorParams {
  /**
   * A list of search parameters
   * to enable when the widget mounts.
   */
  searchParameters: PlainSearchParameters;
}

export interface ConfigureRendererOptions<TConfigureWidgetParams>
  extends RendererOptions<TConfigureWidgetParams> {
  refine: Refine;
}

export type ConfigureRenderer<TConfigureWidgetParams> = Renderer<
  ConfigureRendererOptions<ConfigureConnectorParams & TConfigureWidgetParams>
>;

export type ConfigureWidgetFactory<TConfigureWidgetParams> = WidgetFactory<
  ConfigureConnectorParams & TConfigureWidgetParams
>;

export type ConfigureConnector = <TConfigureWidgetParams>(
  render?: ConfigureRenderer<TConfigureWidgetParams>,
  unmount?: Unmounter
) => ConfigureWidgetFactory<TConfigureWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'configure',
  connector: true,
});

function getInitialSearchParameters(
  state: SearchParameters,
  widgetParams: ConfigureConnectorParams
): SearchParameters {
  // We leverage the helper internals to remove the `widgetParams` from
  // the state. The function `setQueryParameters` omits the values that
  // are `undefined` on the next state.
  return state.setQueryParameters(
    Object.keys(widgetParams.searchParameters).reduce(
      (acc, key) => ({
        ...acc,
        [key]: undefined,
      }),
      {}
    )
  );
}

const connectConfigure: ConfigureConnector = (
  renderFn = noop,
  unmountFn = noop
) => {
  return widgetParams => {
    if (!widgetParams || !isPlainObject(widgetParams.searchParameters)) {
      throw new Error(
        withUsage('The `searchParameters` option expects an object.')
      );
    }

    type ConnectorState = {
      refine?: Refine;
    };

    const connectorState: ConnectorState = {};

    function refine(helper: CliniaSearchHelper): Refine {
      return (searchParameters: PlainSearchParameters) => {
        // Merge new `searchParameters` with the ones set from other widgets
        const actualState = getInitialSearchParameters(
          helper.state,
          widgetParams
        );
        const nextSearchParameters = mergeSearchParameters(
          actualState,
          new searchHelper.SearchParameters(searchParameters)
        );

        // Trigger a search with the resolved search parameters
        helper.setState(nextSearchParameters).search();

        // Update original `widgetParams.searchParameters` to the new refined one
        widgetParams.searchParameters = searchParameters;
      };
    }

    return {
      $$type: 'cvi.configure',

      init({ visionInstance, helper }) {
        connectorState.refine = refine(helper);

        renderFn(
          {
            refine: connectorState.refine,
            visionInstance,
            widgetParams,
          },
          true
        );
      },

      render({ visionInstance }) {
        renderFn(
          {
            refine: connectorState.refine!,
            visionInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return getInitialSearchParameters(state, widgetParams);
      },

      getWidgetSearchParameters(state, { uiState }) {
        return mergeSearchParameters(
          state,
          new searchHelper.SearchParameters({
            ...uiState.configure,
            ...widgetParams.searchParameters,
          })
        );
      },

      getWidgetState(uiState) {
        return {
          ...uiState,
          configure: {
            ...uiState.configure,
            ...widgetParams.searchParameters,
          },
        };
      },
    };
  };
};

export default connectConfigure;
