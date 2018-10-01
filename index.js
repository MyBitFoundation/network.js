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
  var mybitContract = contract(ContractArtifacts.MyBit());
  var erc20BurnerContract = contract(ContractArtifacts.ERC20Burner());
  var databaseContract = contract(ContractArtifacts.Database());
  var contractManagerContract = contract(ContractArtifacts.ContractManager());
  var singleOwnerContract = contract(ContractArtifacts.SingleOwned());
  var pausibleContract = contract(ContractArtifacts.Pausible());
  var accessHierarchyContract = contract(ContractArtifacts.AccessHierarchy());
  var platformFundsContract = contract(ContractArtifacts.PlatformFunds());
  var operatorsContract = contract(ContractArtifacts.Operators());
  var brokerEscrowContract = contract(ContractArtifacts.BrokerEscrow());
  var crowdsaleETHContract = contract(ContractArtifacts.CrowdsaleETH());
  var crowdsaleGeneratorETHContract = contract(ContractArtifacts.CrowdsaleGeneratorETH());
  var crowdsaleERC20Contract = contract(ContractArtifacts.CrowdsaleERC20());
  var crowdsaleGeneratorERC20Contract = contract(ContractArtifacts.CrowdsaleGeneratorERC20());
  var assetExchangeContract = contract(ContractArtifacts.AssetExchange());

  return {
    approveBurn: function(fromAddress){
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
    },

    addOperator: function(account, name, owner){
      return new Promise((resolve, reject) => {
        operatorsContract.at(Chain.Operators()).then(function(instance){
          return instance.registerOperator(account, name, {from: owner});
        }).then(function(tx){
          var operatorID = tx.logs[0].args._operatorID
          return resolve(operatorID);
        });
      });
    },

    acceptEther: function(id, address){
      return new Promise((resolve, reject) => {
        operatorsContract.at(Chain.Operators()).then(function(instance){
          return instance.acceptEther(id, true, {from: address});
        }).then(function(tx){
          return resolve(true);
        });
      });
    },

    createAsset: function(object){
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
            return instance.createAssetOrderETH(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerFee, {from: object.broker, gas:2300000});
          }).then(function(tx){
            return resolve(tx.logs[0].args._assetID);
          });
        }
      });
    },

    fundAsset: function(object){
      return new Promise((resolve, reject) => {
        if(object.fundingToken){
          crowdsaleERC20Contract.at(Chain.CrowdsaleERC20())
          .then(function(instance){
            return instance.buyAssetOrder(object.assetID, object.amount, {from: object.address, gas:2300000});
          }).then(function(tx){
            return resolve(tx.tx);
          });
        } else {
          crowdsaleETHContract.at(Chain.CrowdsaleETH())
          .then(function(instance){
            return instance.buyAssetOrder(object.assetID, {from: object.address, value: object.amount, gas:2300000});
          }).then(function(tx){
            console.log(tx);
            return resolve(tx.tx);
          });
        }
      });
    }
  }
})();
