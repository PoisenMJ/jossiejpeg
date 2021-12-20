import data from './config.json';
var route_prefix = (data.DEV) ? data.DEV_ROUTE_PREFIX : '';
var port = (data.DEV) ? data.DEV_PORT : data.PORT;
export { route_prefix as route_prefix, port as port };