
var app = angular.module("chatapp", ['ngSanitize', 'emojiApp','ngMessages']);

app.controller("chatAppController", function ($scope, $http) {
    
    $scope.emojiMessage={};
    var loggedIn = { nameEntered: false };

    var currentChatTimestamp = 0;



    //Object for each message sent.
    var eachMessage = {
        sender: "",
        text: "",
        speechBubbleColor: "",
        speechTextColor:""
    };
    
    var messages = [];
    //Convert hex to rgb value
    function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
    function getCorrectTextColor() {
        var currentColor = eachMessage.speechBubbleColor;
        //console.log("currentColor: ", currentColor);
        var rgbVal = hexToRgb(currentColor);
        var C = [ rgbVal.r, rgbVal.g, rgbVal.b ];
        var L = C[0]*0.299 + C[1]*0.587 + C[2]*0.114;
        if ( L > 182 ) {
            return true; //black
        } else {
            return false; //white
        }
        
    }

    function getMessages(currTime) {
        $http({
            method: "GET",
            url: "/message",
            params: {
                sent: eachMessage.sender,
                timeSent: currTime,
                
            }
        }).success(function (res) {
                if (res.success) {
                    var allMsgs = res.data;
                    for (var i = 0; i < allMsgs.length; i++) {
                        var eachMsg = allMsgs[i];
                        eachMsg.me = false;
                        messages.push(eachMsg);
                    }
                    currentChatTimestamp = res.currentChatTimestamp;
                } else {
                    alert(res.err);
                }
            });
    }
    //Select a chat bubble color that is unique from those already selected.
    function getAllColors() {
        $http({
            method: "GET",
            url: "/colors"
        }).success(function (res) {
                if (res.success) {
                    var numTries = 10;
                    var uniqueColors = res.data;
                    var colors = ['#FF9500', '#0B93F6', '#FF5E3A','#87FC70', '#52EDC7','#DBDDDE','#EF4DB6','#4CD964','#FFCC00','#ff3b30','#4cd964',
                    '#980000', '#ff0000','#ff9900','#ffff00','#00ff00', '#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff'];

                    var colorToPick = colors[Math.floor(Math.random() * colors.length)];
                    //select a distinct color for each person - but limit number of tries to avoid infinite loop
                    while (uniqueColors.indexOf(colorToPick) > -1 && numTries > 0) {
                        colorToPick = colors[Math.floor(Math.random() * colors.length)];
                        numTries-=1;
                    }
                    //console.log("color Chosen!: ", colorToPick);
                    eachMessage.speechBubbleColor = colorToPick;

                    //This is to ensure that the text can be seen inside the speech bubble 
                    if (getCorrectTextColor()) {
                        eachMessage.speechTextColor='black';
        }
                     else {
                    eachMessage.speechTextColor='white';   
        }
                   
                } else {
                    alert(res.err);
                }
            });
    }

    //When login button is selected, this function is called
    function enterChat() {
        getAllColors();
        console.log("get all colors finished executing");
        //Set field as logged in.
        loggedIn.nameEntered = true;
        //Get all the messages up to this point
        getMessages(currentChatTimestamp);

        //Keep checking for new messages
        setInterval(function(){
            getMessages(currentChatTimestamp);
        }, 1700);
    }

    //This is to allow users to send emoji's! 
     $scope.emojiMessage.replyToUser = function()
            {
                $http({
                method: "POST",
                url: "/message",
                params: eachMessage
            }).success(function (res) {
                    if (res.success) {
                        var myMessage = res.data;
                        myMessage.me = true;                    
                        messages.push(myMessage);
                        eachMessage.text = "";
                        //This is to ensure div is empty once message has been sent
                        $('#messageDiv').html('');
                    } else {
                        alert(res.err);
                    }
                });
            }

    $scope.loggedIn = loggedIn;
    $scope.eachMessage = eachMessage;
    $scope.messages = messages;
    $scope.enterChat = enterChat;

});


app.directive('scrollToLast', ['$location', '$anchorScroll', function($location, $anchorScroll){
  
  function linkFn(scope, element, attrs){
      $location.hash(attrs.scrollToLast);
      $anchorScroll();
  }
  
  return {
    restrict: 'AE',
    scope: {
      
    },
    link: linkFn
  };
  
}]);

