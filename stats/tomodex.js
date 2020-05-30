const request = require('request')
const urljoin = require('url-join')
const config = require('config')

const push = ({ table, domain, address, type, value }) => {
    return new Promise(async (resolve, reject) => {
        let url = urljoin(`https://metrics.tomochain.com`, 'write', '?db=tomodex')
        let username = process.env.STATS_USERNAME || config.get('stats.username')
        let password = process.env.STATS_PASSWORD || config.get('stats.password')
        let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        let data = `
            ${table},address=${address},domain=${domain},type=${type} value=${value}
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
            if (response.statusCode !== 200 && response.statusCode !== 201) {
                return reject(body)
            }

            return resolve(body)
        })

    })
}

module.exports = {
    push
}
