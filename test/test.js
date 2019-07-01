var assert = require('assert');
var Web3 = require('web3');
var Network = require('../index.js');
var Contracts = require('@mybit/contracts');
var ganache = require('ganache-core');
var bn = require('bignumber.js');
var fs = require("fs-extra");
var path = process.cwd();

let web3, network, addresses, accounts, api, myb, operatorID, modelID, ethAsset, erc20Asset;

describe('Network.js', function() {
  describe('Setup', function() {
    it('Should copy chain files for saved state to active state', async function(){
      await fs.copy(`${path}/node_modules/@mybit/network-chain/chain`, `${path}/node_modules/@mybit/network-chain/activechain`);
    });

    it('Should return an object', function() {
      addresses = Contracts.addresses.mybit;
      assert.equal(typeof addresses, 'object');
    });

    it('Should create a web3 object', function(){
      //web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
      //assert.equal(web3.currentProvider.host, "http://localhost:8545");
      let mnemonic = "myth like bonus scare over problem client lizard pioneer submit female collect";
      web3 = new Web3(ganache.provider({
                        mnemonic: mnemonic,
                        network_id: 70,
                        total_accounts: 20,
                        db_path: `${path}/node_modules/@mybit/network-chain/activechain`
                      }))
      assert.equal(web3.currentProvider.options.mnemonic, mnemonic);
    });

    it('Should create a network object', async function(){
      network = new Network(web3, addresses);
      assert.equal(typeof network, 'object');
      api = await network.api();
    });

    it('Should create a non-zero array', async function() {
      accounts = await web3.eth.getAccounts();
      assert.equal(accounts.length > 0, true);
    });

    it('Should send MYB token to all accounts', async function() {
      myb = await network.myBitToken();
      let balance = bn(await myb.methods.balanceOf(accounts[1]).call());
      if(balance.toNumber() == 0){
        let tokenPerAccount = await web3.utils.toWei('1000', 'ether');
        //Give 100 MyB tokens to all accounts
        for(var i=1; i<accounts.length; i++){
          myb.methods.transfer(accounts[i], tokenPerAccount).send({from: accounts[0], gas:700000});
        }
      }
    });
  });

  describe('Instaniate Contracts', function() {
    it('Should create an API contract object', async function(){
      let api = await network.api();
      assert.equal(api.options.address, addresses.API);
    });

    it('Should create an AssetGenerator contract object', async function(){
      let assetGenerator = await network.assetGenerator();
      assert.equal(assetGenerator.options.address, addresses.AssetGenerator);
    });

    it('Should create an AssetManagerEscrow contract object', async function(){
      let assetManagerEscrow = await network.assetManagerEscrow();
      assert.equal(assetManagerEscrow.options.address, addresses.AssetManagerEscrow);
    });

    it('Should create a ContractManager contract object', async function(){
      let contractManager = await network.contractManager();
      assert.equal(contractManager.options.address, addresses.ContractManager);
    });

    it('Should create a CrowdsaleETH contract object', async function(){
      let crowdsaleETH = await network.crowdsaleETH();
      assert.equal(crowdsaleETH.options.address, addresses.CrowdsaleETH);
    });

    it('Should create a CrowdsaleERC20 contract object', async function(){
      let crowdsaleERC20 = await network.crowdsaleERC20();
      assert.equal(crowdsaleERC20.options.address, addresses.CrowdsaleERC20);
    });

    it('Should create a CrowdsaleGeneratorETH contract object', async function(){
      let crowdsaleGeneratorETH = await network.crowdsaleGeneratorETH();
      assert.equal(crowdsaleGeneratorETH.options.address, addresses.CrowdsaleGeneratorETH);
    });

    it('Should create a CrowdsaleGeneratorERC20 contract object', async function(){
      let crowdsaleGeneratorERC20 = await network.crowdsaleGeneratorERC20();
      assert.equal(crowdsaleGeneratorERC20.options.address, addresses.CrowdsaleGeneratorERC20);
    });

    it('Should create a Database contract object', async function(){
      let database = await network.database();
      assert.equal(database.options.address, addresses.Database);
    });

    it('Should create a Events contract object', async function(){
      let events = await network.events();
      assert.equal(events.options.address, addresses.Events);
    });

    it('Should create a Operators contract object', async function(){
      let operators = await network.operators();
      assert.equal(operators.options.address, addresses.Operators);
    });

    it('Should create a Platform contract object', async function(){
      let platform = await network.platform();
      assert.equal(platform.options.address, addresses.Platform);
    });
  });

  describe('Onboard Operator', function() {
    it('Should receive an operator ID', async function(){
      operatorID = await network.addOperator({
        operator: accounts[3],
        name: 'Name operator',
        ipfs: 'QmHash',
        owner: accounts[0]
      });
      assert.equal(operatorID.startsWith('0x'), true);
    });

    it('Should create an asset model', async function(){
      modelID = await network.addModel({
        operator: accounts[3],
        operatorID: operatorID,
        name: 'Asset Name',
        ipfs: 'QmHash',
        accept: false,
        payout: false,
      });
      assert.equal(modelID.startsWith('0x'), true);
    });

    it('Should accept ether and return true', async function(){
      let result = await network.acceptEther({
        id: modelID,
        operator: accounts[3]
      });
      console.log(result)
      assert.equal(result.status, true);
    });

    it('Should accept erc20 and return true', async function(){
      let result = await network.acceptERC20Token({
        id: modelID,
        token: addresses.MyBitToken,
        operator: accounts[3]
      });
      assert.equal(result.status, true);
    });

    it('Should payout ether and return true', async function(){
      let result = await network.payoutEther({
        id: modelID,
        operator: accounts[3]
      });
      assert.equal(result.status, true);
    });

    it('Should payout erc20 and return true', async function(){
      let result = await network.payoutERC20Token({
        id: modelID,
        token: addresses.MyBitToken,
        operator: accounts[3]
      });
      assert.equal(result.status, true);
    });
  });

  describe('Start ETH & ERC20 Crowdsales', function() {
    it('Should receive ETH asset object with asset address', async function(){
      let amount = await web3.utils.toWei('2', 'ether');
      let result = await network.createAsset({
        assetURI: 'ETH Asset',
        assetManager: accounts[2],
        modelID: modelID,
        fundingLength: '2592000',
        startTime: 0,
        amountToRaise: amount,
        assetManagerPercent: 0,
        escrow: 0,
        paymentToken: addresses.MyBitToken
      });

      ethAsset = result.asset;
      assert.equal(ethAsset.startsWith('0x'), true);
    });

    it('Should receive ERC20 asset object with asset address', async function(){
      let amount = await web3.utils.toWei('100', 'ether');
      let result = await network.createAsset({
        assetURI: 'ERC20 Asset',
        assetManager: accounts[2],
        modelID: modelID,
        fundingLength: '2592000',
        startTime: 0,
        amountToRaise: amount,
        assetManagerPercent: 0,
        escrow: 0,
        fundingToken: addresses.MyBitToken,
        paymentToken: addresses.MyBitToken
      });

      erc20Asset = result.asset;
      assert.equal(erc20Asset.startsWith('0x'), true);
    });
  });

  describe('Fund assets', function() {
    it('Should fund ethAsset and get a transaction address', async function(){
      let amount = await web3.utils.toWei('1.03', 'ether');
      let result = await network.fundAsset({
        asset: ethAsset,
        investor: accounts[4],
        amount: amount
      });
      console.log('fundAsset gasUsed: ', result.gasUsed);
      assert.equal(result.status, true);
      let divToken = await network.dividendTokenETH(ethAsset);
      let balance = bn(await divToken.methods.balanceOf(accounts[4]).call())
      assert.equal(balance.eq(bn(amount).dividedBy(1.03)), true);
    });

    it('Should fund ethAsset and get a transaction address', async function(){
      let amount = await web3.utils.toWei('1.03', 'ether');
      let result = await network.fundAsset({
        asset: ethAsset,
        investor: accounts[5],
        amount: amount
      });
      console.log('fundAsset gasUsed: ', result.gasUsed);
      assert.equal(result.status, true);
    });

    it('Should have a finalized crowdsale', async function(){
      let finalized = await api.methods.crowdsaleFinalized(ethAsset).call();
      assert.equal(finalized, true);
    });

    it('Should fund erc20Asset and return receipt', async function(){
      let amount = await web3.utils.toWei('10.3', 'ether');
      await myb.methods.approve(addresses.CrowdsaleERC20, amount).send({from: accounts[4]});
      let result = await network.fundAsset({
        asset: erc20Asset,
        investor: accounts[4],
        amount: amount,
        fundingToken: addresses.MyBitToken,
        paymentToken: addresses.MyBitToken
      });
      console.log('fundAsset gasUsed: ', result.gasUsed);
      assert.equal(result.status, true);
    });
  });

  describe('Issue dividends', function() {
    it('Should send ether to ethAsset', async function() {
      let amount = bn(await web3.utils.toWei('10', 'ether'));
      let result = await network.issueDividends({
        asset: ethAsset,
        account: accounts[3],
        amount: amount.toString()
      });
      console.log('issueDividends gasUsed: ', result.gasUsed);
      assert.equal(result.status, true);
    });

    it('Should be able to receive income', async function() {
      let divToken = await network.dividendTokenETH(ethAsset);
      let incomeOwed = bn(await divToken.methods.incomeOwed(accounts[4]).call());
      console.log('Income owed: ', incomeOwed.toString())
      let assetIncome = bn(await divToken.methods.assetIncome().call());
      console.log('Asset income: ', assetIncome.toString())
      let balanceBefore = bn(await web3.eth.getBalance(accounts[4]));
      console.log('Balance Before: ', balanceBefore.toString())
      let erc20 = await divToken.methods.getERC20().call({from: accounts[4]});
      console.log('ERC20: ', erc20);
      let result = await divToken.methods.withdraw().send({gas: 130000, from: accounts[4]});
      console.log('withdraw gasUser: ', result.gasUsed);
      let balanceAfter = bn(await web3.eth.getBalance(accounts[4]));
      console.log('Balance After: ', balanceAfter.toString())
      let diff = balanceAfter.minus(balanceBefore);
      assert.equal(diff.isGreaterThan(0), true);
    });
  });

  describe('Get assets by manager, operator, and investor', function() {
    it('Should return asset manager assets', async function() {
      let results = await network.getAssetsByManager(accounts[2]);
      assert.equal(results.length == 2, true);
      assert.equal(results[0].toLowerCase() == ethAsset.toLowerCase(), true);
      assert.equal(results[1].toLowerCase() == erc20Asset.toLowerCase(), true);
    });

    it('Should return asset operator assets', async function() {
      let results = await network.getAssetsByOperator(accounts[3]);
      assert.equal(results.length == 2, true);
      assert.equal(results[0].toLowerCase() == ethAsset.toLowerCase(), true);
      assert.equal(results[1].toLowerCase() == erc20Asset.toLowerCase(), true);
    });

    it('Should return asset investor assets', async function() {
      let results = await network.getAssetsByInvestor(accounts[4]);
      console.log(results);
      assert.equal(results.length == 2, true);
      assert.equal(results[0].toLowerCase() == ethAsset.toLowerCase(), true);
      assert.equal(results[1].toLowerCase() == erc20Asset.toLowerCase(), true);
    });

    it('Should return asset investor assets', async function() {
      let results = await network.getAssetsByInvestor(accounts[5]);
      assert.equal(results.length == 1, true);
      assert.equal(results[0].toLowerCase() == ethAsset.toLowerCase(), true);
    });

    it('Should return all assets', async function() {
      let results = await network.getTotalAssets();
      assert.equal(results.length == 2, true);
      assert.equal(results[0].toLowerCase() == ethAsset.toLowerCase(), true);
      assert.equal(results[1].toLowerCase() == erc20Asset.toLowerCase(), true);
    });

    it('Should return all assets with blockNumber and asset manager address', async function() {
      let results = await network.getTotalAssetsWithBlockNumberAndManager();
      assert.equal(results.length == 2, true);
      assert.equal(results[0].address.toLowerCase() == ethAsset.toLowerCase(), true);
      assert.equal(results[1].address.toLowerCase() == erc20Asset.toLowerCase(), true);
    });
  });

  describe('Get manager, operator, investors by asset', function() {
    it('Should return accounts[2]', async function() {
      let result = await network.getAssetManager(ethAsset);
      assert.equal(result.toLowerCase(), accounts[2].toLowerCase());
    });

    it('Should return accounts[3]', async function() {
      let result = await network.getAssetOperator(ethAsset);
      assert.equal(result.toLowerCase(), accounts[3].toLowerCase());
    });

    it('Should return [accounts[4], accounts[5]]', async function() {
      let results = await network.getAssetInvestors(ethAsset);
      assert.equal(results.length == 2, true);
      assert.equal(results[0].toLowerCase(), accounts[4].toLowerCase());
      assert.equal(results[1].toLowerCase(), accounts[5].toLowerCase());
    });
  });

  describe('Get crowdsale details', function() {
    it('Should return one open crowdsale - erc20Asset', async function() {
      let results = await network.getOpenCrowdsales();
      assert.equal(results.length == 1, true);
      assert.equal(results[0].toLowerCase(), erc20Asset.toLowerCase());
    });

    it('Should return funding time left of 0', async function() {
      let result = await network.getFundingTimeLeft(ethAsset);
      assert.equal(result == 0, true);
    });

    it('Should return funding time left greater than 0', async function() {
      let result = await network.getFundingTimeLeft(erc20Asset);
      assert.equal(result > 0, true);
    });

    it('Should return funding goal', async function() {
      let result = bn(await network.getFundingGoal(ethAsset));
      assert.equal(result.eq(await web3.utils.toWei('2', 'ether')), true);
    });

    it('Should return funding goal', async function() {
      let result = bn(await network.getFundingGoal(erc20Asset));
      assert.equal(result.eq(await web3.utils.toWei('100', 'ether')), true);
    });

    it('Should return funding goal', async function() {
      let result = bn(await network.getFundingProgress(erc20Asset));
      assert.equal(result.eq(await web3.utils.toWei('10', 'ether')), true);
    });
  });

  describe('Finish erc20Asset funding and issue dividends', function() {
    it('Should fund erc20Asset and get a transaction address', async function(){
      let amount = await web3.utils.toWei('90', 'ether');
      await myb.methods.approve(addresses.CrowdsaleERC20, amount).send({from: accounts[5]});
      let result = await network.fundAsset({
        asset: erc20Asset,
        investor: accounts[5],
        amount: amount,
        fundingToken: addresses.MyBitToken,
        paymentToken: addresses.MyBitToken
      });

      assert.equal(result.status, true);
    });

    it('Should send myb to erc20Asset', async function() {
      let amount = await web3.utils.toWei('10', 'ether');
      await myb.methods.approve(erc20Asset, amount).send({from: accounts[3]});
      let result = await network.issueDividends({
        asset: erc20Asset,
        account: accounts[3],
        amount: amount
      });
      assert.equal(result.status, true);
    });

    it('Should be able to receive income', async function() {
      let divToken = await network.dividendTokenERC20(erc20Asset);
      let balanceBefore = bn(await myb.methods.balanceOf(accounts[4]).call());
      await divToken.methods.withdraw().send({from: accounts[4], gas:130000});
      let balanceAfter = bn(await myb.methods.balanceOf(accounts[4]).call());
      let diff = balanceAfter.minus(balanceBefore);
      assert.equal(diff.isGreaterThan(0), true);
    });
  });

  describe('Create various tokens', function() {
    let divToken;

    it('Should create an ETH dividend token', async function() {
      divToken = await network.createDividendToken({
        uri: 'Ether DivToken',
        owner: accounts[0]
      });

      assert.equal(bn(await divToken.methods.totalSupply().call()).eq(0), true);
    });

    it('Should mint a token', async function() {
      await divToken.methods.generateTokens(accounts[1], 100).send({from: accounts[0], gas:'125000'});
      assert.equal(bn(await divToken.methods.totalSupply().call()).eq(100), true);
      assert.equal(bn(await divToken.methods.balanceOf(accounts[1]).call()).eq(100), true);
    });

    it('Should issue dividends to token holders', async function() {
      let amount = await web3.utils.toWei('1', 'ether');
      let result = await network.issueDividends({
        asset: divToken.options.address,
        account: accounts[0],
        amount: amount
      });
      assert.equal(result.status, true);
    });

    it('Should withdraw dividends', async function() {
      let balanceBefore = bn(await web3.eth.getBalance(accounts[1]));
      await divToken.methods.withdraw().send({gas: 130000, from: accounts[1]});
      let balanceAfter = bn(await web3.eth.getBalance(accounts[1]));
      let diff = balanceAfter.minus(balanceBefore);
      assert.equal(diff.isGreaterThan(0), true);
    });

    it('Should create an ERC20 dividend token', async function() {
      let divTokenERC20 = await network.createDividendToken({
        uri: 'Ether DivToken',
        owner: accounts[0],
        fundingToken: addresses.MyBitToken
      });

      assert.equal(bn(await divTokenERC20.methods.totalSupply().call()).eq(0), true);
    });

    it('Should create an erc20 token', async function() {
      let erc20 = await network.createERC20Token({
        uri: 'Test ERC20',
        symbol: 'ERC20',
        total: '100',
        owner: accounts[0]
      });

      assert.equal(bn(await erc20.methods.totalSupply().call()).eq(100), true);
    });
  });

  describe('Create tokenized assets', function() {
    let asset;

    it('Should create a non-transferrable tokenized asset', async function() {
      let object = await network.tokenizeAsset({
        assetURI: 'Non-Transferable',
        assetManager: accounts[2],
        tokenHolders: [accounts[6], accounts[7]],
        tokenAmounts: [100, 200]
      });
      asset = object.asset;
      assert.equal(asset.startsWith('0x'), true);
    });
    //This currently hangs because of the finishMinting() function
    it('Should create transferrable asset', async function() {
      let object = await network.tokenizeAsset({
        assetURI: 'Transferable',
        assetManager: accounts[2],
        tokenHolders: [accounts[6], accounts[7]],
        tokenAmounts: [100, 200],
        tradeable: true
      });
      asset = object.asset;
      assert.equal(asset.startsWith('0x'), true);
    });
  });
});
