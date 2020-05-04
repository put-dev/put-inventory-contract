const url = require('url');

module.exports = {
    parseNetworkFromConfig: function(config) {
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
}