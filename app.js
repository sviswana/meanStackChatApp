
var express = require('express');
var mongodb = require('mongodb');

var app  = express();

app.use('/', express.static('./public'));

mongodb.MongoClient.connect("mongodb://localhost/meanchatdb", function(err, db){

    if(err) throw err;

    //Add new message to the database, with speech and text colors initialized.
    app.post('/message', function(req, res){
        var msgObj = {
            sender: req.query.sender,
            text:req.query.text,
            time: new Date().getTime(),
            speechBubbleColor: req.query.speechBubbleColor,
            speechTextColor:req.query.speechTextColor
        };
        
        
        db.collection('chatmessages').insert(msgObj, function(err, m){
            if(err){

                res.json({
                    err:"message not saved"
                });
            }
            else{
                res.json({
                    success:true, 
                    data:m[0]
                });
            }
        });
    });

    app.get('/colors', function(req, res){
            db.collection('chatmessages').distinct("speechBubbleColor", function(err, items) {
                if (err) {
                    res.json({
                        err:"could not fetch the unique colors!"
                    });
                }
                else {
                    res.json({
                        success:true,
                        data: items

                    });
                }
            });
            
        
    });


    app.get('/message', function(req, res){
        var timeSent = parseInt(req.query.timeSent);
       
        //if this is the very beginning of the chat, then just initialize the time since no messages to retrive
        if(timeSent == 0){

            res.json({
                success:true, 
                data:[], 
                currentChatTimestamp:new Date().getTime()
            });
        }
        else{
            //retrieve all the messages after this particular one, and for all senders that aren't 'me'
            db.collection('chatmessages').find({
                sender:{
                    $ne:req.query.sent
                },
                time:{
                    $gt:timeSent
                }
            }).sort({timeSent:1}).toArray(function(err, m){
                    if(err){
                        res.json({
                            err:"other messages not retrieved"
                        });
                    }else{
                        var timeToPrint;

                        if (m.length==0) {
                            timeToPrint = timeSent;
                        }
                        else{
                            timeToPrint = m[m.length -1].time
                        }
                        res.json({
                            success:true,
                            data:m,
                            currentChatTimestamp:timeToPrint
                        });
                       
                        
                    }
                });
        }
        
    });




    app.listen(8080, function(){
        console.log("Go to port 8080 to begin chatting!");
    });

});

