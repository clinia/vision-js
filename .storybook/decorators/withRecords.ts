import { action } from '@storybook/addon-actions';
import clinia from 'clinia/lite';
import vision from '../../src/index';
import defaultPlayground from '../playgrounds/default';

export const withRecords = (
  storyFn: ({
    container,
    vision,
    search,
  }: {
    container: HTMLElement;
    vision: any;
    search: any;
  }) => void,
  searchOptions?: any
) => () => {
  const {
    appId = 'demo-pharmacies',
    apiKey = 'KcLxBhVFP8ooPgQODlAxWqfNg657fTz9',
    indexName = 'health_facility',
    playground = defaultPlayground,
    ...visionOptions
  } = searchOptions || {};

  const urlLogger = action('Routing state');
  const search = vision({
    indexName,
    searchClient: clinia(appId, apiKey),
    routing: {
      router: {
        write: (routeState: object) => {
          urlLogger(JSON.stringify(routeState, null, 2));
        },
        read: () => ({}),
        createURL: () => '',
        onUpdate: () => {},
      },
    },
    ...visionOptions,
  });

  search.addWidgets([
    vision.widgets.configure({
      perPage: 4
    }),
  ]);

  const containerElement = document.createElement('div');

  // Add the preview container to add the stories in
  const previewElement = document.createElement('div');
  previewElement.classList.add('container', 'container-preview');
  containerElement.appendChild(previewElement);

  // Add the playground container to add widgets into
  const playgroundElement = document.createElement('div');
  playgroundElement.classList.add('container', 'container-playground');
  containerElement.appendChild(playgroundElement);

  const leftPanelPlaygroundElement = document.createElement('div');
  leftPanelPlaygroundElement.classList.add('panel-left');
  playgroundElement.appendChild(leftPanelPlaygroundElement);

  const rightPanelPlaygroundElement = document.createElement('div');
  rightPanelPlaygroundElement.classList.add('panel-right');
  playgroundElement.appendChild(rightPanelPlaygroundElement);

  search.addWidgets([
    vision.widgets.configure({
      perPage: 4
    }),
  ]);

  playground({
    search,
    leftPanel: leftPanelPlaygroundElement,
    rightPanel: rightPanelPlaygroundElement,
  });

  storyFn({
    container: previewElement,
    vision,
    search,
  });

  search.start();

  return containerElement;
};
