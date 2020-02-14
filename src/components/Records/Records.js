/** @jsx h */

import { h } from 'preact';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const Records = ({ results, records, cssClasses, templateProps }) => {
  if (results.records.length === 0) {
    return (
      <Template
        {...templateProps}
        templateKey="empty"
        rootProps={{
          className: cx(cssClasses.root, cssClasses.emptyRoot),
        }}
        data={results}
      />
    );
  }

  return (
    <div className={cssClasses.root}>
      <ol className={cssClasses.list}>
        {records.map((record, position) => (
          <Template
            {...templateProps}
            templateKey="item"
            rootTagName="li"
            rootProps={{ className: cssClasses.item }}
            key={record.id}
            data={{
              ...record,
              __recordIndex: position,
            }}
          />
        ))}
      </ol>
    </div>
  );
};

Records.propTypes = {
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    emptyRoot: PropTypes.string.isRequired,
    item: PropTypes.string.isRequired,
    list: PropTypes.string.isRequired,
  }).isRequired,
  records: PropTypes.array.isRequired,
  results: PropTypes.object.isRequired,
  templateProps: PropTypes.object.isRequired,
};

Records.defaultProps = {
  results: { records: [] },
  records: [],
};

export default Records;
