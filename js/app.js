  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAsCcMr4mqFf9SKRGUx-XqXSfTU18OvAJM",
    authDomain: "chatapplication98.firebaseapp.com",
    databaseURL: "https://chatapplication98.firebaseio.com",
    projectId: "chatapplication98",
    storageBucket: "chatapplication98.appspot.com",
    messagingSenderId: "236881188168"
  };
  firebase.initializeApp(config);

  facebookSignin = async () => {
    var provider = new firebase.auth.FacebookAuthProvider();
    await firebase.auth().signInWithPopup(provider)
    .then(async (result) => {
        const { uid , displayName , email , photoURL } = result.user;
        localStorage.setItem('UserAuth',JSON.stringify(result.user))
        let users = {
            displayName,
            email,
            photoURL
        }
        await firebase.database().ref('chat-users').child(uid).child('data').set(users)
        .then((success) => {
            location='../pages/chat.html';
        })
    })
    .catch(function(error) {
        console.log('Error ==> '+ error)
    });
  }

  emailSignup = async () => {
    const displayName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(displayName !== '' && email !== '' && password !== ''){
        await firebase.auth().createUserWithEmailAndPassword(email,password)
        .then(async (result) => {
            const { uid } = result.user;
            let users = {
                displayName,
                email,
                photoURL : 'undefined'
            }
            console.log(users)
            await firebase.database().ref('chat-users').child(uid).child('data').set(users)
            .then((success) => {
                location='../pages/signin.html';
            })
        })
        .catch((error) => {
            console.log('Error ==>' +error)
        })
    }
  }

  signin = async () => {
    // const displayName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if(email !== '' && password !== ''){
        await firebase.auth().signInWithEmailAndPassword(email,password)
        .then((result) => {
            localStorage.setItem('UserAuth',JSON.stringify(result.user))
            location='./chat.html'
        })
        .catch((error) => {
            console.log('Error ==>' +error)
        })
    }
  }

