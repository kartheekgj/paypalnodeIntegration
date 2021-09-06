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
//const PAYPAL_OAUTH_API = 'https://api-m.sandbox.paypal.com/v1/oauth2/token/';
const PAYPAL_ORDER_API = 'https://api-m.sandbox.paypal.com/v2/checkout/orders/';
const PAYPAL_PURCHASE_API = 'https://api-m.sandbox.paypal.com/v2/payments/authorizations/';

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
    var data = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": 1
                }
            }
        ]
    };
    var authData = {
        "intent": "AUTHORIZE",
        "purchase_units": [
            {
                "amount": {
                    "currency_code": "USD",
                    "value": 1
                }
            }
        ]
    };
    let order;
    var captureConfig = {
        method: 'post',
        url: PAYPAL_ORDER_API,
        headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        auth: {
            username: PAYPAL_CLIENT,
            password: PAYPAL_SECRET
        },
        data: data
    };
    var authConfig = {
        method: 'post',
        url: PAYPAL_ORDER_API,
        headers: {
            'Content-Type': 'application/json'
        },
        auth: {
            username: PAYPAL_CLIENT,
            password: PAYPAL_SECRET
        },
        data: authData
    };
    order = axios(captureConfig);
    order.then(function (resp) {
        let orderId = resp.data.id
        console.log("sucessfull created order ", orderId);
        authOrder = axios(authConfig).then(function (respData) {
            console.log("Sending back create order", orderId);
            res.status(200).send({ orderId: orderId });
        }).catch(function (error) {
            if (error.response) {
                // Request made and server responded
                console.log('Auth Error', error.response.data);
                console.log('Auth Error', error.response.status);
                console.log('Auth Error', error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.log('Auth Error', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Auth Error', error.message);
            }

        });
    }).catch(function (err) {
        if (error.response) {
            // Request made and server responded
            console.log('Capture Error', error.response.data);
            console.log('Capture Error', error.response.status);
            console.log('Capture Error', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('Capture Error', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Capture Error', error.message);
        }

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
