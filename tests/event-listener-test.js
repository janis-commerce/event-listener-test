'use strict';

const assert = require('assert');

const sinon = require('sinon');

const {
	EventListener,
	ServerlessHandler
} = require('@janiscommerce/event-listener');

const EventListenerTest = require('../lib/event-listener-test');

const EventListenerTestError = require('../lib/event-listener-test-error');

class MyListener extends EventListener {
	async process() {
		this
			.setBody({
				foo: 1
			})
			.setHeaders({
				'x-foo': 'bar',
				'x-bar': 'baz'
			})
			.setCookie('my-cookie', 'and-value');
	}
}

const MyHandler = (...args) => ServerlessHandler.handle(MyListener, ...args);

class SessionListener extends EventListener {

	async process() {

		const client = await this.session.client;

		this.setBody({
			client,
			clientId: this.session.clientId,
			clientCode: this.session.clientCode,
			userId: this.session.userId
		});
	}
}

const SessionHandler = (...args) => ServerlessHandler.handle(SessionListener, ...args);

describe('EventListenerTest', () => {

	describe('Arguments validation', () => {

		it('Should throw if handler is falsy', () => {
			assert.throws(() => EventListenerTest(undefined, []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => EventListenerTest(null, []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => EventListenerTest(0, []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => EventListenerTest(false, []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});

			assert.throws(() => EventListenerTest('', []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});
		});

		it('Should throw if handler is not a function', () => {
			assert.throws(() => EventListenerTest('InvalidListener', []), {
				code: EventListenerTestError.codes.INVALID_HANDLER
			});
		});

		it('Should throw if rules are falsy', () => {
			assert.throws(() => EventListenerTest(MyHandler, undefined), {
				code: EventListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => EventListenerTest(MyHandler, null), {
				code: EventListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => EventListenerTest(MyHandler, 0), {
				code: EventListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => EventListenerTest(MyHandler, false), {
				code: EventListenerTestError.codes.INVALID_RULES
			});

			assert.throws(() => EventListenerTest(MyHandler, ''), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if rules are not an array', () => {
			assert.throws(() => EventListenerTest(MyHandler, 'InvalidRules'), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if rules are empty', () => {
			assert.throws(() => EventListenerTest(MyHandler, []), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, ['InvalidRule']), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule description is not set', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule description is not a string', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: ['InvalidRuleDescription']
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule request is not set', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule request is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: 'InvalidRequest'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule session is not a boolean nor an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				session: 'Invalid session'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule client is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				session: true,
				client: 'Invalid client'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: 'InvalidResponse'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response code is not a number', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {
					code: 'InvalidResponseCode'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response headers are not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {
					headers: ['InvalidResponseHeaders']
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response strictHeaders are not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {
					strictHeaders: ['InvalidResponseStrictHeaders']
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response cookies are not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {
					cookies: ['InvalidResponseCookies']
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule response strictCookies are not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {
					strictCookies: ['InvalidResponseStrictCookies']
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule before hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {},
				before: 'InvalidBeforeHook'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule after hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {},
				after: 'InvalidAfterHook'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if the before hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {}
			}], {
				before: 'InvalidBeforeHook'
			}), {
				code: EventListenerTestError.codes.INVALID_BEFORE_HOOK
			});
		});

		it('Should throw if the after hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				request: {},
				response: {}
			}], {
				after: 'InvalidAfterHook'
			}), {
				code: EventListenerTestError.codes.INVALID_AFTER_HOOK
			});
		});
	});

	describe('Rule processing', () => {

		EventListenerTest(MyHandler, [
			{
				description: 'Should pass for a basic rule',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {}
			},
			{
				description: 'Should validate response body',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					body: {
						foo: 1
					}
				}
			},
			{
				description: 'Should validate response partial headers',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					headers: {
						'x-foo': 'bar'
					}
				}
			},
			{
				description: 'Should validate response strict headers',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					strictHeaders: {
						'x-foo': 'bar',
						'x-bar': 'baz'
					}
				}
			},
			{
				description: 'Should validate response partial cookies',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					cookies: {
						'my-cookie': 'and-value'
					}
				}
			},
			{
				description: 'Should validate response strict cookies',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					strictCookies: {
						'my-cookie': 'and-value'
					}
				}
			}
		]);

		EventListenerTest(SessionHandler, [
			{
				description: 'Should set the default session if it\'s defined as true',
				session: true,
				request: {
					body: {
						service: 'some-service1',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					body: {
						clientId: 1,
						clientCode: 'defaultClient',
						userId: 2
					}
				}
			},
			{
				description: 'Should set the session defined in the rule if it\'s defined as object',
				session: {
					clientId: 8,
					clientCode: 'customClient'
				},
				request: {
					body: {
						service: 'some-service1',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					body: {
						clientId: 8,
						clientCode: 'customClient',
						userId: undefined
					}
				}
			},
			{
				description: 'Should mock the client db get by default',
				session: true,
				request: {
					body: {
						service: 'some-service1',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					body: {
						client: {
							id: 1,
							code: 'defaultClient'
						}
					}
				}
			},
			{
				description: 'Should mock the client db get using the rule client if present',
				session: true,
				client: {
					id: 5,
					code: 'someOtherClient'
				},
				request: {
					body: {
						service: 'some-service1',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {
					body: {
						client: {
							id: 5,
							code: 'someOtherClient'
						}
					}
				}
			}
		]);
	});

	describe('Hooks calls', () => {

		const externalSandbox = sinon.createSandbox();
		const beforeAll = externalSandbox.fake();
		const before = externalSandbox.fake();
		const after = externalSandbox.fake();

		EventListenerTest(MyHandler, [
			{
				description: 'Should call the rule before and after hooks once',
				request: {
					body: {
						service: 'some-service',
						entity: 'some-entity',
						event: 'some-event'
					}
				},
				response: {},
				before,
				after
			}
		], {
			before: beforeAll,
			after: () => {
				externalSandbox.assert.calledOnce(beforeAll);
				externalSandbox.assert.calledOnce(before);
				externalSandbox.assert.calledOnce(after);

				assert(before.calledAfter(beforeAll));
				assert(after.calledAfter(before));
			}
		});
	});
});
