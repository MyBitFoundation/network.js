var Network = require('.');

const platformOwner = '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1'; //platform owner is accounts[0]

const operator = Network.addOperator(
    '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    'Mac the Operator',
    platformOwner
);

operator.then(function(res) {
    console.log('Response', res)
})
