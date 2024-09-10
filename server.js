const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servimos archivos estáticos (como HTML, JS) desde la carpeta 'public'
app.use(express.static('public'));

// Evento de conexión para los usuarios
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');

    // Recibe y reenvía las ofertas WebRTC
    socket.on('offer', (offer) => {
        socket.broadcast.emit('offer', offer);
    });

    // Recibe y reenvía las respuestas WebRTC
    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
    });

    // Recibe y reenvía los candidatos ICE
    socket.on('ice-candidate', (candidate) => {
        socket.broadcast.emit('ice-candidate', candidate);
    });

    // Usuario desconectado
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
