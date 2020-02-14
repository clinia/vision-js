import Vision from './Vision';
import version from './version';

import * as connectors from '../connectors/index';
import * as widgets from '../widgets/index';
import * as helpers from '../helpers/index';

import * as routers from './routers/index';
import * as stateMappings from './stateMappings/index';
import { VisionOptions } from '../types';

/**
 * Vision is the main component of VisionJS. This object
 * manages the widget and lets you add new ones.
 *
 * Two parameters are required to get you started with VisionJS:
 *  - `indexName`: the main index that you will use for your new search UI
 *  - `searchClient`: the search client to plug to VisionJS
 *
 * The [search client provided by Clinia](https://github.com/clinia/clinia-client-javascript)
 * needs an `appId` and an `apiKey`.
 *
 * If you want to get up and running quickly with Visionjs, have a
 * look at the [getting started](getting-started.html).
 * @function vision
 * @param {VisionSearchOptions} options The options
 */
const vision = (options: VisionOptions) => new Vision(options);

vision.routers = routers;
vision.stateMappings = stateMappings;
vision.connectors = connectors;
vision.widgets = widgets;
vision.version = version;
vision.insights = helpers.insights;

export default vision;
