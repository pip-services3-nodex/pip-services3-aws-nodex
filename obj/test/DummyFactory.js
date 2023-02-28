"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const DummyController_1 = require("./DummyController");
const DummyLambdaService_1 = require("./services/DummyLambdaService");
const DummyCommandableLambdaService_1 = require("./services/DummyCommandableLambdaService");
class DummyFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.registerAsType(DummyFactory.ControllerDescriptor, DummyController_1.DummyController);
        this.registerAsType(DummyFactory.LambdaServiceDescriptor, DummyLambdaService_1.DummyLambdaService);
        this.registerAsType(DummyFactory.CmdLambdaServiceDescriptor, DummyCommandableLambdaService_1.DummyCommandableLambdaService);
    }
}
exports.DummyFactory = DummyFactory;
DummyFactory.Descriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "factory", "default", "default", "1.0");
DummyFactory.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "controller", "default", "*", "1.0");
DummyFactory.LambdaServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "service", "awslambda", "*", "1.0");
DummyFactory.CmdLambdaServiceDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "service", "commandable-awslambda", "*", "1.0");
//# sourceMappingURL=DummyFactory.js.map