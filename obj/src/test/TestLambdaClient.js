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
exports.TestLambdaClient = void 0;
/** @module test */
const LambdaClient_1 = require("../clients/LambdaClient");
/**
 * AWS Lambda client used for automated testing.
 */
class TestLambdaClient extends LambdaClient_1.LambdaClient {
    constructor() {
        super();
    }
    /**
     * Calls a AWS Lambda Function action.
     *
     * @param cmd               an action name to be called.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            (optional) action parameters.
     * @return {any}            action result.
     */
    call(cmd, correlationId, params = {}) {
        const _super = Object.create(null, {
            call: { get: () => super.call }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.call.call(this, cmd, correlationId, params);
        });
    }
    /**
     * Calls a AWS Lambda Function action asynchronously without waiting for response.
     *
     * @param cmd               an action name to be called.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            (optional) action parameters.
     * @return {any}            action result.
     */
    callOneWay(cmd, correlationId, params = {}) {
        return super.callOneWay(cmd, correlationId, params);
    }
}
exports.TestLambdaClient = TestLambdaClient;
//# sourceMappingURL=TestLambdaClient.js.map