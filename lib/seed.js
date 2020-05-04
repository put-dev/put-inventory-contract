async function createFundedAccount(dfuseUp, eosTokenProxy, name, quantity, pubKey) {
    await dfuseUp.createAccount(name, pubKey)
    await eosTokenProxy.issue({
        to: name, 
        quantity, 
        memo: 'Initial funds' 
    }, [{actor: 'eosio.token', permission: 'active'}]);
}

module.exports = async function(dfuseUp, proxies, nrUsers, pubKey) {
    nrUsers = nrUsers || 2;
    for(let i = 1; i <= nrUsers; i++) {
        await createFundedAccount(dfuseUp, proxies['eosio.token'], `putuseruser${i}`, '1000.0000 EOS', pubKey);
    }
}