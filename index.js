var ContractArtifacts = require("@mybit/contracts");
var Chain = require("@mybit/chain");
var Web3 = require("web3");
var TruffleContract = require("truffle-contract");

function contract(artifact){
  var c = TruffleContract(artifact);
  c.setProvider(web3.currentProvider);
  c.currentProvider.sendAsync = function () {
    return c.currentProvider.send.apply(c.currentProvider, arguments);
  };
  return c;
}

module.exports = (function (){
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    // set the provider you want from Web3.providers
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  //Setup contracts
  var mybitContract = contract(ContractArtifacts.BurnableToken);
  var erc20BurnerContract = contract(ContractArtifacts.ERC20Burner);
  var databaseContract = contract(ContractArtifacts.Database);
  var contractManagerContract = contract(ContractArtifacts.ContractManager);
  var singleOwnerContract = contract(ContractArtifacts.SingleOwned);
  var pausibleContract = contract(ContractArtifacts.Pausible);
  var accessHierarchyContract = contract(ContractArtifacts.AccessHierarchy);
  var platformFundsContract = contract(ContractArtifacts.PlatformFunds);
  var operatorsContract = contract(ContractArtifacts.Operators);
  var brokerEscrowContract = contract(ContractArtifacts.BrokerEscrow);
  var crowdsaleETHContract = contract(ContractArtifacts.CrowdsaleETH);
  var crowdsaleGeneratorETHContract = contract(ContractArtifacts.CrowdsaleGeneratorETH);
  var crowdsaleERC20Contract = contract(ContractArtifacts.CrowdsaleERC20);
  var crowdsaleGeneratorERC20Contract = contract(ContractArtifacts.CrowdsaleGeneratorERC20);
  var assetExchangeContract = contract(ContractArtifacts.AssetExchange);
  var divTokenETHContract = contract(ContractArtifacts.DividendToken);
  var divTokenERCContract = contract(ContractArtifacts.DividendTokenERC20);

  return {
    dividendTokenETH: async (tokenAddress) => {
      return await divTokenETHContract.at(tokenAddress);
    },

    dividendTokenERC20: async (tokenAddress) => {
      return await divTokenERCContract.at(tokenAddress);
    },

    approveBurn: async (fromAddress) => {
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      var burnerAddress = Chain.ERC20Burner();
      tokenInstance = await mybitContract.at(Chain.MyBit());
      await tokenInstance.approve(burnerAddress, amount, {from: fromAddress});
      burnerInstance = await erc20BurnerContract.at(burnerAddress);
      await burnerInstance.givePermission({from: fromAddress});
      return true;

      /*
      return new Promise((resolve, reject) => {
        var count = 0;
        var amount = 1000000000000000000000000000000; //Some large amount 10^30
        var burnerAddress = Chain.ERC20Burner();
        mybitContract.at(Chain.MyBit()).then(function(instance){
        return instance.approve(burnerAddress, amount, {from: fromAddress});
        }).then(function(){
          complete();
        });

        erc20BurnerContract.at(burnerAddress).then(function(instance){
        return instance.givePermission({from: fromAddress});
        }).then(function(){
          complete();
        });

        function complete(){
          if(count == 1){
            return resolve(true);
          } else {
            count++;
          }
        }
      });
      */
    },

    addOperator: async (account, name, owner) => {
      instance = await operatorsContract.at(Chain.Operators());
      tx = await instance.registerOperator(account, name, {from: owner});
      return tx.logs[0].args._operatorID;
      /*
      return new Promise((resolve, reject) => {
        operatorsContract.at(Chain.Operators()).then(function(instance){
          return instance.registerOperator(account, name, {from: owner});
        }).then(function(tx){
          var operatorID = tx.logs[0].args._operatorID
          return resolve(operatorID);
        }).catch(e => {
          return reject(e);
        });
      });
      */
    },

    acceptEther: async (id, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
      /*
      return new Promise((resolve, reject) => {
        operatorsContract.at(Chain.Operators()).then(function(instance){
          return instance.acceptEther(id, true, {from: operatorAddress});
        }).then(function(tx){
          return resolve(true);
        });
      });
      */
    },

    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
      /*
      return new Promise((resolve, reject) => {
        operatorsContract.at(Chain.Operators()).then(function(instance){
          return instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
        }).then(function(tx){
          return resolve(true);
        });
      });
      */
    },

    createAsset: async (object) => {
      if(object.fundingToken){
        instance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
        tx = await instance.createAssetOrderERC20(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerFee, object.fundingToken, {from: object.broker, gas:2300000});
        return tx.logs[0].args;
      } else {
        instance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
        tx = await instance.createAssetOrderETH(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, {from: object.broker, gas:2300000});
        return tx.logs[0].args;
      }
      /*
      return new Promise((resolve, reject) => {
        if(object.fundingToken){
          crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20())
          .then(function(instance){
            return instance.createAssetOrderERC20(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerFee, object.fundingToken, {from: object.broker, gas:2300000});
          }).then(function(tx){
            return resolve(tx.logs[0].args._assetID);
          });
        } else {
          crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH())
          .then(function(instance){
            return instance.createAssetOrderETH(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, {from: object.broker, gas:2300000});
          }).then(function(tx){
            return resolve(tx.logs[0].args._assetID);
          });
        }
      });
      */
    },

    fundAsset: async (object) => {
      if(object.fundingToken){
        instance = await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
        tx = await instance.buyAssetOrderERC20(object.assetID, object.amount, {from: object.address, gas:2300000});
        return tx.tx;
      } else {
        instance = await crowdsaleETHContract.at(Chain.CrowdsaleETH());
        tx = await instance.buyAssetOrderETH(object.assetID, {from: object.address, value: object.amount, gas:2300000});
        return tx.tx;
      }
      /*
      return new Promise((resolve, reject) => {
        if(object.fundingToken){
          crowdsaleERC20Contract.at(Chain.CrowdsaleERC20())
          .then(function(instance){
            return instance.buyAssetOrderERC20(object.assetID, object.amount, {from: object.address, gas:2300000});
          }).then(function(tx){
            return resolve(tx.tx);
          });
        } else {
          crowdsaleETHContract.at(Chain.CrowdsaleETH())
          .then(function(instance){
            return instance.buyAssetOrderETH(object.assetID, {from: object.address, value: object.amount, gas:2300000});
          }).then(function(tx){
            console.log(tx);
            return resolve(tx.tx);
          });
        }
      });
      */
    }
  }
})();
