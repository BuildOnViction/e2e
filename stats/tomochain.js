const request = require('request')
const urljoin = require('url-join')
const config = require('config')

const saveEpochDuration = (value) => {
    return new Promise((resolve, reject) => {
        let url = urljoin(config.get('stats.uri'), 'write', '?db=tomochain')
        let username = process.env.STATS_USERNAME || config.get('stats.username')
        let password = process.env.STATS_PASSWORD || config.get('stats.password')
        let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        let data = `
        epoch_duration,env=mainnet value=${value}
        `
        let options = {
            method: 'POST',
            url: url,
            encoding: null,
            headers: {
                Authorization: auth
            },
            body: Buffer.from(data, 'utf-8')
        }
        request(options, (error, response, body) => {
            if (error) {
                return reject(error)
            }
            console.log(`Stats ${response.statusCode} epoch_duration,env=mainnet value=${value}`)
            if (response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 204) {
                return reject(error)
            }

            return resolve(body)
        })
    })
}

const saveEpochVoter = (value) => {
    return new Promise((resolve, reject) => {
        let url = urljoin(config.get('stats.uri'), 'write', '?db=tomochain')
        let username = process.env.STATS_USERNAME || config.get('stats.username')
        let password = process.env.STATS_PASSWORD || config.get('stats.password')
        let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        let data = `
        epoch_voter,env=mainnet value=${value}
        `
        let options = {
            method: 'POST',
            url: url,
            encoding: null,
            headers: {
                Authorization: auth
            },
            body: Buffer.from(data, 'utf-8')
        }
        request(options, (error, response, body) => {
            if (error) {
                return reject(error)
            }
            console.log(`Stats ${response.statusCode} epoch_voter,env=mainnet value=${value}`)
            if (response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 204) {
                return reject(error)
            }

            return resolve(body)
        })
    })
}

const saveEpochSlashedNode = (value) => {
    return new Promise((resolve, reject) => {
        let url = urljoin(config.get('stats.uri'), 'write', '?db=tomochain')
        let username = process.env.STATS_USERNAME || config.get('stats.username')
        let password = process.env.STATS_PASSWORD || config.get('stats.password')
        let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        let data = `
        epoch_slashed_node,env=mainnet value=${value}
        `
        let options = {
            method: 'POST',
            url: url,
            encoding: null,
            headers: {
                Authorization: auth
            },
            body: Buffer.from(data, 'utf-8')
        }
        request(options, (error, response, body) => {
            if (error) {
                return reject(error)
            }
            console.log(`Stats ${response.statusCode} epoch_slashed_node,env=mainnet value=${value}`)
            if (response.statusCode !== 200 && response.statusCode !== 201 && response.statusCode !== 204) {
                return reject(error)
            }

            return resolve(body)
        })
    })
}


module.exports = {
    saveEpochVoter,
    saveEpochSlashedNode,
    saveEpochDuration
}
