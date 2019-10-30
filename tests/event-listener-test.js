'use strict';

const assert = require('assert');

const sinon = require('sinon');

const { ApiResponse } = require('@janiscommerce/sls-api-response');

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

class ErrorListener extends EventListener {

	async process() {

		this
			.setCode(400)
			.setBody({});
	}
}

const ErrorHandler = (...args) => ServerlessHandler.handle(ErrorListener, ...args);

const event = {
	service: 'some-service',
	entity: 'some-entity',
	event: 'some-event'
};

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

		it('Should throw if a rule event is not set', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: 'InvalidEvent'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event service is not defined', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					entity: 'some-entity',
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event service is not a string', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					service: ['InvalidService'],
					entity: 'some-entity',
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event entity is not defined', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					service: 'some-service',
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event entity is not a string', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					service: 'some-service',
					entity: ['InvalidEntity'],
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event name is not defined', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					service: 'some-service',
					entity: 'some-entity'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event name is not a string', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					service: 'some-service',
					entity: 'some-entity',
					event: ['InvalidEvent']
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event client is not a string', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					client: ['InvalidClient'],
					service: 'some-service',
					entity: 'some-entity',
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule event id is not a string nor a number', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event: {
					id: ['InvalidId'],
					service: 'some-service',
					entity: 'some-entity',
					event: 'some-event'
				}
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule session is not a boolean nor an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event,
				session: 'Invalid session'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule client is not an object', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event,
				session: true,
				client: 'Invalid client'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule responseCode is not a number', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event,
				responseCode: 'InvalidResponseCode'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule before hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event,
				before: 'InvalidBeforeHook'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if a rule after hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event,
				after: 'InvalidAfterHook'
			}]), {
				code: EventListenerTestError.codes.INVALID_RULES
			});
		});

		it('Should throw if the before hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event
			}], {
				before: 'InvalidBeforeHook'
			}), {
				code: EventListenerTestError.codes.INVALID_BEFORE_HOOK
			});
		});

		it('Should throw if the after hook is not a function', () => {
			assert.throws(() => EventListenerTest(MyHandler, [{
				description: 'Valid description',
				event
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
				event
			},
			{
				description: 'Should print the response for an individual rule if printResponse is truthy',
				printResponse: true,
				before: ({ stub }) => {
					stub(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledTwice(console.log); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(0), 'Test case: Should print the response for an individual rule if printResponse is truthy'); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(1), sinon.match(/^Response: /)); // eslint-disable-line
				},
				event
			},
			{
				description: 'Should not print the response for an individual rule if printResponse is falsy',
				printResponse: false,
				before: ({ spy }) => {
					spy(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.notCalled(console.log); // eslint-disable-line
				},
				event
			}
		]);

		EventListenerTest(ErrorHandler, [
			{
				description: 'Should fail if status code is not OK',
				event,
				responseCode: 400
			}
		]);

		EventListenerTest(SessionHandler, [
			{
				description: 'Should print the response for the whole execution if printResponse is truthy',
				before: ({ stub }) => {
					stub(console, 'log');
				},
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledTwice(console.log); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(0), 'Test case: Should print the response for the whole execution if printResponse is truthy'); // eslint-disable-line
					sinonAssert.calledWithExactly(console.log.getCall(1), sinon.match(/^Response: /)); // eslint-disable-line
				},
				event
			}
		], {
			printResponse: true
		});

		EventListenerTest(SessionHandler, [
			{
				description: 'Should set the default session if it\'s defined as true',
				session: true,
				event,
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledWithExactly(ApiResponse.send, sinon.match({
						body: {
							clientId: 1,
							clientCode: 'defaultClient',
							userId: 2
						}
					}));
				}
			},
			{
				description: 'Should set the session defined in the rule if it\'s defined as object',
				session: {
					clientId: 8,
					clientCode: 'customClient'
				},
				event,
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledWithExactly(ApiResponse.send, sinon.match({
						body: {
							clientId: 8,
							clientCode: 'customClient',
							userId: undefined
						}
					}));
				}
			},
			{
				description: 'Should mock the client db get by default',
				session: true,
				event,
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledWithExactly(ApiResponse.send, sinon.match({
						body: {
							client: {
								id: 1,
								code: 'defaultClient'
							}
						}
					}));
				}
			},
			{
				description: 'Should mock the client db get using the rule client if present',
				session: true,
				client: {
					id: 5,
					code: 'someOtherClient'
				},
				event,
				after: ({ assert: sinonAssert }) => {
					sinonAssert.calledWithExactly(ApiResponse.send, sinon.match({
						body: {
							client: {
								id: 5,
								code: 'someOtherClient'
							}
						}
					}));
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
				event,
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
