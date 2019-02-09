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


let data = localStorage.getItem('UserAuth');
data = JSON.parse(data);

window.addEventListener('load', async () => {
    await allUsers();
    await showFriends();
})

document.getElementById('status-away').addEventListener('click',async () => {
    await pendingRequests();
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
            }
            
        })
    }
    else{
        location='../pages/signin.html';
    }
}

let contacts = [];
const allUsers = async () => {
    
    if(data !== null && data.user !=='null'){
        await getUserName();
        // let keyArray = [];
        await firebase.database().ref('chat-users')
        .once('value',(data)=>{
            let userdata = data.val();
            for(let key in userdata){
                userdata[key].data.uid = key;
                contacts.push(userdata[key].data)
                // keyArray.push(key)
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
        // console.log(friend)
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
    // const addBtn = document.querySelector('.addcontact');
    // const friendBtn = document.querySelector('#settings');
    // addBtn.style.display = 'none';
    // friendBtn.style.display = 'block';
    // const icon = addBtn.firstChild;
    // const textNode = addBtn.lastChild;
    document.querySelector('.contactHeading').innerHTML = 'Add Contact';
    const ul = document.getElementById('ul');
    ul.innerHTML = ''; 
    // addBtn.setAttribute('onclick','showFriends()');
    // icon.setAttribute('class','fa fa-user')
    // textNode.innerHTML = 'Friends'
    for(let key in contacts)
        {
            // console.log(contacts[key])
            if(contacts[key].uid !== data.uid && contacts[key].status === 'friend'){
                if(contacts[key].photoURL===undefined || contacts[key].photoURL==='undefined'){
                    // console.log(contacts[key].photoURL)
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
                    // console.log(contacts[key].photoURL)
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
                    // console.log(contacts[key].photoURL)
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
}

const signout = async () => {
    firebase.auth().signOut()
    .then(function() {
        localStorage.setItem('UserAuth',JSON.stringify({user:"null"}))
        location='./signin.html';
    }).catch(function(error) {
        console.log(error)
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
        // let id = success.key;
        // let Uid = data.uid;
        // await firebase.database().ref('chat-users').child(data.uid).child('sent').child(id)
        // .once('value',async (data)=>{
        //     let userData = data.val();
        //     userData.key = id;
        //     await firebase.database().ref('chat-users').child(Uid).child('sent').child(id).set(userData)
        // })
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
        console.log(error)
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
    const ul = document.getElementById('ul');
    document.querySelector('.contactHeading').innerHTML = 'Pending Requests';
    ul.innerHTML = '';
    await firebase.database().ref('chats').child('pendings').child(data.uid)
    .on('child_added', async data => {
        let userdata = data.val();
        console.log(userdata.reqFrom)
        await firebase.database().ref('chat-users').child(userdata.reqFrom).child('data')
        .once('value', item => {
            let userData = item.val();
            console.log(userData)
            if(userData.photoURL===undefined || userData.photoURL==='undefined'){
                // console.log(contacts[key].photoURL)
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
            // for(let key in userdata){
            //     requests.push({key:userdata[key].reqFrom,pushKey:userdata[key].key})
            // }
    })
    // console.log(requests)
    // .then(async () => {
    //     for(let key in requests){
    //         // console.log(requests[key])
    //         await firebase.database().ref('chat-users').child(requests[key].key).child('data')
    //         .once('value', data => {
    //             let userdata = data.val();
    //             userdata.uid = requests[key].key;
    //             userdata.pushUid = requests[key].pushKey;
    //             reqData.push(userdata);
    //         })
    //     }    
    //     console.log(reqData)
    // })
    // .catch((error) => {
    //     console.log(error)
    // })
}

const showPendingRequests = () => {
    // showOptions();
    // // reqData = [];
    // const ul = document.getElementById('ul');
    // document.querySelector('.contactHeading').innerHTML = 'Pending Requests';
    // ul.innerHTML = '';
    // for(let key in reqData){
    //     // console.log(reqData[key])
    //     ul.innerHTML += `
    //             <li class="contact">
    //             <div class="wrap">
    //             <img src="http://emilcarlsson.se/assets/louislitt.png" alt="" />
    //             <div class="pendingMeta">
    //             <p class="name">${reqData[key].displayName}</p>
    //             <div style='margin-top:5px;'>
    //             <a onclick='acceptRequest(this,"${reqData[key].uid}","${reqData[key].pushUid}")' class='acceptBtn' href='JavaScript:void(0)'>Accept</a>
    //             <a onclick='rejectRequest(this,"${reqData[key].uid}","${reqData[key].pushUid}")' class='rejectBtn' href='JavaScript:void(0)'>Reject</a>
    //             </div>
    //             </div>
    //             </div>
    //             </li>
    //             `
    // }
    // let checkLength = ul.getElementsByTagName('li');
    // if(checkLength.length===0){
    //     ul.innerHTML = `<li>
    //     <div class='wrap'>
    //     <p>You have 0 pending requests.</p>
    //     </div>
    //     </li>`;
    // }
}

const acceptRequest = async (btn,key,pushKey) => {
    removeSent(key);
    // console.log(result)
    let reqFrom = {
        key
    }
    let userFriend = {
        key:data.uid
    }
    btn.parentNode.parentNode.parentNode.parentNode.style.display = 'none';
    await firebase.database().ref('chat-users').child(data.uid).child('friends').push(reqFrom)
    await firebase.database().ref('chat-users').child(key).child('friends').push(userFriend)
    await firebase.database().ref('chats').child('pendings').child(data.uid).child(pushKey).remove();
}

const removeSent = async (referKey) => {
    let keyToRemove;
    const id = data.uid;
    await firebase.database().ref('chat-users').child(referKey).child('sent')
    .once('value', (data) => {
        let userdata = data.val();
        for(let key in userdata){
            // console.log(`${key} , ${userdata[key].sentTo} , ${referKey}`)
            if(userdata[key].sentTo === id){
                keyToRemove = key;
                // console.log(`${key} , ${userdata[key].sentTo} , ${id}`)
                break;
            }
        }
    })
    await firebase.database().ref('chat-users').child(referKey).child('sent').child(keyToRemove).remove();
}

const showFriends = async () => {
    // const addBtn = document.querySelector('.addcontact');
    // const friendBtn = document.querySelector('#settings');
    // addBtn.style.display = 'block';
    // friendBtn.style.display = 'none';
    const ul = document.getElementById('ul');
    document.querySelector('.contactHeading').innerHTML = 'My Friends';
    ul.innerHTML = '';
    const myKey = data.uid;
    // for(let key in contacts){
        // if(contacts[key].photoURL==='undefined' && contacts[key].status === 'friend'){
        //     console.log(contacts[key])
        //     contacts[key].photoURL=defaultImg;
        // }
        await firebase.database().ref('chat-users').child(myKey).child('friends')
        .on('child_added', async data => {
            let userdata = data.val();
            await firebase.database().ref('chat-users').child(userdata.key).child('data')
            .once('value', item => {
                let userData = item.val();
                if(userData.photoURL===undefined || userData.photoURL==='undefined'){
                    // console.log(contacts[key].photoURL)
                    userData.photoURL=defaultImg;
                }
                        // console.log(contacts[key].photoURL)
                ul.innerHTML += `
                    <li onclick='showMessages("${userdata.key}","${userData.displayName}","${userData.photoURL}")' class="contact friendContact">
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
                let checkLength = ul.getElementsByTagName('li');
                if(checkLength.length===0){
                    ul.innerHTML = `<li>
                    <div class='wrap'>
                    <p>You have 0 friends add contact to start chatting</p>
                    </div>
                    </li>`;
                }
            })
        })
        // if(contacts[key].uid !== data.uid && contacts[key].status === 'friend'){
        //     if(contacts[key].photoURL===undefined || contacts[key].photoURL==='undefined'){
        //         // console.log(contacts[key].photoURL)
        //         contacts[key].photoURL=defaultImg;
        //     }
        //     // console.log(contacts[key].photoURL)
        //     ul.innerHTML += `
        //     <li onclick='showMessages("${contacts[key].uid}","${contacts[key].displayName}","${contacts[key].photoURL}")' class="contact friendContact">
        //     <div class="wrap">
        //     <img src="${contacts[key].photoURL}" alt="" />
        //     <div class="pendingMeta friendMeta">
        //     <p class="name">${contacts[key].displayName}</p>
        //     <p class='msg'> Say Hello To ${contacts[key].displayName}.</p>
        //     </div>
        //     </div>
        //     </li>
        //     `
        // }
    // }
}

const defaultImg = '../images/empty-avatar.png';
let keyForMessage;
const showMessages = async (key,name,photourl) => {
    keyForMessage = key;
    if(photourl==='undefined' || photourl===undefined)
    photourl=defaultImg;
    document.querySelector('.contentOverlay').style.display = 'none';
    document.querySelector('.contentToShow').style.display = 'block';
    document.querySelector('#friendImg').src = photourl ;
    const toChatWith = document.getElementById('toChatWith');
    const msgList = document.getElementById('msgList');
    toChatWith.innerHTML = name;
    msgList.innerHTML = '';
    const myKey = data.uid;
    let myPhoto = data.photoURL;
    if(myPhoto===undefined || myPhoto==='undefined' || myPhoto===null){
        myPhoto = defaultImg;
    }
    await firebase.database().ref('chats').child('friendChats').child(data.uid).child(keyForMessage)
    .on('child_added', data => {
        let userdata = data.val();
        // for(let key in userdata){
            console.log(userdata)
            let sdate=new Date(userdata.time);
            let Year=sdate.getFullYear();
            let month=sdate.getMonth()+1;
            let day=sdate.getDate();
            let hh=sdate.getHours();
            let mm=sdate.getMinutes();
            let ss=sdate.getSeconds();
            let li = document.createElement('li');
            let img = document.createElement('img');
            let p = document.createElement('p');
            if(userdata.sender!==myKey){
                li.setAttribute('class','sent')
                img.setAttribute('src',photourl)
            }
            else{
                li.setAttribute('class','replies')
                img.setAttribute('src',myPhoto)
            }
            let textNode = document.createTextNode(userdata.message);
            p.appendChild(textNode);
            li.appendChild(img);
            li.appendChild(p);
            msgList.appendChild(li);
        // }
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
        console.log(messageObj)
        await firebase.database().ref('chats').child('friendChats').child(data.uid).child(keyForMessage).push(messageObj)
        await firebase.database().ref('chats').child('friendChats').child(keyForMessage).child(data.uid).push(messageObj)
        .then(() => {
            document.querySelector('.message-input input').value = '';
        })

    }
}

document.querySelector('.submit').addEventListener('click', () => {
    createMessage();
})