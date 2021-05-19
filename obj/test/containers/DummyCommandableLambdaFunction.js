"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.DummyCommandableLambdaFunction = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const CommandableLambdaFunction_1 = require("../../src/containers/CommandableLambdaFunction");
const DummyFactory_1 = require("../DummyFactory");
class DummyCommandableLambdaFunction extends CommandableLambdaFunction_1.CommandableLambdaFunction {
    constructor() {
        super("dummy", "Dummy lambda function");
        this._dependencyResolver.put('controller', new pip_services3_commons_nodex_1.Descriptor('pip-services-dummies', 'controller', 'default', '*', '*'));
        this._factories.add(new DummyFactory_1.DummyFactory());
    }
}
exports.DummyCommandableLambdaFunction = DummyCommandableLambdaFunction;
exports.handler = new DummyCommandableLambdaFunction().getHandler();
//# sourceMappingURL=DummyCommandableLambdaFunction.js.map