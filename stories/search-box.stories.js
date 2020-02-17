import { storiesOf } from '@storybook/html';
import { withRecords } from '../.storybook/decorators';

storiesOf('Basics|SearchBox', module)
  .add(
    'default',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
        }),
      ]);
    })
  )
  .add(
    'with a custom placeholder',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          placeholder: 'Search for products',
        }),
      ]);
    })
  )
  .add(
    'with autofocus',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          autofocus: true,
        }),
      ]);
    })
  )
  .add(
    'do not display the loading indicator',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          showLoadingIndicator: false,
        }),
      ]);
    })
  )
  .add(
    'display loading indicator with a template',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          templates: {
            loadingIndicator: '⚡️',
          },
        }),
      ]);
    })
  )
  .add(
    'with custom templates',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          templates: {
            submit: '<div class="cvi-search-box--magnifier">🔍</div>',
            reset: '<div class="cvi-search-box--reset">✖️</div>',
          },
        }),
      ]);
    })
  )
  .add(
    'search on enter',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          searchAsYouType: false,
        }),
      ]);
    })
  )
  .add(
    'with debounced queryHook',
    withRecords(({ search, container, vision }) => {
      let timerId;
      search.addWidgets([
        vision.widgets.searchBox({
          container,
          queryHook(query, refine) {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
              refine(query);
            }, 100);
          },
        }),
      ]);
    })
  );
