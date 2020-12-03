const path = require("path");

const BigNumber = require('bignumber.js');

const https = require('https');

const TradingModel = require(path.join(__dirname, "..", "model", "trading-model"));

const convertCurrency = function (curr, callback) {
    let s = "https://api.exchangeratesapi.io/latest?base=" + curr + "&symbols=USD," + curr;
    console.log(s);
    https.get(s, (resp) => {
        resp.on('data', function (chunk) {
            callback(chunk.toString());
        });
    }).on("error", (err) => {
        console.log(err.message);
    });
}


exports.getHome = (req, res) => {
    res.render("home.ejs");
};

exports.getWallet = (req, res) => {

    const stockObj = {
        "userId": req.session.userId
    }

    const tradingObj = new TradingModel(stockObj);

    tradingObj.getWallet().then((result) => {
        const balance = result.rows[0].balance.toString();
        const invested = result.rows[0].invested.toString();
        let getWalletRetuenObj = {
            "balance": "$" + balance.split(".")[0] + "." + balance.split(".")[1].substring(0, 2) + " (USD)",
            "invested": "$" + invested.split(".")[0] + "." + invested.split(".")[1].substring(0, 2) + " (USD)"
        }
        res.send(getWalletRetuenObj);
    })

        .catch(err => {
            console.log(err);
        })
}

exports.getStocks = (req, res) => {
    TradingModel.getStocks().then(result => {
        res.send(result.rows);
    })
        .catch(err => {
            console.log(err);
        })
}

exports.getStockHoldings = (req, res) => {
    const stockObj = {
        "userId": req.session.userId,
    }

    let tradingObj = new TradingModel(stockObj);

    tradingObj.getStockHoldings().then(result => {
        res.send(result.rows);
    })
        .catch(err => {
            console.log(err);
        })

}

exports.buyStock = (req, res) => {

    const stockObj = {
        "userId": req.session.userId,
        "quantity": parseInt(req.body.quantity),
        "fsym_id": req.body.stockId
    }

    let tradingObj = new TradingModel(stockObj);

    tradingObj.getParticularStock().then(particularStockDetails => {

        particularStockDetails = particularStockDetails.rows[0];

        tradingObj.getWallet().then(walletDetails => {

            walletDetails = walletDetails.rows[0];

            convertCurrency(particularStockDetails.currency, (conversionRes) => {
                conversionRes = JSON.parse(conversionRes);
                console.log(conversionRes.error);
                if (conversionRes.error !== undefined) {                   
                    res.send({ "errMsg":  conversionRes.error });
                    return;
                };

                console.log(conversionRes);

                const conversionRate = new BigNumber(conversionRes["rates"]["USD"]);

                //using BigNumber.js for decimal precision
                let walletBalance = new BigNumber(walletDetails.balance);
                let walletInvested = new BigNumber(walletDetails.invested);
                const stockPrice = new BigNumber(particularStockDetails.p_price);
                const stockPriceConverted = stockPrice.multipliedBy(conversionRate);
                const stockQuantity = new BigNumber(stockObj.quantity);
                let totalPrice = stockPriceConverted.multipliedBy(stockQuantity);

                console.log(stockPriceConverted.toNumber());
                //updated balance and invested amount
                stockObj.balance = (walletBalance.minus(totalPrice)).toNumber();
                stockObj.invested = (walletInvested.plus(totalPrice)).toNumber();

                if (stockObj.balance < 0) {

                    res.send({ "errMsg": "You have insufficient balance." });

                } else {

                    stockObj.proper_name = particularStockDetails.proper_name;
                    stockObj.p_price = particularStockDetails.p_price;
                    stockObj.currency = particularStockDetails.currency;

                    tradingObj = new TradingModel(stockObj);

                    tradingObj.updateWallet(stockObj).then((updateWalletRes) => {

                        tradingObj.addStockHoldings(stockObj).then((addStockHoldingsRes) => {

                            res.send({ "successMsg": "Buying successful." });

                        }).catch(err => {
                            console.log(err);
                        })

                    }).catch(err => {
                        console.log(err);
                    })


                }

            });


        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });

}

exports.sellStock = (req, res) => {

    const stockObj = {
        "userId": req.session.userId,
        "quantity": parseInt(req.body.quantity),
        "fsym_id": req.body.stockId
    }

    let tradingObj = new TradingModel(stockObj);

    tradingObj.getParticularStockHoldings().then(particularStockHoldingsDetails => {

        particularStockHoldingsDetails = particularStockHoldingsDetails.rows[0];

        convertCurrency(particularStockHoldingsDetails.currency, (conversionRes) => {
            conversionRes = JSON.parse(conversionRes);
            console.log(conversionRes);
            const conversionRate = new BigNumber(conversionRes["rates"]["USD"]);

            if (stockObj.quantity > particularStockHoldingsDetails.quantity) {
                res.send({ "errMsg": "You don't have the specified quantity." });
            }

            else {

                tradingObj.getWallet().then(walletDetails => {

                    walletDetails = walletDetails.rows[0];

                    //using BigNumber.js for decimal precision
                    let walletBalance = new BigNumber(walletDetails.balance);
                    let walletInvested = new BigNumber(walletDetails.invested);
                    let stockPrice = new BigNumber(particularStockHoldingsDetails.p_price);
                    const stockPriceConverted = stockPrice.multipliedBy(conversionRate);
                    let stockQuantity = new BigNumber(stockObj.quantity);
                    let totalPrice = stockPriceConverted.multipliedBy(stockQuantity)

                    console.log(stockPriceConverted.toNumber());
                    //updated balance and invested amount
                    stockObj.balance = (walletBalance.plus(totalPrice)).toNumber();
                    stockObj.invested = (walletInvested.minus(totalPrice)).toNumber();

                    stockObj.proper_name = particularStockHoldingsDetails.proper_name;
                    stockObj.p_price = particularStockHoldingsDetails.p_price;
                    stockObj.currency = particularStockHoldingsDetails.currency;

                    //to substract given quantity
                    stockObj.quantity = -stockObj.quantity;

                    tradingObj = new TradingModel(stockObj);

                    tradingObj.updateWallet(stockObj).then((updateWalletRes) => {

                        if (particularStockHoldingsDetails.quantity + stockObj.quantity <= 0) {

                            tradingObj.deleteStockHoldings(stockObj).then(deleteStockHoldingsRes => {

                                res.send({ "successMsg": "Selling successful." });

                            }).catch(err => {
                                console.log(err);
                            });

                        } else {

                            tradingObj.addStockHoldings(stockObj).then((addStockHoldingsRes) => {

                                res.send({ "successMsg": "Selling successful." });

                            }).catch(err => {
                                console.log(err);
                            });
                        }

                    }).catch(err => {
                        console.log(err);
                    })




                }).catch(err => {
                    console.log(err);
                });
            }
        });


    }).catch(err => {
        console.log(err);
    });

}