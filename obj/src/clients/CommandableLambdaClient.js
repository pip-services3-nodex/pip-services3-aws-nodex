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
exports.CommandableLambdaClient = void 0;
/** @module clients */
const LambdaClient_1 = require("./LambdaClient");
/**
 * Abstract client that calls commandable AWS Lambda Functions.
 *
 * Commandable services are generated automatically for [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/commands.icommandable.html ICommandable objects]].
 * Each command is exposed as action determined by "cmd" parameter.
 *
 * ### Configuration parameters ###
 *
 * - connections:
 *     - discovery_key:               (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *     - region:                      (optional) AWS region
 * - credentials:
 *     - store_key:                   (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *     - access_id:                   AWS access/client id
 *     - access_key:                  AWS access/client id
 * - options:
 *     - connect_timeout:             (optional) connection timeout in milliseconds (default: 10 sec)
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>            (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>          (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:discovery:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connection
 * - <code>\*:credential-store:\*:\*:1.0</code>  (optional) Credential stores to resolve credentials
 *
 * @see [[LambdaFunction]]
 *
 * ### Example ###
 *
 *     class MyLambdaClient extends CommandableLambdaClient implements IMyClient {
 *         ...
 *
 *         public async getData(correlationId: string, id: string): Promise<any> {
 *             return this.callCommand("get_data", correlationId, { id: id });
 *         }
 *         ...
 *     }
 *
 *     let client = new MyLambdaClient();
 *     client.configure(ConfigParams.fromTuples(
 *         "connection.region", "us-east-1",
 *         "connection.access_id", "XXXXXXXXXXX",
 *         "connection.access_key", "XXXXXXXXXXX",
 *         "connection.arn", "YYYYYYYYYYYYY"
 *     ));
 *
 *     const result = await client.getData("123", "1");
 *     ...
 */
class CommandableLambdaClient extends LambdaClient_1.LambdaClient {
    /**
     * Creates a new instance of this client.
     *
     * @param name a service name.
     */
    constructor(name) {
        super();
        this._name = name;
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
    callCommand(cmd, correlationId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const timing = this.instrument(correlationId, this._name + '.' + cmd);
            try {
                const result = yield this.call(cmd, correlationId, params);
                timing.endTiming();
                return result;
            }
            catch (err) {
                timing.endTiming(err);
                throw err;
            }
        });
    }
}
exports.CommandableLambdaClient = CommandableLambdaClient;
//# sourceMappingURL=CommandableLambdaClient.js.map