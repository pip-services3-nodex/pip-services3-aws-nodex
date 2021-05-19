"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyCommandableLambdaClient = void 0;
const CommandableLambdaClient_1 = require("../../src/clients/CommandableLambdaClient");
class DummyCommandableLambdaClient extends CommandableLambdaClient_1.CommandableLambdaClient {
    constructor() {
        super("dummy");
    }
    getDummies(correlationId, filter, paging) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('get_dummies', correlationId, {
                filter: filter,
                paging: paging
            });
        });
    }
    getDummyById(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('get_dummy_by_id', correlationId, {
                dummy_id: dummyId
            });
        });
    }
    createDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('create_dummy', correlationId, {
                dummy: dummy
            });
        });
    }
    updateDummy(correlationId, dummy) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('update_dummy', correlationId, {
                dummy: dummy
            });
        });
    }
    deleteDummy(correlationId, dummyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.call('delete_dummy', correlationId, {
                dummy_id: dummyId
            });
        });
    }
}
exports.DummyCommandableLambdaClient = DummyCommandableLambdaClient;
//# sourceMappingURL=DummyCommandableLambdaClient.js.map