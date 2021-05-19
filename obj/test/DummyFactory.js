"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyFactory = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const DummyController_1 = require("./DummyController");
class DummyFactory extends pip_services3_components_nodex_1.Factory {
    constructor() {
        super();
        this.registerAsType(DummyFactory.ControllerDescriptor, DummyController_1.DummyController);
    }
}
exports.DummyFactory = DummyFactory;
DummyFactory.Descriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "factory", "default", "default", "1.0");
DummyFactory.ControllerDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services-dummies", "controller", "default", "*", "1.0");
//# sourceMappingURL=DummyFactory.js.map