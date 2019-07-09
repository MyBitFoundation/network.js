const Web3 = require('web3');
const Network = require('./index.js');
const Contracts = require('@mybit/contracts');
const bn = require('bignumber.js');
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

(async function() {
//Get a web3 instance which we will make calls to
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const addresses = Contracts.addresses.mybit;
const block = Contracts.block.mybit;
const network = new Network(web3, addresses, block);

//Ethereum can't handle decimals. So we have to multiply all of our
//token values by the number of decimal places they support. In this case, 18
const decimals = 10**18;

//Our web3 instance provides accounts with Ether and MyB already loaded in wallets
const accounts  = await web3.eth.getAccounts();
//Define the platform owner (accounts[0]) and our first operator (accounts[1])
const [ platformOwner, operatorAddress ] = accounts;
//Get an instance of the API.sol contract. This contract queries the database for
//commonly used values
var api = await network.api();
var events = await network.events();

//The setOperator function, onboards a new operator from the platform owner account
//The returned operator ID is needed to create a crowdsale
async function setOperator(_uri, _ipfs, _address){
  //Check if operator is already set
  var id = await api.methods.generateOperatorID(_uri).call();
  var currentAddress = await api.methods.getOperatorAddress(id).call();
  if(currentAddress == '0x0000000000000000000000000000000000000000'){
    //If not set
    id = await network.addOperator({
      operator: _address,
      name: _uri,
      ipfs: _ipfs,
      owner: platformOwner
    });
  } else {
    console.log('Operator already set')
  }
  console.log('Operator ID: ', id);

  return id;
}

async function setModel(_operatorID, _uri, _ipfs, _address, _token){
  var id = await api.methods.generateModelID(_uri, _operatorID).call()
  var operatorAddress = await api.methods.getModelOperator(id).call()
  if(operatorAddress == '0x0000000000000000000000000000000000000000'){
    id = await network.addModel({
      operator: _address,
      operatorID: _operatorID,
      name: _uri,
      ipfs: _ipfs,
      accept: true,
      payout: true,
      token: _token
    });
  } else {
    console.log('Model already set')
  }
  console.log('Model ID: ', id);
  return id
}

//This function creates a crowdsale. If fundingToken is empty, the crowdsale will be
//paid using Ether, otherwise an ERC20 compatible address must be passed.
//In order to avoid revert errors, this function first checks whether a crowdsale
//has be created using the same parameters. If there is already a crowdsale created,
//the function returns the asset ID and token address.
async function startCrowdsale(_uri, _goal, _timeInSeconds, _modelID, _managerAddress, _percent, _escrow, _fundingToken, _paymentToken){
  logs = await events.getPastEvents('LogAsset', {
                            filter: { messageID: web3.utils.sha3('Asset funding started'), assetID: web3.utils.sha3(_uri)},
                            fromBlock: 0,
                            toBlock: 'latest'});

  if(logs.length === 0){
    var parameters = {
      assetURI: _uri,
      ipfs: 'QmHash',
      modelID: _modelID,
      fundingLength: _timeInSeconds,
      amountToRaise: _goal,
      assetManagerPercent: _percent,
      assetManager: _managerAddress,
      escrow: _escrow
    }
    if(_fundingToken != '' && _fundingToken != '0x0000000000000000000000000000000000000000'){
      parameters.fundingToken = _fundingToken;
    }
    if(_paymentToken != '' && _paymentToken != '0x0000000000000000000000000000000000000000'){
      parameters.paymentToken = _paymentToken;
    } else {
      parameters.paymentToken = addresses.MyBitToken;
    }
    return await network.createAsset(parameters);
  } else {
    for(var i=0;i<logs.length;i++){
      if(logs[i].returnValues.uri == _uri){
        var response = logs[i].returnValues;
        console.log('Crowdsale already started');
        break;
      }
    }
  }

  return response;
}

//The contribute function allows users to invest in a crowdsale. You must pass
//the asset ID, amount to invest, and the account from which you'll be investing.
//Before any payment is made, this function checks whether the crowdsale is still open.
async function contribute(_asset, _amount, _account, _paymentToken){
  crowdsaleFinalized = await api.methods.crowdsaleFinalized(_asset).call();
  if(!crowdsaleFinalized){
    var parameters = {
        asset: _asset,
        amount: _amount,
        investor: _account
    }
    var fundingToken = await api.methods.getAssetFundingToken(_asset).call();
    if(fundingToken != '0x0000000000000000000000000000000000000000'){
      if(_paymentToken && _paymentToken != '' && _paymentToken != '0x0000000000000000000000000000000000000000'){
        parameters.paymentToken = _paymentToken;
      } else {
        parameters.paymentToken = fundingToken;
      }
      //var token = await network.erc20(parameters.paymentToken);
      //token.methods.approve(addresses.CrowdsaleERC20, _amount).send({from: _account});
    }

    receipt = await network.fundAsset(parameters);
    console.log(receipt.transactionHash)
    console.log('Contributed ', _amount/decimals);
  } else {
    console.log('Crowdsale already finished!');
  }
}

async function withdrawFromCrowdsale(_asset, _user) {
  crowdsaleFinalized = await api.methods.crowdsaleFinalized(_asset).call();
  if(!crowdsaleFinalized){
    let parameters = {
      asset: _asset,
      from: _user
    }
    await network.payout(parameters);
    console.log('Crowdsale funds withdrawn')
  } else {
    console.log('Crowdsale already finished!');
  }
}

//The generateAsset function allows an owner to generate an asset token that pays
//out dividends to the accounts that passed in the parameters. This is a way to
//create an asset without going through the crowdsale process.
//The generated asset tokens can be made transferable by passing 'true' to the
//_tradeable boolean
//The _addresses and _amounts values take arrays. The arrays must be equal length
async function generateAsset(_uri, _addresses, _amounts, _tradeable) {
  var instance = await network.assetGenerator();
  var tx;
  if(tradeable){
    tx = await instance.createTradeableAsset(_uri, _addresses, _amounts);
  } else {
    tx = await instance.createAsset(_uri, _addresses, _amounts);
  }
  return tx.logs[0].returnValues
}

//Allows an account to create a ERC20 token that pays dividends to the token holders
//The owner of the token has the ability to mint as many tokens as they like to
//any account. By passing an integer value to _initialMinting, they set how many
//tokens they'd like to mint for themselves. The _fundingToken takes the address
//of an ERC20 token they would like to use to pay dividends with.
async function createDividendToken(_uri, _account, _initialMinting, _fundingToken){
  var parameters = {
    uri: _uri,
    owner: _account
  }
  if(_fundingToken != '' && _fundingToken != '0x0000000000000000000000000000000000000000'){
    parameters.fundingToken = _fundingToken;
  }
  var tokenInstance = await network.createDividendToken({parameters});
  if(_initialMinting > 0){
    await tokenInstance.mint(_owner, _initialMinting, {from: _owner});
  }
  return tokenInstance;
}

//The createERC20 function creates a standard ERC20 token. This token has no minting
//capabilities, so the value set in the _amount parameter will be the total supply
//of this token. All token are given to the owner to distribute as they see fit.
async function createERC20(_uri, _sym, _amount, _account){
  tokenInstance = await network.createERC20Token({uri: _uri, symbol: _sym, total: _amount, owner: _account})
  return tokenInstance
}

//Get an object listing all participants in the asset passed to the function.
async function getAssetParticipants(_asset){
  var results = {};
  results.operator = await network.getAssetOperator(_asset);
  results.manager = await network.getAssetManager(_asset);
  results.investors = await network.getAssetInvestors(_asset);
  return results;
}

//Get a message on the current progess of a particular crowdsale
async function displayCrowdsaleProgress(_asset){
  var fundingGoal = await network.getFundingGoal(_asset);
  var fundingProgress = await network.getFundingProgress(_asset);
  var timeleft = await network.getFundingTimeLeft(_asset);
  var message = fundingProgress/decimals + " / " + fundingGoal/decimals + " funded, with " + timeleft + " seconds left to go.";
  console.log(message);
}

//The fundCoffee function shows the flow of how a operator is set, a crowdsale is
//started and funded, and payment is made to the operater. Furthermore, it shows
//how the operater pays back the investment by directly paying the asset token.
//Token holders can then withdraw their dividends using the token's withdraw function.
async function fundCoffee(){
  console.log('');
  console.log('Funding a coffee run with Ether...');
  //Setup operator (who will also be the assetManager)
  var operatorID = await setOperator("Mac the operator", "QmHash", operatorAddress);
  var modelID = await setModel(operatorID, "Coffee", "QmHash", operatorAddress, "0x0000000000000000000000000000000000000000")
  //Start the crowdsale for 20 cad (0.07 eth), funding length 1 day (86400 seconds)
  response = await startCrowdsale("CoffeeRun", '70000000000000000', '86400', modelID, operatorAddress, 0, '10000', '', '');

  //Get the asset ID returned by the startCrowdsale function
  var asset = response.asset;
  console.log('Asset: ', asset);

  //Instantiate the token using the token address set previously
  var token = await network.dividendTokenETH(asset);

  //Display the current crowdsale progress (should show no contributions)
  await displayCrowdsaleProgress(asset);

  //Get all participants
  //(should only show operater and manager, who are the same person in this case)
  var participants = await getAssetParticipants(asset);
  console.log('Asset Participants: ', participants);

  //Show current open crowdsales as a list of asset IDs.
  //This crowdsale should be in the list
  var crowdsales = await network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds before
  var operatorEtherBefore = await web3.eth.getBalance(operatorAddress);

  //accounts[2] contributes 0.03 eth.
  await contribute(asset, '30000000000000000', accounts[2]);

  //Check funding progess
  var fundingProgress = await network.getFundingProgress(asset);
  console.log('Funding progress: ', fundingProgress/decimals);

  //accounts[3] contributes 0.045 eth. (this should complete the crowdsale)
  await contribute(asset, '45000000000000000', accounts[3]);

  //Check funding progress
  var fundingProgress = await network.getFundingProgress(asset);
  console.log('Funding progress: ', fundingProgress/decimals);

  await withdrawFromCrowdsale(asset, accounts[0]);

  //Check open crowdsales (this crowdsale should no longer be listed)
  var crowdsales = await network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);

  //Check operator's funds after
  var operatorEtherAfter = await web3.eth.getBalance(operatorAddress);
  var operatorDiff = Number(operatorEtherAfter - operatorEtherBefore);
  console.log('Operator Ether received: ', operatorDiff/decimals);

  //Display asset tokens owned by each participant
  console.log('Operator assets: ', Number(await token.methods.balanceOf(operatorAddress).call()));
  console.log('Investor 1 assets: ', Number(await token.methods.balanceOf(accounts[2]).call())/decimals);
  console.log('Investor 2 assets: ', Number(await token.methods.balanceOf(accounts[3]).call())/decimals);

  //Get the ether balances of the investors before any dividends are issued
  var investor1EtherBefore = await web3.eth.getBalance(accounts[2]);
  var investor2EtherBefore = await web3.eth.getBalance(accounts[3]);

  //Issue dividends to the asset token contract
  console.log('Issuing dividends: 0.01 ETH...');
  await network.issueDividends({
    asset: asset,
    account: operatorAddress,
    amount: '10000000000000000'
  });

  //Investors withdraw there dividends
  await token.methods.withdraw().send({from: accounts[2], gas: 130000});
  await token.methods.withdraw().send({from: accounts[3], gas: 130000});

  //Check ether after dividends are issued and calculate the difference from before
  var investor1EtherAfter = await web3.eth.getBalance(accounts[2]);
  var investor2EtherAfter = await web3.eth.getBalance(accounts[3]);
  var investor1Diff = Number(investor1EtherAfter - investor1EtherBefore);
  var investor2Diff = Number(investor2EtherAfter - investor2EtherBefore);
  console.log('Investor 1 Ether received: ', investor1Diff/decimals);
  console.log('Investor 2 Ether received: ', investor2Diff/decimals);

}

//This function shows the process by which an asset manager creates a crowdsale
//for an ethereum mining operation. The crowdsale is funded using an ERC20 token
//that represent Dai (the ethereum based stable coin). The asset manager takes a
//small percentage which is paid out using the asset token created during the
//crowdsale.
async function fundMiningRig(){
  console.log('');
  console.log('Fund miner using Dai...');
  //Setup operator
  var operatorID = await setOperator("Bespin Cloud Mining", "QmHash", accounts[2]);
  //Asset crowdsale values
  var manager = accounts[3];
  var managerPercent = 2;
  var fundingGoal = bn(3000).times(decimals).toString();
  var fundingLength = 2592000;
  var assetURI = "Worker1";

  //First, check if this crowdsale has been run before, if it has,
  //get the erc20 token address that the crowdsale uses. Otherwise,
  //deploy and distribute a new erc20 token.
  var dai;
  //Find events created by this manager
  logs = await events.getPastEvents('LogAsset',{
                            filter:{ messageID: web3.utils.sha3('Asset funding started'), assetID: web3.utils.sha3('Worker1') },
                            fromBlock: 0,
                            toBlock: 'latest'});

  if(logs.length === 0){
    //No crowdsale has been started
    //Deploy a token that will represent Dai
    dai = await createERC20('Dai', 'DAI', bn(1000000).times(decimals), platformOwner);
    //Distribute Dai to all accounts
    for(var i=1; i<accounts.length; i++){
      await dai.methods.transfer(accounts[i], bn(10000).times(decimals).toString()).send({from: platformOwner, gas: '1000000'});
    }
  } else {
    for(var i=0;i<logs.length;i++){
      if(logs[i].returnValues.uri == assetURI){
        var fundingToken = await api.methods.getAssetFundingToken(logs[i].returnValues.asset).call();
        dai = await network.erc20(fundingToken);
        break;
      }
    }
  }
  //Fund a mining rig
  //Set model to accept Dai
  var modelID = await setModel(operatorID, "Ethereum Miner", "QmHash", accounts[2], dai.options.address)
  //Start the crowdsale, for 3000 usd (3000 dai), funding length 1 month (2592000 seconds), assetManager is accounts[3] with a 2% fee
  response = await startCrowdsale(assetURI, fundingGoal, fundingLength, modelID, manager, managerPercent, 0, dai.options.address, '');
  //Get the asset ID returned by the startCrowdsale function
  var asset = response.asset;
  console.log('Asset: ', asset);


  //Instantiate the token using the token address set previously
  var token = await network.dividendTokenERC20(asset);

  //Three users contribute
  await contribute(asset, bn(1000).times(decimals).toString(), accounts[4]);
  console.log('Funding progress: ', Number(await network.getFundingProgress(asset))/decimals);
  await contribute(asset, bn(1000).times(decimals).toString(), accounts[5]);
  console.log('Funding progress: ', Number(await network.getFundingProgress(asset))/decimals);
  await contribute(asset, bn(1500).times(decimals).toString(), accounts[6]);
  console.log('Funding progress: ', Number(await network.getFundingProgress(asset))/decimals);
  await withdrawFromCrowdsale(asset, accounts[0]);
  console.log('Manager given dividends to cover their percentage');
  let timestamp = await network.getTimestampOfFundedAsset(asset);
  console.log('Timestamp of funded asset: ', timestamp);

  //Display asset tokens owned by participants
  console.log('Manager assets: ', Number(await token.methods.balanceOf(accounts[3]).call())/decimals);
  console.log('Investor 1: ', Number(await token.methods.balanceOf(accounts[4]).call())/decimals);
  console.log('Investor 2: ', Number(await token.methods.balanceOf(accounts[5]).call())/decimals);
  console.log('Investor 3: ', Number(await token.methods.balanceOf(accounts[6]).call())/decimals);

  //Get dai held by each participant before dividends are issued
  var managerDaiBefore = await dai.methods.balanceOf(accounts[3]).call();
  var investor1DaiBefore = await dai.methods.balanceOf(accounts[4]).call();
  var investor2DaiBefore = await dai.methods.balanceOf(accounts[5]).call();
  var investor3DaiBefore = await dai.methods.balanceOf(accounts[6]).call();

  //Issue dividends in Dai
  console.log('Issuing dividends: 1000 DAI...');
  //await dai.methods.approve(token.options.address, bn(1000).times(decimals).toString()).send({from: accounts[2]});
  await network.issueDividends({
    asset: asset,
    account: accounts[2],
    amount: bn(1000).times(decimals).toString()
  });

  console.log('Checking asset has received income...');
  let payments = await network.getAssetIncome(asset);
  console.log(payments);

  //Withdraw dividends for each participant
  //await token.methods.withdraw().send({from: accounts[3], gas:130000});
  await token.methods.withdraw().send({from: accounts[4], gas:130000});
  await token.methods.withdraw().send({from: accounts[5], gas:130000});
  await token.methods.withdraw().send({from: accounts[6], gas:130000});

  //Calculate and display the differene in Dai before and after dividends are issued
  //var managerDaiAfter = await dai.methods.balanceOf(accounts[3]).call();
  var investor1DaiAfter = await dai.methods.balanceOf(accounts[4]).call();
  var investor2DaiAfter = await dai.methods.balanceOf(accounts[5]).call();
  var investor3DaiAfter = await dai.methods.balanceOf(accounts[6]).call();

  //var managerDiff = Number(managerDaiAfter - managerDaiBefore);
  var investor1Diff = Number(investor1DaiAfter - investor1DaiBefore);
  var investor2Diff = Number(investor2DaiAfter - investor2DaiBefore);
  var investor3Diff = Number(investor3DaiAfter - investor3DaiBefore);

  //console.log('Manager Dai received: ', managerDiff/decimals);
  console.log('Investor 1 Dai received: ', investor1Diff/decimals);
  console.log('Investor 2 Dai received: ', investor2Diff/decimals);
  console.log('Investor 3 Dai received: ', investor3Diff/decimals);

}

network.subscribe(function(response){
  console.log('Network Subscribe Event:');
  console.log(response);
});

await fundMiningRig();

await fundCoffee();

console.log(await network.getAssetsByOperator(operatorAddress));
console.log(await network.getAssetsByManager(accounts[3]));
console.log(await network.getAssetsByInvestor(accounts[2]));
console.log(await network.getTotalAssets());

})();
