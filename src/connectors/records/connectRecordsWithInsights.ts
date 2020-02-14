import { withInsights } from '../../lib/insights';
import connectRecords from './connectRecords';

const connectRecordsWithInsights = withInsights(connectRecords);

export default connectRecordsWithInsights;
