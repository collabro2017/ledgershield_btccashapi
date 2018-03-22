'use strict';

const bch = require('bitcoincashjs');
const axios = require('axios');

class BCH {
	
	constructor() {	
		this.APIURL = 'http://18.188.135.113/rpc/';
		this.username = 'adminuser';
		this.password = 'adminpassword';
		this.account = 'lg-default-account'
	}


	__build(method, params) {
		
		const time = Date.now();
		const data = {
			jsonrpc: '1.0',
			id: time,
			method: method
		};

		if (params.length)
			data.params =  params;

		return data;
	}



	__call(method, params=[]) {		
		const data = this.__build(method, params);
		const request = {
			method: 'POST',
			url: this.APIURL,
			auth: {
				username: this.username,
				password: this.password
			},
			headers: {
				'Content-Type': 'text/plain'
			},
			data: data
		};		
		return axios(request).then(res => {
			return res.data.result;
		}).catch(err => {
			console.log(`RPC ${err}`);
		});

	}	

	async getInfo() {		
		const info = await this.__call('getinfo')
		return info;
	}

	async getNewAddress() {
		const response = await this.__call('getnewaddress',[this.account]);
		return response;
	}

	async getReceiveByAddress(address) {
		const response = await this.__call('getreceivedbyaddress', [address, 0])
		return response;
	}


	async listreceivedByAddress(){
		const response = await this.__call('listreceivedbyaddress', [0, false]);
		return response;
	}

	async getAccount(address) {
		const response = await this.__call('getaccount', [address]);
		return response;
	}


	async listAccounts() {

		const response = await this.__call('listaccounts', [0, true]);
		return response;
	}

	async getTransaction(txid) {
		const response = await this.__call('gettransaction',[txid]);
		return response;
	}


	async sendMany(outs) {
		const response = await this.__call('sendmany',[this.account, outs, 1 ,'Transaction relayed by ledgershield!'])
		return response;
	}

	async sendToAddress(address, amount) {
		const response = await this.__call('sendfrom',[this.account, address, amount, 'Exchange transaction!','Trnsaction relayed by ledhershield!'])
		return response;
	}

	toLagacyAddress(address) {
		const Address = bch.Address;
		const fromString = Address.fromString;
		const CashAddrFormat = Address.CashAddrFormat;
		const cashaddr = fromString(address, 'testnet', 'pubkeyhash', CashAddrFormat);				  
		return {
			'cashAddress': address,
			'lagacy': cashaddr.toString()
		};
	}
}

module.exports = BCH;