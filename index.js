'use strict';

const hapi = require('hapi');
const BCH = require('./bch')




const server = hapi.server({
	host: 'localhost',
	port: '9003'
});

const bch = new BCH();

server.route({
	method: 'GET',
	path: '/',
	handler: async (req, h) => {		
		return h.response({'message':'Welcome to api console'}).code(200);
	}
});

server.route({
	method: 'POST',
	path: "/wallet/new",
	handler: async (req, h) => {
		// const privatekey = bch.generateWallet();
		// return h.response(privatekey).code(201);
		let data = await bch.getNewAddress();
		console.log(data);
		data = bch.toLagacyAddress(data);
		return h.response({data}).code(201);

	}
});

server.route({
	method: 'GET',
	path: '/wallet/balance/{address}',
	handler: async (req, h) => {
		const address = req.params.address;
		const data = await bch.getReceiveByAddress(address);
		return h.response({'balance': data}).code(200);
	}
});

server.route({
	method: 'GET',
	path: '/wallet/info',
	handler: async (req, h) => {
		const data = await bch.listreceivedByAddress();
		return h.response(data).code(200);
	}
})


server.route({
	method: 'GET',
	path: '/accounts/list',
	handler: async (req, h) => {
		const data = await bch.listAccounts();
		return h.response(data).code(200);
	}
})

server.route({
	method: 'GET',
	path: '/account/{address}',
	handler: async (req, h) => {
		const data = await bch.getAccount(req.params.address);
		return h.response(data).code(200);
	}
})

server.route({
	method: 'GET',
	path: '/wallet/tx/{txid}',
	handler: async (req, h) => {
		const txid = req.params.txid;
		const tx = await bch.getTransaction(txid);
		return h.response(tx).code(200);
	}
})




const start = async () => {
	try {
		await server.start();
	} catch(err) {
		console.log(`Server error ${err}`);
		process.exit(1);
	}

	console.log(`Server running at ${server.info.uri}`)
};

start();