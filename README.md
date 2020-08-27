# Event Listener Test

![Build Status](https://github.com/janis-commerce/event-listener-test/workflows/Build%20Status/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/janis-commerce/event-listener-test/badge.svg?branch=master)](https://coveralls.io/github/janis-commerce/event-listener-test?branch=master)
[![npm version](https://badge.fury.io/js/%40janiscommerce%2Fevent-listener-test.svg)](https://www.npmjs.com/package/@janiscommerce/event-listener-test)

## Installation

```sh
npm install --save-dev @janiscommerce/event-listener-test
```

## API

`EventListenerTest(handler, rules, extraParameters)`

* **`handler`**: <_function_> **Required**. The Serverless handler (a function that receives a serverless `event` and handles the listener request)
* **`rules`**: <_[Rule]_> **Required**. An array of [rules](#rule) to define what needs to be tested
* **`extraParameters`**: <_object_> An object of key-value properties that configure the test execution. It accepts the following properties:
* * `before`: <_function_> A function to be called before any test case is executed. It receives `sinon` as the first argument.
* * `after`: <_function_> A function to be called after every test case is executed. It receives `sinon` as the first argument.
* * `printResponse`: <_boolean_> Indicates if every test case response should be printed in the console (good for debugging). (Also available within a rule for more granularity)

### Rule

A rule is an object that defines a test case. It has the following properties:

* `description`: <_string_> **Required**. The test case description.
* `only`: <_boolean_> If it's set to true, only this rule will be executed. Useful to debug when a test fails.
* `event`: <_object_> **Required**. The JANIS event to test.
* `session`: <_boolean|object_> Indicates if the test should inject a session. If it's `true` the a default session is injected. If it's an object, it's injected as a session.
* `client`: <_object_> Used to mock the service client, injecting it in the session `client` getter. Only works if `session` is set.
* `responseCode`: <_number_> The response http status code expected. Defaults to `200`.
* `before`: <_function_> A function to be called before this test case is executed. It receives `sinon` as the first argument.
* `after`: <_function_> A function to be called after this test case is executed. It receives `sinon` as the first argument.
* `printResponse`: <_boolean_> Indicates if this test case response should be printed in the console (good for debugging).

## Examples

```js
'use strict';

const EventListenerTest = require('@janiscommerce/event-listener-test');

const MyServerlessHandler = require('./handler');
const MyModel = require('./model');

EventListenerTest(MyServerlessHandler, [
	{
		description: 'It should return a 200 and do nothing',
		event: {
			service: 'demo',
			entity: 'someEntity',
			event: 'somethingHappened'
		}
	},
	{
		description: 'It fail with a 500 status code if event is errorHappened',
		event: {
			service: 'demo',
			entity: 'someEntity',
			event: 'errorHappened'
		},
		responseCode: 500
	},
	{
		description: 'It should update a record and return a 200',
		event: {
			service: 'demo',
			entity: 'someEntity',
			event: 'somethingHappened'
		},
		before: sinon => {
			sinon.stub(MyModel.prototype, 'update')
				.returns(true);
		},
		after: sinon => {
			sinon.assert.calledOnce(MyModel.prototype.update);
		}
	}
]);
```
