const Key = require(`${__models}/key`);
const User = require(`${__models}/users`);
const Log = require(`${__models}/logs`);
const googleWalletService = require(`${__utils}/googleWallet`);
const generateEncryptedKey = require(`${__utils}/helper`);
const { connectToDatabase, disconnectFromDatabase } = require(`${__config}/dbConn`);

exports.generateKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId, isPermanent, startDate, endDate, allowedHours } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Generate encrypted key
    const keyId = generateEncryptedKey();
    const key = await Key.create({ keyId, userId, isPermanent, startDate, endDate, allowedHours });

    // Generate Google Wallet Link
    const walletLink = await googleWalletService.generateWalletLink(keyId);
    key.googleWalletLink = walletLink;
    await key.save();

    // Update User's keys array
    await User.findByIdAndUpdate(userId, { $push: { keys: key._id } });

    res.status(201).json({ 
      status: 'success', 
      data: key 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.verifyKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { keyId, userId } = req.body;

    const key = await Key.findOne({ keyId });
    if (!key) {
      await Log.create({ keyId, userId, isVerify: false, errorMessage: "Key not found" });
      return res.status(200).json({ isVerify: false, message: "Key not found" });
    }

    if (key.isRevoked) {
      await Log.create({ keyId, userId, isVerify: false, errorMessage: "Key revoked" });
      return res.status(200).json({ isVerify: false, message: "Key revoked" });
    }

    if (!key.isPermanent) {
      const now = new Date();
      if (key.startDate && now < new Date(key.startDate)) {
        await Log.create({ keyId, userId, isVerify: false, errorMessage: "Key not yet active" });
        return res.status(200).json({ isVerify: false, message: "Key not yet active" });
      }
      if (key.endDate && now > new Date(key.endDate)) {
        await Log.create({ keyId, userId, isVerify: false, errorMessage: "Key expired" });
        return res.status(200).json({ isVerify: false, message: "Key expired" });
      }
      if (key.allowedHours && !key.allowedHours.includes(now.getHours())) {
        await Log.create({ keyId, userId, isVerify: false, errorMessage: "Outside allowed hours" });
        return res.status(200).json({ isVerify: false, message: "Outside allowed hours" });
      }
    }

    await Log.create({ keyId, userId, isVerify: true });
    res.status(200).json({ isVerify: true, keyDetails: key });
  } catch (err) {
    res.status(500).json({ isVerify: false, message: "Server error" });
  } finally {
    await disconnectFromDatabase();
  }
};