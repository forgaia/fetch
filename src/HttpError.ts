export const errorMessages: Record<number, string> = {
  401: 'Unauthorized, Your token has expired and needs to be renews.',
  404: 'Not Found',
  444: 'Resource Not Found',
  500: 'Sorry, something went wrong.'
};

export default class HttpError extends Error {
  public url?: string = undefined;

  public code?: number = undefined;

  public friendlyMessage?: string = undefined;

  /**
   * @param {number} httpCode
   * @param {string} url
   * @param {string} statusText
   * @param {string} friendlyMessage
   */
  constructor(httpCode: number, url: string, statusText: string, friendlyMessage?: string) {
    super();
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
