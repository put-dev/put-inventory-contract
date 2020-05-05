const {DfuseUp , Testnet} = require('dfuseup');
const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const assert = require('assert');
const ContractProxy = require('../lib/ContractProxy');
const seed = require('../lib/seed');

const EOS_ENDPOINT = "http://localhost:8888"
const CONTRACTS_KEY_PRIV = "5JtUScZK2XEp3g9gh7F8bwtPTRAkASmNrrftmx4AxDKD5K4zDnr"
const CONTRACTS_KEY_PUB = "EOS69X3383RzBZj41k73CSjUNXM5MYGpnDxyPnWUKPEtYQmTBWz4D"

const rpc = new JsonRpc(EOS_ENDPOINT, { fetch });
const eos = new Api({
  rpc,
  signatureProvider: new JsSignatureProvider([CONTRACTS_KEY_PRIV, DfuseUp.keypair.private]),
  textEncoder: new TextEncoder(),
  textDecoder: new TextDecoder()
});
const dfuseUp = new DfuseUp({ eos });
const testnet = new Testnet();

let proxies = {};
const eosioTokenContract = 'eosio.token';
const putContract = 'putinventory';

function debugResults(results) {
  for(let i = 0; i < results.length; i++) {
    console.log(`------ debug out ${i} ------`)
    console.log(results[i]);
    console.log(`--------------------------`)
  }
}

function newUtcDateString(addSeconds) {
  const now = new Date()
  now.setSeconds(now.getSeconds() + addSeconds)

  var n = now.toISOString()
  if (n.substr(23, 1) == 'Z') {
      n = n.substr(0, 23);
  }
  return n
}

describe('Put contract', () => {
    before(async function() {
        this.timeout(0);
        console.log('    Starting testnet...');
        await testnet.setup();
        testnet.loadExitHandler();
        await testnet.start();
        console.log('    Testnet started');

        await dfuseUp.createAccount(putContract, CONTRACTS_KEY_PUB);
        await dfuseUp.setContract(putContract, `contracts/putinventory/putinventory.wasm`);
        await (await dfuseUp.giveCodeActivePermission(putContract, putContract));

        proxies['eosio'] = await ContractProxy(dfuseUp.morph.eos, 'eosio');
        proxies[eosioTokenContract] = await ContractProxy(dfuseUp.morph.eos, eosioTokenContract);
        proxies[putContract] = await ContractProxy(dfuseUp.morph.eos, putContract);
    })

    after(async function() {
        this.timeout(0);
        await testnet.stop();
    })

    it('load seed data', async () => {
      const nrUsers = 5;
      await seed(dfuseUp, proxies, nrUsers, CONTRACTS_KEY_PUB);
    }).timeout(8000)

    it('Insert key', async () => {
      await proxies[putContract].insertkey({
        owner: 'putuseruser1',
        key: 'max_signups',
        value: '100'
      }, [{actor: 'putuseruser1', permission: 'active'}]);

      await proxies[putContract].insertkey({
        owner: 'putuseruser1',
        key: 'signup_uri',
        value: 'https://example.tld'
      }, [{actor: 'putuseruser1', permission: 'active'}]);

      await proxies[putContract].insertkey({
        owner: 'putuseruser2',
        key: 'encrypted_hash',
        value: '4db268bbaad225a0a'
      }, [{actor: 'putuseruser2', permission: 'active'}]);

      const result = await proxies[putContract].getKeyval({scope:'putuseruser1'});
      const result1 = await proxies[putContract].getKeyval({scope:'putuseruser2'});
      debugResults([{keyval:result}, {keyval1:result1}]);
    })

    it('Update key', async () => {
      await proxies[putContract].updatekey({
        owner: 'putuseruser1',
        key: 'max_signups',
        value: '200'
      }, [{actor: 'putuseruser1', permission: 'active'}]);

      const result = await proxies[putContract].getKeyval({scope:'putuseruser1'});
      const result1 = await proxies[putContract].getKeyval({scope:'putuseruser2'});
      debugResults([{keyval:result}, {keyval1:result1}]);
    })

    it('Rekey', async () => {
      await proxies[putContract].rekey({
        owner: 'putuseruser1',
        key: 'max_signups',
        new_key: 'max_signups2'
      }, [{actor: 'putuseruser1', permission: 'active'}]);

      const result = await proxies[putContract].getKeyval({scope:'putuseruser1'});
      const result1 = await proxies[putContract].getKeyval({scope:'putuseruser2'});
      debugResults([{keyval:result}, {keyval1:result1}]);
    })

    it('Delete key', async () => {
      await proxies[putContract].deletekey({
        owner: 'putuseruser1',
        key: 'max_signups2'
      }, [{actor: 'putuseruser1', permission: 'active'}]);

      const result = await proxies[putContract].getKeyval({scope:'putuseruser1'});
      const result1 = await proxies[putContract].getKeyval({scope:'putuseruser2'});
      debugResults([{keyval:result}, {keyval1:result1}]);
    })
  })
