# Welcome to Network.js

 [![MyBit Logo](https://files.mybit.io/mybit-icon-28x28.png)](https://mybit.io/) [MyBit Developer Portal](https://developer.mybit.io/portal/) &gt; [Network.js](https://developer.mybit.io/web)

## network.js

A node.js library for interacting with the MyBit Network SDK.

### Setup

Install dependencies.

`npm install`

### Start blockchain

We have included a local blockchain with our contracts already deployed. The API creates instances of our contracts deployed on the local chain and exposes them for easy interaction. To start the chain simply open up a terminal in the base directory and enter the following command:

`./start_chain`

### Import package

In your node.js file import this package \([@mybit/network.js](https://www.npmjs.com/package/@mybit/network.js)\):

```javascript
const Network = require('@mybit/network.js');
```

`Network` takes several objects in its contructor. You need to pass it a `web3` object, the addresses of the platform contracts, and the block number that the platform was first deployed on. For the address and block number you can get those by importing the `contracts` package:

```javascript
const Contracts = require('@mybit/contracts');
```

To instantiate a `network` object you can do the following:

```javascript
const web3 = new Web3(new Web3.providers.HttpProvider(`wss://mainnet.infura.io/v3/${INFURA_API_KEY}`));
const addresses = Contracts.addresses.mainnet;
const block = Contracts.block.mainnet;
const network = new Network(web3, addresses, block);
```

### Async/await

Since these functions interact with the Ethereum blockchain, everything is done asynchronously. The easiest way to work with asynchronous functions is with the async/await syntax:

```javascript
const Network = require('@mybit/network.js');

(async function() {
  var crowdsales = await Network.getOpenCrowdsales();
  console.log('Open crowdsales: ', crowdsales);
});
```

Check out [Hello Network](https://www.npmjs.com/package/@mybit/hello-network) for more examples.

### Functions

As of version 0.0.5, these are the functions currently available from network.js:

#### Full Contracts

**api\(\) returns \( contract instance \)**

The api function returns the entire [API.sol](https://github.com/MyBitFoundation/MyBit-Network.tech/blob/master/contracts/database/API.sol) contract, which contains many getter functions for accessing variable on [Database.sol](https://github.com/MyBitFoundation/MyBit-Network.tech/blob/master/contracts/database/Database.sol)

**dividendToken\( tokenAddress \) returns \( contract instance \)**

This function takes a contract address for an already deployed [DividenToken.sol](https://github.com/MyBitFoundation/MyBit-Network.tech/blob/master/contracts/tokens/erc20/DividendToken.sol) contract, instantiates the contract, and exposes all of its public functions.

#### Owner Functions

**addOperator\( object \) returns \( bytes32 \)**

This function takes an object with the following values:  operatorID (address), name (string), ipfs (string), referrer (address), and owner (address) and registers the operator in the [Operators.sol](https://github.com/MyBitFoundation/MyBit-Network.tech/blob/master/contracts/roles/Operators.sol) contract from the owner address. It returns the operatorID that will be needed for any crowdsale creation. Note, this function will not work if the owner address is a contract.

#### User Functions



#### Operator Functions
**addModel\( object \) returns \( bool \)**

This function takes an object that contains a bytes32 operatorID, a string of the asset name, a string of the ipfs hash, a bool on whether they accept the cryptocurrency indicated, a bool whether they payout in the cryptocurrency, and a address of the token those bools reference.

**acceptToken\( object \) returns \( bool \)**

An operator must specify the currencies that they accept. The object must contain an `id (bytes32)` of the asset model and a `token (address)`. This function sets the asset model as accepting the indicated token. For accepting Ether, do not pass the token variable.

_Note, an asset can accept as many currencies as they want._

**payoutToken\( object \) returns \( bool \)**

An operator must specify the currencies that they payout with. The object must contain an `id (bytes32)` of the asset model and a `token (address)`. This function sets the asset model as paying with the indicated token. For paying with Ether, do not pass the token variable.

_Note, an asset can payout as many currencies as they want._

**issueDividends\( object \) returns \( bool \)**

To pay out dividends to investors, an operator can call this function. Pass the following: `asset (address)`, `amount (uint256)`, and `account (address)`. The function determines if the asset takes Ether or an ERC-20 token. If the account does not have a sufficient balance in the required payment method, the function will fail.

#### Asset Manager Functions

**createAsset\( object \) returns \( object \)**

To start a crowdsale to fund a new asset you must pass this function and object that contains the following paremeters:

```javascript
{
  assetManager: address, //Address of the asset manager (this function will be called from their account)
  assetURI: string, //The URI where information about this asset can be found
  ipfs: string, //The hash of the IPFS file location
  modelID: bytes32, //Model ID
  fundingLength: uint256, //Funding time in seconds
  amountToRaise: uint256, //Funding goal
  assetManagerPercent: uint256, //A number less than 100: The percentage to be received by the AssetManager
  escrow: uint256, //The amount being kept in collateral priced in the paymentToken
  paymentToken: address, //The token being used to pay the collateral. It will be converted to MYB
  fundingToken: address//Optional: if this asset is being funded with an ERC-20 token, you must pass the address
}
```

The functions returns an object that contains \_assetID, \_assetManager, \_assetURI, and \_tokenAddress.


**payout\( object \) returns \( object \)**

After a successful funding, one must call this function to withdraw funds and asset tokens to the asset manager and the platform. You must pass the following `asset (address)` and `from (address)`.

#### Investor Functions

**fundAsset\( object \) returns \( address \)**

To contribute to a crowdsale call this function and pass the following object:

```javascript
{
  asset: address, //The address of the asset you want to fund
  amount: uint, //The amount you want to contribute
  paymentToken: address, //The token you'd like to pay with. Will be converted to the token used by the asset
  investor: address, //The address from which you will contribute
}
```

#### Getter Functions

**getAssetsByInvestor\( address \) returns \( array \)**

Pass an address and get back an array of assetIDs owned by that investor.

**getAssetsByManager\( address \) returns \( array \)**

Pass an address and get back an array of assetIDs managed by that asset manager.

**getAssetsByOperator\( address \) returns \( array \)**

Pass an address and get back an array of assetIDs operated by that operator.

**getTotalAssets\(\) returns \( array \)**

Get an array of all assetIDs on the network.

**getOpenCrowdsales\(\) returns \( array \)**

Get an array of all assetIDs that are currently seeking funding.

**getFundingTimeLeft\( assetID \) returns \( uint \)**

Pass an assetID and get back the time in seconds until the crowdsale finishes. If the crowdsale is already finished, you'll receive 0.

**getFundingGoal\( assetID \) returns \( uint \)**

Pass an assetID and get back the funding goal for the asset. If the asset is funded, you'll get back the total supply of tokens.

**getFundingProgress\( assetID \) returns \( uint \)**

Pass an assetID and get back the current amount that the asset has been funded.

**getAssetOperator\( assetID \) returns \( address \)**

Pass an assetID and get back the address of the operator.

**getAssetManager\( assetID \) returns \( address \)**

Pass an assetID and get back the address of the asset manager.

**getAssetInvestors\( assetID \) returns \( array \)**

Pass an assetID and get back an array of all the addresses that have funded it.

#### ⚠️ Warning

This application is unstable and has not undergone any rigorous security audits. Use at your own risk.

 MyBit Platform™ CHE-177.186.963  
