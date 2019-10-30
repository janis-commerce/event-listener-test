'use strict';

const { inspect } = require('util');

const sinon = require('sinon');

const { ApiResponse } = require('@janiscommerce/sls-api-response');

const EventListenerTestError = require('./event-listener-test-error');

const EventBuilder = require('./event-builder');

const isObject = value => typeof value === 'object' && !Array.isArray(value);

const idempotent = () => {};

class EventListenerTest {

	constructor(handler, rules, { before, after, printResponse }) {

		this.handler = handler;
		this.rules = rules;

		this.printResponse = !!printResponse;
		this.before = before || idempotent;
		this.after = after || idempotent;
	}

	validate() {

		if(!this.handler || typeof this.handler !== 'function')
			throw new EventListenerTestError(`Handler must be a function. Received ${inspect(this.handler)}`, EventListenerTestError.codes.INVALID_HANDLER);

		if(!this.rules || !Array.isArray(this.rules) || !this.rules.length)
			throw new EventListenerTestError(`Rules must be a not empty array. Received ${inspect(this.rules)}`, EventListenerTestError.codes.INVALID_RULES);

		const invalidRules = this.rules
			.map(rule => {
				try {
					return this.validateRule(rule);
				} catch({ message }) {
					return {
						...(isObject(rule) ? rule : { rule }),
						error: message
					};
				}

			})
			.filter(Boolean);

		if(invalidRules.length) {
			throw new EventListenerTestError(
				`Found ${invalidRules.length} invalid rules: ${inspect(invalidRules)}`, EventListenerTestError.codes.INVALID_RULES
			);
		}

		if(typeof this.before !== 'undefined' && typeof this.before !== 'function')
			throw new EventListenerTestError('Before hook must be an function', EventListenerTestError.codes.INVALID_BEFORE_HOOK);

		if(typeof this.after !== 'undefined' && typeof this.after !== 'function')
			throw new EventListenerTestError('After hook must be an function', EventListenerTestError.codes.INVALID_AFTER_HOOK);
	}

	validateRule(rule) {

		if(!isObject(rule))
			throw new Error('Rule must be an object');

		if(typeof rule.description !== 'string')
			throw new Error('Description must be a string');

		if(typeof rule.request !== 'undefined' && (!isObject(rule.request)))
			throw new Error('Request must be an object');

		if(typeof rule.session !== 'undefined' && typeof rule.session !== 'boolean' && !isObject(rule.session))
			throw new Error('Session must be an object or a boolean');

		if(typeof rule.client !== 'undefined' && !isObject(rule.client))
			throw new Error('Request must be an object');

		if(!isObject(rule.response))
			throw new Error('Response must be an object');

		if(typeof rule.response.code !== 'undefined' && typeof rule.response.code !== 'number')
			throw new Error('Response code must be a number');

		if(typeof rule.response.headers !== 'undefined' && !isObject(rule.response.headers))
			throw new Error('Response headers must be an object');

		if(typeof rule.response.strictHeaders !== 'undefined' && !isObject(rule.response.strictHeaders))
			throw new Error('Rule Strict headers must be an object');

		if(typeof rule.response.cookies !== 'undefined' && !isObject(rule.response.cookies))
			throw new Error('Response cookies must be an object');

		if(typeof rule.response.strictCookies !== 'undefined' && !isObject(rule.response.strictCookies))
			throw new Error('Response strict cookies must be an object');

		if(typeof rule.before !== 'undefined' && typeof rule.before !== 'function')
			throw new Error('Before hook must be an function');

		if(typeof rule.after !== 'undefined' && typeof rule.after !== 'function')
			throw new Error('After hook must be an function');
	}

	process() {

		before(() => {
			this.before(sinon);
		});

		after(() => {
			this.after(sinon);
		});

		afterEach(() => {
			sinon.restore();
		});

		this.rules.forEach(rule => this.processRule(rule));
	}

	processRule({
		description,
		before,
		after,
		request,
		response,
		session,
		client,
		printResponse
	}) {

		it(description, async () => {

			response = {
				code: 200,
				...response
			};

			if(before)
				await before(sinon);

			sinon.spy(ApiResponse, 'send');

			const event = EventBuilder.buildEvent(sinon.stub, request, session, client);

			let actualResponse;

			try {
				actualResponse = await this.handler(event);
			} catch(e) {
				actualResponse = e;
			}

			if(printResponse || this.printResponse) {
				console.log(`Test case: ${description}`); // eslint-disable-line no-console
				console.log(`Response: ${inspect(actualResponse)}`); // eslint-disable-line no-console
			}

			// Assert response
			sinon.assert.calledOnce(ApiResponse.send);

			const responseExpectation = {
				statusCode: response.code
			};

			if(response.body)
				responseExpectation.body = response.body;

			if(response.headers || response.strictHeaders)
				responseExpectation.headers = response.strictHeaders || sinon.match(response.headers);

			if(response.cookies || response.strictCookies)
				responseExpectation.cookies = response.strictCookies || sinon.match(response.cookies);

			sinon.assert.calledWithExactly(ApiResponse.send, sinon.match(responseExpectation));

			if(after)
				await after(sinon);
		});
	}
}

module.exports = (handler, rules, extraParameters) => {

	const tester = new EventListenerTest(handler, rules, extraParameters || {});

	tester.validate();

	return tester.process();
};
