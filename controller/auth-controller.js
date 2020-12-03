const path = require("path");

const AuthModel = require(path.join(__dirname, "..", "model", "auth-model"));

/** Function for validating user inputs
 * parameters userObj: containing all user input fields
 * parameter action: "register", "login" 
 * return string: "valid" if everything is fine otherwise errMsg 
*/
const validiteInputs = (userObj, action) => {

  if (userObj.email === "" || userObj.password === "") {
    return "All fields are mandatory!";
  }

  const mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!mailformat.test(userObj.email)) {
    return "Invalid email address!";
  }


  if (action === "register") {
    if (userObj.password !== userObj.confirmPassword) {
      return "Passwords don't match!";
    }
  }

  return "valid";
};
/** Function for validating user inputs closed */

/** GET / */
exports.getIndex = (req, res) => {
  if (req.session.userId !== undefined) {
    res.redirect("/home");
  } else {
    res.render("index.ejs");
  }
};
/** GET / closed */

/** POST /login */
exports.login = (req, res) => {

  //creating userObj with user input fields
  const userObj = {
    email: req.body.email,
    password: req.body.password
  };

  //validating user inputs
  const validationMsg = validiteInputs(userObj, "login");
  if (validationMsg != "valid") {
    res.render("index.ejs", {
      errMsg: validationMsg
    });
    return;
  }

  //if user inputs validated
  const authObj = new AuthModel(userObj);
  //verfying username password
  authObj.login().then((data) => {

    //if verified
    if (data.rows.length !== 0) {
      req.session.userId = data.rows[0].id;
      req.session.email = data.rows[0].email;
      res.redirect("/home");
    }

    //if not verified
    else {
      res.render("index.ejs", {
        errMsg:
          "Incorrect Email or Password!"
      });
    }

  })
    //for database related issues
    .catch((err) => {
      console.log(err);
      res.render("index.ejs", {
        errMsg: "Some error occurred. Please contact admin."
      });
    });

};
/** POST /login closed */

/** POST /logout */
exports.logout = (req, res) => {
  req.session.destroy();
  res.render("index.ejs", {
    successMsg: "You are successfully Logged Out!"
  });
};
/** POST /logout closed */

/** POST /register */
exports.register = (req, res) => {

  //creating userObj with user input fields
  const userObj = {
    email: req.body.signUpEmail,
    password: req.body.signUpPassword,
    confirmPassword: req.body.signUpConfirmPassword
  };

  //validating user inputs
  const validationMsg = validiteInputs(userObj, "register");
  if (validationMsg != "valid") {
    res.render("index.ejs", {
      errMsg: validationMsg
    });
    return;
  }

  //if user inputs are validated
  let authObj = new AuthModel(userObj);

  //verifying if email already exists
  authObj.verifyEmail().then((data) => {

    //if email already exists
    if (data.rows.length !== 0) {
      res.render("index.ejs", {
        errMsg: "Email Id already exist."
      });
    }

    //if email does not exists
    else {

      //register user returning id
      authObj.register().then((result) => {

        //creating wallet after registration
        userObj.id = result.rows[0].id;
        authObj = new AuthModel(userObj);
        authObj.createWallet().then((createWalletRes) => {
          res.render("index.ejs", {
            successMsg: "You have successfully registered."
          });
        })

          //for database related issues in creating the wallet
          .catch((err) => {
            console.log(err);
            res.render("index.ejs", {
              errMsg: "Some error occurred. Please contact admin."
            });
          })
      })

        //for database related issues in registering
        .catch((err) => {
          console.log(err);
          res.render("index.ejs", {
            errMsg: "Some error occurred. Please contact admin."
          });
        });
    }
  })

    //for database related issues in verifying email
    .catch((err) => {
      console.log(err);
      res.render("index.ejs", {
        errMsg: "Some error occurred. Please contact admin."
      });
    });
};
/** POST /register closed */
