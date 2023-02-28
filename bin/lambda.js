let DummyLambdaFunction = require('obj/test/containers/DummyLambdaFunction').DummyLambdaFunction;

exports.handler = new DummyLambdaFunction().getHandler();