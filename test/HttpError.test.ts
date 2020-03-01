import HttpError, { errorMessages } from '../src/HttpError';

describe('HttpError', () => {
  const error = new HttpError(500, '/url', 'error', 'Something went wrong.');
  it('inherit Error class', () => {
    expect(error).toBeInstanceOf(Error);
  });

  it('code is set', () => {
    expect(error.code).toEqual(500);
  });

  it('name is set', () => {
    expect(error.name).toEqual('HTTP Error');
  });
  it('Override correct friendlyMessage for known status', () => {
    expect(error.friendlyMessage).toEqual('Something went wrong.');
  });
  it('has fallback friendlyMessage for unknown status', () => {
    const error2 = new HttpError(999, '/url', 'error');
    expect(error2.friendlyMessage).toEqual('Something went wrong.');
  });

  it('has correct friendlyMessage for known status 500', () => {
    const error2 = new HttpError(500, '/url', 'error');
    expect(error2.friendlyMessage).toEqual(errorMessages[500]);
  });
  it('has correct friendlyMessage for known status 401', () => {
    const error2 = new HttpError(401, '/url', 'error');
    expect(error2.friendlyMessage).toEqual(errorMessages[401]);
  });
  it('has correct friendlyMessage for known status 404', () => {
    const error2 = new HttpError(404, '/url', 'error');
    expect(error2.friendlyMessage).toEqual(errorMessages[404]);
  });
  it('has correct friendlyMessage for known status 444', () => {
    const error2 = new HttpError(444, '/url', 'error');
    expect(error2.friendlyMessage).toEqual(errorMessages[444]);
  });
});
