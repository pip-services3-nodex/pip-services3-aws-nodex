"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.DummyLambdaFunction = void 0;
const LambdaFunction_1 = require("../../src/containers/LambdaFunction");
const DummyFactory_1 = require("../DummyFactory");
class DummyLambdaFunction extends LambdaFunction_1.LambdaFunction {
    constructor() {
        super("dummy", "Dummy lambda function");
        this._factories.add(new DummyFactory_1.DummyFactory());
    }
}
exports.DummyLambdaFunction = DummyLambdaFunction;
exports.handler = new DummyLambdaFunction().getHandler();
//# sourceMappingURL=DummyLambdaFunction.js.map