const ContractArtifacts = require("@mybit/contracts");
const Chain = require("@mybit/chain");
const Web3 = require("web3");
const TruffleContract = require("truffle-contract");
const Promisify = (inner) =>
    new Promise((resolve, reject) =>
        inner((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        })
    );


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
  var apiContract = contract(ContractArtifacts.API);
  var mybitContract = contract(ContractArtifacts.BurnableToken);
  var erc20BurnerContract = contract(ContractArtifacts.ERC20Burner);
  var databaseContract = contract(ContractArtifacts.Database);
  var contractManagerContract = contract(ContractArtifacts.ContractManager);
  var singleOwnerContract = contract(ContractArtifacts.SingleOwned);
  var pausibleContract = contract(ContractArtifacts.Pausible);
  var accessHierarchyContract = contract(ContractArtifacts.AccessHierarchy);
  var platformFundsContract = contract(ContractArtifacts.PlatformFunds);
  var operatorsContract = contract(ContractArtifacts.Operators);
  var assetManagerEscrowContract = contract(ContractArtifacts.AssetManagerEscrow);
  var crowdsaleETHContract = contract(ContractArtifacts.CrowdsaleETH);
  var crowdsaleGeneratorETHContract = contract(ContractArtifacts.CrowdsaleGeneratorETH);
  var crowdsaleERC20Contract = contract(ContractArtifacts.CrowdsaleERC20);
  var crowdsaleGeneratorERC20Contract = contract(ContractArtifacts.CrowdsaleGeneratorERC20);
  var assetGeneratorContract = contract(ContractArtifacts.AssetGenerator);
  var assetExchangeContract = contract(ContractArtifacts.AssetExchange);
  var divTokenETHContract = contract(ContractArtifacts.DividendToken);
  var divTokenERCContract = contract(ContractArtifacts.DividendTokenERC20);
  var divTokenInterface = contract(ContractArtifacts.DivToken);
  var erc20Interface = contract(ContractArtifacts.ERC20);

  return {
    api: async () => {
      return await apiContract.at(Chain.API());
    },

    assetExchange: async () => {
      return await assetExchangeContract.at(Chain.AssetExchange());
    },

    assetGenerator: async () => {
      return await assetGeneratorContract.at(Chain.AssetGenerator());
    },

    assetManagerEscrow: async () => {
      return await assetManagerEscrowContract.at(Chain.BrokerEscrow());
    },

    contractManager: async () => {
      return await contractManagerContract.at(Chain.ContractManager());
    },

    crowdsaleETH: async () => {
      return await crowdsaleETHContract.at(Chain.CrowdsaleETH());
    },

    crowdsaleERC20: async () => {
      return await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
    },

    crowdsaleGeneratorETH: async () => {
      return await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
    },

    crowdsaleGeneratorERC20: async () => {
      return await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
    },

    database: async () => {
      return await databaseContract.at(Chain.Database());
    },

    dividendTokenETH: async (tokenAddress) => {
      return await divTokenETHContract.at(tokenAddress);
    },

    dividendTokenERC20: async (tokenAddress) => {
      return await divTokenERCContract.at(tokenAddress);
    },

    erc20Burner: async () => {
      return await erc20BurnerContract.at(Chain.ERC20Burner());
    },

    operators: async () => {
      return await operatorsContract.at(Chain.Operators());
    },

    platformFunds: async () => {
      return await platformFundsContract.at(Chain.PlatformFunds());
    },

    approveBurn: async (fromAddress) => {
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      tokenInstance = await mybitContract.at(Chain.MyBit());
      await tokenInstance.approve(Chain.ERC20Burner(), amount, {from: fromAddress});
      contractManagerInstance = await contractManagerContract.at(Chain.ContractManager());
      await contractManagerInstance.setContractStatePreferences(true, false, {from: fromAddress});
      return true;
    },

    addOperator: async (account, name, owner) => {
      instance = await operatorsContract.at(Chain.Operators());
      tx = await instance.registerOperator(account, name, {from: owner});
      return tx.logs[0].args._operatorID;
    },

    acceptEther: async (id, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
    },

    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
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
    },

    createDividendToken: async (object) => {
      if(object.fundingToken){
        instance = await divTokenERCContract.new(object.uri, object.owner, object.fundingToken);
        return instance;
      } else {
        instance = await divTokenETHContract.new(object.uri, object.owner, {from: object.owner, gas:2700000});
        return instance;
      }
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
    },

    issueDividends: async (assetID, account, amount) => {
      var apiInstance = await apiContract.at(Chain.API());
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var interfaceInstance = await divTokenInterface.at(tokenAddress);
      var erc20Address = await interfaceInstance.getERC20();
      if(erc20Address == '0x0000000000000000000000000000000000000000'){
        var balance = await web3.eth.getBalance(account);
        if(balance >= amount){
          try{
            var tokenInstance = await divTokenETHContract.at(tokenAddress);
            await tokenInstance.issueDividends({from:account, value:amount});
            console.log('Succesful');
            return true;
          } catch(e){
            console.log(e);
            return false;
          }
        } else {
          console.log('Not enough funds!');
          return false;
        }
      } else {
        var erc20Instance = await erc20Interface.at(erc20Address);
        var balance = await erc20Instance.balanceOf(account);
        if(balance >= amount){
          try{
            var tokenInstance = await divTokenERCContract.at(tokenAddress);
            await tokenInstance.issueDividends(amount, {from:account});
            console.log('Succesful');
            return true;
          } catch(e){
            console.log(e);
            return false;
          }
        } else {
          console.log('Not enough funds!');
          return false;
        }
      }
    },

    getAssetsByInvestor: async (address) => {
      var assets = [];
      var crowdsaleETHInstance = await crowdsaleETHContract.at(Chain.CrowdsaleETH());
      getAssets(crowdsaleETHInstance);
      var crowdsaleERCInstance = await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
      getAssets(crowdsaleERCInstance);

      function getAssets(instance){
        fundingEvent = instance.LogAssetPurchased({_sender: address}, {fromBlock: 0, toBlock: 'latest'});
        fundingEvent.get((error, logs) => {
          logs.forEach(function (log, index) {
            var assetID = log.args._assetID;
            assets.push(assetID);
          });
        });
      }

      return assets;
    },

    getAssetsByManager: async (address) => {
      var assets = [];
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
      getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
      getAssets(crowdsaleGenERCInstance);

      function getAssets(instance){
        fundingEvent = instance.LogAssetFundingStarted({_assetManager: address}, {fromBlock: 0, toBlock: 'latest'});
        fundingEvent.get((error, logs) => {
          logs.forEach(function (log, index) {
            var assetID = log.args._assetID;
            assets.push(assetID);
          });
        });
      }

      return assets;
    },

    getAssetsByOperator: async (address) => {
      var assets = [];
      var apiInstance = await apiContract.at(Chain.API());
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
      await getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
      await getAssets(crowdsaleGenERCInstance);

      async function getAssets(instance){
        fundingEvent = instance.LogAssetFundingStarted({}, {fromBlock: 0, toBlock: 'latest'});
        logs = await Promisify(callback => fundingEvent.get(callback));
        for(var i=0; i<logs.length; i++){
          var assetID = logs[i].args._assetID;
          var operator = await apiInstance.getAssetOperator(assetID);
          if(address.toLowerCase() == operator.toLowerCase()){
            assets.push(assetID);
          }
        }
      };

      return assets;
    },

    getTotalAssets: async () => {
      var assets = [];
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
      getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
      getAssets(crowdsaleGenERCInstance);

      function getAssets(instance){
        fundingEvent = instance.LogAssetFundingStarted({}, {fromBlock: 0, toBlock: 'latest'});
        fundingEvent.get((error, logs) => {
          logs.forEach(function (log, index) {
            var assetID = log.args._assetID;
            assets.push(assetID);
          });
        });
      }

      return assets;
    },

    getOpenCrowdsales: async () => {
      var assets = [];
      var apiInstance = await apiContract.at(Chain.API());
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
      await getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
      await getAssets(crowdsaleGenERCInstance);

      async function getAssets(instance) {
        fundingEvent = instance.LogAssetFundingStarted({}, {fromBlock: 0, toBlock: 'latest'});
        logs = await Promisify(callback => fundingEvent.get(callback));
        //console.log(logs);
        for(var i=0; i<logs.length; i++){
          var assetID = logs[i].args._assetID;
          var finalized = await apiInstance.crowdsaleFinalized(assetID);
          if(!finalized){
            var deadline = Number(await apiInstance.getAssetFundingDeadline(assetID));
            var now = Math.round(new Date().getTime()/1000); //Current time in seconds;
            if(deadline > now){
              assets.push(assetID);
            }
          }
        }
      };

      return assets;
    },

    getFundingTimeLeft: async (assetID) => {
      var instance = await apiContract.at(Chain.API());
      var deadline = Number(await instance.getAssetFundingDeadline(assetID));
      var now = Math.round(new Date().getTime()/1000); //Current time in seconds;
      var timeleft;
      if(deadline > now){
        timeleft = deadline - now;
      } else {
        timeleft = 0;
      }
      return timeleft
    },

    getFundingGoal: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var finalized = await apiInstance.crowdsaleFinalized(assetID);
      var goal;

      //Funding goal gets deleted when crowdsale finalizes, so we must get the token supply
      if(finalized) {
        var tokenAddress = await apiInstance.getAssetAddress(assetID);
        var tokenInstance = await divTokenInterface.at(tokenAddress);
        goal = Number(await tokenInstance.totalSupply());
      } else {
        goal = Number(await apiInstance.getAssetFundingGoal(assetID));
      }
      return goal;
    },

    getFundingProgress: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var tokenInstance = await divTokenInterface.at(tokenAddress);
      var progress = Number(await tokenInstance.totalSupply());
      return progress;
    },

    getAssetOperator: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var operator = await apiInstance.getAssetOperator(assetID);
      return operator;
    },

    getAssetManager: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var manager = await apiInstance.getAssetManager(assetID);
      return manager;
    },

    getAssetInvestors: async (assetID) => {
      var investors = [];
      var crowdsaleETHInstance = await crowdsaleETHContract.at(Chain.CrowdsaleETH());
      getInvestors(crowdsaleETHInstance);
      var crowdsaleERCInstance = await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
      getInvestors(crowdsaleERCInstance);

      function getInvestors(instance){
        fundingEvent = instance.LogAssetPurchased({_assetID: assetID}, {fromBlock: 0, toBlock: 'latest'});
        fundingEvent.get((error, logs) => {
          logs.forEach(function (log, index) {
            var investor = log.args._sender;
            investors.push(investor);
          });
        });
      }

      return investors;
    }
  }
})();
