import data from './config.json';
var route_prefix = (data.DEVELOPMENT) ? data.DEVELOPMENT_ROUTE_PREFIX : '';
export default route_prefix;