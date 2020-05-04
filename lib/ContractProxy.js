
module.exports = async function(eos, contract, account) {
    const abi = (await eos.rpc.get_abi(contract)).abi;
    let proxy = { eos, contract, account };
    for(let action of abi.actions) {
        proxy[action.name] = async function(data, authorization, options) {
            authorization = authorization || [{ actor: this.account, permission: 'active'}]
            options = { broadcast: true, sign: true, blocksBehind: 0, expireSeconds: 60, ...options }
            return this.eos.transact(
            {
                actions: [
                    {
                        account: this.contract,
                        name: action.name,
                        authorization,
                        data
                    }
                ]
            }, options)
        }
    }

    for (let table of abi.tables) {
        const tableNameCap = table.name.charAt(0).toUpperCase() + table.name.slice(1)
        proxy[`get${tableNameCap}`] = async function(options) {
            const data = await this.eos.rpc.get_table_rows({
                json: options.json,
                code: this.contract,
                scope: options.scope,
                table: table.name,
                table_key: options.table_key, // Table secondary key name
                lower_bound: options.lower_bound,
                upper_bound: options.upper_bound,
                limit: options.limit,
                key_type: options.key_type,  // type of key specified by index_position
                index_position: options.index_position, // 1 - primary (first), 2 - secondary index (in order defined by multi_index), 3 - third index, etc
                encode_type: options.encode_type, //dec, hex , default=dec
                reverse: options.reverse,
                show_payer: options.show_payer
            })
            return data.rows
        }
    }

    return proxy;
}