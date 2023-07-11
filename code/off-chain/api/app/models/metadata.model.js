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

    //  Token Names
      nftTokenName: {
        type: Sequelize.STRING
      },
      stablecoinTokenName: {
        type: Sequelize.STRING
      },

    //  Currency Symbol / Policy Ids
      nftPolicyId: {
        type: Sequelize.STRING
      },
      oraclePolicyId: {
        type: Sequelize.STRING
      },
      reservePolicyId: {
        type: Sequelize.STRING
      },
      stablecoinPolicyId: {
        type: Sequelize.STRING
      }
    });
  
    return Metadata;
  };
  