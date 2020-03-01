export declare const errorMessages: Record<number, string>;
export default class HttpError extends Error {
    url?: string;
    code?: number;
    friendlyMessage?: string;
    /**
     * @param {number} httpCode
     * @param {string} url
     * @param {string} statusText
     * @param {string} friendlyMessage
     */
    constructor(httpCode: number, url: string, statusText: string, friendlyMessage?: string);
}
