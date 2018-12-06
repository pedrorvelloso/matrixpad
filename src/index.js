import express from 'express';
import http from 'http';
import mongoose from 'mongoose';

import socket from './socket';

const app = express();
const server = http.createServer(app);
// Mongo Connection
mongoose.connect(process.env.MONGO, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log('-- Connected to Mongo --');
});

// Routing
/* Homepage */
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/static/home.html');
});

/* Docs */
app.get('*', (req, res) => {
	res.sendFile(__dirname + '/static/index.html');
});

// Socket start
socket.listen({ server });

const port = process.env.PORT || 4000;

server.listen({ port }, () => {
	console.log(`🚀  Listening on port ${port}`);
});
