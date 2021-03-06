const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


exports.sendMessage = functions.database.ref('{companycode}/messages/{toname}/{fromname}/{key}')
    .onCreate((csnapshot, context) => {
        let value = csnapshot.val();
        console.log('---------message---------------',value);
        var toname = context.params.toname;
        var company = context.params.companycode
        var fromname = context.params.fromname
        console.log('toname',toname)
        console.log('company', company)
        console.log('fromnaem', fromname)
        if(value.user.name == fromname) {
            admin.database().ref(company+'/users/'+toname).once('value', function(snapshot) {
                snapshot.forEach(function(child) {
                    //console.log(child)
                    if(child.key == 'token') {
                        var temp = child.val();
                        console.log('token', temp)
                        var totoken = temp;
                        const messages = [];
                        console.log('********************', JSON.stringify(value))
                        messages.push({
                            data: {
                                data: JSON.stringify(value),
                                fromname: fromname
                            },
                            token: totoken
                        });

                        //if(value.user.name == fromname) {
                        messages.push({
                            notification: {
                                title: 'Notification',
                                body: 'Message from '+fromname,
                            },
                            data: {
                                fromname: fromname
                            },
                            android: {
                                notification: {
                                    sound: 'default'
                                },
                            },
                            apns: {
                                payload: {
                                    aps: {
                                        sound: 'default'
                                    },
                                },
                            },
                            token: totoken
                        });
                        //
                        admin.messaging().sendAll(messages)
                        .then((res) => {
                            console.log('Successfully sent message:', res);
                            return;
                        })
                        .catch((err) => {
                            console.log('Error sending message:', err);
                        })
                    }
                })
                
            })
        }

    });

exports.sendGroupMessage = functions.database.ref('{companycode}/groupMessages/{gid}/{key}')
    .onCreate((csnapshot, context) => {
        let value = csnapshot.val();
        console.log('---------groupmessage---------------',value);
        var company = context.params.companycode;
        var gid = context.params.gid;
        var totoken = []
        var title = ""
        admin.database().ref(company+'/groups/' + gid).once('value', function(snapshot) {
            title = snapshot.val().title;
            var users = snapshot.val().users;
            admin.database().ref(company+'/users').once('value', function(msnapshot) {
                msnapshot.forEach(function(child) {
                    if (users.includes(child.key)) {
                        var temp = child.val().token;
                        console.log('token', temp)
                        totoken.push(temp)
                    }
                })
                var messages = {
                    data: {
                        data: JSON.stringify(value),
                        fromname: gid,
                        group: '1',
                    },
                    tokens: totoken
                };
               
                admin.messaging().sendMulticast(messages)
                .then((res) => {
                    console.log('Successfully sent message:', res);
                    return;
                })
                .catch((err) => {
                    console.log('Error sending message:', err);
                });
    
    
                //notifications
                var notification = {
                    notification: {
                        title: 'Notification',
                        body: 'Message from group',
                    },
                    data: {
                        fromname: gid,
                        group: '1',
                    },
                    android: {
                        notification: {
                            sound: 'default'
                        },
                    },
                    apns: {
                        payload: {
                            aps: {
                                sound: 'default'
                            },
                        },
                    },
                    tokens: totoken
                };
                admin.messaging().sendMulticast(notification)
                .then((res) => {
                    console.log('Successfully sent notification:', res);
                    return;
                })
                .catch((err) => {
                    console.log('Error sending notification:', err);
                });
            })
        })
    });
