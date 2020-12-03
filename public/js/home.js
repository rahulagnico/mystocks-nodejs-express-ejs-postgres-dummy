const getStocks = function () {
    $.ajax({
        method: "GET",
        url: "home/stocks",
        success: function (data) {
            $.ajax({
                method: "GET",
                url: "https://api.exchangeratesapi.io/latest?base=USD",
                success: function (convRates) {
                    for (let ele of data) {
                        let oldCurrency = ele.currency;
                        let rate = convRates.rates[oldCurrency]
                        ele.price_usd = (ele.p_price / rate).toFixed(2);
                    }
                    $("#stocksTable").DataTable({
                        "data": data,
                        "columns": [

                            { "data": "proper_name" },
                            { "data": "p_price" },
                            { "data": "currency" },
                            { "data": "price_usd" },
                            { "data": "fsym_id" }
                        ],
                        "columnDefs": [
                            {
                                "targets": [4],
                                "visible": false,
                                "searchable": false
                            }
                        ]
                    });
                    $("#stocksTable tbody").on("click", "tr", function () {
                        loadBuyStockModal($("#stocksTable").DataTable().row(this).data(), "buy");
                    });
                    getWallet();
                },
                error: function () {
                    console.log(err);
                }
            });

        },
        error: function (err) {
            console.log(err);
        }
    });
};
getStocks();

const getWallet = function () {
    $.ajax({
        method: "GET",
        url: "home/wallet",
        success: function (data) {
            document.getElementById("walletBalance").innerHTML = data.balance;
            document.getElementById("walletInvested").innerHTML = data.invested;
            document.getElementById("fullBodyLoader").style.display = "none";
        },
        error: function (err) {
            console.log(err);
        }
    });
};
document.getElementById("wallet-tab").addEventListener("click", getWallet);

const getStockHoldings = () => {
    document.getElementById("fullBodyLoader").style.display = "block";
    $.ajax({
        method: "GET",
        url: "home/stock-holdings",
        success: function (data) {

            $.ajax({
                method: "GET",
                url: "https://api.exchangeratesapi.io/latest?base=USD",
                success: function (convRates) {
                    for (let ele of data) {
                        let oldCurrency = ele.currency;
                        let rate = convRates.rates[oldCurrency]
                        ele.price_usd = (ele.p_price / rate).toFixed(2);
                    }
                    document.getElementById("fullBodyLoader").style.display = "none";
                    $("#stockHoldingsTable").DataTable({
                        "data": data,
                        "columns": [

                            { "data": "proper_name" },
                            { "data": "p_price" },
                            { "data": "currency" },
                            { "data": "price_usd" },
                            { "data": "quantity" },
                            { "data": "fsym_id" }
                        ],
                        "columnDefs": [
                            {
                                "targets": [5],
                                "visible": false,
                                "searchable": false
                            }
                        ],
                        "destroy": true
                    });
                    $("#stockHoldingsTable tbody").on("click", "tr", function () {
                        loadBuyStockModal($("#stockHoldingsTable").DataTable().row(this).data(), "sell")
                    });

                },
                error: function () {
                    console.log(err);
                }
            });
        },
        error: function (err) {
            console.log(err);
        }
    });
};
document.getElementById("sell-stock-tab").addEventListener("click", getStockHoldings);

document.getElementById("buyNow").addEventListener("click", function () {
    document.getElementById("fullBodyLoader").style.display = "block";
    $.ajax({
        method: "POST",
        url: "home/buy-stock",
        data: {
            "quantity": document.getElementById("stockQuantity").value,
            "stockId": document.getElementById("stockId").value
        },
        success: function (data) {
            if (data.successMsg != undefined) {
                alert(data.successMsg);
                $('#buyStockModal').modal('hide');
            } else {
                alert(data.errMsg);
            }
            document.getElementById("fullBodyLoader").style.display = "none";
        },
        error: function (err) {
            document.getElementById("fullBodyLoader").style.display = "none";
            console.log(err);
        }
    })
});

document.getElementById("sellNow").addEventListener("click", function () {
    document.getElementById("fullBodyLoader").style.display = "block";
    $.ajax({
        method: "POST",
        url: "home/sell-stock",
        data: {
            "quantity": document.getElementById("stockQuantity").value,
            "stockId": document.getElementById("stockId").value
        },
        success: function (data) {
            if (data.successMsg != undefined) {
                alert(data.successMsg);
            } else {
                alert(data.errMsg);
            }
            $('#buyStockModal').modal('hide');
            getStockHoldings();
        },
        error: function (err) {
            document.getElementById("fullBodyLoader").style.display = "none";
            console.log(err);
        }
    })
});

const loadBuyStockModal = function (stockInfo, action) {
    if (action === "buy") {
        document.getElementById("buyNow").style.display = "block";
        document.getElementById("sellNow").style.display = "none";
        document.getElementById("stockQuantity").value = 1;

    } else {
        document.getElementById("buyNow").style.display = "none";
        document.getElementById("sellNow").style.display = "block";
        document.getElementById("stockQuantity").value = stockInfo.quantity;

    }
    document.getElementById("buyStockModalTitle").innerHTML = stockInfo.proper_name;
    document.getElementById("stockPrice").innerHTML = "Stock Price: " + "<b>" + stockInfo.price_usd + " (USD)</b>";
    document.getElementById("stockId").value = stockInfo.fsym_id;
    $('#buyStockModal').modal('show');
}