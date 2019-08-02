const yolapi = require('../yolapi');
const request = require('./__mocks__/superagent');

describe('session', () => {

  describe('creating a session', () => {

    test('can be used to create a session', () => {
      const session = new yolapi.session(
        'https://some-environment.rainbird.ai',
        'apikey',
        'kmid',
      );
      expect(session).toBeTruthy();
    });

    test('throws an error when the KMID is missing', () => {
      try {
        const session = new yolapi.session(
          'https://some-environment.rainbird.ai',
          'apikey',
          null,
        );
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

    test('throws an error when the API URL is missing', () => {
      try {
        const session = new yolapi.session(
          '',
          'apikey',
          'kmid',
        );
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

    test('throws an error when the API key is missing', () => {
      try {
        const session = new yolapi.session(
          'https://some-environment.rainbird.ai',
          '',
          'kmid',
        );
      } catch (e) {
        expect(e).toBeTruthy();
      }
    });

  });

  describe('undo endpoint', () => {

    let session;

    beforeAll((done) => {
      request.__setMockResponseBody({ id: 123456 });

      session = new yolapi.session(
        'https://some-environment.rainbird.ai',
        'apikey',
        'kmid',
      );

      session.start((err) => {
        expect(err).toBeFalsy();
        done();
      });
    });

    test('should be able call the undo endpoint', (done) => {
      session.undo((err, result) => {
        expect(err).toBeFalsy();
        expect(result).toBeTruthy();
        expect(request.__getRequestUrl()).toEqual('https://some-environment.rainbird.ai/123456/undo');
        done();
      });
    });

    test('should return errors from the undo endpoint', (done) => {
      request.__setMockError(new Error('Failed to find session.'));

      session.undo((err, result) => {
        expect(err).toBeTruthy();
        expect(result).toBeFalsy();
        done();
      });
    });

  });
});
