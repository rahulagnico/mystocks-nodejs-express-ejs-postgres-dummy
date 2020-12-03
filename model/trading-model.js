const path = require("path");

const db = require(path.join(__dirname, "..", "util", "database.js"));

class Trading {

    constructor(stockObj) {
        this.userId = stockObj.userId;
        this.fsym_id = stockObj.fsym_id;
        this.quantity = stockObj.quantity;
        this.invested = stockObj.invested;
        this.balance = stockObj.balance;
        this.p_price = stockObj.p_price;
        this.proper_name = stockObj.proper_name;
        this.currency = stockObj.currency;
    }

    getWallet() {
        return db.query(
            'SELECT * FROM public."wallet" WHERE "userId"=$1',
            [this.userId]
        )
    }

    updateWallet() {
        return db.query(
            'UPDATE public."wallet" SET balance=$1, invested=$2 WHERE "userId"=$3',
            [this.balance, this.invested, this.userId]
        )
    }

    static getStocks() {
        return db.query(
            'SELECT * FROM public."Stocks"'
        )
    }

    getParticularStock() {
        return db.query(
            'SELECT * FROM public."Stocks" WHERE "fsym_id"=$1',
            [this.fsym_id]
        )
    }

    addStockHoldings() {
        return db.query(
            'INSERT INTO public.stock_holdings ("userId", fsym_id, proper_name, p_price, quantity, generated_id, "currency") VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT ("generated_id") DO UPDATE SET quantity = public.stock_holdings.quantity + $5',
            [this.userId, this.fsym_id, this.proper_name, this.p_price, this.quantity, this.fsym_id+this.userId,this.currency]
        )
    }

    getStockHoldings() {
        return db.query(
            'SELECT fsym_id, proper_name, p_price, currency, quantity FROM public."stock_holdings" WHERE "userId"=$1',
            [this.userId]
        )
    }

    getParticularStockHoldings() {
        return db.query(
            'SELECT * FROM public."stock_holdings" WHERE "userId"=$1 AND "fsym_id"=$2',
            [this.userId,this.fsym_id]
        )
    }   

    deleteStockHoldings(){
        return db.query(
            'DELETE FROM public."stock_holdings" WHERE "userId"=$1 AND "fsym_id"=$2',
            [this.userId,this.fsym_id]
        )
    }

}

module.exports = Trading;