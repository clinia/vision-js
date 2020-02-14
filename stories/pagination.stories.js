import { storiesOf } from '@storybook/html';
import { withRecords } from '../.storybook/decorators';

storiesOf('Pagination|Pagination', module)
  .add(
    'default',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          totalPages: 20,
        }),
      ]);
    })
  )
  .add(
    'with padding',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          padding: 6,
        }),
      ]);
    })
  )
  .add(
    'without showFirst',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          showFirst: false,
        }),
      ]);
    })
  )
  .add(
    'without showLast',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          showLast: false,
        }),
      ]);
    })
  )
  .add(
    'without showPrevious',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          showPrevious: false,
        }),
      ]);
    })
  )
  .add(
    'without showNext',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          showNext: false,
        }),
      ]);
    })
  )
  .add(
    'with templates',
    withRecords(({ search, container, vision }) => {
      search.addWidgets([
        vision.widgets.pagination({
          container,
          templates: {
            previous: 'Previous',
            next: 'Next',
            first: 'First',
            last: 'Last',
          },
        }),
      ]);
    })
  );
