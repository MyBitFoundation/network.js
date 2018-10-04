var Network = require('.');

const operator = Network.addOperator(
    '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
    'Mac the Operator',
    '0xffcf8fdee72ac11b5c542428b35eef5769c409f0'
);

operator.then(function(res) {
    console.log('Response', res)
})