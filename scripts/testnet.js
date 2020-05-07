require('dotenv').config()
const {DfuseUp , Testnet} = require('dfuseup');
const { Api, JsonRpc } = require('eosjs');
const config = require('config');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
const { TextDecoder, TextEncoder } = require('util');
const fetch = require('node-fetch');
const storage = require('node-persist');
const ContractProxy = require('../lib/ContractProxy');
const seed = require('../lib/seed');

async function main() {
  var args = process.argv.slice(2);

  const rpc = new JsonRpc('http://127.0.0.1:8888', { fetch })
  const eos = new Api({
    rpc,
    signatureProvider: new JsSignatureProvider([config.get('testnet.privatekey'), DfuseUp.keypair.private]),
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder()
  });
  const dfuseUp = new DfuseUp({ eos });
  const testnet = new Testnet({
    printOutput: true
  });

  await storage.init({
    dir: 'data'
  })

  let isNew = true;
  let containerId = await storage.getItem('testnet-container');

  if(!containerId || args.length > 0 && 
    (args[0] == '--new' || args[0] == '-n')) {
    containerId = '';
    console.log("starting testnet from new container");
  } else {
    isNew = false;
    console.log("starting testnet from container: " + containerId);
  }

  await testnet.setup();
  testnet.loadExitHandler();
  await testnet.start({ containerId });

  if(!isNew) {
    return
  }

  await storage.setItem('testnet-container', testnet.container.id);

  let proxies = {};
  const putContract = 'putinventory';

  try {
    await dfuseUp.createAccount(putContract, config.get('testnet.publickey'))
    await dfuseUp.setContract(putContract, `./contracts/putinventory/putinventory.wasm`)
    await (await dfuseUp.giveCodeActivePermission(putContract, putContract))

    let proxies = {};
    proxies['eosio'] = await ContractProxy(dfuseUp.morph.eos, 'eosio');
    proxies['eosio.token'] = await ContractProxy(dfuseUp.morph.eos, 'eosio.token');
    proxies[putContract] = await ContractProxy(dfuseUp.morph.eos, putContract);

    await seed(dfuseUp, proxies, 5, config.get('testnet.publickey'));

  } catch(ex) {
    console.log(ex);
    await testnet.stop({autoRemove: false});
    process.exit(1);
  }
}

main()