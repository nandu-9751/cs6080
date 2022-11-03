import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

// server started
console.log('Starting...');

// by default, token and userId is null and profile button cannot use
let token = null;
let userId = null;

//console.log(document.getElementById('sidebar-welcome').innerHTML);

// helper function to clear out localStorage after closing browser
// not working
/* function clearStorage() {
    let session = sessionStorage.getItem('register');

    if (session == null) {
    
        localStorage.removeItem('remove');

    }
    sessionStorage.setItem('register', 1);
}
window.addEventListener('load', clearStorage); */

// helper function to send data to backend
const makeRequest = (route, method, body) => {
    const baseOptions = {
        method: method,
        headers: {
            'Content-type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
    };
    if (body !== undefined) {
        baseOptions.body = JSON.stringify(body);
    }
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5005'+route, baseOptions).then((rawdata) => {
            return rawdata.json();
        }).then((data) => {
            if (data.error) {
                alert(data.error);
            }
            else {
                resolve(data);
            }
        });
    });
    
}

// login: hide login\register form and all welcome msg, display main page and profile button
const login = () => {
    document.getElementById('login').classList.add('hide');
    document.getElementById('register').classList.add('hide');
    document.getElementById('sidebar-welcome').classList.add('hide');
    document.getElementById('main-page').classList.remove('hide');
    document.getElementById('user-center').classList.remove('hide');  
    document.getElementById('back-to-homepage').classList.remove('hide');  
    document.getElementById('create-channel').classList.remove('hide');
    displayChannels();
};

// logout: hide main and profile, go to login form, and reset userId and token
const logout = () => {
    document.getElementById('login').classList.remove('hide');
    document.getElementById('register').classList.add('hide');
    document.getElementById('sidebar-welcome').classList.remove('hide');
    document.getElementById('main-page').classList.add('hide');
    document.getElementById('user-center').classList.add('hide');
    document.getElementById('back-to-homepage').classList.add('hide'); 
    document.getElementById('create-channel').classList.add('hide');
    token = null;
    userId = null;
}

// empty the div view-users
const stopDisplayUsers = () => {
    document.getElementById('view-users').innerText = '';
}

// hide edit profile page
document.getElementById('cancel-update-profile-btn').addEventListener(('click'), () => {
    document.getElementById('update-profile-page').classList.add('hide');
    document.getElementById('user-center-page').classList.remove('hide');
});

// delete current user details
const deleteUserlInfo = () => {
    document.getElementById('user-center-page').textContent = '';
};

// display the user's details
// order could be messed; if messed up change this function's order
const displayUserDetails = (userId) => {
    console.log('user wants to display profile')
    //document.getElementById('update-profile-page').classList.remove('hide');
    makeRequest('/user/'+userId, 'GET').then((data) =>{
        if (data.error) {
            alert(data.error);
        }
        else {
            console.log(data);
            const userName = document.createElement('div');
            userName.innerText = 'Username: '+data.name;
            const userEmail = document.createElement('div');
            userEmail.innerText = 'User email: '+data.email;
            const userPassword = document.createElement('div');
            userPassword.innerText = 'Password: **********';
            const userPhoto = document.createElement('div');
            if (data.image === null) {
                userPhoto.innerText = 'The user didn\'t provide a photo. '
            }
            else {
                userPhoto.innerText = data.image;
            }
            document.getElementById('user-center-page').appendChild(userName);
            document.getElementById('user-center-page').appendChild(userEmail);
            document.getElementById('user-center-page').appendChild(userPassword);
            document.getElementById('user-center-page').appendChild(userPhoto);

            // hide or unhide sections
            document.getElementById('update-user-detail').classList.remove('hide');
            document.getElementById('cancel-update-profile').classList.remove('hide');
            document.getElementById('create-channel-section').classList.add('hide');
        }
    });
};

// user log in function
document.getElementById('login-btn').addEventListener(('click'), (e)=> {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pwd = document.getElementById('login-pwd').value;
    //console.log('login button clicked', email, pwd);
    if (email === '' || pwd === '') {
        alert('Please fill in all blank');
    }
    else {        
        //send data to backend
        makeRequest('/auth/login', 'POST', {
            email: email,
            password: pwd
        }).then((data) => {
            token = data.token;
            userId = data.userId;
            // console.log(data);
            // console.log(userId);
            deleteUserlInfo();
            login();
            // user can view his/her detail via user button
            document.getElementById('user-center-btn').addEventListener(('click'), () => {
                document.getElementById('channel-details').classList.add('hide');
                deleteUserlInfo();
                document.getElementById('user-center-page').classList.remove('hide');
                document.getElementById('main-page').classList.add('hide');
                displayUserDetails(userId);
            });
            // edit profile
            document.getElementById('update-user-detail-btn').addEventListener(('click'), () => {
                document.getElementById('update-profile-page').classList.remove('hide');
                document.getElementById('user-center-page').classList.add('hide')
            });
                // send data to backend
            document.getElementById('submit-new-user-detail-btn').addEventListener(('click'), () => {
                const newName = document.getElementById('change-username').value;
                const newEmail = document.getElementById('change-email').value;
                const newPwd = document.getElementById('change-password').value;
                const newBio = document.getElementById('change-bio').value;
                let newImg = document.getElementById('change-img').src;
                if (document.getElementById('change-img').src === null) {
                    newImg = 'https://www.pngmart.com/files/21/Among-Us-Transparent-PNG.png';
                }
                console.log(newName, newEmail, newPwd, newBio, newImg);
                makeRequest('/user', 'PUT', {
                    email: newEmail,
                    password: newPwd,
                    name: newName,
                    bio: newBio,
                    image: newImg
                }).then((data) => {
                    if (data.error) {
                        alert(data.error);
                    }
                    else {
                        alert('Details successfully updated!')
                        console.log(data);
                    }
                });
            });
        });
        // store user msg to localStorage, so can keep after refresh
        /* localStorage.setItem('email', email);
        window.onload = function() {
            const email = localStorage.getItem('email');
            if (email !== null) {
                document.getElementById('login').classList.add('hide');
                document.getElementById('main-page').classList.remove('hide');
            }
        }  */
    }
});

// user registration functions
document.getElementById('regi-btn').addEventListener(('click'), (e)=> {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const pwd = document.getElementById('pwd').value;
    const repwd = document.getElementById('re-pwd').value;
    //console.log('regi button clicked', email, name, pwd, repwd);
    if (email === '' || name === '' || pwd === '' || repwd === '') {
        alert('Please fill in all blank');
    }
    else if (pwd !== repwd) {
        alert('Two passwords don\'t match');
    }
    else if (pwd.length < 6) {
        alert('Your password should at least have 6 characters')
    }
    else {
        // successfully logged in, send data to backend
        makeRequest('/auth/register', 'POST', {
            email: email,
            name: name,
            password: pwd
        }).then((data) => {
            console.log(data);
            // display main page, hide regi
            token = data.token;
            userId = data.userId;
            login();
        });
    }
});

// user logout function
document.getElementById('logout-btn').addEventListener(('click'), () => {
    makeRequest('/auth/logout', 'POST').then(() => {
        logout();
        deleteUserlInfo();
        deleteChannels();
        deleteChannelInfo();
    });
    // hide all channels when log out
    document.getElementById('channel-holder').innerText='';
});

// show register section, hide login
document.getElementById('goToRegi').addEventListener(('click'), ()=> {
    document.getElementById('login').classList.add('hide');
    document.getElementById('register').classList.remove('hide');
});

// show login section, hide register
document.getElementById('goToLogin').addEventListener(('click'), ()=> {
    document.getElementById('login').classList.remove('hide');
    document.getElementById('register').classList.add('hide');
});

// channel functions

// a function to delete current channel's info
const deleteChannelInfo = () => {
    document.getElementById('channel-info').textContent = '';
};

// a function to delete all displayed channels
const deleteChannels = () => {
    document.getElementById('channel-holder').textContent = '';
};

// a function allowing user to join channel
const joinChannel = (channelID) => {
    makeRequest('/channel/'+channelID+'join', 'POST').then(() => {

    });
};

// a function to edit channel info
const editInfo = (channelID) => {
    const newName = document.getElementById('change-channel-name').value;
    const newDescription = document.getElementById('change-channel-description').value;
    makeRequest('/channel/'+channelID, 'PUT', {
        name: newName,
        description: newDescription
    }).then((data) => {
        if (data.error) {
            alert(data.error);
        }
        else {
            deleteChannels();
            displayChannels();
        }
    });
};

// delete all message of a channel
const deleteMsg = () => {
    document.getElementById('channel-msg').textContent = '';
};

// display all users function
const displayAllUsers = (channelID) => {
    //console.log('now displaying all users...')
    makeRequest('/user', 'GET').then((data) => {
        if (data.error) {
            alert(data.error);
        }
        else {
            stopDisplayUsers();
            // console.log(data);
            // getting users' id, using the id to get the user's name
            let userIds = []
            for (const i in data.users) {
                //console.log(data.users[i].id);
                userIds[i] = data.users[i].id;
            }
            getUserName(userIds, channelID);
        }
    });    
};

// display a channel's related info and other functions
const displayChannelInfo = (channelID) => {
    makeRequest('/channel/'+channelID, 'GET').then((data) => {
        if (data.error) {
            //console.log(data.error);
            // let the user join:
            // joinChannel();
        }
        else {
            // the user is a member of the channel,
            // he or she should be able to view the details
            console.log(data);
            document.getElementById('main-page').classList.add('hide');
            document.getElementById('create-channel-section').classList.add('hide');
            document.getElementById('channel-details').classList.remove('hide');
            const line = document.createElement('hr')
            const divName = document.createElement('div');
            divName.innerText = 'Channel name: ' + data.name;
            const divDescription = document.createElement('div');
            if (data.description === '') {
                divDescription.innerText = 'Channel description: No description entered';
            }
            else {
                divDescription.innerText = 'Channel description: ' + data.description;
            }
            const divType = document.createElement('div');
            if (data.private === false) {
                divType.innerText = 'Channel type: Public';
            }
            else {
                divType.innerText = 'Channel type: Private';
            }
            const divCreateTime = document.createElement('div');
            divCreateTime.innerText = 'Created at: ' + data.createdAt;
            const divCreater = document.createElement('div');
            divCreater.innerText = 'Created by: ' + data.creator;
            console.log(data.name, data.description, data.private, data.createdAt, data.creator);
            document.getElementById('channel-info').appendChild(divName);
            document.getElementById('channel-info').appendChild(divDescription);
            document.getElementById('channel-info').appendChild(divType);
            document.getElementById('channel-info').appendChild(divCreateTime);
            document.getElementById('channel-info').appendChild(divCreater);
            document.getElementById('channel-info').appendChild(line);

            // update a channel's name or description
            document.getElementById('update-channel-info-btn').addEventListener(('click'), () => {
                editInfo(channelID);
                alert('Successfully edited. ');
            }); 
        }
    });
};

// move here:
// for display all users function; use userId to get the user's name
const getUserName = (userIds, channelID) => {
    let userNames = []
    for (const i in userIds) {
        makeRequest('/user/'+userIds[i], 'GET').then((data) => {
            if(data.error) {
                alert(data.error);
            }
            else {
                userNames[i] = data.name;
                // create another section with usernames
                console.log(userNames[i]);
                const displayUser = document.createElement('div');
                const displayName = userNames[i];
                displayUser.innerText = displayName;
                displayUser.setAttribute('id', 'user-individual-'+userIds[i]);
                displayUser.setAttribute('class', 'user-block');
                displayUser.setAttribute('title', 'click to invite');
                document.getElementById('view-users').appendChild(displayUser);
                // when being clicked, the user is invited to this channel
                displayUser.onclick = function() {
                    makeRequest('/channel/'+channelID+'/invite', 'POST', {
                        userId: userIds[i]
                    }).then((data) => {
                        if (data.error) {
                            alert(data.error);
                        }
                        else {
                            // update this channel's info
                            deleteChannelInfo();
                            displayChannelInfo();
                            console.log(data);
                            alert('Successfully invited!')
                        }
                    })
                }
            }
        })
    }
};

// get user's profile pic function
const getImg = (userId) => {
    let userImg = '';
    makeRequest('/user/'+userId, 'GET').then((data) => {
        if (data.error) {
            alert(data.error);
        }
        else {
            //console.log(data);
            userImg = data.img;
            //console.log(userImg);
        }
    });
}

// display user's profile pic function
const displayImg = (userId) => {
    const userImg = document.createElement('img');
    const src = getImg(userId);
    if (src === undefined) {
        userImg.setAttribute('src', 'https://www.pngmart.com/files/21/Among-Us-Transparent-PNG.png')
    }
    else {
        userImg.setAttribute('src', src);
    }
    userImg.setAttribute('alt', 'user profile pic');
    userImg.setAttribute('class', 'profile-pic');
    document.getElementById('channel-msg').appendChild(userImg);
}

// a function to send message
const sendMessage = (channelID) => {
    const msg = document.getElementById('send-msg').value;
    const img = document.getElementById('send-img').src;
    if (msg === null | msg === undefined) {
        makeRequest('/message/'+channelID, 'POST', {
            message: '',
            image: img
        }).then((data) => {
            if(data.error) {
                alert(data.error);
            }
            else{
                console.log(data);
                deleteMsg();
                displayMsg(channelID);
            }
        })
    }
    makeRequest('/message/'+channelID, 'POST', {
        message: msg,
        image: ''
    }).then((data) => {
        if(data.error) {
            alert(data.error);
        }
        else{
            console.log(data);
            deleteMsg();
            displayMsg(channelID);
        }
    })
}

// display channel's messages:
const displayMsg = (channelID) => {
    // starting from 0
    makeRequest('/message/'+channelID+'?start=0', 'GET').then((data) => {
        if (data.error) {
            alert(data.error);
        }
        else{
            // console.log(data);
            for (const message of data.messages) {
                // console.log(message);  
                // display user's img
                const userId = message.sender;
                // console.log(userId); // -> user id are produced correctly
                displayImg(userId);
                const msgCreateTime = document.createElement('span');
                msgCreateTime.innerText = 'says at ' + message.sentAt + ': ';
                const msgText = document.createElement('div');
                msgText.innerText = message.message;
                msgText.setAttribute('class', 'chatbox');
                document.getElementById('channel-msg').appendChild(msgCreateTime);
                if (message.message === null | message.message === undefined) {
                    // no message means display img
                    const msgImg = document.createElement('img');
                    msgImg.src = document.getElementById('change-img').value;
                    document.getElementById('channel-msg').appendChild(msgImg);
                }
                else {
                    document.getElementById('channel-msg').appendChild(msgText);
                }
                // hover, allow user to react to message
                msgText.onmouseover = function() {
                    //todo
                };
                // mouse out, hide drop down
                msgText.onmouseOut = function() {
                    //todo
                };
                // click to edit the message
                msgText.onclick = function() {
                    let msg;
                    let newMsg = prompt('Please edit the message:', 'New message');
                    if (msg == null || msg == "") {
                        msgText.innerText = message.message;
                    } else {
                        msg = newMsg;
                        makeRequest('/message/'+channelID+'/'+message.id, 'PUT', {
                            message: msg,
                            image:''
                        }).then((data) => {
                            if (data.error) {
                                alert(data.error);
                            }
                            else {
                                console.log(data);
                            }
                        });
                    };
                    
                };
            };
        };
    });
    document.getElementById('send-msg-btn').addEventListener(('click'), () => {
        sendMessage(channelID);
        alert('Sent!');
    });
}

// display channels
const displayChannels = () => {
    makeRequest('/channel', 'GET').then((data) => {
        for (const channel of data.channels) {
            // create a span element which contains the channel's name
            const div = document.createElement('div');
            let channelID = channel.id;
            // maybe add <hr /> here?
            div.innerText = channel.name;
            const channelBlock = document.getElementById('channel-holder').appendChild(div);
            channelBlock.setAttribute('id', 'channel-individual'+channelID);
            if (channel.private === true) {
                channelBlock.setAttribute('class', 'private-channel');
            } else {
                channelBlock.setAttribute('class', 'channel-block');
            }
            const divider = document.createElement('br');
            document.getElementById('channel-holder').appendChild(divider);
            channelBlock.onclick = function() {
                // console.log(channelID);
                document.getElementById('update-profile-page').classList.add('hide');
                deleteChannelInfo();
                deleteMsg();
                displayChannelInfo(channelID);
                displayMsg(channelID);
                document.getElementById('user-center-page').classList.add('remove');
                document.getElementById('update-user-detail').classList.add('remove');
                document.getElementById('cancel-update-profile').classList.add('remove');
                // invite user; disable messages to save web space
                document.getElementById('view-user-btn').addEventListener(('click'), ()=> {
                    document.getElementById('channel-msg').classList.add('hide');
                    displayAllUsers(channelID);
                })
                // modify this to show more details

            };
        }
        //console.log(data);
    });
    //document.getElementById('channel-holder').classList.remove('hide');
};

// go to create channel form
document.getElementById('goto-create-channel-form').addEventListener(('click'), ()=> {
    document.getElementById('create-channel-section').classList.remove('hide');
    document.getElementById('main-page').classList.add('hide');
    document.getElementById('channel-details').classList.add('hide');
    document.getElementById('update-user-detail').classList.add('hide');
    document.getElementById('cancel-update-profile').classList.add('hide');
    document.getElementById('user-center-page').classList.add('hide');
    console.log('user wants to create a channel');
});

// finished entering details, add channel to the database
document.getElementById('channel-create-btn').addEventListener(('click'), ()=> {
    const channelName = document.getElementById('channel-name').value;
    const type = document.getElementById('channel-type').value;
    const description = document.getElementById('channel-description').value;
    console.log(channelName, type, description);

    let channelType = true;
    if (type === 'Public') {
        channelType = false;
    }

    makeRequest('/channel', 'POST', {
        name: channelName,
        private: channelType,
        description: description
    }).then((data) => {
        // delete all channels then display again. could be slow but it works --> but creates unnecessary br?
        deleteChannels();
        displayChannels();
        console.log(data);
    });

    // after creating the channel, go back to main page
    // or don't, user can use the home button anyway
});

// cancel create channel, go back to main page
document.getElementById('cancel-create-channel-btn').addEventListener(('click'), ()=> {
    document.getElementById('create-channel-section').classList.add('hide');
    document.getElementById('main-page').classList.remove('hide');
});

// home page btn clicked then go back to welcome page
document.getElementById('homepage-btn').addEventListener(('click'), ()=> {
    document.getElementById('main-page').classList.remove('hide');
    document.getElementById('login').classList.add('hide');
    document.getElementById('register').classList.add('hide');
    document.getElementById('create-channel-section').classList.add('hide');
    document.getElementById('channel-details').classList.add('hide');
    document.getElementById('user-center-page').classList.add('hide');
    document.getElementById('update-user-detail').classList.add('hide');
    document.getElementById('cancel-update-profile').classList.add('hide');
});