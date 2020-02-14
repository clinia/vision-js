import searchHelper, {
  CliniaSearchHelper as Helper,
  DerivedHelper,
  SearchParameters,
  SearchResults,
} from '@clinia/search-helper';
import {
  Vision,
  UiState,
  IndexUiState,
  Widget,
  InitOptions,
  RenderOptions,
  WidgetStateOptions,
  WidgetSearchParametersOptions,
  ScopedResult,
  Client,
} from '../../types';
import {
  createDocumentationMessageGenerator,
  resolveSearchParameters,
  mergeSearchParameters,
  warning,
  capitalize,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'index-widget',
});

type IndexProps = {
  indexName: string;
  indexId?: string;
};

type IndexInitOptions = Pick<
  InitOptions,
  'visionInstance' | 'parent' | 'uiState'
>;

type IndexRenderOptions = Pick<RenderOptions, 'visionInstance'>;

type LocalWidgetSearchParametersOptions = WidgetSearchParametersOptions & {
  initialSearchParameters: SearchParameters;
};

export type Index = Widget & {
  getIndexName(): string;
  getIndexId(): string;
  getHelper(): Helper | null;
  getResults(): SearchResults | null;
  getParent(): Index | null;
  getWidgets(): Widget[];
  addWidgets(widgets: Widget[]): Index;
  removeWidgets(widgets: Widget[]): Index;
  init(options: IndexInitOptions): void;
  render(options: IndexRenderOptions): void;
  dispose(): void;
  getWidgetState(uiState: UiState): UiState;
};

function isIndexWidget(widget: Widget): widget is Index {
  return widget.$$type === 'cvi.index';
}

function getLocalWidgetsState(
  widgets: Widget[],
  widgetStateOptions: WidgetStateOptions
): IndexUiState {
  return widgets
    .filter(widget => !isIndexWidget(widget))
    .reduce<IndexUiState>((uiState, widget) => {
      if (!widget.getWidgetState) {
        return uiState;
      }

      return widget.getWidgetState(uiState, widgetStateOptions);
    }, {});
}

function getLocalWidgetsSearchParameters(
  widgets: Widget[],
  widgetSearchParametersOptions: LocalWidgetSearchParametersOptions
): SearchParameters {
  const { initialSearchParameters, ...rest } = widgetSearchParametersOptions;

  return widgets
    .filter(widget => !isIndexWidget(widget))
    .reduce<SearchParameters>((state, widget) => {
      if (!widget.getWidgetSearchParameters) {
        return state;
      }

      return widget.getWidgetSearchParameters(state, rest);
    }, initialSearchParameters);
}

function resetPageFromWidgets(widgets: Widget[]): void {
  const indexWidgets = widgets.filter(isIndexWidget);

  if (indexWidgets.length === 0) {
    return;
  }

  indexWidgets.forEach(widget => {
    const widgetHelper = widget.getHelper()!;

    // @ts-ignore @TODO: remove "ts-ignore" once `resetPage()` is typed in the helper
    widgetHelper.setState(widgetHelper.state.resetPage());

    resetPageFromWidgets(widget.getWidgets());
  });
}

function resolveScopedResultsFromWidgets(widgets: Widget[]): ScopedResult[] {
  const indexWidgets = widgets.filter(isIndexWidget);

  return indexWidgets.reduce<ScopedResult[]>((scopedResults, current) => {
    return scopedResults.concat(
      {
        indexId: current.getIndexId(),
        results: current.getResults()!,
        helper: current.getHelper()!,
      },
      ...resolveScopedResultsFromWidgets(current.getWidgets())
    );
  }, []);
}

function resolveScopedResultsFromIndex(widget: Index): ScopedResult[] {
  const widgetParent = widget.getParent();
  // If the widget is the root, we consider itself as the only sibling.
  const widgetSiblings = widgetParent ? widgetParent.getWidgets() : [widget];

  return resolveScopedResultsFromWidgets(widgetSiblings);
}

const index = (props: IndexProps): Index => {
  if (props === undefined || props.indexName === undefined) {
    throw new Error(withUsage('The `indexName` option is required.'));
  }

  const { indexName, indexId = indexName } = props;

  let localWidgets: Widget[] = [];
  let localUiState: IndexUiState = {};
  let localVisionInstance: Vision | null = null;
  let localParent: Index | null = null;
  let helper: Helper | null = null;
  let derivedHelper: DerivedHelper | null = null;

  const createURL = (nextState: SearchParameters) =>
    localVisionInstance!._createURL!({
      [indexId]: getLocalWidgetsState(localWidgets, {
        searchParameters: nextState,
        helper: helper!,
      }),
    });

  return {
    $$type: 'cvi.index',

    getIndexName() {
      return indexName;
    },

    getIndexId() {
      return indexId;
    },

    getHelper() {
      return helper;
    },

    getResults() {
      return derivedHelper && derivedHelper.lastResults;
    },

    getParent() {
      return localParent;
    },

    getWidgets() {
      return localWidgets;
    },

    addWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `addWidgets` method expects an array of widgets.')
        );
      }

      if (
        widgets.some(
          widget =>
            typeof widget.init !== 'function' &&
            typeof widget.render !== 'function'
        )
      ) {
        throw new Error(
          withUsage(
            'The widget definition expects a `render` and/or an `init` method.'
          )
        );
      }

      localWidgets = localWidgets.concat(widgets);

      if (localVisionInstance && Boolean(widgets.length)) {
        helper!.setState(
          getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: helper!.state,
          })
        );

        widgets.forEach(widget => {
          if (localVisionInstance && widget.init) {
            widget.init({
              helper: helper!,
              parent: this,
              uiState: {},
              visionInstance: localVisionInstance,
              state: helper!.state,
              templatesConfig: localVisionInstance.templatesConfig,
              createURL,
            });
          }
        });

        localVisionInstance.scheduleSearch();
      }

      return this;
    },

    removeWidgets(widgets) {
      if (!Array.isArray(widgets)) {
        throw new Error(
          withUsage('The `removeWidgets` method expects an array of widgets.')
        );
      }

      if (widgets.some(widget => typeof widget.dispose !== 'function')) {
        throw new Error(
          withUsage('The widget definition expects a `dispose` method.')
        );
      }

      localWidgets = localWidgets.filter(
        widget => widgets.indexOf(widget) === -1
      );

      if (localVisionInstance && Boolean(widgets.length)) {
        const nextState = widgets.reduce((state, widget) => {
          // the `dispose` method exists at this point we already assert it
          const next = widget.dispose!({ helper: helper!, state });

          return next || state;
        }, helper!.state);

        localUiState = getLocalWidgetsState(localWidgets, {
          searchParameters: nextState,
          helper: helper!,
        });

        helper!.setState(
          getLocalWidgetsSearchParameters(localWidgets, {
            uiState: localUiState,
            initialSearchParameters: nextState,
          })
        );

        if (localWidgets.length) {
          localVisionInstance.scheduleSearch();
        }
      }

      return this;
    },

    init({ visionInstance, parent, uiState }: IndexInitOptions) {
      localVisionInstance = visionInstance;
      localParent = parent;
      localUiState = uiState[indexId] || {};

      // The `mainHelper` is already defined at this point. The instance is created
      // inside Vision at the `start` method, which occurs before the `init`
      // step.
      const mainHelper = visionInstance.mainHelper!;
      const parameters = getLocalWidgetsSearchParameters(localWidgets, {
        uiState: localUiState,
        initialSearchParameters: new searchHelper.SearchParameters({
          index: indexName,
        }),
      });

      // This Helper is only used for state management we do not care about the
      // `searchClient`. Only the "main" Helper created at the `Vision`
      // level is aware of the client.
      helper = searchHelper({} as Client, parameters.index, parameters);

      // We forward the call to `search` to the "main" instance of the Helper
      // which is responsible for managing the queries (it's the only one that is
      // aware of the `searchClient`).
      helper.search = () => mainHelper.search();

      derivedHelper = mainHelper.derive(() =>
        mergeSearchParameters(...resolveSearchParameters(this))
      );

      // Subscribe to the Helper state changes for the page before widgets
      // are initialized. This behavior mimics the original one of the Helper.
      // It makes sense to replicate it at the `init` step. We have another
      // listener on `change` below, once `init` is done.
      helper.on('change', ({ isPageReset }) => {
        if (isPageReset) {
          resetPageFromWidgets(localWidgets);
        }
      });

      derivedHelper.on('search', () => {
        // The index does not manage the "staleness" of the search. This is the
        // responsibility of the main instance. It does not make sense to manage
        // it at the index level because it's either: all of them or none of them
        // that are stalled. The queries are performed into a single network request.
        visionInstance.scheduleStalledRender();

        if (__DEV__) {
          // Some connectors are responsible for multiple widgets so we need
          // to map them.
          // eslint-disable-next-line no-inner-declarations
          function getWidgetNames(connectorName: string): string[] {
            switch (connectorName) {
              case 'range':
                return ['rangeInput', 'rangeSlider'];

              case 'menu':
                return ['menu', 'menuSelect'];

              default:
                return [connectorName];
            }
          }

          type StateDescription = {
            connectors: string[];
            widgets: Array<Widget['$$type']>;
          };

          type StateToWidgets = {
            [TParameter in keyof IndexUiState]: StateDescription;
          };

          const stateToWidgetsMap: StateToWidgets = {
            query: {
              connectors: ['connectSearchBox'],
              widgets: ['cvi.searchBox', 'cvi.autocomplete', 'cvi.voiceSearch'],
            },
            refinementList: {
              connectors: ['connectRefinementList'],
              widgets: ['cvi.refinementList'],
            },
            menu: {
              connectors: ['connectMenu'],
              widgets: ['cvi.menu'],
            },
            toggle: {
              connectors: ['connectToggleRefinement'],
              widgets: ['cvi.toggleRefinement'],
            },
            geoSearch: {
              connectors: ['connectGeoSearch'],
              widgets: ['cvi.geoSearch'],
            },
            page: {
              connectors: ['connectPagination'],
              widgets: ['cvi.pagination', 'cvi.infiniteRecords'],
            },
            perPage: {
              connectors: ['connectPerPage'],
              widgets: ['cvi.perPage'],
            },
            configure: {
              connectors: ['connectConfigure'],
              widgets: ['cvi.configure'],
            },
            places: {
              connectors: [],
              widgets: ['cvi.places'],
            },
          };

          const mountedWidgets = this.getWidgets()
            .map(widget => widget.$$type)
            .filter(Boolean);

          type MissingWidgets = Array<[string, StateDescription]>;

          const missingWidgets = Object.keys(localUiState).reduce<
            MissingWidgets
          >((acc, parameter) => {
            const requiredWidgets: Array<Widget['$$type']> | undefined =
              stateToWidgetsMap[parameter] &&
              stateToWidgetsMap[parameter].widgets;

            if (
              requiredWidgets &&
              !requiredWidgets.some(requiredWidget =>
                mountedWidgets.includes(requiredWidget)
              )
            ) {
              acc.push([
                parameter,
                {
                  connectors: stateToWidgetsMap[parameter].connectors,
                  widgets: stateToWidgetsMap[parameter].widgets.map(
                    (widgetIdentifier: string) =>
                      widgetIdentifier.split('cvi.')[1]
                  ),
                },
              ]);
            }

            return acc;
          }, []);

          warning(
            missingWidgets.length === 0,
            `The UI state for the index "${this.getIndexId()}" is not consistent with the widgets mounted.

This can happen when the UI state is specified via \`initialUiState\` or \`routing\` but that the widgets responsible for this state were not added. This results in those query parameters not being sent to the API.

To fully reflect the state, some widgets need to be added to the index "${this.getIndexId()}":

${missingWidgets
  .map(([stateParameter, { widgets }]) => {
    return `- \`${stateParameter}\` needs one of these widgets: ${([] as string[])
      .concat(...widgets.map(name => getWidgetNames(name!)))
      .map((name: string) => `"${name}"`)
      .join(', ')}`;
  })
  .join('\n')}

If you do not wish to display widgets but still want to support their search parameters, you can mount "virtual widgets" that don't render anything:

\`\`\`
${missingWidgets
  .filter(([_stateParameter, { connectors }]) => {
    return connectors.length > 0;
  })
  .map(([_stateParameter, { connectors, widgets }]) => {
    const capitalizedWidget = capitalize(widgets[0]!);
    const connectorName = connectors[0];

    return `const virtual${capitalizedWidget} = ${connectorName}(() => null);`;
  })
  .join('\n')}

search.addWidgets([
  ${missingWidgets
    .filter(([_stateParameter, { connectors }]) => {
      return connectors.length > 0;
    })
    .map(([_stateParameter, { widgets }]) => {
      const capitalizedWidget = capitalize(widgets[0]!);

      return `virtual${capitalizedWidget}({ /* ... */ })`;
    })
    .join(',\n  ')}
]);
\`\`\`

If you're using custom widgets that do set these query parameters, we recommend using connectors instead.`
          );
        }
      });

      derivedHelper.on('result', ({ results }) => {
        // The index does not render the results it schedules a new render
        // to let all the other indices emit their own results. It allows us to
        // run the render process in one pass.
        visionInstance.scheduleRender();

        // the derived helper is the one which actually searches, but the helper
        // which is exposed e.g. via instance.helper, doesn't search, and thus
        // does not have access to lastResults, which it used to in pre-federated
        // search behavior.
        helper!.lastResults = results;
      });

      localWidgets.forEach(widget => {
        if (widget.init) {
          widget.init({
            uiState,
            helper: helper!,
            parent: this,
            visionInstance,
            state: helper!.state,
            templatesConfig: visionInstance.templatesConfig,
            createURL,
          });
        }
      });

      // Subscribe to the Helper state changes for the `uiState` once widgets
      // are initialized. Until the first render, state changes are part of the
      // configuration step. This is mainly for backward compatibility with custom
      // widgets. When the subscription happens before the `init` step, the (static)
      // configuration of the widget is pushed in the URL. That's what we want to avoid.
      helper.on('change', ({ state }) => {
        localUiState = getLocalWidgetsState(localWidgets, {
          searchParameters: state,
          helper: helper!,
        });

        visionInstance.onStateChange();
      });
    },

    render({ visionInstance }: IndexRenderOptions) {
      localWidgets.forEach(widget => {
        // At this point, all the variables used below are set. Both `helper`
        // and `derivedHelper` have been created at the `init` step. The property
        // `lastResults` might be `null` though. It's possible that a stalled render
        // happens before the result e.g with a dynamically added index the request might
        // be delayed. The render is triggered for the complete tree but some parts do
        // not have results yet.

        if (widget.render && derivedHelper!.lastResults) {
          widget.render({
            helper: helper!,
            visionInstance,
            results: derivedHelper!.lastResults,
            scopedResults: resolveScopedResultsFromIndex(this),
            state: derivedHelper!.lastResults._state,
            templatesConfig: visionInstance.templatesConfig,
            createURL,
            searchMetadata: {
              isSearchStalled: visionInstance._isSearchStalled,
            },
          });
        }
      });
    },

    dispose() {
      localWidgets.forEach(widget => {
        if (widget.dispose) {
          // The dispose function is always called once the instance is started
          // (it's an effect of `removeWidgets`). The index is initialized and
          // the Helper is available. We don't care about the return value of
          // `dispose` because the index is removed. We can't call `removeWidgets`
          // because we want to keep the widgets on the instance, to allow idempotent
          // operations on `add` & `remove`.
          widget.dispose({ helper: helper!, state: helper!.state });
        }
      });

      localVisionInstance = null;
      localParent = null;
      helper!.removeAllListeners();
      helper = null;

      derivedHelper!.detach();
      derivedHelper = null;
    },

    getWidgetState(uiState: UiState) {
      return localWidgets
        .filter(isIndexWidget)
        .reduce<UiState>(
          (previousUiState, innerIndex) =>
            innerIndex.getWidgetState(previousUiState),
          {
            ...uiState,
            [this.getIndexId()]: localUiState,
          }
        );
    },
  };
};

export default index;
