const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const fetch = require('node-fetch');

module.exports = function (server) {

    let nombreDePari = 0; // Variable pour suivre le nombre de joueurs ayant parié
    let joueurs = {};
    const connectedUsers = {};

    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        transports: ['websocket']
    });

    // Fonction pour récupérer les joueurs d'une salle et renvoie un tableau de joueurs
    async function getRoomPlayers(token, roomId, isMulti) {
        if(isMulti === true){
            const response = await fetch(`${process.env.PMU_API}/room/players/${roomId}`, {
                headers: {
                    'Authorization': token
                }
            });
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'ID de la salle');
            }
            const players = await response.json();
            return [...players.users, players.admin];
        }
        return;
    }

    async function emitToRoom(socket, roomId, eventName, data, isMulti) {
        if(isMulti === true){
        console.log('roomId', roomId)
        console.log('eventName', eventName)

        // Récupération du bearer token envoyé depuis le front
        const token = socket.handshake.query['Authorization']
        // Récupération des joueurs de la salle
        const players = await getRoomPlayers(token, roomId);

        // Envoi de l'événement à tous les joueurs de la salle
        for (const player of players) {
            if (connectedUsers[player.user_id]) {
                io.to(connectedUsers[player.user_id]).emit(eventName, data);
            }
        }
        }
    }

    io.on('connection', (socket) => {
        // Récupération de l'ID de l'utilisateur envoyé depuis le front
        const userId = socket.handshake.query['userId']

        // Enregistrement de l'ID de l'utilisateur et de son socket ID
        if (!connectedUsers[userId]) {
            connectedUsers[userId] = socket.id;
        }

        // affiche un message lorsqu'un joueur arrive dans le salon
        socket.on('joinRoom', async (room) => {
            socket.join(room);
            io.to(room).emit('message', `Le joueur ${socket.id} a rejoint la partie "${room}"`);
            console.log(`Le joueur ${socket.id} a rejoint la partie ${room}`);

            // Ajouter le joueur à une liste
            joueurs[socket.id] = { room, nom: socket.id, aParié: false }; // Initialiser le joueur avec le statut "aParié" à false

            // Stocker la salle dans une variable
            socket.room = room;

            try {
                // Faire un appel à la route /api/room/:id pour récupérer l'ID de la salle
                const response = await fetch(`${process.env.PMU_API}/room/${room}`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération de l\'ID de la salle');
                }
                const roomId = await response.text(); // Récupérer l'ID de la salle sous forme de texte brut
                io.to(room).emit('miseAJourListeJoueurs', Object.values(joueurs).filter(joueur => joueur.room === roomId));
            } catch (error) {
                console.error('Erreur lors de la requête à la route /api/room/:id:', error);
            }
        });

        // Affiche un message lorsqu'un joueur quitte le salon
        socket.on('disconnect', async () => {
            // Supprimer le joueur de la liste des joueurs
            delete joueurs[socket.id];
            
            // Récupérer l'ID de l'utilisateur envoyé depuis le front
            const userId = socket.handshake.query['userId']

            // Supprimer l'utilisateur de la liste des utilisateurs connectés
            if (connectedUsers[userId]) {
                delete connectedUsers[userId];
            }

            // Récupérer la salle à partir de laquelle le joueur se déconnecte
            const room = socket.room;

            // Quitter la salle
            socket.leave(room);
            io.to(room).emit('message', `Le joueur ${socket.id} a quitté la partie "${room}"`);
            console.log(`Le joueur ${socket.id} a quitté la partie ${room}`);

            // Mettre à jour la liste des joueurs dans la salle
            io.to(room).emit('miseAJourListeJoueurs', Object.values(joueurs).filter(joueur => joueur.room === room));
        });


        // affiche un message lorsque l'admin clique sur lancer la partie
        socket.on('lancerPartie', async () => {
            console.log(`La partie va bientôt commencer`);
            try {
                // Effectuer une action via la websocket, par exemple :
                io.emit('message', 'La partie va bientôt commencer'); // Envoyer un message à tous les clients
            } catch (error) {
                console.error('Erreur lors de l\'envoi de données via la websocket :', error);
            }
        });

        // augmente de 1 le nombre de joueur ayant parier sur l'écran de l'admin
        socket.on('parier', async () => {
            // Mettre à jour le drapeau "aParié" du joueur
            joueurs[socket.id].aParié = true;

            // Mettre à jour la liste des joueurs
            io.to(joueurs[socket.id].roomId).emit('miseAJourListeJoueurs', Object.values(joueurs).filter(joueur => joueur.roomId === joueurs[socket.id].roomId));

            // Augmenter le nombre de joueurs ayant parié
            nombreDePari++;
            io.emit('miseAJourNombrePari', nombreDePari);

            // Vérifier si tous les joueurs ont validé leur pari
            const room = joueurs[socket.id].roomId;
            try {
                // Vérifiez si tous les joueurs de la salle ont validé leur pari
                const response1 = await fetch(`${process.env.PMU_API}./round/${room}/bet`);
                const response2 = await fetch(`${process.env.PMU_API}./room/${room}`);
                const data1 = await response1.json();
                const data2 = await response2.json();

                // Vérifiez si tous les joueurs ont validé leur pari en comparant les données obtenues
                const tousLesJoueursOntParié = data1.some(joueur => joueur.aParié) && data1.length === data2.nombreDeJoueurs;

                // Si tous les joueurs ont validé leur pari, effectuez l'action nécessaire
                if (tousLesJoueursOntParié) {
                    // Faites quelque chose...
                    console.log("Tous les joueurs ont validé leur pari !");
                }
            } catch (error) {
                console.error('Erreur lors de la vérification des paris des joueurs:', error);
            }
        });

        // Lorsque le serveur reçoit un appel pour mettre à jour la position du pion
        socket.on('mettreAJourPositionPion', ({roomId, data}) => emitToRoom(socket, roomId, 'mettreAJourPosition', data));
        socket.on('deckChange', ({roomId, data}) => emitToRoom(socket, roomId, 'deckChange', data) );
        socket.on('navigate', ({roomId, data}) => emitToRoom(socket, roomId, 'navigate', data) );
        // Réception de l'événement pour mettre à jour le discard
        socket.on('discardChange', ({roomId, data}) => emitToRoom(socket, roomId, 'discardChange', data) );
        socket.on('showPopup', ({roomId, data}) => emitToRoom(socket, roomId, 'showPopup', data) );
        socket.on('clickedInconvenientChange', ({roomId, data}) => emitToRoom(socket, roomId, 'clickedInconvenientChange', data) );
        socket.on('SelectedHorseChange', ({roomId, data}) => emitToRoom(socket, roomId, 'SelectedHorseChange', data) );
        socket.on('InconvenientCardChange', ({roomId, data}) => emitToRoom(socket, roomId, 'InconvenientCardChange', data) );
        socket.on('StateInconvenientChange', ({roomId, data}) => emitToRoom(socket, roomId, 'StateInconvenientChange', data) );
        socket.on('ShowPopupInconvenientChange', ({roomId, data}) => emitToRoom(socket, roomId, 'ShowPopupInconvenientChange', data) );
        socket.on('finishParty', ({roomId, data}) => emitToRoom(socket, roomId, 'finishParty', data) );
        socket.on('redirectToMenu', ({roomId}) => emitToRoom(socket, roomId, 'redirectToMenu', {}) );
        socket.on('playerRelance', ({roomId}) => emitToRoom(socket, roomId, 'playerRelance', roomId) );
        socket.on('playerExit', ({roomId, data}) =>  emitToRoom(socket, roomId, 'playerExit', data) );
        socket.on('chat message', ({roomId, data}) => emitToRoom(socket, roomId, 'chat message', data) );
    });
};
