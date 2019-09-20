export default function(soapMessage, endpoint) {

    function parseField(field) {
        const regex = new RegExp(`<${field}>\((\.|\\s)\*?\)</${field}>`, 'gm');
        const match = regex.exec(soapMessage)
        if(!match) {
            let err = new Error(`Failed to parseField ${field}`)
            err.soapMessage = soapMessage
            throw err
        }
        return match[1]
    }

    const hasFault = soapMessage.match(/<soap:Fault>\S+<\/soap:Fault>/g);

    let ret;

    if(hasFault) {
        ret = {
            faultCode: parseField('faultcode'),
            faultString: parseField('faultstring')
        }
    } else {

        if(endpoint === "tin") {
            ret = {
                countryCode: parseField('countryCode'),
                vatNumber: parseField('tinNumber'),
                requestDate: parseField('requestDate'),
                valid: parseField('validSyntax') === 'true' && parseField('validStructure') === 'true',
                validSyntax: parseField('validSyntax') === 'true',
                validStructure: parseField('validStructure') === 'true'
            }
        } else if(endpoint === "vat") {
            ret = {
                countryCode: parseField('countryCode'),
                vatNumber: parseField('vatNumber'),
                requestDate: parseField('requestDate'),
                valid: parseField('valid') === 'true',
                name: parseField('name'),
                address: parseField('address').replace(/\n/g, ', ')
            }
        }
    }

    return ret

}
