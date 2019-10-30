'use strict';

class EventListenerTestError extends Error {

	static get codes() {

		return {
			INVALID_AFTER_HOOK: 1,
			INVALID_BEFORE_HOOK: 2,
			INVALID_HANDLER: 3,
			INVALID_RULES: 4
		};

	}

	constructor(err, code) {
		super(err);
		this.message = err.message || err;
		this.code = code;
		this.name = 'EventListenerTestError';
	}
}

module.exports = EventListenerTestError;
