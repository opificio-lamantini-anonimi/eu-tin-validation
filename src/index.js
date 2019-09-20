import http from 'http';
import https from 'https';
import url from 'url';

import baseConfig from './lib/config';
import countries from './lib/countries';
import getErrorMessage from './lib/errors';
import parseSoapResponse from './lib/parseSoapResponse';

export default function(endpoint, countryCode, docNumber, timeout, callback) {

    if(typeof timeout === 'function') {
        callback = timeout;
        timeout = null;
    }

    if(!countries.includes(countryCode) || docNumber.length <= 0) {
        return process.nextTick(() => {
            callback(new Error(getErrorMessage("INVALID_INPUT")))
        })
    }

    if(endpoint !== "tin" && endpoint !== "vat") {
        return process.nextTick(() => {
            callback(new Error(getErrorMessage("INVALID_ENDPOINT")))
        })
    }

    let config = {
        ...baseConfig,
        serviceUrl: baseConfig.serviceUrl[endpoint],
        soapAction: baseConfig.soapAction[endpoint],
        soapBodyTemplate: baseConfig.soapBodyTemplate[endpoint]
    };

    const parsedUrl = url.parse(config.serviceUrl)

    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'node-soap',
        'Accept' : 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'none',
        'Accept-Charset': 'utf-8',
        'Connection': 'close',
        'Host' : parsedUrl.hostname,
        'SOAPAction': config.soapAction
    }

    const xml = config.soapBodyTemplate
    .replace('_country_code_placeholder_', countryCode)
    .replace('_doc_number_placeholder_', docNumber)
    .replace('\n', '')
    .trim()

    headers['content-length'] = Buffer.byteLength(xml, 'utf8');

    const options = {
        host: parsedUrl.host,
        method: "POST",
        path: parsedUrl.path,
        headers: headers,
        family: 4
    }

    const requester = endpoint === "tin" ? https : http;

    const req = requester.request(options, (res) => {
        res.setEncoding('utf8');
        let str = '';

        res.on('data', (chunk) => {
            str += chunk;
        })

        res.on('end', () => {

            let data, err;

            try {
                data = parseSoapResponse(str, endpoint);
            }

            catch(error) {
                err = error;
                return callback(err)
            }

            if(data && data.faultString != null && data.faultString.length > 0) {
                err = new Error(getErrorMessage(data.faultString));
                err.code = data.faultString;
                return callback(err);
            }

            return callback(null, data);
        })
    });

    if(timeout) {
        req.setTimeout(timeout, () => {
            return req.abort()
        })
    }

    req.on('error', (e) => {
        callback()
    });
    req.write(xml);
    return req.end();

}
