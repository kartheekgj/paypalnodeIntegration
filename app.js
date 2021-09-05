const http = require('http');
var axios = require('axios');
var qs = require('qs');
const https = require('https');
const express = require('express');
const app = express();
const server = http.createServer(app);
app.use(express.urlencoded({
    extended: true
}))
app.use(express.json());
app.use(express.static("./", { index: "index.html" }));

//********** Get port used by Heroku or use a default
const PORT = Number(process.env.PORT || 3000);
server.listen(PORT);

// 1a. Add your client ID and secret
const PAYPAL_CLIENT = 'AWMW8DUMHT7PaJcIWB0FZBgv5TYWo1UV-Od7Q0vTMNnxVNw78R5qFH4Sc3rtwcEzBA5iEyX_qQpFGjIR';
const PAYPAL_SECRET = 'EIelm-Nd88TAqHnHvVPw_E_ZnBPw6XTILxVgY1h2vbqdafxgPmEKy53Gx5FTE5wiI3hdpw4PUjLCYAYh';

// 1b. Point your server to the PayPal APIs
const PAYPAL_OAUTH_API = 'https://api-m.sandbox.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api-m.sandbox.paypal.com/v2/checkout/orders/';
const PAYPAL_PURCHASE_API = 'https://api-m.sandbox.paypal.com/v2/payments/authorizations/';

// 1c. Get an access token from the PayPal API
let AuthToken = "";
var data = qs.stringify({
    'grant_type': 'client_credentials'
});
var config = {
    method: 'post',
    url: PAYPAL_OAUTH_API,
    headers: {
        'Authorization': 'Basic QVdNVzhEVU1IVDdQYUpjSVdCMEZaQmd2NVRZV28xVVYtT2Q3UTB2VE1ObnhWTnc3OFI1cUZINFNjM3J0d2NFekJBNWlFeVhfcVFwRkdqSVI6RUllbG0tTmQ4OFRBcUhuSHZWUHdfRV9abkJQdzZYVElMeFZnWTFoMnZicWRhZnhnUG1FS3k1M0d4NUZURTV3aUkzaGRwdzRQVWpMQ1lBWWg=',
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: data
};
axios(config).then(function (resp) {
    AuthToken = resp.data.access_token;;
});

//****** Callbacks for all URL requests
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});

app.get('/*.html', function (req, res) {
    res.sendFile(__dirname + "/views/index.html");
});
app.get('/*.js', function (req, res) {
    res.sendFile(__dirname + "/js/" + req.path);
});
app.get('/*.css', function (req, res) {
    res.sendFile(__dirname + "/css/" + req.path);
});
app.get('/*.png', function (req, res) {
    res.sendFile(__dirname + "/img/" + req.path);
});
app.get('/*.svg', function (req, res) {
    res.sendFile(__dirname + "/img/" + req.path);
});
//keep it last when all the above routes not found we come here
app.get('*', function (req, res) {
    res.sendFile(__dirname + "/views/404.html");
});

app.post('/demo_paypal/createOder', function (req, res) {
    amount = req.body.amount || 1;
    amount = parseInt(amount, 10);
    console.log("amount", amount);
    var data = JSON.stringify({ "intent": "CAPTURE", "purchase_units": [{ "amount": { "currency_code": "USD", "value": amount } }] });
    var captureConfig = {
        method: 'post',
        url: PAYPAL_ORDER_API,
        headers: {
            'Authorization': 'Bearer ' + AuthToken,
            'Content-Type': 'application/json'

        },
        data: data
    };
    var authData = JSON.stringify({ "intent": "AUTHORIZE", "purchase_units": [{ "amount": { "currency_code": "USD", "value": amount } }] });
    var authConfig = {
        method: 'post',
        url: PAYPAL_ORDER_API,
        headers: {
            'Authorization': 'Bearer ' + AuthToken,
            'Content-Type': 'application/json'

        },
        data: authData
    };
    order = axios(captureConfig).then(function (resp) {
        var orderId = resp.data.id
        console.log("sucessfull created order ", orderId);
        // res.status(200).send({ orderId:  });
        authOrder = axios(authConfig).then(function (respData) {
            console.log("Sending back create order", orderId);
            res.status(200).send({ orderId: orderId });
        }).catch(function (error) {
            console.log("AuthError:", error);
        });
    }).catch(function (error) {
        console.log("CreateOrderError:", error);
    });

});
app.post('/demo_paypal/approveOrder', function (req, res) {
    orderID = req.body.orderID;
    var authConfig = {
        method: 'post',
        url: PAYPAL_ORDER_API + orderID + '/capture',
        headers: {
            'Authorization': 'Bearer ' + AuthToken,
            'Content-Type': 'application/json'

        }
    };
    orderAuth = axios(authConfig).then(function (resp) {
        console.log("sucessfull Order AUth", resp.data.purchase_units[0].payments);
        res.status(200).send({ oData: resp.data });
    }).catch(function (error) {
        console.log(error);
    });
});

console.log("All code is fine. App Started Listerning to:", PORT);