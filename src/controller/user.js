const User = require(`${__models}/users`);
const Key = require(`${__models}/key`);
const { connectToDatabase, disconnectFromDatabase } = require(`${__config}/dbConn`);

exports.createUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { name, phone, isAdmin } = req.body;
    const user = await User.create({ name, phone, isAdmin });
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.updateUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.query;
    const { name, phone, isAdmin } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, isAdmin },
      { new: true, runValidators: true }
    );
    // console.log("=====>", userId)
    // console.log("=====>", name)
    // console.log("=====>", phone)
    // console.log("=====>", isAdmin)

    if (!updatedUser) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      status: 'success', 
      data: updatedUser 
    });
  } catch (err) {
    res.status(400).json({ 
      status: 'fail', 
      message: err.message 
    });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.query;

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        status: 'fail', 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'User is deleted successfully',
      data: user 
    });
  } catch (err) {
    res.status(400).json({ 
      status: 'fail', 
      message: err.message 
    });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    await connectToDatabase();
    const users = await User.find({ isDeleted: false }).populate('keys');
    res.status(200).json({ 
      status: 'success', 
      data: users,
      message: 'Active users retrieved successfully' 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to fetch users',
      error: err.message 
    });
  } finally {
    await disconnectFromDatabase();
  }
};

exports.revokeKey = async (req, res) => {
  try {
    await connectToDatabase();
    const { keyId } = req.body;
    const key = await Key.findOneAndUpdate(
      { keyId },
      { isRevoked: true },
      { new: true }
    );
    res.status(200).json({ status: 'success', data: key });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  } finally {
    await disconnectFromDatabase();
  }
};
