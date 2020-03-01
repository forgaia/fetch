interface RequestParams extends Partial<Omit<Request, 'body'>> {
    readonly url: string;
    readonly params?: Record<string, any>;
    readonly shouldMockRequest?: boolean;
    readonly body?: string;
}
export default class FetchAPI {
    private static shouldMockAllRequests;
    private static baseUrl;
    private static defaultHeaders;
    private static defaultRequestInfo;
    static setShouldMockAllRequests(shouldMockAllRequests: boolean): void;
    static setBaseUrl(baseUrl: string): void;
    static setDefaultHeaders(headers: Record<string, string>): void;
    static setAuthorizationToken(token: string): void;
    static set setDefaultRequestInfo(reqInfo: Partial<Request>);
    private static serializeQueryString;
    private static getUrl;
    private static getHeaders;
    static fetch<T = any>(req: RequestParams): Promise<T>;
}
export {};
