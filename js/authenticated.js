  // Initialize Firebase
  "use strict";
  let config = {
    apiKey: "AIzaSyAsCcMr4mqFf9SKRGUx-XqXSfTU18OvAJM",
    authDomain: "chatapplication98.firebaseapp.com",
    databaseURL: "https://chatapplication98.firebaseio.com",
    projectId: "chatapplication98",
    storageBucket: "chatapplication98.appspot.com",
    messagingSenderId: "236881188168"
};
firebase.initializeApp(config);


const defaultImg = '../images/empty-avatar.png';
let data = localStorage.getItem('UserAuth');
data = JSON.parse(data);
let profilepic = data.photoURL;
const myKey = data.uid;
if(profilepic===undefined || profilepic==='undefined' || profilepic===null)
profilepic=defaultImg;

window.addEventListener('load', async () => {
    await allUsers();
    await showFriends();
    checkLengthFriend();
    
})

document.querySelector('.goBack').addEventListener('click', () => {
    goBack();
})

document.getElementById('status-away').addEventListener('click',async () => {
    await pendingRequests();
    setTimeout( () =>{
        const ul = document.getElementById('ulPending');
        let checkLength = ul.getElementsByTagName('li');
        if(checkLength.length===0){
            ul.innerHTML = `<li class='contact'>
            <div class='wrap'>
            <p>You have no pending request</p>
            </div>
            </li>`;
        }
    },4000);
    
})

const getUserName = async () => {
    const onDisplay = document.getElementById('username');
    const onDisplayPic = document.getElementById('profile-img');
    if(data !== null && data.user !=='null'){
        await firebase.database().ref('chat-users').child(data.uid)
        .once('value',(data)=>{
            let userdata = data.val();
            onDisplay.innerHTML = userdata.data.displayName;
            if(userdata.data.photoURL===undefined || userdata.data.photoURL==='undefined')
            onDisplayPic.src = defaultImg;
            else{
                onDisplayPic.src = userdata.data.photoURL;
                profilepic = userdata.data.photoURL;
            }
            
        })
    }
    else{
        swal({
            title: "Warning!",
            text: `Please Signin to continue!`,
            icon: "warning",
        })
        .then(()=> {
            location='../pages/signin.html';
        })
    }
}

let contacts = [];
const allUsers = async () => {
    
    if(data !== null && data.user !=='null'){
        await getUserName();
        await firebase.database().ref('chat-users')
        .once('value',(data)=>{
            let userdata = data.val();
            for(let key in userdata){
                userdata[key].data.uid = key;
                contacts.push(userdata[key].data)
            }   
        })
        let sent = [];
        await firebase.database().ref('chat-users').child(data.uid).child('sent')
        .once('value',(data) => {
            let userdata = data.val();
            for(let key in userdata){
                sent.push(userdata[key].sentTo)
            }
        })
        
        let friend = [];
        await firebase.database().ref('chat-users').child(data.uid).child('friends')
        .once('value',(data) => {
            let userdata = data.val();
            for(let key in userdata){
                friend.push(userdata[key].key)
            }
        })
        for(let key in sent){
            updateSentStatus(sent[key],contacts)
        }
        for(let key in friend){
            updateFriendStatus(friend[key],contacts)
        }
        requests =[];
        reqData =[];
    }
    else{
        location='../pages/signin.html';
    }
}

const updateSentStatus = (key,Arrays) => {
    for(let keys in Arrays){
        if(Arrays[keys].uid === key){
            Arrays[keys].status = 'sent'
            break;
        }
    }
}

const updateFriendStatus = (key,Arrays) => {
    for(let keys in Arrays){
        if(Arrays[keys].uid === key){
            Arrays[keys].status = 'friend'
            break;
        }
    }
}

const showContacts = async () => {
    contacts = [];  
    await allUsers();
    document.querySelector('.contactHeading').innerHTML = 'Add Contact';
    const ul = document.getElementById('ulContact');
    ul.innerHTML = ''; 
    for(let key in contacts)
    {
        if(contacts[key].uid !== data.uid && contacts[key].status === 'friend'){
            if(contacts[key].photoURL===undefined || contacts[key].photoURL==='undefined'){
                contacts[key].photoURL=defaultImg;
            }
            ul.innerHTML += `
            <li class="contact">
            <div class="wrap">
            <img src="${contacts[key].photoURL}" alt="" />
            <div class="meta">
            <p class="name">${contacts[key].displayName}</p>
            <a style="background-color:green;" class='reqBtn' href='JavaScript:void(0)'>Friends</a>
            </div>
            </div>
            </li>
            `
        }
        else if(contacts[key].uid !== data.uid && contacts[key].status === 'sent'){
            if(contacts[key].photoURL===undefined || contacts[key].photoURL==='undefined'){
                contacts[key].photoURL=defaultImg;
            }
            ul.innerHTML += `
            <li class="contact">
            <div class="wrap">
            <img src="${contacts[key].photoURL}" alt="" />
            <div class="meta">
            <p class="name">${contacts[key].displayName}</p>
            <a style="background-color:green;" class='reqBtn' href='JavaScript:void(0)'>Sent</a>
            </div>
            </div>
            </li>
            `
        }
        else if(contacts[key].uid !== data.uid){
            if(contacts[key].photoURL===undefined || contacts[key].photoURL==='undefined'){
                contacts[key].photoURL=defaultImg;
            }
            ul.innerHTML += `
            <li class="contact">
            <div class="wrap">
            <img src="${contacts[key].photoURL}" alt="" />
            <div class="meta">
            <p class="name">${contacts[key].displayName}</p>
            <a onclick='sentRequest(this,"${contacts[key].uid}")' class='reqBtn' href='JavaScript:void(0)'>Request</a>
            </div>
            </div>
            </li>
            `
        }
    }
    document.getElementById('ulFriend').style.display='none';
    document.getElementById('ulPending').style.display='none';
    ul.style.display='block';
}

const signout = async () => {
    firebase.auth().signOut()
    .then(function() {
        localStorage.setItem('UserAuth',JSON.stringify({user:"null"}))
        location='./signin.html';
    })
    .catch(function(error) {
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    });
}

const sentRequest = async (btn,key) => {
    let req = {
        reqFrom: data.uid
    }
    let sent = {
        sentTo: key
    }
    await firebase.database().ref('chat-users').child(data.uid).child('sent').push(sent)
    .then(async (success) => {
        btn.style.backgroundColor = 'green';
        btn.innerHTML = 'Sent';
        btn.setAttribute('onclick','');
    })
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
    await firebase.database().ref('chats').child('pendings').child(key).push(req)
    .then(async (success) => {
        let id = success.key;
        await firebase.database().ref('chats').child('pendings').child(key).child(id)
        .once('value',async (data)=>{
            let userData = data.val();
            userData.key = id;
            await firebase.database().ref('chats').child('pendings').child(key).child(id).set(userData)
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

const showOptions = () =>{
    let options = document.getElementById('status-options');
    let check = options.classList.contains('active');
    check ? options.classList.remove('active') : options.classList.add('active')
}

let requests = [];
let reqData = [];
const pendingRequests = async () => {
    showOptions();
    const ul = document.getElementById('ulPending');
    document.querySelector('.contactHeading').innerHTML = 'Pending Requests';
    ul.innerHTML = '';
    await firebase.database().ref('chats').child('pendings').child(data.uid)
    .on('child_added', async data => {
        let userdata = data.val();
        await firebase.database().ref('chat-users').child(userdata.reqFrom).child('data')
        .once('value', item => {
            let userData = item.val();
            if(userData.photoURL===undefined || userData.photoURL==='undefined'){
                userData.photoURL=defaultImg;
            }
            ul.innerHTML += `
            <li class="contact">
            <div class="wrap">
            <img src="${userData.photoURL}" alt="" />
            <div class="pendingMeta">
            <p class="name">${userData.displayName}</p>
            <div style='margin-top:5px;'>
            <a onclick='acceptRequest(this,"${userdata.reqFrom}","${userdata.key}")' class='acceptBtn' href='JavaScript:void(0)'>Accept</a>
            <a onclick='rejectRequest(this,"${userdata.reqFrom}","${userdata.key}")' class='rejectBtn' href='JavaScript:void(0)'>Reject</a>
            </div>
            </div>
            </div>
            </li>
            `;
        })
    })
    document.getElementById('ulContact').style.display='none';
    document.getElementById('ulFriend').style.display='none';
    ul.style.display='block'
}


const acceptRequest = async (btn,key,pushKey) => {
    removeSent(key);
    let reqFrom = {
        key
    }
    let userFriend = {
        key:data.uid
    }
    btn.parentNode.parentNode.parentNode.parentNode.remove();
    checkLengthPending();
    await firebase.database().ref('chat-users').child(data.uid).child('friends').push(reqFrom)
    .then(()=>{})
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
    await firebase.database().ref('chat-users').child(key).child('friends').push(userFriend)
    .then(()=>{})
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
    await firebase.database().ref('chats').child('pendings').child(data.uid).child(pushKey).remove()
    .then(()=>{})
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
}

const rejectRequest = async (btn,key,pushKey) => {
    removeSent(key);
    await firebase.database().ref('chats').child('pendings').child(data.uid).child(pushKey).remove()
    .then(()=>{
        btn.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
    })
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
}

const removeSent = async (referKey) => {
    let keyToRemove;
    const id = data.uid;
    await firebase.database().ref('chat-users').child(referKey).child('sent')
    .once('value', (data) => {
        let userdata = data.val();
        for(let key in userdata){
            if(userdata[key].sentTo === id){
                keyToRemove = key;
                break;
            }
        }
    })
    .then(()=>{})
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
    await firebase.database().ref('chat-users').child(referKey).child('sent').child(keyToRemove).remove()
    .then(()=>{})
    .catch((error)=>{
        swal({
            title: "Warning!",
            text: `${error.message}!`,
            icon: "warning",
        });
    })
}

const showFriends = () => {
    const ul = document.getElementById('ulFriend');
    document.querySelector('.contactHeading').innerHTML = 'My Friends';
    document.getElementById('ulContact').style.display='none';
    document.getElementById('ulPending').style.display='none';
    ul.style.display='block';
}

const friendSync = firebase.database().ref('chat-users').child(myKey).child('friends');
friendSync.on('child_added', async data => {
    document.getElementById('ulFriend').innerHTML = '';
    show(data.val());
})
friendSync.on('child_removed', data => {
    let liToRemove = document.getElementById(data.val());
    liToRemove.remove();
})

const show =async (userdata) => {
    const ul = document.getElementById('ulFriend');
    await firebase.database().ref('chat-users').child(userdata.key).child('data')
    .once('value', item => {
        let userData = item.val();
        if(userData.photoURL===undefined || userData.photoURL==='undefined'){
            userData.photoURL=defaultImg;
        }
        ul.innerHTML += `
        <li id='${userdata.key}' onclick='showMessages("${userdata.key}","${userData.displayName}","${userData.photoURL}")' class="contact friendContact">
        <div class="wrap">
        <img src="${userData.photoURL}" alt="" />
        <div class="pendingMeta friendMeta">
        <p class="name">${userData.displayName}</p>
        <p class='msg'> Say Hello To ${userData.displayName}.</p>
        </div>
        </div>
        </li>
        ` 
    })
    .then(() => {
    })
}

const checkLengthFriend = () =>{
    const ul = document.getElementById('ulFriend');
    let checkLength = ul.getElementsByTagName('li');
    if(checkLength.length===0){
        ul.innerHTML = `<li class='contact'>
        <div class='wrap'>
        <p>You have 0 friends add contact to start chatting</p>
        </div>
        </li>`;
    }
}

const checkLengthPending = () =>{
    const ul = document.getElementById('ulPending');
    let checkLength = ul.getElementsByTagName('li');
    if(checkLength.length===0){
        ul.innerHTML = `<li class='contact'>
        <div class='wrap'>
        <p>You have no pending request</p>
        </div>
        </li>`;
    }
}

let keyForMessage;
const showMessages = async (key,name,photourl) => {
    keyForMessage = key;
    if(photourl==='undefined' || photourl===undefined)
    photourl=defaultImg;
    document.querySelector('.contentOverlay').style.display = 'none';
    document.querySelector('.changeProfilePanel').style.display = 'none';
    document.querySelector('.contentToShow').style.display = 'block';
    document.querySelector('#friendImg').src = photourl ;
    const sidepanel = document.querySelector('#sidepanel');
    const content = document.querySelector('.content');
    if(window.innerWidth<735){
        sidepanel.style.width= '0px';
        sidepanel.style.minWidth= '0px';
        content.style.transition = "width 0.3s";
        content.style.width = '100%';
    }
    const toChatWith = document.getElementById('toChatWith');
    const msgList = document.getElementById('msgList');
    toChatWith.innerHTML = name;
    msgList.innerHTML = '';
    const myKey = data.uid;
    let myPhoto = profilepic;
    if(myPhoto===undefined || myPhoto==='undefined' || myPhoto===null){
        myPhoto = defaultImg;
    }
    await firebase.database().ref('chats').child('friendChats').child(data.uid).child(keyForMessage)
    .on('child_added', data => {
        let userdata = data.val();
        let current = new Date();
        let sdate=new Date(userdata.time);
        let Year=sdate.getFullYear().toString();
        let currentYear=current.getFullYear().toString();
        let month=(sdate.getMonth()+1).toString();
        let currentMonth=(current.getMonth()+1).toString();
        let day=sdate.getDate().toString();
        let currentDay=current.getDate().toString();
        let toShowDate;
        let toShowTime;
        Year===currentYear && month===currentMonth && day===currentDay ? (toShowDate=`display:none`,toShowTime='display:inline-block') : (toShowDate=`display:inline-block`,toShowTime='display:none');
        let hh=Number(sdate.getHours());
        let unit = hh>11 ? 'PM' : 'AM'
        let mm=sdate.getMinutes().toString();
        hh =  hh===24 ?  hh+1 : hh
        hh = hh>12 ? (hh - 12).toString() : hh.toString();
        month.length===1 ? month=`0${month}` : month;
        day.length===1 ? day=`0${day}` : day;
        hh.length===1 ? hh=`0${hh}` : hh;
        mm.length===1 ? mm=`0${mm}` : mm;
        Year = Year.slice(2)
        let liType;
        let divType;
        let picToDisplay;
        if(userdata.sender!==myKey){
            liType = 'sent';
            divType = 'sentDiv';
            picToDisplay = photourl;
        }
        else{
            liType = 'replies';
            divType = 'repliesDiv';
            picToDisplay = myPhoto;
        }
        msgList.innerHTML += `<li class="${liType}">
        <div class="${divType}">
        <img src="${picToDisplay}">
        <p>${userdata.message}</p>
        <div>
        <span style='${toShowDate};padding:5px'>${day}/${month}/${Year}</span>
        <span style='${toShowTime};padding:5px'>${hh}:${mm} ${unit}</span>
        </div>
        </div>
        </li>`
    })
}

const createMessage = async () => {
    const message = document.querySelector('.message-input input').value;
    if(message !== ''){
        let time = firebase.database.ServerValue.TIMESTAMP
        const messageObj = {
            sender: data.uid,
            reciever: keyForMessage,
            message,
            time
        }
        await firebase.database().ref('chats').child('friendChats').child(data.uid).child(keyForMessage).push(messageObj)
        .then(()=>{})
        .catch((error)=>{
            swal({
                title: "Warning!",
                text: `${error.message}!`,
                icon: "warning",
            });
        })
        await firebase.database().ref('chats').child('friendChats').child(keyForMessage).child(data.uid).push(messageObj)
        .then(() => {
            document.querySelector('.message-input input').value = '';
        })
        .catch((error)=>{
            swal({
                title: "Warning!",
                text: `${error.message}!`,
                icon: "warning",
            });
        })
        
    }
}

document.querySelector('.submit').addEventListener('click', () => {
    createMessage();
})

const changepic = (e) => {
    let selectedImage = e.files[0];
    document.querySelector('#profilepic').src=window.URL.createObjectURL(selectedImage);
}

const updateProfile = () => {
    showOptions();
    document.querySelector('#profilepic').src = profilepic;
    document.querySelector('.contentOverlay').style.display = 'none';
    document.querySelector('.contentToShow').style.display = 'none';
    document.querySelector('.changeProfilePanel').style.display = 'flex';
    const sidepanel = document.querySelector('#sidepanel');
    const content = document.querySelector('.content');
    if(window.innerWidth<735){
        sidepanel.style.width= '0px';
        sidepanel.style.minWidth= '0px';
        content.style.transition = "width 0.3s";
        content.style.width = '100%';
    }
}

const updateImg = async (btn) => {
    let uploader = document.getElementById('uploader');
    let img = uploader.files[0];
    let imgUrl = "";
    if(img!==undefined){
        btn.innerHTML = 'Uploading..'
        await firebase.storage().ref('profilePics/' + img.name).put(img)
        .then(async (success)=>{
            await firebase.storage().ref('profilePics/' + img.name).getDownloadURL()
            .then(async (url)=>{
                btn.innerHTML = 'Upload';
                imgUrl = url;
                await firebase.database().ref('chat-users').child(data.uid).child('data')
                .once('value',async (datas)=>{
                    let userData = datas.val();
                    userData.photoURL = imgUrl;
                    await firebase.database().ref('chat-users').child(data.uid).child('data').set(userData)
                })
                .then(()=>{
                    swal({
                        title: "Success!",
                        text: `Image Successfully uploaded!`,
                        icon: "success",
                    });
                })
                .catch((error) => {
                    swal({
                        title: "Warning!",
                        text: `${error.message}!`,
                        icon: "warning",
                    });        
                })
            })
        })
        .catch((error)=>{
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
            text: `Please Choose an image!`,
            icon: "warning",
        });
    }
}

const goBack = () => {
    const sidepanel = document.querySelector('#sidepanel');
    const content = document.querySelector('.content');
    if(window.innerWidth<735){
        sidepanel.style.transition = "width 0.3s";
        sidepanel.style.width = '100%';
        content.style.width= '0px';
        content.style.minWidth= '0px';
    }
}
