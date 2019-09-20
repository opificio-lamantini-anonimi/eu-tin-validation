const messages = {
    'INVALID_ENDPOINT': 'Endpoint must be "tin" or "vat"',
    'INVALID_INPUT': 'The provided CountryCode is invalid or the VAT number is empty',
    'SERVICE_UNAVAILABLE': 'The VIES VAT service is unavailable, please try again later',
    'MS_UNAVAILABLE': 'The VAT database of the requested member country is unavailable, please try again later',
    'MS_MAX_CONCURRENT_REQ': 'The VAT database of the requested member country has had too many requests, please try again later',
    'TIMEOUT': 'The request to VAT database of the requested member country has timed out, please try again later',
    'SERVER_BUSY': 'The service cannot process your request, please try again later',
    'UNKNOWN': 'Unknown error'
}

export default function(faultstring) {
    return messages[faultstring] || messages["UNKNOWN"]
}
