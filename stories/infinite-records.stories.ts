import { storiesOf } from '@storybook/html';
import { withRecords } from '../.storybook/decorators';
import { infiniteRecords } from '../src/widgets';

storiesOf('Results|InfiniteRecords', module)
  .add(
    'default',
    withRecords(({ search, container }) => {
      search.addWidgets([
        infiniteRecords({
          container,
          templates: {
            item: '{{name}}',
          },
        }),
      ]);
    })
  )
  .add(
    'with custom "showMoreText" template',
    withRecords(({ search, container }) => {
      search.addWidgets([
        infiniteRecords({
          container,
          templates: {
            item: '{{name}}',
            showMoreText: 'Load more',
          },
        }),
      ]);
    })
  )
  .add(
    'with transformed items',
    withRecords(({ search, container }) => {
      search.addWidgets([
        infiniteRecords({
          container,
          templates: {
            item: '{{name}}',
          },
          transformItems: items =>
            items.map(item => ({
              ...item,
              name: `${item.name} (transformed)`,
            })),
        }),
      ]);
    })
  )
  .add(
    'with previous button enabled',
    withRecords(
      ({ search, container }) => {
        search.addWidgets([
          infiniteRecords({
            container,
            showPrevious: true,
            templates: {
              item: '{{name}}',
            },
          }),
        ]);
      },
      {
        initialUiState: {
          health_facility: {
            page: 3,
          },
        },
      }
    )
  );
