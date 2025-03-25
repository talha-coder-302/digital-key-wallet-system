const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

class GoogleWalletService {
  constructor() {
    this.credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      issuer_id: process.env.GOOGLE_ISSUER_ID
    };
  }

  async generateWalletLink(keyId) {
    const issuerId = this.credentials.issuer_id;
    const classSuffix = 'accessKeyClass'; // Fixed class name
    const objectSuffix = `accessKey_${keyId}`; // Unique for each key

    // Define the pass class
    const newClass = {
      'id': `${issuerId}.${classSuffix}`,
      // Add class properties as needed
    };

    // Define the pass object
    const newObject = {
      'id': `${issuerId}.${objectSuffix}`,
      'classId': `${issuerId}.${classSuffix}`,
      'state': 'ACTIVE',
      'barcode': {
        'type': 'QR_CODE',
        'value': keyId
      },
      'cardTitle': {
        'defaultValue': {
          'language': 'en-US',
          'value': 'Access Key'
        }
      },
      // Add other required fields
    };

    // Create JWT
    const claims = {
      iss: this.credentials.client_email,
      aud: 'google',
      origins: [process.env.APP_DOMAIN],
      typ: 'savetowallet',
      payload: {
        genericClasses: [newClass],
        genericObjects: [newObject]
      },
    };

    const token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });
    return `https://pay.google.com/gp/v/save/${token}`;
  }

  // Alternative API method (if you prefer direct API calls)
  async saveToGoogleWallet(keyId) {
    try {
      const authClient = new google.auth.JWT({
        email: this.credentials.client_email,
        key: this.credentials.private_key,
        scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
      });

      const wallet = google.walletobjects({
        version: 'v1',
        auth: authClient,
      });

      const loyaltyCard = {
        id: keyId,
        classId: `${this.credentials.issuer_id}.${keyId}`,
        state: 'ACTIVE',
        barcode: {
          type: 'QR_CODE',
          value: keyId,
        },
      };

      const response = await wallet.loyaltyobject.insert({
        resource: loyaltyCard,
      });

      return response.data.id;
    } catch (err) {
      console.error('Google Wallet API Error:', err);
      throw err;
    }
  }
}

module.exports = new GoogleWalletService();