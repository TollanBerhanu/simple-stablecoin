module.exports = (sequelize, Sequelize) => {
    const Metadata = sequelize.define("arbitrary_metadata", {
        
    //  Oracle Datum Data
      mintAllowed: {
        type: Sequelize.BOOLEAN
      },
      burnAllowed: {
        type: Sequelize.BOOLEAN
      },
      rate: {
        type: Sequelize.FLOAT
      },
    
    //  Developer's Payment Address
      developerAddress: {
        type: Sequelize.STRING
      },
      oracleAddress: {
        type: Sequelize.STRING
      },
      reserveAddress: {
        type: Sequelize.STRING
      },

    //  Token Names
      nftTokenName: {
        type: Sequelize.STRING
      },
      stablecoinTokenName: {
        type: Sequelize.STRING
      },

    //  Reference Script UTxOs
      nftRefScript: {
        type: Sequelize.STRING
      },
      oracleRefScript: {
        type: Sequelize.STRING
      },
      reserveRefScript: {
        type: Sequelize.STRING
      },
      stablecoinRefScript: {
        type: Sequelize.STRING
      }
    });
  
    return Metadata;
  };
  