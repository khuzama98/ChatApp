  // Initialize Firebase
  
  "use strict";
  var config = {
    apiKey: "AIzaSyAsCcMr4mqFf9SKRGUx-XqXSfTU18OvAJM",
    authDomain: "chatapplication98.firebaseapp.com",
    databaseURL: "https://chatapplication98.firebaseio.com",
    projectId: "chatapplication98",
    storageBucket: "chatapplication98.appspot.com",
    messagingSenderId: "236881188168"
};
firebase.initializeApp(config);


window.addEventListener('load', async e =>{
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../sw.js')
          .then(() => {
              console.log('service worker')
          })
          .catch(error =>{
            console.log(error)
          })
    }
    else{
      console.log('no serviceWorker')
    }
  })


const facebookSignup = async () => {
    var provider = new firebase.auth.FacebookAuthProvider();
    await firebase.auth().signInWithPopup(provider)
    .then(async (result) => {
        const { uid , displayName , email , photoURL } = result.user;
        localStorage.setItem('UserAuth',JSON.stringify(result.user))
        let users = {
            uid,
            displayName,
            email,
            photoURL
        }
        await firebase.database().ref('chat-users').child(uid).child('data').set(users)
        .then((success) => {
            swal({
                title: "SIGNUP SUCCESSFUL!",
                text: "Please signin to continue!",
                icon: "success",
            })
            .then(() => {
                location='../pages/signin.html';
            })
        })
    })
    .catch(function(error) {
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    });
}

const facebookSignin = async () => {
    var provider = new firebase.auth.FacebookAuthProvider();
    let check =true;
    let toSave;
    await firebase.auth().signInWithPopup(provider)
    .then(async (result) => {
        toSave=result.user;
        await firebase.database().ref('chat-users')
        .once('value', data => {
            let userdata = data.val();
            for(let key in userdata)
            {
                console.log(key,result.user.uid)
                if(key===result.user.uid){
                    console.log('success')
                    check=false;
                    break;
                }
            }
        })
        .then(() => {
            swal({
                title: "SIGNIN SUCCESSFUL!",
                text: "You have successfully signed in!",
                icon: "success",
            })
            .then(() => {
                localStorage.setItem('UserAuth',JSON.stringify(toSave));     
                location='../pages/chat.html';
            })
            .catch(function(error) {
                swal({
                    title: "Warning!",
                    text: `${error.message}!`,
                    icon: "warning",
                });
            });
            if(check){   
                swal({
                    title: "Warning!",
                    text: `Please Signup First to continue!`,
                    icon: "warning",
                });
            }
        })
    })
    .catch(function(error) {
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    });
}
const emailSignup = async () => {
    const displayName = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if(displayName !== '' && email !== '' && password !== ''){
        await firebase.auth().createUserWithEmailAndPassword(email,password)
        .then(async (result) => {
            const { uid } = result.user;
            let users = {
                uid,
                displayName,
                email,
                photoURL : 'undefined'
            }
            
            await firebase.database().ref('chat-users').child(uid).child('data').set(users)
            .then((success) => {
                swal({
                    title: "SIGNUP SUCCESSFUL!",
                    text: "Please signin to continue!",
                    icon: "success",
                })
                .then(() => {
                    location='../pages/signin.html';
                })
                
            })
        })
        .catch((error) => {
            swal({
                title: "Warning!",
                text: `${error.message}!`,
                icon: "warning",
            });
        })
    }
    else{
        swal({
            title: "Warning!",
            text: `Please Enter Email And Password!`,
            icon: "warning",
        });
    }
}

const signin = async () => {

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if(email !== '' && password !== ''){
        await firebase.auth().signInWithEmailAndPassword(email,password)
        .then((result) => {
            swal({
                title: "SIGNIN SUCCESSFUL!",
                text: "You have successfully signed in!",
                icon: "success",
            })
            .then(() => {
                localStorage.setItem('UserAuth',JSON.stringify(result.user));     
                location='./chat.html';
            })
        })
        .catch((error) => {
            swal({
                title: "Warning!",
                text: `${error.message}!`,
                icon: "warning",
            });
        })
    }
    else{
        swal({
            title: "Warning!",
            text: `Please Enter Email And Password!`,
            icon: "warning",
        });
    }
}

