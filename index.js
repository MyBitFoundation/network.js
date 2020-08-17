const Contracts = require("@mybit/contracts");
const Artifacts = Contracts.artifacts;
const gas = require("./gas.js");
const bn = require("bignumber.js");
bn.config({ EXPONENTIAL_AT: 80 });
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

module.exports = function (web3, contractAddresses, blockNumber){
  function contract(artifact, address){
    const c = new web3.eth.Contract(artifact.abi, address);
    return c;
  }

  function processEventCallbacks(object){
    //Regular event callbacks
    if(!object.onError) object.onError = function(){}
    if(!object.onTransactionHash) object.onTransactionHash = function(){}
    if(!object.onReceipt) object.onReceipt = function(){}
    return object;
  }

  async function processGas(object, defaultGas){
    if(!object.gas) object.gas = defaultGas;
    if(!object.gasPrice) object.gasPrice = await web3.eth.getGasPrice();
    return object;
  }

  //Event functions
  async function getTransactionEvent(_message, _from, _to, _fromBlock){
    initEventsContract();
    e = await eventsContract.getPastEvents('LogTransaction', {
                                              filter:{
                                                  messageID: web3.utils.sha3(_message),
                                                  from: _from,
                                                  to: _to },
                                              fromBlock: _fromBlock,
                                              toBlock: 'latest'});
    return e;
  };

  async function getAssetEvent(_message, _uri, _fromBlock){
    initEventsContract();
    let assetID;
    if(_uri) assetID = web3.utils.sha3(_uri);
    e = await eventsContract.getPastEvents('LogAsset', {
                                            filter: {
                                                messageID: web3.utils.sha3(_message),
                                                assetID: assetID },
                                            fromBlock: _fromBlock,
                                            toBlock: 'latest'});
    return e;
  };

  async function getOperatorEvent(_message, _origin, _fromBlock){
    initEventsContract();
    e = await eventsContract.getPastEvents('LogOperator', {
                                              filter:{
                                                  messageID: web3.utils.sha3(_message),
                                                  origin: _origin},
                                              fromBlock: _fromBlock,
                                              toBlock: 'latest'});
    return e;
  };

  //Setup contracts
  let apiContract, mybitContract, databaseContract, eventsContract,
      contractManagerContract, singleOwnedContract, pausibleContract,
      platformContract, operatorsContract, assetManagerEscrowContract,
      assetManagerFundsContract, crowdsaleETHContract, crowdsaleGeneratorETHContract,
      crowdsaleERC20Contract, crowdsaleGeneratorERC20Contract, assetGeneratorContract,
      tokenFactoryContract;

  //Setup contracts only when it`s using
  const initApiContract = () => { apiContract = apiContract || contract(Artifacts.API, contractAddresses.API) }
  const initMyBitContract = () => { mybitContract = mybitContract || contract(Artifacts.MyBitToken, contractAddresses.MyBitToken) }
  const initDatabaseContract = () => { databaseContract = databaseContract || contract(Artifacts.Database, contractAddresses.Database) }
  const initEventsContract = () => { eventsContract = eventsContract || contract(Artifacts.Events, contractAddresses.Events) }
  const initContractManagerContract = () => { contractManagerContract = contractManagerContract || contract(Artifacts.ContractManager, contractAddresses.ContractManager) }
  const initSingleOwnedContract = () => { singleOwnedContract = singleOwnedContract || contract(Artifacts.SingleOwned, contractAddresses.SingleOwned) }
  const initPausibleContract = () => { pausibleContract = pausibleContract || contract(Artifacts.Pausible, contractAddresses.Pausible) }
  const initPlatformContract = () => { platformContract = platformContract || contract(Artifacts.Platform, contractAddresses.Platform) }
  const initOperatorsContract = () => { operatorsContract = operatorsContract || contract(Artifacts.Operators, contractAddresses.Operators) }
  const initAssetManagerEscrowContract = () => { assetManagerEscrowContract = assetManagerEscrowContract || contract(Artifacts.AssetManagerEscrow, contractAddresses.AssetManagerEscrow) }
  const initAssetManagerFundsContract = () => { assetManagerFundsContract = assetManagerFundsContract || contract(Artifacts.AssetManagerFunds, contractAddresses.AssetManagerFunds) }
  const initCrowdsaleETHContract= () => { crowdsaleETHContract = crowdsaleETHContract || contract(Artifacts.CrowdsaleETH, contractAddresses.CrowdsaleETH) }
  const initCrowdsaleGeneratorETHContract = () => { crowdsaleGeneratorETHContract = crowdsaleGeneratorETHContract || contract(Artifacts.CrowdsaleGeneratorETH, contractAddresses.CrowdsaleGeneratorETH) }
  const initCrowdsaleERC20Contract = () => { crowdsaleERC20Contract = crowdsaleERC20Contract || contract(Artifacts.CrowdsaleERC20, contractAddresses.CrowdsaleERC20) }
  const initCrowdsaleGeneratorERC20Contract = () => { crowdsaleGeneratorERC20Contract = crowdsaleGeneratorERC20Contract || contract(Artifacts.CrowdsaleGeneratorERC20, contractAddresses.CrowdsaleGeneratorERC20) }
  const initAssetGeneratorContract = () => { assetGeneratorContract = assetGeneratorContract || contract(Artifacts.AssetGenerator, contractAddresses.AssetGenerator) }
  const initTokenFactoryContract = () => { tokenFactoryContract = tokenFactoryContract || contract(Artifacts.MiniMeTokenFactory, contractAddresses.MiniMeTokenFactory) }

  return {
    api: () => {
      initApiContract()
      return apiContract
    },

    assetGenerator: () => {
      initAssetGeneratorContract()
      return assetGeneratorContract
    },

    assetManagerEscrow: () => {
      initAssetManagerEscrowContract()
      return assetManagerEscrowContract
    },

    assetManagerFunds: () => {
      initAssetManagerFundsContract()
      return assetManagerFundsContract
    },

    contractManager: () => {
      initContractManagerContract()
      return contractManagerContract
    },

    crowdsaleETH: () => {
      initCrowdsaleETHContract()
      return crowdsaleETHContract;
    },

    crowdsaleERC20: () => {
      initCrowdsaleERC20Contract()
      return crowdsaleERC20Contract
    },

    crowdsaleGeneratorETH: () => {
      initCrowdsaleGeneratorETHContract()
      return crowdsaleGeneratorETHContract
    },

    crowdsaleGeneratorERC20: () => {
      initCrowdsaleGeneratorERC20Contract()
      return crowdsaleGeneratorERC20Contract
    },

    database: () => {
      initDatabaseContract()
      return databaseContract
    },

    events: () => {
      initEventsContract()
      return eventsContract
    },

    myBitToken: () => {
      initMyBitContract()
      return mybitContract
    },

    operators: () => {
      initOperatorsContract()
      return operatorsContract
    },

    platform: async () => {
      initPlatformContract()
      return platformContract
    },

    tokenFactory: async () => {
      initTokenFactoryContract()
      return tokenFactory
    },

    miniMeToken: (tokenAddress) => {
      return contract(Artifacts.MiniMeToken, tokenAddress)
    },

    dividendToken: (tokenAddress) => {
      return contract(Artifacts.MiniMeToken, tokenAddress)
    },

    //DEPRECIATED
    dividendTokenETH: (tokenAddress) => {
      console.log('Depreciated. Please use dividendToken()')
      return contract(Artifacts.MiniMeToken, tokenAddress)
    },

    //DEPRECIATED
    dividendTokenERC20: (tokenAddress) => {
      console.log('Depreciated. Please use dividendToken()')
      return contract(Artifacts.MiniMeToken, tokenAddress)
    },

    erc20: (tokenAddress) => {
      return contract(Artifacts.ERC20, tokenAddress)
    },

    approve: async (object) => {
      object = await processGas(object, gas.approve);
      tokenInterface = contract(Artifacts.ERC20, object.token)
      return tokenInterface.methods.approve(object.to, object.amount).send({from: object.from, gas:object.gas, gasPrice:object.gasPrice});
    },

    //Approve the burning of MyBit on the MyBit Go Platform
    /*
    approveBurn: async (object) => {
      initMyBitContract();
      initContractManagerContract();
      if(!object.approve) object.approve = {}
      if(!object.setState) object.setState = {}
      object.approve = processEventCallbacks(object.approve);
      object.setState = processEventCallbacks(object.setState);
      const amount = '1000000000000000000000000000000'; //Some large amount 10^30
      await mybitContract.methods.approve(contractAddresses.ERC20Burner, amount)
                         .send({from: object.from, gas:'55000'})
                         .on('error', object.approve.onError)
                         .on('transactionHash', object.approve.onTransactionHash)
                         .on('receipt', object.approve.onReceipt)

      let receipt = await contractManagerContract.methods.setContractStatePreferences(true, false)
                                                 .send({from: object.from})
                                                 .on('error', object.setState.onError)
                                                 .on('transactionHash', object.setState.onTransactionHash)
                                                 .on('receipt', object.setState.onReceipt)

      return receipt;
    },*/

    //Add an operator. Only the platform owner may call this function.
    addOperator: async (object) => {
      initOperatorsContract();
      initApiContract();
      object = processEventCallbacks(object);
      object = await processGas(object, gas.addOperator);
      if(!object.referrer) object.referrer = NULL_ADDRESS
      tx = await operatorsContract.methods.registerOperator(object.operator, object.name, object.ipfs, object.referrer)
                             .send({from: object.owner, gas:object.gas, gasPrice:object.gasPrice})
                             .on('error', object.onError)
                             .on('transactionHash', object.onTransactionHash)
                             .on('receipt', object.onReceipt)

     let operatorID = await apiContract.methods.getOperatorID(object.operator).call();
     return operatorID;
   },

   addModel: async (object) => {
     initOperatorsContract();
     object = processEventCallbacks(object);
     object = await processGas(object, gas.addAsset);
     if(!object.token)  object.token = NULL_ADDRESS
     let block = await web3.eth.getBlock('latest');
     let receipt = await operatorsContract.methods.addAsset(object.operatorID, object.name, object.ipfs, object.accept, object.payout, object.token)
                                          .send({from: object.operator, gas:object.gas, gasPrice: object.gasPrice})
                                          .on('error', object.onError)
                                          .on('transactionHash', object.onTransactionHash)
                                          .on('receipt', object.onReceipt)

    const logs = await getOperatorEvent('Asset added', object.operator, block.number)
    return logs[logs.length-1].returnValues.id;
   },

   //Set whether the operator accepts a token (operator only).
   acceptToken: async (object) => {
     initOperatorsContract();
     object = processEventCallbacks(object);
     object = await processGas(object, gas.acceptToken);
     if(!object.token) object.token = NULL_ADDRESS
     let receipt = await operatorsContract.methods.acceptToken(object.id, object.token, true)
                                          .send({from: object.operator, gas:object.gas, gasPrice:object.gasPrice})
                                          .on('error', object.onError)
                                          .on('transactionHash', object.onTransactionHash)
                                          .on('receipt', object.onReceipt)
     return receipt;
   },

   //Set whether the operator accepts an ERC20 (operator only).
   payoutToken: async (object) => {
     initOperatorsContract();
     object = processEventCallbacks(object);
     object = await processGas(object, gas.payoutToken);
     if(!object.token) object.token = NULL_ADDRESS
     let receipt = await operatorsContract.methods.payoutToken(object.id, object.token, true)
                                          .send({from: object.operator, gas:object.gas, gasPrice:object.gasPrice})
                                          .on('error', object.onError)
                                          .on('transactionHash', object.onTransactionHash)
                                          .on('receipt', object.onReceipt)
     return receipt;
    },

    //DEPRECIATED
    //Set whether the operator accepts Ether (operator only).
    acceptEther: async (object) => {
      console.log('Depreciated. Please use acceptToken()')
      initOperatorsContract();
      object = processEventCallbacks(object);
      object = await processGas(object, gas.acceptToken);
      let receipt = await operatorsContract.methods.acceptToken(object.id, NULL_ADDRESS, true)
                                           .send({from: object.operator, gas:object.gas, gasPrice: object.gasPrice})
                                           .on('error', object.onError)
                                           .on('transactionHash', object.onTransactionHash)
                                           .on('receipt', object.onReceipt)
      return receipt;
    },

    //DEPRECIATED
    //Set whether the operator accepts an ERC20 (operator only).
    acceptERC20Token: async (object) => {
      console.log('Depreciated. Please use acceptToken()')
      initOperatorsContract();
      object = processEventCallbacks(object);
      object = await processGas(object, gas.acceptToken);
      let receipt = await operatorsContract.methods.acceptToken(object.id, object.token, true)
                                           .send({from: object.operator, gas:object.gas, gasPrice:object.gasPrice})
                                           .on('error', object.onError)
                                           .on('transactionHash', object.onTransactionHash)
                                           .on('receipt', object.onReceipt)
      return receipt;
    },

    //DEPRECIATED
    //Set whether the operator accepts Ether (operator only).
    payoutEther: async (object) => {
      console.log('Depreciated. Please use payoutToken()')
      initOperatorsContract();
      object = processEventCallbacks(object);
      object = await processGas(object, gas.payoutToken);
      let receipt = operatorsContract.methods.payoutToken(object.id, NULL_ADDRESS, true)
                                           .send({from: object.operator, gas:object.gas, gasPrice: object.gasPrice})
                                           .on('error', object.onError)
                                           .on('transactionHash', object.onTransactionHash)
                                           .on('receipt', object.onReceipt)
      return receipt;
    },

    //DEPRECIATED
    //Set whether the operator accepts an ERC20 (operator only).
    payoutERC20Token: async (object) => {
      console.log('Depreciated. Please use payoutToken()')
      initOperatorsContract();
      object = processEventCallbacks(object);
      object = await processGas(object, gas.payoutToken);
      let receipt = await operatorsContract.methods.payoutToken(object.id, object.token, true)
                                           .send({from: object.operator, gas:object.gas, gasPrice:object.gasPrice})
                                           .on('error', object.onError)
                                           .on('transactionHash', object.onTransactionHash)
                                           .on('receipt', object.onReceipt)
      return receipt;
    },

    //Create a new asset and begin a crowdsale to fund the asset. Tokens representing shares are paid out to investors.

    createAsset: async (object) => {
      console.log('createAsset', object)
      if(!object.approve) object.approve = {}
      if(!object.createAsset) object.createAsset = {}
      object.approve = processEventCallbacks(object.approve);
      object.createAsset = processEventCallbacks(object.createAsset);
      if(object.escrow > 0) initMyBitContract();
      let value = 0;
      let block = await web3.eth.getBlock('latest');
      if(object.fundingToken === undefined){
        initCrowdsaleGeneratorETHContract();
        if(object.escrow > 0) {
          if(object.paymentToken.toLowerCase() !== ETH_ADDRESS){
            object.approve = await processGas(object.approve, gas.approve);
            let paymentTokenContract = contract(Artifacts.ERC20, object.paymentToken)
            await paymentTokenContract.methods.approve(contractAddresses.CrowdsaleGeneratorETH, object.escrow)
                                      .send({from: object.assetManager, gas: object.approve.gas, gasPrice: object.approve.gasPrice})
                                      .on('error', object.approve.onError)
                                      .on('transactionHash', object.approve.onTransactionHash)
                                      .on('receipt', object.approve.onReceipt)
          } else {
            value = object.escrow;
          }
        }
        object.createAsset = await processGas(object.createAsset, gas.createAssetOrderETH);
        tx = await crowdsaleGeneratorETHContract.methods.createAssetOrderETH(object.assetURI, object.ipfs, object.fundingLength, object.amountToRaise, object.assetManagerPercent, object.escrow, object.paymentToken)
                                           .send({from: object.assetManager, value: value, gas:object.createAsset.gas, gasPrice:object.createAsset.gasPrice})
                                           .on('error', object.createAsset.onError)
                                           .on('transactionHash', object.createAsset.onTransactionHash)
                                           .on('receipt', object.createAsset.onReceipt)
      } else {
        initCrowdsaleGeneratorERC20Contract();
        if(object.escrow > 0) {
          if(object.paymentToken.toLowerCase() !== ETH_ADDRESS){
            let paymentTokenContract = contract(Artifacts.ERC20, object.paymentToken)
            object.approve = await processGas(object.approve, gas.approve);
            await paymentTokenContract.methods.approve(contractAddresses.CrowdsaleGeneratorERC20, object.escrow)
                               .send({from: object.assetManager, gas: object.approve.gas, gasPrice: object.approve.gasPrice})
                               .on('error', object.approve.onError)
                               .on('transactionHash', object.approve.onTransactionHash)
                               .on('receipt', object.approve.onReceipt);
          } else {
            value = object.escrow;
          }
        }
        object.createAsset = await processGas(object.createAsset, gas.createAssetOrderERC20);
        console.log(object.assetURI, object.ipfs, object.fundingLength, object.amountToRaise, object.assetManagerPercent, object.escrow, object.fundingToken, object.paymentToken)
        tx = await crowdsaleGeneratorERC20Contract.methods.createAssetOrderERC20(object.assetURI, object.ipfs, object.fundingLength, object.amountToRaise, object.assetManagerPercent, object.escrow, object.fundingToken, object.paymentToken)
                                             .send({from: object.assetManager, value: value, gas:object.createAsset.gas, gasPrice:object.createAsset.gasPrice})
                                             .on('error', object.createAsset.onError)
                                             .on('transactionHash', object.createAsset.onTransactionHash)
                                             .on('receipt', object.createAsset.onReceipt)
      }
      const logs = await getAssetEvent('Asset funding started', object.assetURI, block.number);
      return logs[logs.length-1].returnValues;
    },

    //Create a dividend token (tradeable or non-tradeable) for an asset already operating.
    tokenizeAsset: async (object) => {
      initAssetGeneratorContract();
      object = processEventCallbacks(object);
      let block = await web3.eth.getBlock('latest');
      if(object.tradeable == true){
        object = await processGas(object, gas.createTradeableAsset)
        await assetGeneratorContract.methods.createTradeableAsset(object.assetURI, object.tokenHolders, object.tokenAmounts)
                              .send({from: object.assetManager, gas:object.gas, gasPrice:object.gasPrice})
                              .on('error', object.onError)
                              .on('transactionHash', object.onTransactionHash)
                              .on('receipt', object.onReceipt)
      } else {
        object = await processGas(object, gas.createAsset)
        await assetGeneratorContract.methods.createAsset(object.assetURI, object.tokenHolders, object.tokenAmounts)
                              .send({from: object.assetManager, gas:object.gas, gasPrice:object.gasPrice})
                              .on('error', object.onError)
                              .on('transactionHash', object.onTransactionHash)
                              .on('receipt', object.onReceipt)
      }
      let logs = await getAssetEvent('Asset created', object.assetURI, block.number)
      return logs[logs.length-1].returnValues;
    },

    //Create a dividend token. Once deployed, the creator can mint as many tokens as they like.
    createDividendToken: async (object) => {
      initTokenFactoryContract()
      object = processEventCallbacks(object);
      object = await processGas(object, gas.createDividendToken);

      if(object.symbol === undefined) object.symbol = object.uri
      if(object.fundingToken === undefined) object.fundingToken = NULL_ADDRESS
      let tx = await tokenFactoryContract.methods.createCloneToken(NULL_ADDRESS, 0, object.uri, 18, object.symbol, true, object.fundingToken)
                                                 .send({from: object.owner, gas:'6000000', gasPrice:object.gasPrice})
                                                 .on('error', object.onError)
                                                 .on('transactionHash', object.onTransactionHash)
                                                 .on('receipt', object.onReceipt);

      return contract(Artifacts.MiniMeToken, tx.events.NewToken.returnValues.token)
    },

    //Create a basic ERC20 token. The owner must pass the number of tokens they wish to create. All tokens are given to creator.
    createERC20Token: async (object) => {
      object = processEventCallbacks(object);
      object = await processGas(object, gas.createERC20Token);
      let erc20Contract = new web3.eth.Contract(Artifacts.MyBitToken.abi)
      let instance = await erc20Contract.deploy({data: Artifacts.MyBitToken.bytecode, arguments: [object.uri, object.symbol, bn(object.total).toString()]})
                                        .send({from: object.owner, gas:object.gas, gasPrice:object.gasPrice})
                                        .on('error', object.onError)
                                        .on('transactionHash', object.onTransactionHash)
                                        .on('receipt', object.onReceipt);
      return instance;
    },

    //Fund an asset undergoing a crowdsale. Pay Eth or ERC20's and get an asset dividen token in return.
    fundAsset: async (object) => {
      if(!object.buyAsset) object.buyAsset = {}
      object.buyAsset = processEventCallbacks(object.buyAsset);
      let receipt;
      if(object.paymentToken === undefined){
        initCrowdsaleETHContract();
        object.buyAsset = await processGas(object.buyAsset, gas.buyAssetOrderETH);
        receipt = await crowdsaleETHContract.methods.buyAssetOrderETH(object.asset)
                                  .send({from: object.investor, value: object.amount, gas:object.buyAsset.gas, gasPrice:object.buyAsset.gasPrice})
                                  .on('error', object.buyAsset.onError)
                                  .on('transactionHash', object.buyAsset.onTransactionHash)
                                  .on('receipt', object.buyAsset.onReceipt);
      } else {
        initCrowdsaleERC20Contract();
        object.buyAsset = await processGas(object.buyAsset, gas.buyAssetOrderERC20);
        let value = 0;
        if(object.paymentToken.toLowerCase() !== ETH_ADDRESS){
          if(!object.approve) object.approve = {};
          object.approve = processEventCallbacks(object.approve);
          object.approve = await processGas(object.approve, gas.approve);
          let paymentTokenContract = contract(Artifacts.ERC20, object.paymentToken)
          await paymentTokenContract.methods.approve(contractAddresses.CrowdsaleERC20, object.amount)
                                    .send({from: object.investor, gas: object.approve.gas, gasPrice: object.approve.gasPrice})
                                    .on('error', object.approve.onError)
                                    .on('transactionHash', object.approve.onTransactionHash)
                                    .on('receipt', object.approve.onReceipt);
        } else {
          value = object.amount;
        }
        receipt = await crowdsaleERC20Contract.methods.buyAssetOrderERC20(object.asset, object.amount, object.paymentToken)
                                              .send({from: object.investor, value: value, gas:object.buyAsset.gas, gasPrice:object.buyAsset.gasPrice})
                                              .on('error', object.buyAsset.onError)
                                              .on('transactionHash', object.buyAsset.onTransactionHash)
                                              .on('receipt', object.buyAsset.onReceipt);
      }
      return receipt;
    },

    payout: async (object) => {
      initApiContract();
      object = processEventCallbacks(object);
      let receipt;
      let fundingToken = await apiContract.methods.getAssetFundingToken(object.asset).call()
      if(fundingToken == NULL_ADDRESS){
        initCrowdsaleETHContract();
        object = await processGas(object, gas.payout);
        receipt = await crowdsaleETHContract.methods.payoutETH(object.asset)
                                              .send({from: object.from, gas:object.gas, gasPrice:object.gasPrice})
                                              .on('error', object.onError)
                                              .on('transactionHash', object.onTransactionHash)
                                              .on('receipt', object.onReceipt);
      } else {
        initCrowdsaleERC20Contract();
        object = await processGas(object, gas.payout);
        receipt = await crowdsaleERC20Contract.methods.payoutERC20(object.asset)
                                              .send({from: object.from, gas:object.gas, gasPrice:object.gasPrice})
                                              .on('error', object.onError)
                                              .on('transactionHash', object.onTransactionHash)
                                              .on('receipt', object.onReceipt);

      }
      return receipt;
    },

    //Pay Eth or ERC20 tokens into a asset's dividend token. The money will be distributed amongst all token holders. Returns web3 PromiEvent
    issueDividends: async (object) => {
      if(!object.approve) object.approve = {}
      if(!object.issueDividends) object.issueDividends = {}
      object.approve = processEventCallbacks(object.approve);
      object.issueDividends = processEventCallbacks(object.issueDividends);
      let receipt;
      const assetContract = contract(Artifacts.MiniMeToken, object.asset);
      const erc20Address = await assetContract.methods.getERC20().call()
      if(erc20Address == NULL_ADDRESS){
        object.issueDividends = await processGas(object.issueDividends, gas.issueDividendsETH);
        receipt = await assetContract.methods.issueDividends(object.amount)
                                     .send({from:object.account, value:object.amount, gas:object.issueDividends.gas, gasPrice:object.issueDividends.gasPrice})
                                     .on('error', object.issueDividends.onError)
                                     .on('transactionHash', object.issueDividends.onTransactionHash)
                                     .on('receipt', object.issueDividends.onReceipt)
      } else {
        object.issueDividends = await processGas(object.issueDividends, gas.issueDividendsERC20);
        object.approve = await processGas(object.approve, gas.approve);
        const fundingToken = contract(Artifacts.ERC20, erc20Address);
        await fundingToken.methods.approve(object.asset, object.amount)
                          .send({from: object.account, gas: object.approve.gas, gasPrice: object.approve.gasPrice})
                          .on('error', object.approve.onError)
                          .on('transactionHash', object.approve.onTransactionHash)
                          .on('receipt', object.approve.onReceipt);
        receipt = await assetContract.methods.issueDividends(object.amount)
                                     .send({from:object.account, gas:object.issueDividends.gas, gasPrice:object.issueDividends.gasPrice})
                                     .on('error', object.issueDividends.onError)
                                     .on('transactionHash', object.issueDividends.onTransactionHash)
                                     .on('receipt', object.issueDividends.onReceipt)
      }
      return receipt;
    },

    //View the assets an investor has invested in. (This may not represent their current stake, just crowdsales they have contributed to)
    getAssetsByInvestor: async (address) => {
      let assets = [];
      const logs = await getTransactionEvent('Asset purchased', undefined, address, blockNumber);
      logs.forEach(function (log, index) {
        const asset = log.returnValues.token;
        assets.push(asset);
      });

      return assets;
    },

    //View assets created by an asset manager
    getAssetsByManager: async (address) => {
      initApiContract();
      let assets = [];
      const logs = await getAssetEvent('Asset funding started', undefined, blockNumber);
      for(let i=0; i<logs.length; i++){
        const asset = logs[i].returnValues.asset;
        const manager = await apiContract.methods.getAssetManager(asset).call();
        if(address.toLowerCase() == manager.toLowerCase()){
          assets.push(asset);
        }
      }

      return assets;
    },

    //View assets by operator
    getAssetsByOperator: async (address) => {
      initApiContract();
      let assets = [];
      const logs = await getAssetEvent('Asset funding started', undefined, blockNumber);
      for(let i=0; i<logs.length; i++){
        const asset = logs[i].returnValues.asset;
        const operator = await apiContract.methods.getAssetOperator(asset).call();
        if(address.toLowerCase() == operator.toLowerCase()){
          assets.push(asset);
        }
      }

      return assets;
    },

    //View assets by modelID
    getAssetsByModelID: async (bytes32) => {
      initApiContract();
      let assets = [];
      const logs = await getAssetEvent('Asset funding started', undefined, blockNumber);
      for(let i=0; i<logs.length; i++){
        const asset = logs[i].returnValues.asset;
        const modelID = await apiContract.methods.getAssetModelID(asset).call();
        if(bytes32.toLowerCase() == modelID.toLowerCase()){
          assets.push(asset);
        }
      }

      return assets;
    },

    //View all assets with blockNumber, manager address and ipfs hash
    getTotalAssetsWithBlockNumberAndManager: async () => {
      let assets = [];
      const [
        assetLogs,
        ipfsAssetLogs,
      ] = await Promise.all([
        getAssetEvent('Asset funding started', undefined, blockNumber),
        getAssetEvent('New asset ipfs', undefined, blockNumber),
      ]);
      for(let i=0;i<assetLogs.length;i++){
        const { uri } = ipfsAssetLogs[i].returnValues;
        const { blockNumber } = assetLogs[i];
        const {
          asset,
          manager,
        } = assetLogs[i].returnValues;
        assets.push({
          blockNumber,
          manager,
          ipfs: uri,
          address: asset,
        });
      }
      return assets;
    },

    //View all assets
    getTotalAssets: async () => {
      let assets = [];
      const logs = await getAssetEvent('Asset funding started', undefined, blockNumber);
      logs.forEach(function (log, index) {
        const asset = log.returnValues.asset;
        assets.push(asset);
      });

      return assets;
    },

    //View assets by the open crowdsales
    getOpenCrowdsales: async () => {
      initApiContract();
      let assets = [];
      const logs = await getAssetEvent('Asset funding started', undefined, blockNumber);
      for(let i=0; i<logs.length; i++){
        const asset = logs[i].returnValues.asset;
        const finalized = await apiContract.methods.crowdsaleFinalized(asset).call();
        if(!finalized){
          const deadline = bn(await apiContract.methods.getCrowdsaleDeadline(asset).call());
          const now = Math.round(new Date().getTime()/1000); //Current time in seconds;
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
      const finalized = await apiContract.methods.crowdsaleFinalized(asset).call();
      const deadline = bn(await apiContract.methods.getCrowdsaleDeadline(asset).call());
      const now = Math.round(new Date().getTime()/1000); //Current time in seconds;
      let timeleft;
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
      const goal = bn(await apiContract.methods.getCrowdsaleGoal(asset).call()).toString();
      return goal;
    },

    //Get funding progress
    getFundingProgress: async (asset) => {
      const assetInterface = contract(Artifacts.DivToken, asset);
      const progress = bn(await assetInterface.methods.totalSupply().call()).toString();
      return progress;
    },

    //Get the operator of an asset
    getAssetOperator: async (asset) => {
      initApiContract();
      const operator = await apiContract.methods.getAssetOperator(asset).call();
      return operator;
    },

    //Get the manager of an asset
    getAssetManager: async (asset) => {
      initApiContract();
      const manager = await apiContract.methods.getAssetManager(asset).call();
      return manager;
    },

    //Get an asset's investors
    getAssetInvestors: async (asset) => {
      let investors = [];
      const logs = await getTransactionEvent('Asset purchased', undefined, undefined, blockNumber);
      logs.forEach(function (log, index) {
        if(log.returnValues.token == asset){
          const investor = log.returnValues.to;
          investors.push(investor);
        }
      });

      return [...new Set(investors)];
    },

    //View all the operators
    getOperators: async () => {
      initEventsContract();
      const operators = {};
      const logs = await eventsContract.getPastEvents('LogOperator', {
                           filter: {},
                           fromBlock: blockNumber,
                           toBlock: 'latest'});
      for(let i=0; i<logs.length; i++){
        const eventType = logs[i].returnValues[0];
        const {
         account,
         ipfs,
         name,
         id: operatorID
        } = logs[i].returnValues;
        if(eventType === 'Operator registered'){
          operators[account] = {
            ipfs,
            account,
            operatorID
          }
        } else if(eventType === 'Operator removed'){
          delete operators[account];
        } else if(eventType === 'Operator address changed'){
          const toDelete = operators.find(operator => operator.ipfs === ipfs);
          if(Array.isArray(toDelete) && toDelete.length > 0){
            delete operators[to]
          }
          operators[account] = {
            ipfs,
            name,
            operatorID,
          }
        }
      }
      return operators;
    },

    getAssetIPFS: async () => {
      const assetIPFS = {}
      const logs = await getAssetEvent('New asset ipfs', undefined, blockNumber);
      for(let i=0; i<logs.length; i++){
        const {
          uri,
          asset,
          manager,
        } = logs[i].returnValues
        assetIPFS[asset] = {
          ipfs: uri,
          asset,
          manager
        }
      }
      return assetIPFS;
    },

    getTimestampOfFundedAsset: async (asset) => {
      const logs = await getTransactionEvent('Asset payout', asset, undefined, blockNumber);
      if(logs.length > 0) {
        const blockInfo = await web3.eth.getBlock(logs[0].blockNumber);
        return blockInfo.timestamp;
      };
      return null;
    },

    getTimestampOfAssetCreation: async asset => {
      const logs = await getTransactionEvent('Asset funding started', asset, undefined, blockNumber);
      if(logs.length > 0) {
        const blockInfo = await web3.eth.getBlock(logs[0].blockNumber);
        return blockInfo.timestamp;
      };
      return null;
    },

    getAssetIncome: async (asset) => {
      const assetInterface = contract(Artifacts.DivToken, asset);
      logs = await assetInterface.getPastEvents('LogIncomeReceived', {
                              filter: {},
                              fromBlock: blockNumber,
                              toBlock: 'latest'});

      return await Promise.all(logs.map(async log => {
        const { blockNumber, returnValues, } = log;
        const { _paymentAmount, } = returnValues;
        const block = await web3.eth.getBlock(blockNumber);
        const timestamp = block.timestamp;
        return{
          payment: _paymentAmount,
          timestamp,
        }
      }));
    },

    //Subscribe to the network's events
    subscribe: (onError, onResponse, fromBlock) => {
      initEventsContract();
      const allEvents = eventsContract.events.allEvents({
        fromBlock: fromBlock,
        toBlock: 'latest'
      }, (err, res) => {
        if(err && onError && typeof onError === 'function') onError(err);
        if(res && onResponse && typeof onResponse === 'function') onResponse(res);
      });
    }
  }
};
