/** Internal Packages */
const path = require("path")
/** Internal Packages closed */

/** External Packages */
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
/** External Packages closed */

/** Self-declared Packages */
const userRoute = require(path.join(__dirname, "routes", "user-route"));
const authRoute = require(path.join(__dirname, "routes", "auth-route"));
/** Self-declared Packages closed */

const app = express();

//Using body-parser
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
    secret: "mY-St0Ck__N0d3-@pP",
    resave: true,
    saveUninitialized: true
}));

/** Setting view engin */
app.set("view engin", "ejs")
app.set("views", "views")
/** Setting view engin closed*/

/** Setting static folder path */
app.use(express.static(path.join(__dirname, "public")));
/** Setting static folder path closed */

/** Authentication middleware to check if session exist */
const authMiddleware = (req, res, next) => {
    if (req.session.userId !== undefined) {
        next();
    } else {
        res.render("page-not-found.ejs");
    }
};
/** Authentication middleware to check if session exist closed */

app.use("/", authRoute);
app.use("/home", authMiddleware, userRoute);

/** Page Not Found */
app.use("/", (req, res) => {
    res.render("page-not-found.ejs");
});
/** Page Not Found */

/** Starting server */
const port = process.env.PORT || 3000;
app.listen(port);
console.log("Server running at http://localhost:%d", port);
/** Starting server closed */