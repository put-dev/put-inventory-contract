const { DfuseUp } = require('dfuseup')
const { Api, JsonRpc } = require('eosjs')
const fetch = require('node-fetch')
const config = require('config')
const { TextDecoder, TextEncoder } = require('util')
const { default: ScatterJS } = require('@scatterjs/core')
const { default: ScatterEOS } = require('@scatterjs/eosjs2')
const ContractProxy = require('../lib/ContractProxy')
const helpers = require('../lib/helpers')
global.fetch = fetch

function parseNetworkFromConfig(config) {
  const api = config.get(`chains.${config.get('chain.active')}.api`)
  const urlObj = url.parse(api)
  return {
    protocol: urlObj.protocol,
    host: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https' ? 443 : 80),
    blockchain: config.get(`chains.${config.get('chain.active')}.type`),
    chainId: config.get(`chains.${config.get('chain.active')}.chainId`)
  }
}

async function hasAuthority(rpc, account, authName) {
  const auth = (await rpc.get_account(account)).permissions.find(
    (p) => p.perm_name === authName
  )
  return !(!auth || auth.length === 0)
}

async function main() {
  console.log(`${new Date()} deploy NODE ENVIRONMENT: `, process.env.NODE_ENV)
  ScatterJS.plugins(new ScatterEOS())
  const contract = config.get('chain.contracts')[0]

  const connected = await ScatterJS.scatter.connect('Put-dev Deploy')
  if (!connected) {
    throw new Error('Could not connect to Scatter')
  }

  const scatter = ScatterJS.scatter
  const network = helpers.parseNetworkFromConfig(config)
  const rpc = new JsonRpc(config.get(`chains.${config.get('chain.active')}.api`), { fetch })
  const eos = new Api({
    rpc,
    signatureProvider: scatter.eosHook(network),
    textEncoder: new TextEncoder(),
    textDecoder: new TextDecoder()
  })
  const dfuseUp = new DfuseUp({ eos });
  const requiredFields = { accounts: [network] }

  let proxies = {}
  proxies['eosio'] = await ContractProxy(eos, 'eosio');

  //--------- handle contract part ---------

  await scatter.forgetIdentity()
  await scatter.getIdentity(requiredFields)
  
  // Give eosio.code permission to the contract itself
  if (
    !(await dfuseUp.hasCodeActivePermission(contract, contract))
  ) {
    console.log('giveCodeActivePermission...')
    await (await dfuseUp.giveCodeActivePermission(contract, contract))
  }

  // Deploy contract
  console.log('Deploying contract...')
  await dfuseUp.setContract(contract, `contracts/putinventory/putinventory.wasm`)

  // Force Scatter disconnection by exiting
  console.log('Done!')
  process.exit()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
