var MyBit = require("./index.js");
var Web3 = require("web3");

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

//console.log(web3.eth);

web3.eth.getAccounts().then(function(accounts){
  var operatorAddress = accounts[9];
  var operatorID = '0x4b7dd584c75ecee607c00a1cf1cfea444458b1d7433ec28d51d77c2ee40b8526';
  var assetID = '0x4ec08c8709da563d5d455c0bf7c7a7bdacf7b5e516e05acd4fd582ca8387f1af';

  //MyBit.approveBurn(accounts[3]);

/*
  MyBit.addOperator(accounts[9], "SomeOtherGuy9", accounts[0]).then(function(test){
    console.log(test);
  });
*/

/*
  MyBit.acceptEther(operatorID, accounts[9]).then(function(test){
    console.log(test);
  });
*/

/*
  MyBit.createAsset({
      assetURI: "Test4",
      operatorID: operatorID,
      fundingLength: 1000,
      amountToRaise: 10000000000000000,
      brokerFee: 1,
      broker: accounts[1]
      //optional fundingToken: tokenAddress
  }).then(function(assetID){
    console.log(assetID);
  });
*/

/*
  MyBit.fundAsset({
    assetID: assetID,
    amount: 1000000000000,
    address: accounts[3]
    //optional fundingToken: tokenAddress
  }).then(function(response){
    console.log(response);
  });
*/

});
