const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

class GoogleWalletService {
  constructor() {
    this.credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, // Ensure this is correct
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Correct formatting for private key
      issuer_id: process.env.GOOGLE_ISSUER_ID,
    };
  }

  // Create a Generic Class (Wallet Class)
  async createGenericClass(authClient, classId) {
    const wallet = google.walletobjects({
      version: 'v1',
      auth: authClient,
    });

    const newClass = {
      id: classId,
      issuerName: "TalhaCoder",
      reviewStatus: "UNDER_REVIEW",
    };

    try {
      await wallet.genericclass.insert({ resource: newClass });
      console.log("✅ Generic Class created.");
      return { success: true };
    } catch (err) {
      if (err.errors && err.errors[0].reason === 'conflict') {
        console.log("ℹ️ Class already exists. Skipping.");
        return { success: true }; // Not a failure
      } else {
        console.error("❌ Error creating class:", err);
        return { success: false, message: err.message };
      }
    }
  }

  // Create a Generic Object (Wallet Object)
  async createGenericObject(authClient, objectId, classId, keyId) {
    const wallet = google.walletobjects({
      version: 'v1',
      auth: authClient,
    });

    const newObject = {
      id: objectId,
      classId: classId,
      state: 'ACTIVE',
      header: {
        defaultValue: {
          language: 'en-US',
          value: 'Your Digital Key',
        },
      },
      barcode: {
        type: 'QR_CODE',
        value: keyId,
      },
      cardTitle: {
        defaultValue: {
          language: 'en-US',
          value: 'Access Key',
        },
      },
    };

    try {
      await wallet.genericobject.insert({ resource: newObject });
      console.log("✅ Generic Object created.");
      return { success: true };
    } catch (err) {
      if (err.errors && err.errors[0].reason === 'conflict') {
        console.log("ℹ️ Object already exists. Skipping.");
        return { success: true };
      } else {
        console.error("❌ Error creating object:", err);
        return { success: false, message: err.message };
      }
    }
  }

  // Generate the Wallet Link
  async generateWalletLink(keyId) {
    const issuerId = this.credentials.issuer_id;
    const classId = `${issuerId}.accessKeyClass5`;
    const objectId = `${issuerId}.accessKey_${keyId}`;

    // Create a new JWT auth client
    const authClient = new google.auth.JWT({
      email: this.credentials.client_email,
      key: this.credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'], // Ensure this scope is correct
    });

    // Authorize the JWT client
    await authClient.authorize();

    // Create the class (if not exists)
    const classResult = await this.createGenericClass(authClient, classId);
    if (!classResult.success) {
      return {
        success: false,
        message: classResult.message || 'Failed to create Wallet Class',
        data: null,
      };
    }

    // Create the object (if not exists)
    const objectResult = await this.createGenericObject(authClient, objectId, classId, keyId);
    if (!objectResult.success) {
      return {
        success: false,
        message: objectResult.message || 'Failed to create Wallet Object',
        data: null,
      };
    }

    // Create the JWT token for the save-to-wallet link
    const claims = {
      iss: this.credentials.client_email, // Service account email
      aud: 'google', // Audience is 'google' for Wallet API
      origins: [process.env.APP_DOMAIN], // Set your app domain correctly
      typ: 'savetowallet', // Type for Google Wallet
      payload: {
        genericObjects: [{ id: objectId }],
      },
    };

    // Sign the JWT token
    const token = jwt.sign(claims, this.credentials.private_key, {
      algorithm: 'RS256',
      header: {
        typ: 'JWT',
        alg: 'RS256',
      },
    });

    // Create the save-to-wallet URL
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return {
      success: true,
      message: 'Wallet link generated successfully',
      data: saveUrl,
    };
  }
}

module.exports = new GoogleWalletService();
