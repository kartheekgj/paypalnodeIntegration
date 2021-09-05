paypal.Buttons({
    style: {
        shape: 'pill',
        layout: 'horizontal',
        color: 'black',
        label: 'pay',
        tagline: 'false',

    },
    createOrder: function (data, actions) {
        $("#errPaypal").text("").hide();
        var amount = $("#amount").val() || 1;
        amount = parseInt(amount, 10);;
        console.log(amount);
        return fetch('/demo_paypal/createOder', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
            })
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            console.log("createOrder:", data);
            $("#errPaypal").html("Order has been created: <b>" + data.orderId + "</b>")
                .show();
            return data["orderId"];
        });
    },
    onApprove: function (data, actions) {
        // 2. Make a request to your server
        console.log("data:", data)
        return fetch('/demo_paypal/approveOrder', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                orderID: data.orderID
            })
        }).then(function (res) {
            return res.json();
        }).then(function (details) {
            console.log("onApprove:", details);
            var details = details.oData;
            var approvalId = details.purchase_units[0].payments.captures[0].id;
            debugger;
            console.log("approvalId:", details.purchase_units[0].payments.captures);
            var payerName = details.payer.name.given_name;
            var appendText = "<br />Order has been approved: <b>";
            appendText += details["approvalId"] + "</b> by <b>";
            appendText += payerName + "</b>";
            $("#errPaypal").append(appendText).show();
        });
    },
    onError: function (err) {
        console.log(err);
    }
}).render('#paypal-button-container');