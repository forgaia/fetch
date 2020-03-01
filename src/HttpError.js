export const errorMessages = {
    401: 'Unauthorized, Your token has expired and needs to be renews.',
    404: 'Not Found',
    444: 'Resource Not Found',
    500: 'Sorry, something went wrong.'
};
export default class HttpError extends Error {
    /**
     * @param {number} httpCode
     * @param {string} url
     * @param {string} statusText
     * @param {string} friendlyMessage
     */
    constructor(httpCode, url, statusText, friendlyMessage) {
        super();
        this.url = undefined;
        this.code = undefined;
        this.friendlyMessage = undefined;
        this.name = 'HTTP Error';
        this.code = httpCode;
        this.url = url;
        this.message = statusText || '';
        this.friendlyMessage = friendlyMessage || errorMessages[this.code] || 'Something went wrong.';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}
