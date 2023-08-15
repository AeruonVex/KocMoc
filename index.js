import P from 'pino';
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from 'baileys';

const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_sessions');

const bot = () => {
	
	let sock = makeWASocket({
		logger: P({ level: 'silent' }),
		printQRInTerminal: true,
		auth: state
	});

	sock.ev.on('creds.update', saveCreds);

	sock.ev.on('connection.update', ({qr, connection, lastDisconnect}) => {
		if (qr) { console.log('Escanee el siguiente QR con su WhatsApp actualizado.'); };
		if (connection == 'close') {
			if (lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut) { bot(); }
		} else if (connection == 'open') {
			console.log('Bot conectado');
		};
	});

	sock.ev.on('messages.upsert', m => {
		m = m.messages[0]
		
		if (!m.message || m.broadcast || m.key.id.startsWith('BAE5') && m.key.id.length == 16) return;
		
		m.message = (Object.keys(m.message)[0] == 'ephemeralMessage') ? m.message.ephemeralMessage.message : m.message;

		console.log(m);
	});

	return sock;
};

bot();