module.exports = (sequelize, Sequelize) => {
    const Serialized = sequelize.define("serialized_scripts", {
      nft: {
        type: Sequelize.STRING
      },
      oracle: {
        type: Sequelize.STRING
      },
      reserve: {
        type: Sequelize.STRING
      },
      stablecoin: {
        type: Sequelize.STRING
      }
    });
  
    return Serialized;
  };
  