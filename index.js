const ContractArtifacts = require("@mybit/contracts");
// const Chain = require("@mybit/chain");
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
      return await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
    },

    assetExchange: async () => {
      return await assetExchangeContract.at('0x8914a9e5c5e234fdc3ce9dc155ec19f43947ab59');
    },

    assetGenerator: async () => {
      return await assetGeneratorContract.at('0xf16165f1046f1b3cdb37da25e835b986e696313a');
    },

    // assetManagerEscrow: async () => {
    //   return await assetManagerEscrowContract.at(Chain.BrokerEscrow());
    // },

    contractManager: async () => {
      return await contractManagerContract.at('0xd86c8f0327494034f60e25074420bccf560d5610');
    },

    crowdsaleETH: async () => {
      return await crowdsaleETHContract.at('0xceefd27e0542afa926b87d23936c79c276a48277');
    },

    crowdsaleERC20: async () => {
      return await crowdsaleERC20Contract.at('0xc34175a79acca40392becd22ff10faebfe780ae7');
    },

    crowdsaleGeneratorETH: async () => {
      return await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
    },

    crowdsaleGeneratorERC20: async () => {
      return await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
    },

    database: async () => {
      return await databaseContract.at('0x21a59654176f2689d12e828b77a783072cd26680');
    },

    dividendTokenETH: async (tokenAddress) => {
      return await divTokenETHContract.at(tokenAddress);
    },

    dividendTokenERC20: async (tokenAddress) => {
      return await divTokenERCContract.at(tokenAddress);
    },

    erc20: async (tokenAddress) => {
      return await mybitContract.at(tokenAddress);
    },

    erc20Burner: async () => {
      return await erc20BurnerContract.at('0xddb64fe46a91d46ee29420539fc25fd07c5fea3e');
    },

    operators: async () => {
      return await operatorsContract.at('0x22d5c8bdd4346b390014a07109a8f830094d4abf');
    },

    platformFunds: async () => {
      return await platformFundsContract.at('0x970e8f18ebfea0b08810f33a5a40438b9530fbcf');
    },

    approveBurn: async (fromAddress) => {
      var count = 0;
      var amount = 1000000000000000000000000000000; //Some large amount 10^30
      tokenInstance = await mybitContract.at('0x254dffcd3277c0b1660f6d42efbb754edababc2b');
      await tokenInstance.approve('0xddb64fe46a91d46ee29420539fc25fd07c5fea3e', amount, {from: fromAddress});
      contractManagerInstance = await contractManagerContract.at('0xd86c8f0327494034f60e25074420bccf560d5610');
      await contractManagerInstance.setContractStatePreferences(true, false, {from: fromAddress});
      return true;
    },

    addOperator: async (account, name, owner) => {
      instance = await operatorsContract.at('0x22d5c8bdd4346b390014a07109a8f830094d4abf');
      tx = await instance.registerOperator(account, name, {from: owner});
      return tx.logs[0].args._operatorID;
    },

    acceptEther: async (id, operatorAddress) => {
      instance = await operatorsContract.at('0x22d5c8bdd4346b390014a07109a8f830094d4abf');
      await instance.acceptEther(id, true, {from: operatorAddress});
      return true;
    },

    acceptERC20Token: async (id, tokenAddress, operatorAddress) => {
      instance = await operatorsContract.at('0x22d5c8bdd4346b390014a07109a8f830094d4abf');
      await instance.acceptERC20Token(id, tokenAddress, true, {from: operatorAddress});
      return true;
    },

    createAsset: async (object) => {
      if(object.fundingToken === undefined){
        instance = await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
        tx = await instance.createAssetOrderETH(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, {from: object.broker, gas:2300000});
        return tx.logs[0].args;
      } else {
        instance = await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
        tx = await instance.createAssetOrderERC20(object.assetURI, object.operatorID, object.fundingLength, object.amountToRaise, object.brokerPercent, object.fundingToken, {from: object.broker, gas:6700000});
        return tx.logs[0].args;
      }
    },

    createDividendToken: async (object) => {
      if(object.fundingToken === undefined){
        instance = await divTokenETHContract.new(object.uri, object.owner, {from: object.owner, gas:2700000});
        return instance;
      } else {
        instance = await divTokenERCContract.new(object.uri, object.owner, object.fundingToken, {from: object.owner, gas:2700000});
        return instance;
      }
    },

    createERC20Token: async (object) => {
      instance = await mybitContract.new(object.uri, object.total, {from: object.owner, gas:2700000});
      return instance;
    },

    fundAsset: async (object) => {
      if(object.fundingToken === undefined){
        instance = await crowdsaleETHContract.at('0xceefd27e0542afa926b87d23936c79c276a48277');
        tx = await instance.buyAssetOrderETH(object.assetID, {from: object.address, value: object.amount, gas:2300000});
        return tx.tx;
      } else {
        instance = await crowdsaleERC20Contract.at('0xc34175a79acca40392becd22ff10faebfe780ae7');
        tx = await instance.buyAssetOrderERC20(object.assetID, object.amount, {from: object.address, gas:2300000});
        return tx.tx;
      }
    },

    issueDividends: async (assetID, account, amount) => {
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
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
      var assets = [];
      var crowdsaleETHInstance = await crowdsaleETHContract.at('0xceefd27e0542afa926b87d23936c79c276a48277');
      getAssets(crowdsaleETHInstance);
      var crowdsaleERCInstance = await crowdsaleERC20Contract.at('0xc34175a79acca40392becd22ff10faebfe780ae7');
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
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
      getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
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
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
      await getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
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
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
      getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
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
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
      var crowdsaleGenETHInstance = await crowdsaleGeneratorETHContract.at('0x4cfb3f70bf6a80397c2e634e5bdd85bc0bb189ee');
      await getAssets(crowdsaleGenETHInstance);
      var crowdsaleGenERCInstance = await crowdsaleGeneratorERC20Contract.at('0x988b6cfbf3332ff98ffbded665b1f53a61f92612');
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
      var instance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
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
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
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
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
      var tokenAddress = await apiInstance.getAssetAddress(assetID);
      var tokenInstance = await divTokenInterface.at(tokenAddress);
      var progress = Number(await tokenInstance.totalSupply());
      return progress;
    },

    getAssetOperator: async (assetID) => {
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
      var operator = await apiInstance.getAssetOperator(assetID);
      return operator;
    },

    getAssetManager: async (assetID) => {
      var apiInstance = await apiContract.at('0x7c728214be9a0049e6a86f2137ec61030d0aa964');
      var manager = await apiInstance.getAssetManager(assetID);
      return manager;
    },

    getAssetInvestors: async (assetID) => {
      var investors = [];
      var crowdsaleETHInstance = await crowdsaleETHContract.at('0xceefd27e0542afa926b87d23936c79c276a48277');
      getInvestors(crowdsaleETHInstance);
      var crowdsaleERCInstance = await crowdsaleERC20Contract.at('0xc34175a79acca40392becd22ff10faebfe780ae7');
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

    getWeb3EventsListener: () => new Web3EventsListener(),
  }
})();
