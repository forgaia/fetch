import HttpError from './HttpError';

export interface RequestConfig {
  /**
   * Returns the URL of request as a string.
   */
  readonly url: string;
  /**
   * Returns request's HTTP method, which is "GET" by default.
   */
  readonly method?: string;
  /**
   * List if allowed query string params for this endpoint.
   * All allowed keys must exists inside the the provided params array.
   */
  readonly allowedParams: string[];
  /**
   * Whether to add the mock HTTP header to the Request or not.
   */
  readonly shouldMockRequest?: boolean;
}

interface RequestParams extends Partial<Omit<Request, 'body' | 'url' | 'method'>>, RequestConfig {
  readonly params?: Record<string, any>;
  readonly body?: string;
}

export default class FetchAPI {
  private static shouldMockAllRequests: boolean = false;

  private static baseUrl: string;

  /**
   * Treat some http code as valid response
   * For Example: in PM Project we treat 422 (Validation error) as valid response)
   */
  private static whitelistedHTTPCodes: number[] = [];

  private static defaultHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  private static defaultRequestInfo: Partial<RequestParams> = {
    method: 'GET'
  };

  public static setWhitelistedHTTPCodes(errorCodes: number[]) {
    this.whitelistedHTTPCodes = errorCodes;
  }

  public static setShouldMockAllRequests(shouldMockAllRequests: boolean) {
    this.shouldMockAllRequests = shouldMockAllRequests;
  }

  public static setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static setDefaultHeaders(headers: Record<string, string>) {
    Object.keys(headers).forEach((key: string) => {
      FetchAPI.defaultHeaders[key] = headers[key];
    });
  }

  public static setAuthorizationToken(token: string) {
    FetchAPI.setDefaultHeaders({ Authorization: `Bearer ${token}` });
  }

  public static setDefaultRequestInfo(reqInfo: Partial<Request>) {
    Object.keys(reqInfo).forEach((key: string) => {
      // @ts-ignore
      FetchAPI.defaultRequestInfo[key] = reqInfo[key];
    });
  }

  /**
   * @param params
   * @param allowedParams
   */
  private static serializeQueryString(params: any, allowedParams: string[]): string {
    return allowedParams
      .map(key => {
        // Encode objects and array to json. (used for cellIds and drillParams.)
        const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
        return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
      })
      .join('&');
  }

  private static getUrl(req: RequestParams): string {
    if (req.params) {
      const qs = this.serializeQueryString(req.params, req.allowedParams);
      return `${this.baseUrl}${req.url}${qs ? `?${qs}` : ''}`;
    }
    return `${this.baseUrl}${req.url}`;
  }

  private static getHeaders(req: RequestParams): Headers {
    const headers = new Headers(this.defaultHeaders);

    if (this.shouldMockAllRequests || req.shouldMockRequest) {
      headers.set('x-mock-response', 'yes');
    }

    return headers;
  }

  public static fetch<T = any>(req: RequestParams): Promise<T> {
    const url = this.getUrl(req);

    return fetch(url, {
      ...this.defaultRequestInfo,
      ...req,
      headers: this.getHeaders(req)
    })
      .then(response => {
        if (response.ok || this.whitelistedHTTPCodes.includes(response.status)) {
          return response.json();
        }

        return response.json().then(json => {
          if (json.status_code) {
            // The API provides custom response on errors. As shows in the example below. This code handles this situation by creating custom HttpError Class which allows sentry.io and AppDynamics to capture the error information.
            // json example: {
            // status_code: 404;
            // title: "Resource Not Found"
            // message: "Requested resource is unavailable, it's either been moved or deleted."
            // }
            return Promise.reject(new HttpError(json.status_code, response.url, json.message, json.title));
          }
          return Promise.reject(new HttpError(response.status, response.url, response.statusText));
        });
      })
      .catch(error => {
        throw new HttpError(error.code || 500, url, error.message || '', error.friendlyMessage);
      });
  }
}
