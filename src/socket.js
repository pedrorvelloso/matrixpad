import io from 'socket.io';
import Data from './models/data';

const listen = options => {
	const socketIo = io.listen(options.server);

	// Socket
	socketIo.on('connection', function (socket) {

		/* Join Socket Room */
		socket.on('join', (room) => {
			socket.join(room);
			/* Inser Room in Mongo */
			Data.find({ location: room }, (err, results) => {
				if (results.length === 0) {
					console.log(`Criando ${room}...`);
					const newRoom = new Data({ location: room, data: '' });
					newRoom.save();
				} else {
					let message = results[0].data;
					Data.find({ location: { $regex: room + '/.*' } }, (err, results) => {
						let r = [];
						let rCursor = room.split('/').length;
						results.map(result => {
							if (result.location.split('/')[rCursor + 1] === undefined) {
								r.push(result.location.split('/')[rCursor]);
							}
						});
						//console.log(r);
						socketIo.in(room).emit('entrou', { msg: message, folders: r });
					});

				}
			});

		});

		socket.on('disconnect', function () {
			//console.log('user disconnected');
		});

		/* Text changes on Socket Room */
		socket.on('text', (msg) => {
			const message = msg.msg;
			socketIo.sockets.in(msg.room).emit('text', message);
		});

		/* Mongo save, request by client every 2500ms */
		socket.on('save', (msg) => {
			Data.find({ location: msg.room }, (err, results) => {
				if (results.length === 0) {
					const newRoom = new Data({ location: msg.room, data: msg.msg });
					newRoom.save();
				} else {
					results[0].set({ data: msg.msg });
					results[0].save();
				}
			});

		});

	});

	// Last Mongo DELETE (first date on 'npm start')
	let date = new Date();
	date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`;

	setInterval(() => {
		console.log(`Deletando rotas vazia do banco (Última atualização: ${date})`);
		date = new Date();
		date = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} - ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}:${date.getSeconds() < 10 ? '0' : ''}${date.getSeconds()}`;

		Data.find({}, (err, results) => {
			results.map(result => {
				if (result.data == 0) {
					Data.deleteOne({ location: result.location }, (err) => {
						if (err) console.log('Erro');
					});
				}
			});
		});
	}, 28800000);


};

export default { listen };