const express=require('express');

const app=express();

const socket=require('socket.io');

const server=app.listen(3000,()=>{
    console.log("Server is running")
})

const bodyParser=require('body-parser');

app.use(bodyParser.json());

app.set('view engine','ejs');
app.set('views','./views');

app.use(express.static('public'));

const userRoute=require('./routes/userRoute');

app.use('/',userRoute);

//socket io working with signaling server

var io=socket(server);
io.on('connection',function(socket){
    console.log("user connected: "+socket.id);

    socket.on('join',function(roomname){
        var rooms=io.sockets.adapter.rooms; //create default room.


       var room= rooms.get(roomname); //get room from client.
       console.log(room);
 
       //if client has not pass any room.so only one user joined the room
       if(room==undefined){
        socket.join(roomname); // create a room
        socket.emit("created");
        console.log("Room Joined");
       }else if(room.size==1){  //I want 2 user chat so if room size is only one then another user can join the room.
           socket.join(roomname);
           socket.emit("joined");
       }else{
         socket.emit("full")
         console.log("Room full for now"); //not more than 2 user joined the room.
       }
       console.log(rooms);
    });

     //1st step ready for join
    socket.on("ready",function(roomName){
        socket.broadcast.to(roomName).emit("ready");
    });
    //second step==>candidate in both side. first getting the candidate on server side then sending the candidate in client side.
    socket.on("candidate",function(candidate,roomName){
       socket.broadcast.to(roomName).emit("candidate",candidate)
    });

    //create an offer==>create on both side. so getting the offer on server side and sending to the clinet side.
    socket.on("offer",function(offer,roomName){
        console.log("offer");
        console.log(offer);
       socket.broadcast.to(roomName).emit("offer",offer);
    });

    //answer step. either cut the call or pick up.
    socket.on("answer",function(answer,roomName){
        console.log("answer");
       socket.broadcast.to(roomName).emit("answer",answer); //sending ans to the client .

    });
     
})