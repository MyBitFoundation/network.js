const ContractArtifacts = require("@mybit/contracts");
const Chain = require("@mybit/chain");
const Web3 = require("web3");
const TruffleContract = require("truffle-contract");
const Web3EventsListener = require("./eventListener");

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
  var apiContract = null;
  var mybitContract = null;
  var erc20BurnerContract = null;
  var databaseContract = null;
  var contractManagerContract = null;
  var singleOwnerContract = null;
  var pausibleContract = null;
  var accessHierarchyContract = null;
  var platformFundsContract = null;
  var operatorsContract = null;
  var assetManagerEscrowContract = null;
  var crowdsaleETHContract = null;
  var crowdsaleGeneratorETHContract = null;
  var crowdsaleERC20Contract = null
  var crowdsaleGeneratorERC20Contract = null;
  var assetGeneratorContract = null;
  var assetExchangeContract = null;
  var divTokenETHContract = null;
  var divTokenERCContract = null;
  var divTokenInterface = null;
  var erc20Interface = null;

  //Setup contracts only when it`s using
  const initApiContract = () => {
    apiContract = apiContract || contract(ContractArtifacts.API);
  };

  const initMybitContract = () => {
    mybitContract = mybitContract || contract(ContractArtifacts.BurnableToken);
  }

  const initErc20BurnerContract = () => {
    erc20BurnerContract = erc20BurnerContract || contract(ContractArtifacts.ERC20Burner)
  }

  const initDatabaseContract = () => {
    databaseContract = databaseContract || contract(ContractArtifacts.Database);
  }
 
  const initContractManagerContract = () => {
    contractManagerContract = contractManagerContract || contract(ContractArtifacts.ContractManager);
  }

  const initSingleOwnerContract = () => {
    singleOwnerContract = singleOwnerContract || contract(ContractArtifacts.SingleOwned);
  }
  
  const initPausibleContract = () => {
    pausibleContract = pausibleContract || contract(ContractArtifacts.Pausible);
  }

  const initAccessHierarchyContract = () => {
    accessHierarchyContract = accessHierarchyContract || contract(ContractArtifacts.AccessHierarchy);
  }

  const initPlatformFundsContract = () => {
    platformFundsContract = platformFundsContract || contract(ContractArtifacts.PlatformFunds);
  }

  const initOperatorsContract = () => {
    operatorsContract = operatorsContract || contract(ContractArtifacts.Operators);
  }

  const initAssetManagerEscrowContract = () => {
    assetManagerEscrowContract = assetManagerEscrowContract || contract(ContractArtifacts.AssetManagerEscrow);
  }

  const initCrowdsaleETHContract= () => {
    crowdsaleETHContract = crowdsaleETHContract || contract(ContractArtifacts.CrowdsaleETH);
  }
  
  const initCrowdsaleGeneratorETHContract = () => {
    crowdsaleGeneratorETHContract = crowdsaleGeneratorETHContract || contract(ContractArtifacts.CrowdsaleGeneratorETH);
  }

  const initCrowdsaleERC20Contract = () => {
    crowdsaleERC20Contract = crowdsaleERC20Contract || contract(ContractArtifacts.CrowdsaleERC20);
  }

  const initCrowdsaleGeneratorERC20Contract = () => {
    crowdsaleGeneratorERC20Contract = crowdsaleGeneratorERC20Contract || contract(ContractArtifacts.CrowdsaleGeneratorERC20);
  }

  const initAssetGeneratorContract = () => {
    assetGeneratorContract = assetGeneratorContract || contract(ContractArtifacts.AssetGenerator);
  }

  const initAssetExchangeContract = () => {
    assetExchangeContract = assetExchangeContract || contract(ContractArtifacts.AssetExchange);
  }

  const initDivTokenETHContract = () => {
    divTokenETHContract = divTokenETHContract || contract(ContractArtifacts.DividendToken);
  }

  const initDivTokenERCContract = () => {
    divTokenERCContract = divTokenERCContract || contract(ContractArtifacts.DividendTokenERC20);
  }

  const initDivTokenInterface = () => {
    divTokenInterface = divTokenInterface || contract(ContractArtifacts.DivToken);
  }

  const initErc20Interface = () => {
    erc20Interface = erc20Interface || contract(ContractArtifacts.ERC20);
  }

  return {
    api: async () => {
      initApiContract();
      return await apiContract.at(Chain.API());
    },

    assetExchange: async () => {
      initAssetExchangeContract();
      return await assetExchangeContract.at(Chain.AssetExchange());
    },

    assetGenerator: async () => {
      initAssetGeneratorContract()
      return await assetGeneratorContract.at(Chain.AssetGenerator());
    },

    assetManagerEscrow: async () => {
      initAssetManagerEscrowContract();
      return await assetManagerEscrowContract.at(Chain.BrokerEscrow());
    },

    contractManager: async () => {
      initContractManagerContract()
      return await contractManagerContract.at(Chain.ContractManager());
    },

    crowdsaleETH: async () => {
      initCrowdsaleETHContract();
      return await crowdsaleETHContract.at(Chain.CrowdsaleETH());
    },

    crowdsaleERC20: async () => {
      initCrowdsaleERC20Contract();
      return await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
    },

    crowdsaleGeneratorETH: async () => {
      initCrowdsaleGeneratorETHContract();
      return await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
    },

    crowdsaleGeneratorERC20: async () => {
      initCrowdsaleGeneratorERC20Contract();
      return await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
    },

    database: async () => {
      initDatabaseContract();
      return await databaseContract.at(Chain.Database());
    },

    dividendTokenETH: async (tokenAddress) => {
      initDivTokenETHContract()
      return await divTokenETHContract.at(tokenAddress);
    },

    dividendTokenERC20: async (tokenAddress) => {
      initDivTokenERCContract();
      return await divTokenERCContract.at(tokenAddress);
    },

    erc20: async (tokenAddress) => {
      initMybitContract();
      return await mybitContract.at(tokenAddress);
    },

    erc20Burner: async () => {
      initErc20BurnerContract();
      return await erc20BurnerContract.at(Chain.ERC20Burner());
    },

    operators: async () => {
      initOperatorsContract();
      return await operatorsContract.at(Chain.Operators());
    },

    platformFunds: async () => {
      initPlatformFundsContract();
      return await platformFundsContract.at(Chain.PlatformFunds());
    },

    approveBurn: async (fromAddress) => {
      initMybitContract();
      initContractManagerContract();
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      tokenInstance = await mybitContract.at(Chain.MyBit());
      await tokenInstance.approve(Chain.ERC20Burner(), amount, {from: fromAddress});
      contractManagerInstance = await contractManagerContract.at(Chain.ContractManager());
      await contractManagerInstance.setContractStatePreferences(true, false, {from: fromAddress});
      return true;
    },

    addOperator: async (account, name, owner) => {
      initOperatorsContract();
      instance = await operatorsContract.at(Chain.Operators());
      tx = await instance.registerOperator(account, name, {from: owner});
      return tx.logs[0].args._operatorID;
    },

    acceptEther: async (id, operatorAddress) => {
      initOperatorsContract();
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
    },

    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      initOperatorsContract();
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
    },

    createAsset: async (object) => {
      if(object.fundingToken === undefined){
        initCrowdsaleGeneratorETHContract();
        instance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
        tx = await instance.createAssetOrderETH(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, {from: object.broker, gas:2300000});
        return tx.logs[0].args;
      } else {
        initCrowdsaleGeneratorERC20Contract();
        instance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
        tx = await instance.createAssetOrderERC20(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, object.fundingToken, {from: object.broker, gas:6700000});
        return tx.logs[0].args;
      }
    },

    createDividendToken: async (object) => {
      if(object.fundingToken === undefined){
        initDivTokenETHContract();
        instance = await divTokenETHContract.new(object.uri, object.owner, {from: object.owner, gas:2700000});
        return instance;
      } else {
        initDivTokenERCContract();
        instance = await divTokenERCContract.new(object.uri, object.owner, object.fundingToken, {from: object.owner, gas:2700000});
        return instance;
      }
    },

    createERC20Token: async (object) => {
      initMybitContract();
      instance = await mybitContract.new(object.uri, object.total, {from: object.owner, gas:2700000});
      return instance;
    },

    fundAsset: async (object) => {
      if(object.fundingToken === undefined){
        initCrowdsaleETHContract();
        instance = await crowdsaleETHContract.at(Chain.CrowdsaleETH());
        tx = await instance.buyAssetOrderETH(object.assetID, {from: object.address, value: object.amount, gas:2300000});
        return tx.tx;
      } else {
        initCrowdsaleERC20Contract();
        instance = await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
        tx = await instance.buyAssetOrderERC20(object.assetID, object.amount, {from: object.address, gas:2300000});
        return tx.tx;
      }
    },

    issueDividends: async (assetID, account, amount) => {
      initApiContract();
      initDivTokenETHContract();
      initDivTokenERCContract();
      initDivTokenInterface();
      initErc20Interface();
      var apiInstance = await apiContract.at(Chain.API());
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var interfaceInstance = await divTokenInterface.at(tokenAddress);
      var erc20Address = await interfaceInstance.getERC20();
      if(erc20Address == '0x0000000000000000000000000000000000000000'){
        var balance = await web3.eth.getBalance(account);
        if(balance >= amount){
          try{
            var tokenInstance = await divTokenETHContract.at(tokenAddress);
            await tokenInstance.issueDividends({from:account, value:amount, gas: 220000});
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
            await tokenInstance.issueDividends(amount, {from:account, gas: 220000});
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
      initCrowdsaleETHContract();
      initCrowdsaleERC20Contract();
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
      initCrowdsaleGeneratorETHContract();
      initCrowdsaleGeneratorERC20Contract();
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
      initApiContract();
      initCrowdsaleGeneratorETHContract();
      initCrowdsaleGeneratorERC20Contract()
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
      initCrowdsaleGeneratorETHContract();
      initCrowdsaleGeneratorERC20Contract();
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
      initApiContract();
      initCrowdsaleGeneratorETHContract();
      initCrowdsaleGeneratorERC20Contract();
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
      initApiContract();
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
      initApiContract();
      initDivTokenInterface();
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
      initApiContract();
      initDivTokenInterface();
      var apiInstance = await apiContract.at(Chain.API());
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var tokenInstance = await divTokenInterface.at(tokenAddress);
      var progress = Number(await tokenInstance.totalSupply());
      return progress;
    },

    getAssetOperator: async (assetID) => {
      initApiContract();
      var apiInstance = await apiContract.at(Chain.API());
      var operator = await apiInstance.getAssetOperator(assetID);
      return operator;
    },

    getAssetManager: async (assetID) => {
      initApiContract();
      var apiInstance = await apiContract.at(Chain.API());
      var manager = await apiInstance.getAssetManager(assetID);
      return manager;
    },

    getAssetInvestors: async (assetID) => {
      initCrowdsaleETHContract();
      initCrowdsaleERC20Contract();
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
    },

    getWeb3EventsListener: (providerNet) => {
      const eventListener = new Web3EventsListener(providerNet)
      return eventListener
    }
  }
})();
