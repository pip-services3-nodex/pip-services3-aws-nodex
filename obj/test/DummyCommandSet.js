"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCommandSet = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_5 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_6 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_7 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_8 = require("pip-services3-commons-nodex");
const DummySchema_1 = require("./DummySchema");
class DummyCommandSet extends pip_services3_commons_nodex_1.CommandSet {
    constructor(controller) {
        super();
        this._controller = controller;
        this.addCommand(this.makeGetPageByFilterCommand());
        this.addCommand(this.makeGetOneByIdCommand());
        this.addCommand(this.makeCreateCommand());
        this.addCommand(this.makeUpdateCommand());
        this.addCommand(this.makeDeleteByIdCommand());
    }
    makeGetPageByFilterCommand() {
        return new pip_services3_commons_nodex_2.Command("get_dummies", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withOptionalProperty("filter", new pip_services3_commons_nodex_7.FilterParamsSchema())
            .withOptionalProperty("paging", new pip_services3_commons_nodex_8.PagingParamsSchema()), (correlationId, args) => {
            let filter = pip_services3_commons_nodex_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_nodex_4.PagingParams.fromValue(args.get("paging"));
            return this._controller.getPageByFilter(correlationId, filter, paging);
        });
    }
    makeGetOneByIdCommand() {
        return new pip_services3_commons_nodex_2.Command("get_dummy_by_id", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy_id", pip_services3_commons_nodex_6.TypeCode.String), (correlationId, args) => {
            let id = args.getAsString("dummy_id");
            return this._controller.getOneById(correlationId, id);
        });
    }
    makeCreateCommand() {
        return new pip_services3_commons_nodex_2.Command("create_dummy", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy", new DummySchema_1.DummySchema()), (correlationId, args) => {
            let entity = args.get("dummy");
            return this._controller.create(correlationId, entity);
        });
    }
    makeUpdateCommand() {
        return new pip_services3_commons_nodex_2.Command("update_dummy", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy", new DummySchema_1.DummySchema()), (correlationId, args) => {
            let entity = args.get("dummy");
            return this._controller.update(correlationId, entity);
        });
    }
    makeDeleteByIdCommand() {
        return new pip_services3_commons_nodex_2.Command("delete_dummy", new pip_services3_commons_nodex_5.ObjectSchema(true)
            .withRequiredProperty("dummy_id", pip_services3_commons_nodex_6.TypeCode.String), (correlationId, args) => {
            let id = args.getAsString("dummy_id");
            return this._controller.deleteById(correlationId, id);
        });
    }
}
exports.DummyCommandSet = DummyCommandSet;
//# sourceMappingURL=DummyCommandSet.js.map