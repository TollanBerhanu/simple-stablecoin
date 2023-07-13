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

    // Last transaction hash
      nftTxOutRef: {
        type: Sequelize.STRING
      },
      oracleTxOutRef: {
        type: Sequelize.STRING
      },

    //  Reference Script UTxOs
      reserveRefScriptUTxO: {
        type: Sequelize.STRING
      },
      stablecoinRefScriptUTxO: {
        type: Sequelize.STRING
      }
    });
  
    return Metadata;
  };
  