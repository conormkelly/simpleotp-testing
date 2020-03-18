const simpleOtp = require('simpleotp');
const moment = require('moment');

const APP_SECRET = '123456789';

class SimpleOtp {
  // Totp instance
  totp;
  // Config
  algorithm = 'sha1';
  secretEncoding = 'base64';
  stepInSeconds = 600;
  tokenLength = 6;

  constructor() {
    this.totp = new simpleOtp.Totp({
      algorithm: this.algorithm,
      encoding: this.encoding,
      step: this.stepInSeconds
    });
  }

  createToken(secret) {
    const sharedSecret = this.generateSharedSecret(secret);

    return this.totp.createToken({
      secret: sharedSecret
    });
  }

  verifyToken(tokenCode, secret) {
    const sharedSecret = this.generateSharedSecret(secret);

    const currentTokenValid = this.totp.validate({
      token: tokenCode,
      secret: sharedSecret
    });

    if (currentTokenValid) {
      return true;
    }

    // Only proceed to check previous token if currentToken not valid
    const previousTokenValid = this.totp.validate({
      token: tokenCode,
      secret: sharedSecret,
      seconds: Date.now() / 1000 - this.stepInSeconds
    });

    return previousTokenValid;
  }

  generateExpiryTime() {
    return moment()
      .add(this.stepInSeconds, 's')
      .toISOString();
  }

  isExpired(expiryTimestamp) {
    const now = moment();
    const expiryTime = moment(expiryTimestamp);
    return now > expiryTime;
  }

  generateSharedSecret(secret) {
    return Buffer.from(APP_SECRET + secret).toString('base64');
  }
}

module.exports = SimpleOtp;
