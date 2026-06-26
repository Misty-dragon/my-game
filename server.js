const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const players = {};

io.on("connection", (socket) => {
    console.log("Player joined:", socket.id);

    players[socket.id] = {
        x: 0,
        y: 1,
        z: 0,
        color: Math.random() * 0xffffff
    };

    socket.emit("currentPlayers", players);

    socket.broadcast.emit("newPlayer", {
        id: socket.id,
        player: players[socket.id]
    });

    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].z = data.z;

            io.emit("playerMoved", {
                id: socket.id,
                x: data.x,
                z: data.z
            });
        }
    });

    socket.on("disconnect", () => {
        console.log("Player left:", socket.id);

        delete players[socket.id];

        io.emit("playerDisconnected", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});