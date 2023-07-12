module.exports = (sequelize, Sequelize) => {
    const Serialized = sequelize.define("serialized_scripts", {
      nft: {
        type: Sequelize.TEXT
      },
      oracle: {
        type: Sequelize.TEXT
      },
      reserve: {
        type: Sequelize.TEXT
      },
      stablecoin: {
        type: Sequelize.TEXT
      }
    });
  
    return Serialized;
  };
  