const socket = io();

// Obtiene el audio del otro usuario
const remoteAudio = document.getElementById('remoteAudio');

let localStream;
let peerConnection;

// Configuración de servidores STUN para WebRTC
const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
    ]
};

// Crear PeerConnection y enviar oferta
async function createOffer() {
    peerConnection = new RTCPeerConnection(servers);
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
}

// Captura el stream de audio local
document.getElementById('joinRoomBtn').addEventListener('click', async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    createOffer();
});

// Responde a las ofertas recibidas
socket.on('offer', async (offer) => {
    peerConnection = new RTCPeerConnection(servers);
    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
    };

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

// Recibe respuestas
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Manejo de candidatos ICE
socket.on('ice-candidate', (candidate) => {
    const newCandidate = new RTCIceCandidate(candidate);
    peerConnection.addIceCandidate(newCandidate);
});
