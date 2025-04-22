const Key = require(`${__models}/key`);
const User = require(`${__models}/users`);
const Log = require(`${__models}/logs`);
const googleWalletService = require(`${__utils}/googleWallet`);
const { generateEncryptedKey } = require(`${__utils}/helper`);
const { connectToDatabase, disconnectFromDatabase } = require(`${__config}/dbConn`);
const { responseHandler } = require(`${__utils}/responseHandler`)

exports.generatePermanentKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.notFound(res, "User Not Found");
    }

    // Check if user already has a permanent key
    const existingPermanentKey = await Key.findOne({ 
      userId, 
      isPermanent: true,
      isRevoked: false 
    });
    
    if (existingPermanentKey) {
      return responseHandler.validationError(res, 'User already has an active permanent key');
    }

    // Generate encrypted key
    const keyId = generateEncryptedKey();
    const key = await Key.create({ 
      keyId, 
      userId, 
      isPermanent: true 
    });

    // Generate Google Wallet Link
    const walletResult = await googleWalletService.generateWalletLink(keyId);

    if (!walletResult.success) {
      return responseHandler.error(res, walletResult.message);
    }

    key.googleWalletLink = walletResult.data;
    await key.save();

    // Update User's keys array
    await User.findByIdAndUpdate(userId, { $push: { keys: key._id } });

    return responseHandler.success(res, key, "Succesfully generated permanent key")
  } catch (err) {
    return responseHandler.error(res, err.message);
  } finally {
    await disconnectFromDatabase();
  }
};

exports.generateTemporaryKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId, startDate, endDate, allowedHours } = req.body;

    // Validate required fields for temporary key
    if (!startDate || !endDate || !allowedHours || !Array.isArray(allowedHours)) {
      return responseHandler.validationError(res, "Some fields are required, fill the required fields")
    }

    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.notFound(res, "User not found")
    }

    // Generate encrypted key
    const keyId = generateEncryptedKey();
    const key = await Key.create({ 
      keyId, 
      userId, 
      isPermanent: false,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      allowedHours
    });

    // Generate Google Wallet Link
    const walletResult = await googleWalletService.generateWalletLink(keyId);

    if (!walletResult.success) {
      return responseHandler.error(res, walletResult.message);
    }

    key.googleWalletLink = walletResult.data;
    await key.save();



    // Update User's keys array
    await User.findByIdAndUpdate(userId, { $push: { keys: key._id } });

    return responseHandler.success(res, key, "Successfully created temporary key");
  } catch (err) {
    return responseHandler.error(res, err.message);
  } finally {
    await disconnectFromDatabase();
  }
};

exports.verifyKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { keyId, userId } = req.params;

    const key = await Key.findOne({ keyId }).populate('userId');
    if (!key) {
      await Log.create({ 
        keyId, 
        userId, 
        isVerify: false, 
        errorMessage: "Key not found" 
      });
      return responseHandler.notFound(res, "Key not found"); 
    }

    // Check if the scanning user is the key owner or admin
    if (key.userId._id.toString() !== userId && !req.user.role === 'Admin') {
      await Log.create({ 
        keyId, 
        userId, 
        isVerify: false, 
        errorMessage: "Unauthorized access attempt" 
      });
      return res.status(403).json({ 
        isVerify: false, 
        message: "Unauthorized" 
      });
    }

    if (key.isRevoked) {
      await Log.create({ 
        keyId, 
        userId, 
        isVerify: false, 
        errorMessage: "Key revoked" 
      });
      return res.status(200).json({ 
        isVerify: false, 
        message: "Key revoked" 
      });
    }

    if (!key.isPermanent) {
      const now = new Date();
      
      // Check date validity
      if (now < new Date(key.startDate)) {
        await Log.create({ 
          keyId, 
          userId, 
          isVerify: false, 
          errorMessage: "Key not yet active" 
        });
        return res.status(200).json({ 
          isVerify: false, 
          message: "Key not yet active" 
        });
      }
      
      if (now > new Date(key.endDate)) {
        await Log.create({ 
          keyId, 
          userId, 
          isVerify: false, 
          errorMessage: "Key expired" 
        });
        return res.status(200).json({ 
          isVerify: false, 
          message: "Key expired" 
        });
      }
      
      // Check allowed hours
      if (key.allowedHours && key.allowedHours.length > 0) {
        const currentHour = now.getHours();
        if (!key.allowedHours.includes(currentHour)) {
          await Log.create({ 
            keyId, 
            userId, 
            isVerify: false, 
            errorMessage: "Outside allowed hours" 
          });
          return res.status(200).json({ 
            isVerify: false, 
            message: "Outside allowed hours" 
          });
        }
      }
    }

    // Successful verification
    await Log.create({ 
      keyId, 
      userId, 
      isVerify: true 
    });
    
    res.status(200).json({ 
      isVerify: true, 
      keyDetails: {
        keyId: key.keyId,
        isPermanent: key.isPermanent,
        startDate: key.startDate,
        endDate: key.endDate,
        allowedHours: key.allowedHours,
        user: {
          name: key.userId.name,
          phone: key.userId.phone
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      isVerify: false, 
      message: "Server error" 
    });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.revokeKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { keyId, userId } = req.params;

    const key = await Key.findOne({ keyId });
    if (!key) {
      return responseHandler.notFound(res, "Key not found");
    }

    if (key.isRevoked) {
      return responseHandler.validationError(res, "Key is already revoked");
    }

    key.isRevoked = true;
    await key.save();

    await Log.create({
      keyId,
      userId,
      isVerify: false,
      action: "Key Revoked",
      errorMessage: "Key was manually revoked"
    });

    return responseHandler.success(res, key, "Key successfully revoked");
  } catch (err) {
    return responseHandler.error(res, err.message);
  } finally {
    await disconnectFromDatabase();
  }
};
