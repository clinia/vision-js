/* eslint-disable no-console */

describe('toWarnDev', () => {
  describe('usage', () => {
    test('fails with incorrect type of message', () => {
      expect(() => {
        // @ts-ignore:next-line
        expect(() => {}).toWarnDev(false);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  if (__DEV__) {
    describe('without message', () => {
      test('does not fail if called', () => {
        expect(() => {
          expect(() => {
            console.warn('warning');
          }).toWarnDev();
        }).not.toThrow();
      });

      test('fails if not called', () => {
        expect(() => {
          expect(() => {}).toWarnDev();
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe('with message', () => {
      test('does not fail with correct message', () => {
        expect(() => {
          expect(() => {
            console.warn('warning');
          }).toWarnDev('warning');
        }).not.toThrow();
      });

      test('fails if a warning is not correct', () => {
        expect(() => {
          expect(() => {
            console.warn('warning');
          }).toWarnDev('another warning');
        }).toThrow(/Unexpected warning recorded./);
      });
    });
  }
});

/* eslint-enable no-console */
