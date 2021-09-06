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
        let amount = $("#amount").val() || 1;
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
            let oRespData = details.oData;
            let captureId = details.captureId;
            let name = details.name;
            let status = details.status
            console.log("Approved:", oRespData, captureId, name, status);
            let appendText = "<br />Order has been approved: <b>";
            appendText += "</b> by <b> " + name + "</b>";
            $("#errPaypal").append(appendText).show();
        });
    },
    onError: function (err) {
        $("#errPaypal").html("Something is not right here! Please try again later.").show();
        console.log("Tranasction error", err);
    },
    onCancel: function (data, actions) {
        $("#errPaypal").html("Transaction has been canceled").show();
        console.log("Transaction canceled", data);
    }
}).render('#paypal-button-container');