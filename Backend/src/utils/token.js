const jwt = require('jsonwebtoken');

function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

module.exports = { signToken };
