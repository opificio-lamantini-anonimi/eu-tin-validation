const proxyUrl = "https://cors-anywhere.herokuapp.com/";

export default {
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
}
