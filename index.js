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
		data = bch.toLagacyAddress(data);
		return h.response(data).code(201);

	}
});

server.route({
	method: 'GET',
	path: '/wallet/balance/{address}/{confirmations}',
	handler: async (req, h) => {
		const address = req.params.address;
		const confirmations = req.params.confirmations		
		const data = await bch.getReceiveByAddress(address, confirmations);
		return h.response({'balance': data}).code(200);
	}
});

server.route({
	method: 'GET',
	path: '/wallet/info/{confirmations}',
	handler: async (req, h) => {
		const confirmations = req.params.confirmations
		const data = await bch.listreceivedByAddress(confirmations);
		return h.response(data).code(200);
	}
})


server.route({
	method: 'GET',
	path: '/accounts/list/{confirmations}',
	handler: async (req, h) => {
		const confirmations = req.params.confirmations
		const data = await bch.listAccounts(confirmations);
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


server.route({
	method:'POST',
	path: '/wallet/transfer',
	handler: async (req, h) => {
		let outs = req.payload;

		if(typeof outs === 'string') {
			outs = JSON.parse(outs)
		}
		
		const len = outs.length;
		
		if(len < 1) {
			return h.response({"message": "Invalid outputs"}).code(400);
		}
		const dests = {};
		const feeOuts= []

		outs.forEach(out => {
			const address = out.address;
			const amount = out.amount;
			dests[address] = amount;
			feeOuts.push(address)
		});

		const response =  await bch.sendMany(dests, feeOuts);
		console.log(response);
		const outputs = []

		outs.forEach(out => {
			if(!response){
				out.comment = 'something went wrong while transferring funds!'
				out.tx_hash = ''
			}else{
				out.tx_hash = response
				out.comment = ''
			}
				
			outputs.push(out)
		})


		return h.response(outs).code(200)
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