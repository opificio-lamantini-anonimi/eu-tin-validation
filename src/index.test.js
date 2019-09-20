const request = require('../lib/index.js');

test("tin validation", function() {
    expect(request("tin", "IT", "SMNLMN92C02G224L")).toEqual({
        countryCode: 'IT',
        vatNumber: 'SMNLMN92C02G224L',
        requestDate: '2019-09-20+02:00',
        valid: true,
        validSyntax: true,
        validStructure: true
    })
})

test("vat validation", function() {
    expect(request("vat", "IT", "04854710284")).toEqual({
        countryCode: 'IT',
        vatNumber: '04854710284',
        requestDate: '2019-09-20+02:00',
        valid: true,
        name: 'OPIFICIO LAMANTINI ANONIMI DI LUCA MANUELE SIMONATO',
        address: 'VIA MURO N 12 , 35030 BAONE PD, '
    })
})
