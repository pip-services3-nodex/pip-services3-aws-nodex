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
exports.TestCommandableLambdaClient = void 0;
/** @module test */
const CommandableLambdaClient_1 = require("../clients/CommandableLambdaClient");
class TestCommandableLambdaClient extends CommandableLambdaClient_1.CommandableLambdaClient {
    constructor(baseRoute) {
        super(baseRoute);
    }
    /**
     * Calls a remote action in AWS Lambda function.
     * The name of the action is added as "cmd" parameter
     * to the action parameters.
     *
     * @param cmd               an action name
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            command parameters.
     * @return {any}            action result.
     */
    callCommand(name, correlationId, params) {
        const _super = Object.create(null, {
            callCommand: { get: () => super.callCommand }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.callCommand.call(this, name, correlationId, params);
        });
    }
}
exports.TestCommandableLambdaClient = TestCommandableLambdaClient;
//# sourceMappingURL=TestCommandableLambdaClient.js.map