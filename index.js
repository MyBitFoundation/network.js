const ContractArtifacts = require("@mybit/contracts");
const Chain = require("@mybit/network-chain");
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
  var mybitContract = contract(ContractArtifacts.MyBitToken);
  var erc20Contract = contract(ContractArtifacts.MyBitToken);
  var erc20BurnerContract = contract(ContractArtifacts.ERC20Burner);
  var databaseContract = contract(ContractArtifacts.Database);
  var eventsContract = contract(ContractArtifacts.Events);
  var contractManagerContract = contract(ContractArtifacts.ContractManager);
  var singleOwnerContract = contract(ContractArtifacts.SingleOwned);
  var pausibleContract = contract(ContractArtifacts.Pausible);
  var accessHierarchyContract = contract(ContractArtifacts.AccessHierarchy);
  var platformFundsContract = contract(ContractArtifacts.PlatformFunds);
  var operatorsContract = contract(ContractArtifacts.Operators);
  var assetGoveranceContract = contract(ContractArtifacts.AssetGovernance);
  var assetManagerEscrowContract = contract(ContractArtifacts.AssetManagerEscrow);
  var assetManangerFundsContract = contract(ContractArtifacts.AssetManagerFunds);
  var crowdsaleETHContract = contract(ContractArtifacts.CrowdsaleETH);
  var crowdsaleGeneratorETHContract = contract(ContractArtifacts.CrowdsaleGeneratorETH);
  var crowdsaleERC20Contract = contract(ContractArtifacts.CrowdsaleERC20);
  var crowdsaleGeneratorERC20Contract = contract(ContractArtifacts.CrowdsaleGeneratorERC20);
  var assetGeneratorContract = contract(ContractArtifacts.AssetGenerator);
  var assetExchangeContract = contract(ContractArtifacts.AssetExchange);
  var divTokenETHContract = contract(ContractArtifacts.DividendToken);
  var divTokenERCContract = contract(ContractArtifacts.DividendTokenERC20);
  var divTokenInterface = contract(ContractArtifacts.DivToken);

  //Event functions
  async function getTransactionEvent(_message, _from, _to, _fromBlock){
    events = await eventsContract.at(Chain.Events());
    e = events.LogTransaction({messageID: web3.utils.sha3(_message), from: _from, to: _to}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

  async function getAssetEvent(_message, _manager, _fromBlock){
    events = await eventsContract.at(Chain.Events());
    e = events.LogAsset({messageID: web3.utils.sha3(_message), manager: _manager}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

  async function getOperatorEvent(_message, _origin, _fromBlock){
    events = await eventsContract.at(Chain.Events());
    e = events.LogOperator({messageID: web3.utils.sha3(_message), origin: _origin}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

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

    assetGovernance: async () => {
      return await assetGovernanceContract.at(Chain.AssetGovernance());
    },

    assetManagerEscrow: async () => {
      return await assetManagerEscrowContract.at(Chain.AssetManagerEscrow());
    },

    assetManagerFunds: async () => {
      return await assetManagerFundsContract.at(Chain.AssetManagerFunds());
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

    events: async () => {
      return await eventsContract.at(Chain.Events());
    },

    dividendTokenETH: async (tokenAddress) => {
      return await divTokenETHContract.at(tokenAddress);
    },

    dividendTokenERC20: async (tokenAddress) => {
      return await divTokenERCContract.at(tokenAddress);
    },

    erc20: async (tokenAddress) => {
      return await erc20Contract.at(tokenAddress);
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

    //Approve the burning of MyBit on the MyBit Go Platform
    approveBurn: async (fromAddress) => {
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      tokenInstance = await mybitContract.at(Chain.MyBit());
      await tokenInstance.approve(Chain.ERC20Burner(), amount, {from: fromAddress});
      contractManagerInstance = await contractManagerContract.at(Chain.ContractManager());
      await contractManagerInstance.setContractStatePreferences(true, false, {from: fromAddress});
      return true;
    },

    //Add an operator to the platform (owner only)
    addOperator: async (account, name, assetType, owner) => {
      instance = await operatorsContract.at(Chain.Operators());
      block = await web3.eth.getBlock('latest');
      await instance.registerOperator(account, name, assetType, {from: owner, gas:300000});
      logs = await getOperatorEvent('Operator registered', owner, block.number);
      return logs[0].args.operatorID;
    },

    //Set whether the operator accepts Ether (operator only)
    acceptEther: async (id, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
    },

    //Set whether the operator accepts an ERC20 (operator only)
    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      instance = await operatorsContract.at(Chain.Operators());
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
    },

    //Create a new asset and begin a crowdsale to fund the asset. Tokens representing shares are paid out to investors
    createAsset: async (object) => {
      block = await web3.eth.getBlock('latest');
      if(object.fundingToken === undefined){
        instance = await crowdsaleGeneratorETHContract.at(Chain.CrowdsaleGeneratorETH());
        await instance.createAssetOrderETH(object.assetURI, object.assetManager, object.operatorID, object.fundingLength, object.startTime, object.amountToRaise, object.assetManagerPercent, {from: object.assetManager, gas:2300000});
      } else {
        instance = await crowdsaleGeneratorERC20Contract.at(Chain.CrowdsaleGeneratorERC20());
        await instance.createAssetOrderERC20(object.assetURI, object.assetManager, object.operatorID, object.fundingLength, object.startTime, object.amountToRaise, object.assetManagerPercent, object.fundingToken, {from: object.assetManager, gas:6700000});
      }
      logs = await getAssetEvent('Asset funding started', object.assetManager, block.number)
      return logs[logs.length-1].args;
    },

    //Create a dividend token (tradeable or non-tradeable) for an asset already operating
    tokenizeAsset: async (object) => {
      instance = await assetGeneratorContract.at(Chain.AssetGenerator());
      block = await web3.eth.getBlock('latest');
      if(object.tradeable == true){
        await instance.createTradeableAsset(object.assetURI, object.assetManager, object.tokenHolders, object.tokenAmounts, {from: object.assetManager, gas:2000000});
        logs = await getAssetEvent('Asset created', object.assetManager, block.number);
      } else {
        await instance.createAsset(object.assetURI, object.assetManager, object.tokenHolders, object.tokenAmounts, {from: object.assetManager, gas:2000000});
        logs = await getAssetEvent('Asset created', object.assetManager, block.number);
      }
      return logs[logs.length-1].args;
    },

    //Create a dividend token. Once deployed, the creator can mint as many tokens as they like.
    createDividendToken: async (object) => {
      if(object.fundingToken === undefined){
        instance = await divTokenETHContract.new(object.uri, object.owner, {from: object.owner, gas:2700000});
        return instance;
      } else {
        instance = await divTokenERCContract.new(object.uri, object.owner, object.fundingToken, {from: object.owner, gas:2700000});
        return instance;
      }
    },

    //Create a basic ERC20 token. The owner must pass the number of tokens they wish to create. All tokens are given to creator.
    createERC20Token: async (object) => {
      instance = await mybitContract.new(object.uri, object.total, {from: object.owner, gas:2700000});
      return instance;
    },

    //Fund an asset undergoing a crowdsale. Pay Eth or ERC20's and get an asset dividen token in return.
    fundAsset: async (object) => {
      if(object.fundingToken === undefined){
        instance = await crowdsaleETHContract.at(Chain.CrowdsaleETH());
        tx = await instance.buyAssetOrderETH(object.assetID, object.investor, {from: object.investor, value: object.amount, gas:2300000});
      } else {
        instance = await crowdsaleERC20Contract.at(Chain.CrowdsaleERC20());
        tx = await instance.buyAssetOrderERC20(object.assetID, object.investor, object.amount, {from: object.investor, gas:2300000});
      }
      return tx.tx;
    },

    //Pay Eth or ERC20 tokens into a asset's dividend token. The money will be distributed amongst all token holders.
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
        var erc20Instance = await erc20Contract.at(erc20Address);
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

    //View the assets an investor has invested in. (This may not represent their current stake, just crowdsales they have contributed to)
    getAssetsByInvestor: async (address) => {
      var assets = [];
      var logs = await getTransactionEvent('Asset purchased', address, undefined, 0);
      logs.forEach(function (log, index) {
        var assetID = log.args.assetID;
        assets.push(assetID);
      });

      return assets;
    },

    //View assets created by an asset manager
    getAssetsByManager: async (address) => {
      var assets = [];
      var logs = await getAssetEvent('Asset funding started', address, 0);
      logs.forEach(function (log, index) {
        var assetID = log.args.assetID;
        assets.push(assetID);
      });

      return assets;
    },

    //View assets by operator
    getAssetsByOperator: async (address) => {
      var assets = [];
      var apiInstance = await apiContract.at(Chain.API());
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      for(var i=0; i<logs.length; i++){
        var assetID = logs[i].args.assetID;
        var operator = await apiInstance.getAssetOperator(assetID);
        if(address.toLowerCase() == operator.toLowerCase()){
          assets.push(assetID);
        }
      }

      return assets;
    },

    //View all assets
    getTotalAssets: async () => {
      var assets = [];
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      logs.forEach(function (log, index) {
        var assetID = log.args.assetID;
        assets.push(assetID);
      });

      return assets;
    },

    //View assets by the open crowdsales
    getOpenCrowdsales: async () => {
      var assets = [];
      var apiInstance = await apiContract.at(Chain.API());
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      for(var i=0; i<logs.length; i++){
        var assetID = logs[i].args.assetID;
        var finalized = await apiInstance.crowdsaleFinalized(assetID);
        if(!finalized){
          var deadline = Number(await apiInstance.getAssetFundingDeadline(assetID));
          var now = Math.round(new Date().getTime()/1000); //Current time in seconds;
          if(deadline > now){
            assets.push(assetID);
          }
        }
      }

      return assets;
    },

    //Get the time left on a crowdsale (closed sales return 0).
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

    //Get the funding goal of a crowdsale
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

    //Get funding progress
    getFundingProgress: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var tokenInstance = await divTokenInterface.at(tokenAddress);
      var progress = Number(await tokenInstance.totalSupply());
      return progress;
    },

    //Get the operator of an asset
    getAssetOperator: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var operator = await apiInstance.getAssetOperator(assetID);
      return operator;
    },

    //Get the manager of an asset
    getAssetManager: async (assetID) => {
      var apiInstance = await apiContract.at(Chain.API());
      var manager = await apiInstance.getAssetManager(assetID);
      return manager;
    },

    //Get an asset's investors
    getAssetInvestors: async (assetID) => {
      var investors = [];
      var logs = await getTransactionEvent('Asset purchased', undefined, undefined, 0);
      logs.forEach(function (log, index) {
        if(log.args.id == assetID){
          var investor = log.args.from;
          investors.push(investor);
        }
      });

      return investors;
    }
  }
})();
