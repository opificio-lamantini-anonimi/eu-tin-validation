import http from 'http';
import https from 'https';
import url from 'url';

const proxyUrl = "https://cors-anywhere.herokuapp.com/";

var baseConfig = {
    serviceUrl: {
        tin: proxyUrl + "https://ec.europa.eu/taxation_customs/tin/services/checkTinService",
        vat: proxyUrl + "http://ec.europa.eu/taxation_customs/vies/services/checkVatService"
    },
    soapAction: {
        tin: 'urn:ec.europa.eu:taxud:tin:services:checkTin/checkTin',
        vat: 'urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat'
    },
    soapBodyTemplate: {
        tin: `<soap:Envelope
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
            xmlns:tns1="urn:ec.europa.eu:taxud:tin:services:checkTin:types"
            xmlns:impl="urn:ec.europa.eu:taxud:tin:services:checkTin">
            <soap:Header> </soap:Header>
            <soap:Body>
                <tns1:checkTin
                    xmlns:tns1="urn:ec.europa.eu:taxud:tin:services:checkTin:types"
                    xmlns="urn:ec.europa.eu:taxud:tin:services:checkTin:types">
                    <tns1:countryCode>_country_code_placeholder_</tns1:countryCode>
                    <tns1:tinNumber>_doc_number_placeholder_</tns1:tinNumber>
                </tns1:checkTin>
            </soap:Body>
        </soap:Envelope>
        `,
        vat: `<soap:Envelope
            xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
            xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"
            xmlns:impl="urn:ec.europa.eu:taxud:vies:services:checkVat">
            <soap:Header> </soap:Header>
            <soap:Body>
                <tns1:checkVat
                    xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"
                    xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
                    <tns1:countryCode>_country_code_placeholder_</tns1:countryCode>
                    <tns1:vatNumber>_doc_number_placeholder_</tns1:vatNumber>
                </tns1:checkVat>
            </soap:Body>
        </soap:Envelope>
        `
    }
};

var countries = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB'];

const messages = {
    'INVALID_ENDPOINT': 'Endpoint must be "tin" or "vat"',
    'INVALID_INPUT': 'The provided CountryCode is invalid or the VAT number is empty',
    'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later',
    'MS_UNAVAILABLE': 'The VAT database of the requested member country is unavailable, please try again later',
    'MS_MAX_CONCURRENT_REQ': 'The VAT database of the requested member country has had too many requests, please try again later',
    'TIMEOUT': 'The request to VAT database of the requested member country has timed out, please try again later',
    'SERVER_BUSY': 'The service cannot process your request, please try again later',
    'UNKNOWN': 'Unknown error'
};

function getErrorMessage (faultstring) {
    return messages[faultstring] || messages["UNKNOWN"];
}

function parseSoapResponse (soapMessage, endpoint) {

    function parseField(field) {
        const regex = new RegExp(`<${field}>\((\.|\\s)\*?\)</${field}>`, 'gm');
        const match = regex.exec(soapMessage);
        if (!match) {
            let err = new Error(`Failed to parseField ${field}`);
            err.soapMessage = soapMessage;
            throw err;
        }
        return match[1];
    }

    const hasFault = soapMessage.match(/<soap:Fault>\S+<\/soap:Fault>/g);

    let ret;

    if (hasFault) {
        ret = {
            faultCode: parseField('faultcode'),
            faultString: parseField('faultstring')
        };
    } else {

        if (endpoint === "tin") {
            ret = {
                countryCode: parseField('countryCode'),
                vatNumber: parseField('tinNumber'),
                requestDate: parseField('requestDate'),
                valid: parseField('validSyntax') === 'true' && parseField('validStructure') === 'true',
                validSyntax: parseField('validSyntax') === 'true',
                validStructure: parseField('validStructure') === 'true'
            };
        } else if (endpoint === "vat") {
            ret = {
                countryCode: parseField('countryCode'),
                vatNumber: parseField('vatNumber'),
                requestDate: parseField('requestDate'),
                valid: parseField('valid') === 'true',
                name: parseField('name'),
                address: parseField('address').replace(/\n/g, ', ')
            };
        }
    }

    return ret;
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var index = (async function (endpoint, countryCode, docNumber, timeout, callback) {

    console.log(1);

    if (typeof timeout === 'function') {
        callback = timeout;
        timeout = null;
    }

    console.log(2);

    if (!countries.includes(countryCode) || docNumber.length <= 0) {
        return process.nextTick(() => {
            callback(getErrorMessage("INVALID_INPUT"));
        });
    }

    console.log(3);

    if (endpoint !== "tin" && endpoint !== "vat") {
        return process.nextTick(() => {
            callback(getErrorMessage("INVALID_ENDPOINT"));
        });
    }

    console.log(4);

    let config = _extends({}, baseConfig, {
        serviceUrl: baseConfig.serviceUrl[endpoint],
        soapAction: baseConfig.soapAction[endpoint],
        soapBodyTemplate: baseConfig.soapBodyTemplate[endpoint]
    });

    console.log(5);

    const parsedUrl = await url.parse(config.serviceUrl);

    console.log(6, parsedUrl);

    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'node-soap',
        'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'none',
        'Accept-Charset': 'utf-8',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'close',
        'Host': parsedUrl.hostname,
        'SOAPAction': config.soapAction
    };

    const xml = config.soapBodyTemplate.replace('_country_code_placeholder_', countryCode).replace('_doc_number_placeholder_', docNumber).replace('\n', '').trim();

    headers['content-length'] = Buffer.byteLength(xml, 'utf8');

    const options = {
        host: parsedUrl.host,
        method: "POST",
        path: parsedUrl.path,
        headers: headers,
        family: 4
    };

    const requester = endpoint === "tin" ? https : http;

    const req = await requester.request(options, res => {
        res.setEncoding('utf8');
        let str = '';

        res.on('data', chunk => {
            str += chunk;
        });

        console.log(res);

        res.on('end', () => {

            let data, err;

            try {
                data = parseSoapResponse(str, endpoint);
            } catch (error) {
                err = error;
                return callback(err);
            }

            console.log(data);

            if (data && data.faultString != null && data.faultString.length > 0) {
                err = getErrorMessage(data.faultString);
                err.code = data.faultString;
                return callback(err);
            }

            return callback(null, data);
        });
    });

    console.log(options);

    if (timeout) {
        req.setTimeout(timeout, () => {
            return req.abort();
        });
    }

    req.on('error', e => {
        return callback(e);
    });

    req.write(xml);

    return req.end();
});

export default index;
//# sourceMappingURL=index.esm.js.map
