const request = require('./index.js');

request("tin", "IT", "SMNLMN92C02G224L", function(error, result) {

    console.log("___TIN___")

    if(error) {
        console.error("ERROR");
        return console.error(error);
    }

    console.log("SUCCESS")
    console.log(result)
})

request("vat", "IT", "04854710284", function(error, result) {

    console.log("___VAT___")

    if(error) {
        console.error("ERROR");
        return console.error(error);
    }

    console.log("SUCCESS")
    console.log(result)
})
