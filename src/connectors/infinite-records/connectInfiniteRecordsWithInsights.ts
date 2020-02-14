import { withInsights } from '../../lib/insights';
import connectInfiniteRecords from './connectInfiniteRecords';

const connectInfiniteRecordsWithInsights = withInsights(connectInfiniteRecords);

export default connectInfiniteRecordsWithInsights;
