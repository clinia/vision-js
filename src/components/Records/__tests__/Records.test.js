/** @jsx h */

import { h } from 'preact';
import { shallow, mount } from 'enzyme';
import Template from '../../Template/Template';
import Records from '../Records';

describe('Records', () => {
  const cssClasses = {
    root: 'root',
    emptyRoot: 'emptyRoot',
    item: 'item',
    list: 'list',
  };

  function shallowRender(extraProps = {}) {
    const props = {
      cssClasses,
      templateProps: {},
      ...extraProps,
    };

    return shallow(<Records {...props} />);
  }

  describe('no results', () => {
    it('should use the empty template if no results', () => {
      const props = {
        results: {
          records: [],
        },
        records: [],
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.props().templateKey).toEqual('empty');
    });

    it('should set the empty CSS class when no results', () => {
      const props = {
        results: {
          records: [],
        },
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.props().rootProps.className).toContain('root');
    });
  });

  describe('individual item templates', () => {
    it('should add an item template for each hit', () => {
      const records = [
        {
          id: 'one',
          foo: 'bar',
        },
        {
          id: 'two',
          foo: 'baz',
        },
      ];
      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper).toHaveLength(2);
      expect(wrapper.at(0).props().templateKey).toEqual('item');
    });

    it('should set the item class to each item', () => {
      const records = [
        {
          id: 'one',
          foo: 'bar',
        },
      ];
      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props).find(Template);

      expect(wrapper.props().rootProps.className).toContain('item');
    });

    it('should wrap the items in a root div element', () => {
      const props = {
        results: {
          records: [
            {
              id: 'one',
              foo: 'bar',
            },
            {
              id: 'two',
              foo: 'baz',
            },
          ],
        },
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props);

      expect(wrapper.name()).toEqual('div');
      expect(wrapper.props().className).toContain('root');
    });

    it('should pass each result data to each item template', () => {
      const records = [
        {
          id: 'one',
          foo: 'bar',
        },
        {
          id: 'two',
          foo: 'baz',
        },
      ];
      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.foo).toEqual('bar');
      expect(wrapper.at(1).props().data.foo).toEqual('baz');
    });

    it('should add the __hitIndex in the list to each item', () => {
      const records = [
        {
          id: 'one',
          foo: 'bar',
        },
        {
          id: 'two',
          foo: 'baz',
        },
      ];
      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).props().data.__hitIndex).toEqual(0);
      expect(wrapper.at(1).props().data.__hitIndex).toEqual(1);
    });

    it('should use the id as the DOM key', () => {
      const records = [
        {
          id: 'BAR',
          foo: 'bar',
        },
        {
          id: 'BAZ',
          foo: 'baz',
        },
      ];
      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'one item',
          },
        },
        cssClasses,
      };

      const wrapper = shallowRender(props).find({ templateKey: 'item' });

      expect(wrapper.at(0).key()).toEqual('BAR');
      expect(wrapper.at(1).key()).toEqual('BAZ');
    });
  });

  describe('markup', () => {
    it('should render <Records />', () => {
      const records = [
        {
          id: 'one',
          foo: 'bar',
        },
        {
          id: 'two',
          foo: 'baz',
        },
      ];

      const props = {
        results: { records },
        records,
        templateProps: {
          templates: {
            item: 'item',
          },
        },
        cssClasses,
      };

      const wrapper = mount(<Records {...props} />);

      expect(wrapper).toMatchSnapshot();
    });
  });
});
