import { apiFetch } from '@lib';

const basePath = '/readable';

const readableBasicFromApi = (params = {}, config = {}) => apiFetch.stream(`${basePath}/basic`, { params, ...config });

const readableDataFromApi = (params = {}, config = {}) => apiFetch.stream(`${basePath}/data`, { params, ...config });

const readableLogsFromApi = (params = {}, config = {}) => apiFetch.stream(`${basePath}/logs`, { params, ...config });

const readableCustomFromApi = (params = {}, config = {}) =>
  apiFetch.stream(`${basePath}/custom`, { params, ...config });

export { readableBasicFromApi, readableDataFromApi, readableLogsFromApi, readableCustomFromApi };
