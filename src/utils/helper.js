const crypto = require('crypto');

const generateEncryptedKey = () => {
  const randomKey = crypto.randomBytes(12).toString('hex');
  const issuerPrefix = process.env.GOOGLE_ISSUER_ID;
  return `${issuerPrefix}.${randomKey}`;
};

module.exports = generateEncryptedKey;