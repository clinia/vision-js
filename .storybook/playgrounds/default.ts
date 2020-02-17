import vision from '../../src/index';

export const recordsItemTemplate = `
<article>
  <header>
    <strong>{{ name }}</strong>
  </header>
</article>
`;

function visionPlayground({
  search,
  rightPanel,
}: {
  search: any;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
}) {


  const searchBox = document.createElement('div');
  searchBox.classList.add('searchbox');
  rightPanel.appendChild(searchBox);

  search.addWidgets([
    vision.widgets.searchBox({
      container: searchBox,
      placeholder: 'Search here…',
    }),
  ]);

  const records = document.createElement('div');
  records.classList.add('records');
  rightPanel.appendChild(records);

  search.addWidgets([
    vision.widgets.records({
      container: records,
      templates: {
        item: recordsItemTemplate,
      },
      cssClasses: {
        item: 'records-item',
      },
    }),
  ]);

  const pagination = document.createElement('div');
  rightPanel.appendChild(pagination);

  search.addWidgets([
    vision.widgets.pagination({
      container: pagination,
    }),
  ]);
}

export default visionPlayground;
