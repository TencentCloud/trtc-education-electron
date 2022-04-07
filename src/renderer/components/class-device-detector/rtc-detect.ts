/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-useless-constructor */
export default class RtcDetect {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getSystem() {
    return {
      browser: {
        name: 'Chrome',
        version: 'xxx',
      },
      OS: 'iOS',
    };
  }

  isTRTCSupported() {
    return {
      result: true,
    };
  }

  getAPISupported() {
    return {
      isScreenCaptureAPISupported: true,
    };
  }
}
