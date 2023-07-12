module.exports = (sequelize, Sequelize) => {
    const SerializedParam = sequelize.define("serialized_param_scripts", {
      nftParam: {
        type: Sequelize.TEXT
      },
      oracleParam: {
        type: Sequelize.TEXT
      },
      reserveParam: {
        type: Sequelize.TEXT
      },
      stablecoinParam: {
        type: Sequelize.TEXT
      }
    });
  
    return SerializedParam;
  };
  