/**
 * The `ApiFetch` class provides a utility for making HTTP requests with configurable base URLs,
 * default headers, and support for request and response interceptors. It simplifies interaction
 * with APIs by handling common patterns like building full URLs, adding query parameters, and
 * managing JSON content negotiation.
 */
class ApiFetch {
  constructor(config = {}) {
    this.baseURL = config.baseURL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api/v1';
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    };

    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(onFulfilled, onRejected) {
    this.requestInterceptors.push({ onFulfilled, onRejected });
  }

  addResponseInterceptor(onFulfilled, onRejected) {
    this.responseInterceptors.push({ onFulfilled, onRejected });
  }

  async processRequestInterceptors(config) {
    let processedConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      if (interceptor.onFulfilled) {
        processedConfig = await interceptor.onFulfilled(processedConfig);
      }
    }

    return processedConfig;
  }

  async processResponseInterceptors(response) {
    let processedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      if (response.ok && interceptor.onFulfilled) {
        processedResponse = await interceptor.onFulfilled(response);
      } else if (!response.ok && interceptor.onRejected) {
        throw await interceptor.onRejected(response);
      }
    }

    return processedResponse;
  }

  buildUrl(url) {
    if (url.startsWith('http')) return url;
    return `${this.baseURL}${url.startsWith('/') ? url : `/${url}`}`;
  }

  buildQueryString(params) {
    if (!params || Object.keys(params).length === 0) return '';
    return '?' + new URLSearchParams(params).toString();
  }

  async request(method, url, config = {}) {
    const processedConfig = await this.processRequestInterceptors({
      method: method.toUpperCase(),
      url,
      ...this.defaultConfig,
      ...config,
    });

    const fullUrl = this.buildUrl(processedConfig.url) + this.buildQueryString(processedConfig.params);

    const fetchOptions = {
      method: processedConfig.method,
      headers: processedConfig.headers,
      signal: processedConfig.signal,
    };

    if (processedConfig.data && !['GET', 'HEAD'].includes(processedConfig.method)) {
      fetchOptions.body =
        typeof processedConfig.data === 'string' ? processedConfig.data : JSON.stringify(processedConfig.data);
    }

    const response = await fetch(fullUrl, fetchOptions);

    return this.processResponseInterceptors(response);
  }

  get(url, config = {}) {
    return this.request('GET', url, config);
  }

  post(url, data, config = {}) {
    return this.request('POST', url, { ...config, data });
  }

  put(url, data, config = {}) {
    return this.request('PUT', url, { ...config, data });
  }

  delete(url, config = {}) {
    return this.request('DELETE', url, config);
  }

  patch(url, data, config = {}) {
    return this.request('PATCH', url, { ...config, data });
  }

  async stream(url, config = {}) {
    const processedConfig = await this.processRequestInterceptors({
      method: 'GET',
      url,
      ...this.defaultConfig,
      ...config,
    });

    const fullUrl = this.buildUrl(processedConfig.url) + this.buildQueryString(processedConfig.params);

    const fetchOptions = {
      method: 'GET',
      headers: processedConfig.headers,
      signal: processedConfig.signal,
    };

    return fetch(fullUrl, fetchOptions);
  }
}

/**
 * An instance of ApiFetch used to interact with the application's API.
 *
 * This object facilitates making HTTP requests to the backend API. The base URL for
 * the API is determined dynamically using the `VITE_API_URL` environment variable.
 * If the environment variable is not set, it defaults to `http://127.0.0.1:5001/api/v1`.
 *
 * @type {ApiFetch}
 */
const apiFetch = new ApiFetch({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api/v1',
});

apiFetch.addRequestInterceptor(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

apiFetch.addResponseInterceptor(
  async response => {
    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json();
    }
    return response.text();
  },
  async error => {
    let errorMessage = 'An error occurred while processing your request.';

    if (error instanceof Response) {
      try {
        const errorData = await error.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      }
    }

    return Promise.reject(errorMessage);
  },
);

export default apiFetch;
