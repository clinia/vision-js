import { VisionOptions } from './types';
import Vision from './lib/Vision';
import version from './lib/version';

const vision = (options: VisionOptions): Vision => new Vision(options);

vision.version = version;

Object.defineProperty(vision, 'widgets', {
  get() {
    throw new ReferenceError(
      `"vision.widgets" are not available from the ES build.

To import the widgets:

import { searchBox } from 'vision/es/widgets'`
    );
  },
});

Object.defineProperty(vision, 'connectors', {
  get() {
    throw new ReferenceError(
      `"vision.connectors" are not available from the ES build.

To import the connectors:

import { connectSearchBox } from 'vision/es/connectors'`
    );
  },
});

export default vision;
