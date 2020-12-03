const path = require("path");

const db = require(path.join(__dirname, "..", "util", "database.js"));

class Auth {

    constructor(userObj) {
        this.id = userObj.id;
        this.email = userObj.email;
        this.password = userObj.password;
        this.userName = userObj.userName;
        this.phoneNo = userObj.phoneNo;
        this.lastActivationDate = userObj.lastActivationDate;
        this.isActive = userObj.isActive;
        this.userType = userObj.userType;
    }

    login() {
        return db.query(
            'SELECT * FROM public."users" WHERE email=$1 AND password=$2',
            [this.email, this.password]
        )
    }

    register() {
        return db.query(
            'INSERT INTO public."users" (email, password) VALUES ($1,$2) RETURNING id;',
            [this.email, this.password]
        )
    }

    verifyEmail() {
        return db.query(
            'SELECT * FROM public."users" WHERE email=$1',
            [this.email]
        )
    }

    createWallet(){
        return db.query(
            'INSERT INTO public."wallet" ("userId", balance, invested) VALUES ($1,$2,$3)',
            [this.id, 100000,0]
        )
    }

}

module.exports = Auth;