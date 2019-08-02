const yolapi = require('../yolapi');

describe('session', () => {

  describe('creating a session', () => {

    test('can be used to create a session', () => {
      const session = new yolapi.session(
        'https://some-environment.rainbird.ai',
        'apikey',
        'kmid',
      );
      expect(session).toBeTruthy;
    });

    test('throws an error when the KMID is missing', () => {
      try {
        const session = new yolapi.session(
          'https://some-environment.rainbird.ai',
          'apikey',
          null,
        );
      } catch (e) {
        expect(e).toBeTruthy;
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
        expect(e).toBeTruthy;
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
        expect(e).toBeTruthy;
      }
    });

  });

});
