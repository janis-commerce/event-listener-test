'use strict';

const { ApiSession } = require('@janiscommerce/api-session');

const defaultClient = {
	id: 1,
	code: 'defaultClient'
};

const defaultSessionData = {
	clientId: 1,
	clientCode: 'defaultClient',
	userId: 2,
	profileId: 3,
	permissions: [
		'some-service:some-entity:some-action',
		'some-service:some-entity:some-other-action'
	],
	userIsDev: false
};

class EventBuilder {

	static buildEvent(stub, request, session, client) {

		const authorizer = {};
		if(session)
			authorizer.janisAuth = JSON.stringify(session === true ? { ...defaultSessionData } : { ...session });

		stub(ApiSession.prototype, 'client')
			.get(() => client || defaultClient);

		return {
			headers: request.headers || {},
			body: request.body,
			method: request.method || 'POST',
			authorizer
		};
	}

}

module.exports = EventBuilder;
