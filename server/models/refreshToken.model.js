
module.exports = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("refresh_token", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: DataTypes.STRING,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER
    },
    expiryDate: {
      type: DataTypes.DATE
    }
  });

  RefreshToken.createToken = async function(user) {
    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 604800); // 7 days
    
    const _token = require('crypto').randomBytes(40).toString('hex');
    
    const refreshToken = await this.create({
      token: _token,
      userId: user.id,
      expiryDate: expiredAt.getTime()
    });
    
    return refreshToken.token;
  };
  
  RefreshToken.verifyExpiration = (token) => {
    return token.expiryDate.getTime() < new Date().getTime();
  };
  
  return RefreshToken;
};