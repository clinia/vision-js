import { storiesOf } from '@storybook/html';
import { withRecords, withLifecycle } from '../.storybook/decorators';

storiesOf('Basics|Configure', module)
  .add(
    'Force 1 records per page',
    withRecords(({ search, container, vision }) => {
      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provided to the Configure widget:</p>
        <pre>{ perPage: 1 }</pre>
      `;

      container.appendChild(description);

      search.addWidgets([
        vision.widgets.configure({
          perPage: 1,
        }),
      ]);
    })
  )
  .add(
    'with add/remove',
    withRecords(({ search, container, vision }) => {
      withLifecycle(search, container, () =>
        vision.widgets.configure({
          perPage: 1,
        })
      );

      const description = document.createElement('div');
      description.innerHTML = `
        <p>Search parameters provided to the Configure widget:</p>
        <pre>{ perPage: 1 }</pre>
      `;

      container.appendChild(description);
    })
  );
