var activeRoom;

 function getMyProfile() {
   $.get("/fn/profiles/myProfile", "", function(profile){
     $("#title-username").text(JSON.parse(profile).firstName)
   });
 }

 function getRooms() {
   $.get("/fn/rooms/listRooms", "", function(rooms){
     rooms = JSON.parse(rooms)
     $("#rooms").empty()
     for(i=0;i<rooms.length;i++){
       $("#rooms").append(
         "<li data-id=\""+rooms[i].id+"\""+
             "data-name=\""+rooms[i].name+"\">"+
              "#"+rooms[i].name+
         "</li>"
       )
     }
   });
 };

 function addRoom() {
   var room = {
     name: $("#room-name-input").val(),
     purpose: "..."
   }
   $("#room-name-input").val('')
   $.post("/fn/rooms/newRoom", JSON.stringify(room), getRooms)
 }

 function selectRoom(event) {
   $("#rooms li").removeClass("selected-room")
   $(this).addClass("selected-room")
   activeRoom = this
   $("#messages-header").text("Messages in #"+$(this).data("name"))
   getMessages()
 }

 function getMessages() {
   var hash = $(activeRoom).data('id')
   console.log("Getting messages for room: "+hash)
   $.post("/fn/messages/listMessages", JSON.stringify(hash), function(messages){
     $("#messages").empty()
     messages = JSON.parse(messages)
     messages = messages.sort(function(a,b){
       timeA = new Date(a.timestamp)
       timeB = new Date(b.timestamp)
       return a.valueOf() < b.valueOf()
     })
     for(var i=0;i<messages.length;i++) {
       $("#messages").append("<li>"+messages[i].content+"</li>")
     }
   });
 }

 function sendMessage() {
   var text = $("#message-input").val()
   var message = {
     content: text,
     room: $(activeRoom).data('id')
   }

   $.post("/fn/messages/newMessage", JSON.stringify(message), function(){
     $("#message-input").val("")
     getMessages()
   })
 }



 function doRegister(){
   var arg = {
     username: $("#signupUsername").val(),
     firstName: $("#signupFirstname").val(),
     lastName: $("#signupLastname").val(),
     email: $("#signupEmail").val()
   };
   console.log('signup clicked');
   $.post("/fn/profiles/register", JSON.stringify(arg),
     function(hash) {
       console.log('register: '+hash)
       $.post("/fn/profiles/isRegistered", "",
           function(registered) {
               console.log('registered: '+registered)
               if(JSON.parse(registered)) {
                 getMyProfile()
                 $('#registerDialog').modal('hide');
               } else {
                 $('#registerDialog').modal('show');
               }
           });
     },
     "json"
   );
 }


 $(window).ready(function() {
    $.post("/fn/profiles/isRegistered", "",
        function(registered) {

            if(!JSON.parse(registered)){
                $('#registerDialog').modal('show')
            } else {
                getMyProfile()
                getRooms()
            }

        }
    ).error(function(response) {
        $("#messages").html(response.responseText)
    });

    $("#signupButton").click(doRegister)
    $("#room-name-button").click(addRoom)
    $("#rooms").on("click", "li", selectRoom)
    $("#message-button").click(sendMessage)
 });
