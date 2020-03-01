import HttpError from './HttpError';
export default class FetchAPI {
    static setShouldMockAllRequests(shouldMockAllRequests) {
        this.shouldMockAllRequests = shouldMockAllRequests;
    }
    static setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
    }
    static setDefaultHeaders(headers) {
        Object.keys(headers).forEach((key) => {
            FetchAPI.defaultHeaders[key] = headers[key];
        });
    }
    static setAuthorizationToken(token) {
        FetchAPI.setDefaultHeaders({ Authorization: `Bearer ${token}` });
    }
    static set setDefaultRequestInfo(reqInfo) {
        Object.keys(reqInfo).forEach((key) => {
            // @ts-ignore
            FetchAPI.defaultRequestInfo[key] = reqInfo[key];
        });
    }
    static serializeQueryString(params) {
        const urlSearchParams = Object.keys(params).map(key => {
            // Encode objects and array to json. (used for cellIds and drillParams.)
            const value = typeof params[key] === 'object' ? JSON.stringify(params[key]) : params[key];
            return [encodeURIComponent(key), encodeURIComponent(value)].join('=');
        });
        return urlSearchParams.join('&');
    }
    static getUrl(req) {
        if (req.params) {
            return `${this.baseUrl}${req.url}?${this.serializeQueryString(req.params)}`;
        }
        return `${this.baseUrl}${req.url}`;
    }
    static getHeaders(req) {
        const headers = new Headers(this.defaultHeaders);
        if (this.shouldMockAllRequests || req.shouldMockRequest) {
            headers.set('x-mock-response', 'yes');
        }
        return headers;
    }
    static fetch(req) {
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
FetchAPI.shouldMockAllRequests = false;
FetchAPI.defaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
};
FetchAPI.defaultRequestInfo = {
    method: 'GET'
};
