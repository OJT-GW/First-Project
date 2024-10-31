(function () {
  // Initialize Firebase
  var config = {
    apiKey: "xxxxx",
    authDomain: "xxxx.firebaseapp.com",
    databaseURL: "xxxx.firebaseio.com",
    projectId: "xxxx",
    storageBucket: "xxxx.appspot.com",
    messagingSenderId: "xxxxx",
  };
  firebase.initializeApp(config);
  var database = firebase.database();

  //Google singin provider
  var ggProvider = new firebase.auth.GoogleAuthProvider();
  //Facebook singin provider
  //Login in variables
  const btnGoogle = document.getElementById("btnGoogle");

  //Sing in with Google
  btnGoogle.addEventListener(
    "click",
    (e) => {
      firebase
        .auth()
        .signInWithPopup(ggProvider)
        .then(function (result) {
          var token = result.credential.accessToken;
          var user = result.user;
          console.log("User>>Goole>>>>", user);
          userId = user.uid;
        })
        .catch(function (error) {
          console.error("Error: hande error here>>>", error.code);
        });
    },
    false
  );
})();
