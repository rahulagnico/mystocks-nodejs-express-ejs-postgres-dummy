document.getElementById("notAMember").addEventListener("click", function () {
    document.getElementById("signInForm").style.display = "none";
    document.getElementById("signUpForm").style.display = "block";
});
document.getElementById("alreadyAMember").addEventListener("click", function () {
    document.getElementById("signUpForm").style.display = "none";
    document.getElementById("signInForm").style.display = "block";
});
if (window.location.pathname === "/register") {
    if (document.getElementById("errMsg").innerHTML != "") {
        document.getElementById("signInForm").style.display = "none";
        document.getElementById("signUpForm").style.display = "block";
    }
}