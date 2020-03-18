// Libs for testing
const { expect } = require('chai');
const sinon = require('sinon');
const moment = require('moment');

// Constants
const SECRET = '1234';
const VALID_SECONDS = 600;

const {
  DEC_31_2019_11_59_PM,
  FEB_28_2020_23_59_PM,
  JAN_01_2020_00_00_AM,
  JAN_01_2020_00_59_AM
} = require('./test-timestamps');

// Class under test
const SimpleOtp = require('../app');

describe('Validate every second across the full step', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should work across year boundaries', () => {
    const creationTime = DEC_31_2019_11_59_PM;

    for (let iSecond = 0; iSecond <= VALID_SECONDS; iSecond++) {
      testToken({
        createdAt: creationTime,
        verifiedAt: moment(creationTime)
          .add(iSecond, 's')
          .toISOString(),
        expectedExpiryResult: false,
        expectedValidityResult: true
      });
    }
  });

  it('should work on leap days', () => {
    const creationTime = FEB_28_2020_23_59_PM;

    for (let iSecond = 0; iSecond <= VALID_SECONDS; iSecond++) {
      testToken({
        createdAt: creationTime,
        verifiedAt: moment(creationTime)
          .add(iSecond, 's')
          .toISOString(),
        expectedExpiryResult: false,
        expectedValidityResult: true
      });
    }
  });

  it('should work within a single window', () => {
    const creationTime = JAN_01_2020_00_00_AM;

    for (let iSecond = 0; iSecond <= VALID_SECONDS; iSecond++) {
      testToken({
        createdAt: creationTime,
        verifiedAt: moment(creationTime)
          .add(iSecond, 's')
          .toISOString(),
        expectedExpiryResult: false,
        expectedValidityResult: true
      });
    }
  });

  it('should work when validation/generation happen between windows', () => {
    const creationTime = JAN_01_2020_00_59_AM;

    for (let iSecond = 0; iSecond <= VALID_SECONDS; iSecond++) {
      testToken({
        createdAt: creationTime,
        verifiedAt: moment(creationTime)
          .add(iSecond, 's')
          .toISOString(),
        expectedExpiryResult: false,
        expectedValidityResult: true
      });
    }
  });
});

function testToken({
  createdAt,
  verifiedAt,
  expectedExpiryResult,
  expectedValidityResult
}) {
  // Mock the token generation time
  sinon.useFakeTimers(new Date(createdAt));

  const simpleOtp = new SimpleOtp();

  // then create token and set expiry time
  const token = simpleOtp.createToken(SECRET);
  const expiryTime = simpleOtp.generateExpiryTime();

  // Fast forward to the time of verification
  sinon.useFakeTimers(new Date(verifiedAt));

  // Check if expired or isVerifiedCode
  const isExpired = simpleOtp.isExpired(expiryTime);
  const isVerifiedCode = simpleOtp.verifyToken(token, SECRET);

  const isValidToken = !isExpired && isVerifiedCode;

  expect(isExpired).to.eql(expectedExpiryResult);
  expect(isValidToken).to.eql(expectedValidityResult);
}
