const request = require('request')
const urljoin = require('url-join')

const push = ({ table, name, address, value }) => {
    return new Promise(async (resolve, reject) => {
        let url = urljoin(`https://metrics.tomochain.com`, 'write', '?db=tomobridge')
        let username = process.env.STATS_USERNAME || 'tomochain'
        let password = process.env.STATS_PASSWORD || ''
        let auth = 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
        let data = `
            ${table},name=${name},address=${address} value=${value}
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
