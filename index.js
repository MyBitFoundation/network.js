const Contracts = require("@mybit/contracts");
const Artifacts = Contracts.artifacts;
const TruffleContract = require("truffle-contract");
const bn = require("bignumber.js");

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

module.exports = function (web3, contractsAddresses){
  function contract(artifact){
    var c = TruffleContract(artifact);
    c.setProvider(web3.currentProvider);
    c.currentProvider.sendAsync = function () {
      return c.currentProvider.send.apply(c.currentProvider, arguments);
    };
    return c;
  }
  //Event functions
  async function getTransactionEvent(_message, _from, _to, _fromBlock){
    initEventsContract();
    events = await eventsContract.at(contractsAddresses.Events);
    e = events.LogTransaction({messageID: web3.utils.sha3(_message), from: _from, to: _to}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

  async function getAssetEvent(_message, _uri, _fromBlock){
    initEventsContract();
    events = await eventsContract.at(contractsAddresses.Events);
    e = events.LogAsset({messageID: web3.utils.sha3(_message), assetID: web3.utils.sha3(_uri)}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

  async function getOperatorEvent(_message, _origin, _fromBlock){
    initEventsContract();
    events = await eventsContract.at(contractsAddresses.Events);
    e = events.LogOperator({messageID: web3.utils.sha3(_message), origin: _origin}, {fromBlock: _fromBlock, toBlock: 'latest'});
    logs = await Promisify(callback => e.get(callback));
    return logs;
  };

  //Setup contracts
  let apiContract, mybitContract, erc20BurnerContract, databaseContract, eventsContract,
      contractManagerContract, singleOwnerContract, pausibleContract, accessHierarchyContract,
      platformContract, operatorsContract, assetManagerEscrowContract, crowdsaleETHContract,
      crowdsaleGeneratorETHContract, crowdsaleERC20Contract, crowdsaleGeneratorERC20Contract,
      assetGeneratorContract, assetExchangeContract, divTokenETHContract, divTokenERCContract,
      divTokenInterface, erc20Interface;

  //Setup contracts only when it`s using
  const initApiContract = () => {
    apiContract = apiContract || contract(Artifacts.API);
  };

  const initMyBitContract = () => {
    mybitContract = mybitContract || contract(Artifacts.MyBitToken);
  }

  const initErc20BurnerContract = () => {
    erc20BurnerContract = erc20BurnerContract || contract(Artifacts.ERC20Burner)
  }

  const initDatabaseContract = () => {
    databaseContract = databaseContract || contract(Artifacts.Database);
  }

  const initEventsContract = () => {
    eventsContract = eventsContract || contract(Artifacts.Events);
  }

  const initContractManagerContract = () => {
    contractManagerContract = contractManagerContract || contract(Artifacts.ContractManager);
  }

  const initSingleOwnerContract = () => {
    singleOwnerContract = singleOwnerContract || contract(Artifacts.SingleOwned);
  }

  const initPausibleContract = () => {
    pausibleContract = pausibleContract || contract(Artifacts.Pausible);
  }

  const initAccessHierarchyContract = () => {
    accessHierarchyContract = accessHierarchyContract || contract(Artifacts.AccessHierarchy);
  }

  const initPlatformContract = () => {
    platformContract = platformContract || contract(Artifacts.Platform);
  }

  const initOperatorsContract = () => {
    operatorsContract = operatorsContract || contract(Artifacts.Operators);
  }

  const initAssetManagerEscrowContract = () => {
    assetManagerEscrowContract = assetManagerEscrowContract || contract(Artifacts.AssetManagerEscrow);
  }

  const initAssetGoveranceContract = () => {
    assetGoveranceContract = assetGoveranceContract || contract(Artifacts.AssetGoverance);
  }

  const initCrowdsaleETHContract= () => {
    crowdsaleETHContract = crowdsaleETHContract || contract(Artifacts.CrowdsaleETH);
  }

  const initCrowdsaleGeneratorETHContract = () => {
    crowdsaleGeneratorETHContract = crowdsaleGeneratorETHContract || contract(Artifacts.CrowdsaleGeneratorETH);
  }

  const initCrowdsaleERC20Contract = () => {
    crowdsaleERC20Contract = crowdsaleERC20Contract || contract(Artifacts.CrowdsaleERC20);
  }

  const initCrowdsaleGeneratorERC20Contract = () => {
    crowdsaleGeneratorERC20Contract = crowdsaleGeneratorERC20Contract || contract(Artifacts.CrowdsaleGeneratorERC20);
  }

  const initAssetGeneratorContract = () => {
    assetGeneratorContract = assetGeneratorContract || contract(Artifacts.AssetGenerator);
  }

  const initAssetExchangeContract = () => {
    assetExchangeContract = assetExchangeContract || contract(Artifacts.AssetExchange);
  }

  const initDivTokenETHContract = () => {
    divTokenETHContract = divTokenETHContract || contract(Artifacts.DividendToken);
  }

  const initDivTokenERCContract = () => {
    divTokenERCContract = divTokenERCContract || contract(Artifacts.DividendTokenERC20);
  }

  const initDivTokenInterface = () => {
    divTokenInterface = divTokenInterface || contract(Artifacts.DivToken);
  }

  const initErc20Interface = () => {
    erc20Interface = erc20Interface || contract(Artifacts.ERC20);
  }

  return {
    api: async () => {
      initApiContract();
      return await apiContract.at(contractsAddresses.API);
    },

    assetExchange: async () => {
      initAssetExchangeContract();
      return await assetExchangeContract.at(contractsAddresses.AssetExchange);
    },

    assetGenerator: async () => {
      initAssetGeneratorContract()
      return await assetGeneratorContract.at(contractsAddresses.AssetGenerator);
    },

    assetManagerEscrow: async () => {
      initAssetManagerEscrowContract();
      return await assetManagerEscrowContract.at(contractsAddresses.AssetManagerEscrow);
    },

    contractManager: async () => {
      initContractManagerContract()
      return await contractManagerContract.at(contractsAddresses.ContractManager);
    },

    crowdsaleETH: async () => {
      initCrowdsaleETHContract();
      return await crowdsaleETHContract.at(contractsAddresses.CrowdsaleETH);
    },

    crowdsaleERC20: async () => {
      initCrowdsaleERC20Contract();
      return await crowdsaleERC20Contract.at(contractsAddresses.CrowdsaleERC20);
    },

    crowdsaleGeneratorETH: async () => {
      initCrowdsaleGeneratorETHContract();
      return await crowdsaleGeneratorETHContract.at(contractsAddresses.CrowdsaleGeneratorETH);
    },

    crowdsaleGeneratorERC20: async () => {
      initCrowdsaleGeneratorERC20Contract();
      return await crowdsaleGeneratorERC20Contract.at(contractsAddresses.CrowdsaleGeneratorERC20);
    },

    database: async () => {
      initDatabaseContract();
      return await databaseContract.at(contractsAddresses.Database);
    },

    events: async () => {
      initEventsContract();
      return await eventsContract.at(contractsAddresses.Events);
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
      initMyBitContract();
      return await mybitContract.at(tokenAddress);
    },

    erc20Burner: async () => {
      initErc20BurnerContract();
      return await erc20BurnerContract.at(contractsAddresses.ERC20Burner);
    },

    operators: async () => {
      initOperatorsContract();
      return await operatorsContract.at(contractsAddresses.Operators);
    },

    platform: async () => {
      initPlatformContract();
      return await platformContract.at(contractsAddresses.Platform);
    },

    //Approve the burning of MyBit on the MyBit Go Platform
    approveBurn: async (fromAddress) => {
      initMyBitContract();
      initContractManagerContract();
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      tokenInstance = await mybitContract.at(contractsAddresses.MyBitToken);
      await tokenInstance.approve(contractsAddresses.ERC20Burner, amount, {from: fromAddress});
      contractManagerInstance = await contractManagerContract.at(contractsAddresses.ContractManager);
      await contractManagerInstance.setContractStatePreferences(true, false, {from: fromAddress});
      return true;
    },

    addOperator: async (account, name, assetType, owner) => {
      initOperatorsContract();
      instance = await operatorsContract.at(contractsAddresses.Operators);
      block = await web3.eth.getBlock('latest');
      await instance.registerOperator(account, name, assetType, {from: owner, gas:300000});
      logs = await getOperatorEvent('Operator registered', owner, block.number);
      return logs[0].args.operatorID;
    },

    //Set whether the operator accepts Ether (operator only)
    acceptEther: async (id, operatorAddress) => {
      initOperatorsContract();
      instance = await operatorsContract.at(contractsAddresses.Operators);
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
    },

    //Set whether the operator accepts an ERC20 (operator only)
    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      initOperatorsContract();
      instance = await operatorsContract.at(contractsAddresses.Operators);
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
    },

    //Create a new asset and begin a crowdsale to fund the asset. Tokens representing shares are paid out to investors
    createAsset: async (object) => {
      if(bn(object.escrow).isGreaterThan(0)){
        //Get approval to transfer tokens to AssetManagerEscrow
        initMyBitContract();
        tokenInstance = await mybitContract.at(contractsAddresses.MyBitToken);
      }
      block = await web3.eth.getBlock('latest');
      if(object.fundingToken === undefined){
        initCrowdsaleGeneratorETHContract();
        instance = await crowdsaleGeneratorETHContract.at(contractsAddresses.CrowdsaleGeneratorETH);
        if(object.escrow > 0) await tokenInstance.approve(contractsAddresses.CrowdsaleGeneratorETH, object.escrow, {from: object.assetManager});
        await instance.createAssetOrderETH(object.assetURI, object.assetManager, object.operatorID, object.fundingLength, object.startTime, object.amountToRaise, object.assetManagerPercent, object.escrow, {from: object.assetManager, gas:2300000});
      } else {
        initCrowdsaleGeneratorERC20Contract();
        instance = await crowdsaleGeneratorERC20Contract.at(contractsAddresses.CrowdsaleGeneratorERC20);
        if(object.escrow > 0) await tokenInstance.approve(contractsAddresses.CrowdsaleGeneratorERC20, object.escrow, {from: object.assetManager});
        await instance.createAssetOrderERC20(object.assetURI, object.assetManager, object.operatorID, object.fundingLength, object.startTime, object.amountToRaise, object.assetManagerPercent, object.escrow, object.fundingToken, {from: object.assetManager, gas:6700000});
      }
      logs = await getAssetEvent('Asset funding started', object.assetURI, block.number);
      return logs[logs.length-1].args;
    },

    //Create a dividend token (tradeable or non-tradeable) for an asset already operating
    tokenizeAsset: async (object) => {
      initAssetGeneratorContract();
      instance = await assetGeneratorContract.at(contractsAddresses.AssetGenerator);
      block = await web3.eth.getBlock('latest');
      if(object.tradeable == true){
        await instance.createTradeableAsset(object.assetURI, object.assetManager, object.tokenHolders, object.tokenAmounts, {from: object.assetManager, gas:2000000});
        logs = await getAssetEvent('Asset created', object.assetURI, block.number);
      } else {
        await instance.createAsset(object.assetURI, object.assetManager, object.tokenHolders, object.tokenAmounts, {from: object.assetManager, gas:2000000});
        logs = await getAssetEvent('Asset created', object.assetURI, block.number);
      }
      return logs[logs.length-1].args;
    },

    //Create a dividend token. Once deployed, the creator can mint as many tokens as they like.
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

    //Create a basic ERC20 token. The owner must pass the number of tokens they wish to create. All tokens are given to creator.
    createERC20Token: async (object) => {
      initMyBitContract();
      instance = await mybitContract.new(object.uri, object.total, {from: object.owner, gas:2700000});
      return instance;
    },

    //Fund an asset undergoing a crowdsale. Pay Eth or ERC20's and get an asset dividen token in return.
    fundAsset: async (object) => {
      if(object.fundingToken === undefined){
        initCrowdsaleETHContract();
        instance = await crowdsaleETHContract.at(contractsAddresses.CrowdsaleETH);
        tx = await instance.buyAssetOrderETH(object.asset, object.investor, {from: object.investor, value: object.amount, gas:2300000});
      } else {
        initCrowdsaleERC20Contract();
        instance = await crowdsaleERC20Contract.at(contractsAddresses.CrowdsaleERC20);
        tx = await instance.buyAssetOrderERC20(object.asset, object.investor, object.amount, {from: object.investor, gas:2300000});
      }
      return tx.tx;
    },

    //Pay Eth or ERC20 tokens into a asset's dividend token. The money will be distributed amongst all token holders.
    issueDividends: async (asset, account, amount) => {
      initApiContract();
      initDivTokenETHContract();
      initDivTokenERCContract();
      initDivTokenInterface();
      initErc20Interface();
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var iDivTokenInstance = await divTokenInterface.at(asset);
      var erc20Address = await iDivTokenInstance.getERC20();
      if(erc20Address == '0x0000000000000000000000000000000000000000'){
        var balance = bn(await web3.eth.getBalance(account));
        if(balance.isGreaterThanOrEqualTo(amount)){
          try{
            var tokenInstance = await divTokenETHContract.at(asset);
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
        var iERC20Instance = await erc20Interface.at(erc20Address);
        var balance = bn(await iERC20Instance.balanceOf(account));
        if(balance.isGreaterThanOrEqualTo(amount)){
          try{
            var tokenInstance = await divTokenERCContract.at(asset);
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
        var asset = log.args.to;
        assets.push(asset);
      });

      return assets;
    },

    //View assets created by an asset manager
    getAssetsByManager: async (address) => {
      var assets = [];
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      for(var i=0; i<logs.length; i++){
        var asset = logs[i].args.asset;
        var manager = await apiInstance.getAssetManager(asset);
        if(address.toLowerCase() == manager.toLowerCase()){
          assets.push(asset);
        }
      }

      return assets;
    },

    //View assets by operator
    getAssetsByOperator: async (address) => {
      initApiContract();
      var assets = [];
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      for(var i=0; i<logs.length; i++){
        var asset = logs[i].args.asset;
        var operator = await apiInstance.getAssetOperator(asset);
        if(address.toLowerCase() == operator.toLowerCase()){
          assets.push(asset);
        }
      }

      return assets;
    },

    //View all assets
    getTotalAssets: async () => {
      var assets = [];
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      logs.forEach(function (log, index) {
        var asset = log.args.asset;
        assets.push(asset);
      });

      return assets;
    },

    //View assets by the open crowdsales
    getOpenCrowdsales: async () => {
      initApiContract();
      var assets = [];
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var logs = await getAssetEvent('Asset funding started', undefined, 0);
      for(var i=0; i<logs.length; i++){
        var asset = logs[i].args.asset;
        var finalized = await apiInstance.crowdsaleFinalized(asset);
        if(!finalized){
          var deadline = bn(await apiInstance.getCrowdsaleDeadline(asset));
          var now = Math.round(new Date().getTime()/1000); //Current time in seconds;
          if(deadline.isGreaterThan(now)){
            assets.push(asset);
          }
        }
      }

      return assets;
    },

    //Get the time left on a crowdsale (closed sales return 0).
    getFundingTimeLeft: async (asset) => {
      initApiContract();
      var instance = await apiContract.at(contractsAddresses.API);
      var finalized = await instance.crowdsaleFinalized(asset);
      var deadline = bn(await instance.getCrowdsaleDeadline(asset));
      var now = Math.round(new Date().getTime()/1000); //Current time in seconds;
      var timeleft;
      if(deadline.isGreaterThan(now) && !finalized){
        timeleft = deadline - now;
      } else {
        timeleft = 0;
      }
      return timeleft
    },

    //Get the funding goal of a crowdsale
    getFundingGoal: async (asset) => {
      initApiContract();
      initDivTokenInterface();
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var finalized = await apiInstance.crowdsaleFinalized(asset);
      var goal;

      //Funding goal gets deleted when crowdsale finalizes, so we must get the token supply
      if(finalized) {
        var tokenInstance = await divTokenInterface.at(asset);
        goal = Number(await tokenInstance.totalSupply());
      } else {
        goal = Number(await apiInstance.getCrowdsaleGoal(asset));
      }
      return goal;
    },

    //Get funding progress
    getFundingProgress: async (asset) => {
      initApiContract();
      initDivTokenInterface();
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var tokenInstance = await divTokenInterface.at(asset);
      var progress = Number(await tokenInstance.totalSupply());
      return progress;
    },

    //Get the operator of an asset
    getAssetOperator: async (asset) => {
      initApiContract();
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var operator = await apiInstance.getAssetOperator(asset);
      return operator;
    },

    //Get the manager of an asset
    getAssetManager: async (asset) => {
      initApiContract();
      var apiInstance = await apiContract.at(contractsAddresses.API);
      var manager = await apiInstance.getAssetManager(asset);
      return manager;
    },

    //Get an asset's investors
    getAssetInvestors: async (asset) => {
      var investors = [];
      var logs = await getTransactionEvent('Asset purchased', undefined, undefined, 0);
      logs.forEach(function (log, index) {
        if(log.args.to == asset){
          var investor = log.args.from;
          investors.push(investor);
        }
      });

      return investors;
    },
  }
};
