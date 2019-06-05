//Socket.io
const config = require('../config')

module.exports = (http, conn) => {
    const io = require('socket.io')(http,{
        log: false,
        agent: false,
        origins: '*:*',
        transports: ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling', 'polling']
    });
    const Auth = new (require('./models/Auth'))(conn, config.database.name);

    io.use(async (socket, next) => {
        try {
            let err = null;
            if(socket.handshake.query === undefined){
                err = new Error('Не удалось получить [query]')
                return next(err, false);
            }

            if(socket.handshake.query.token === undefined){
                err = new Error('Не удалось получить [query].[token]')
                return next(err, false)
            }

            let decode = Auth.jwt.verify(socket.handshake.query.token,Auth.jwtSecret);
            if(!decode.id){
                err = new Error('Не удалось получить id пользователя')
                return next(err, false);
            }
            //Токен существует проверяем его в БД
            let users = await Auth.findUsers(decode.id)

            if (users.length === 0) {
                err = new Error('Не удалось найти пользователя в БД')
                return next(err, false)
            }



            //Пользователь существует подписываем текущее соединение в комнату пользователя
            socket.auth = users[0]
            //Подписываем пользотеля в комнату этого пользователя
            socket.join(socket.auth.id)

            //console.log("Socket Auth:", {socketID: socket.id, connectToRoom: socket.auth.id})
            console.log('Socket Auth:', {room: io.sockets.adapter.rooms[socket.auth.id].sockets, socket: socket.id})

            next(err, true);
        }catch (err) {
            console.log(err)
            next(err, false);
        }
    });

    io.on('connection', (socket) => {
        // console.log(socket.auth)
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    return io;
}