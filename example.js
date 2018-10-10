var Network = require('.');
var accounts = require("@mybit/chain/accounts.json");

const platformOwner = accounts[0];
const operatorAddress = accounts[1];

var operatorID;
var assetID;

async function setOperator(){
  var id = await Network.addOperator(
    operatorAddress,
    'Mac the Operator',
    platformOwner
  );

  await Network.acceptEther(id, operatorAddress);

  return id;
}

async function startCrowdsale(){
  await Network.approveBurn(operatorAddress);

  var id = await Network.createAsset({
      assetURI: "CoffeeRun",
      operatorID: operatorID,
      fundingLength: 1000,
      amountToRaise: 70000000000000000, //about $20 CAD
      brokerPercent: 0,
      broker: operatorAddress //operator is also broker
  });

  return id;
}

async function contribute(account, amount){
  await Network.approveBurn(account);
  await Network.fundAsset({
      assetID: assetID,
      amount: amount,
      address: account
  });
}

async function fundCoffee(){
  //Setup operator (who will also be the broker)
  operatorID = await setOperator();
  console.log('Operator ID: ', operatorID);
  //Start the crowdsale
  var response = await startCrowdsale();
  assetID = response._assetID;
  console.log('Asset ID: ', assetID);
  var tokenAddress = response._tokenAddress;
  console.log('Token Address: ', tokenAddress);
  //Check operator's funds before
  console.log('Operator ether before: ', await web3.eth.getBalance(operatorAddress));
  //Two users contribute
  await contribute(accounts[3], 30000000000000000);
  await contribute(accounts[4], 40000000000000000);
  //Check operator's funds after
  console.log('Operator ether after: ', await web3.eth.getBalance(operatorAddress));
  token = await Network.dividendTokenETH(tokenAddress);
  console.log('Operator assets: ', Number(await token.balanceOf(operatorAddress)));
  console.log('Investor 1 assets: ', Number(await token.balanceOf(accounts[3])));
  console.log('Investor 2 assets: ', Number(await token.balanceOf(accounts[4])));
}

fundCoffee();
