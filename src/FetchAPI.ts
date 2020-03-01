import HttpError from './HttpError';

interface RequestParams extends Partial<Omit<Request, 'body'>> {
  readonly url: string;
  readonly params?: Record<string, any>;
  readonly shouldMockRequest?: boolean;
  readonly body?: string;
}

export default class FetchAPI {
  private static shouldMockAllRequests: boolean = false;

  private static baseUrl: string;

  private static defaultHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  private static defaultRequestInfo: Partial<RequestParams> = {
    method: 'GET'
  };

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

  public static set setDefaultRequestInfo(reqInfo: Partial<Request>) {
    Object.keys(reqInfo).forEach((key: string) => {
      // @ts-ignore
      FetchAPI.defaultRequestInfo[key] = reqInfo[key];
    });
  }

  private static serializeQueryString(params: any): string {
    const urlSearchParams = Object.keys(params).map(key => {
      // Encode objects and array to json. (used for cellIds and drillParams.)
      const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
      return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
    });
    return urlSearchParams.join('&');
  }

  private static getUrl(req: RequestParams): string {
    if (req.params) {
      return `${this.baseUrl}${req.url}?${this.serializeQueryString(req.params)}`;
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
        if (response.ok) {
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
