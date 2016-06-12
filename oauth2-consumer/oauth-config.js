'use strict';

module.exports = {
	provider: {
		protocol: "http", 
		host: "127.0.0.1:8000",
		profileUrl: "/api/userinfo"
	}, 
	consumer: {
		protocol: "http", 
		host: "127.0.0.1:3001"
	}
};
