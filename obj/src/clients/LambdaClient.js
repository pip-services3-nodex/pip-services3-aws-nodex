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
exports.LambdaClient = void 0;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_4 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_components_nodex_2 = require("pip-services3-components-nodex");
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = require("aws-sdk");
const AwsConnectionResolver_1 = require("../connect/AwsConnectionResolver");
/**
 * Abstract client that calls AWS Lambda Functions.
 *
 * When making calls "cmd" parameter determines which what action shall be called, while
 * other parameters are passed to the action itself.
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
 * @see [[CommandableLambdaClient]]
 *
 * ### Example ###
 *
 *     class MyLambdaClient extends LambdaClient implements IMyClient {
 *         ...
 *
 *         public async getData(correlationId: string, id: string): Promise<MyData> {
 *
 *             let timing = this.instrument(correlationId, 'myclient.get_data');
 *             const result = await this.call("get_data" correlationId, { id: id });
 *             timing.endTiming();
 *             return result;
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
 */
class LambdaClient {
    constructor() {
        /**
         * The opened flag.
         */
        this._opened = false;
        this._connectTimeout = 10000;
        /**
         * The dependencies resolver.
         */
        this._dependencyResolver = new pip_services3_commons_nodex_4.DependencyResolver();
        /**
         * The connection resolver.
         */
        this._connectionResolver = new AwsConnectionResolver_1.AwsConnectionResolver();
        /**
         * The logger.
         */
        this._logger = new pip_services3_components_nodex_1.CompositeLogger();
        /**
         * The performance counters.
         */
        this._counters = new pip_services3_components_nodex_2.CompositeCounters();
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        this._connectionResolver.configure(config);
        this._dependencyResolver.configure(config);
        this._connectTimeout = config.getAsIntegerWithDefault('options.connect_timeout', this._connectTimeout);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._dependencyResolver.setReferences(references);
    }
    /**
     * Adds instrumentation to log calls and measure call time.
     * It returns a CounterTiming object that is used to end the time measurement.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param name              a method name.
     * @returns {CounterTiming} object to end the time measurement.
     */
    instrument(correlationId, name) {
        this._logger.trace(correlationId, "Executing %s method", name);
        return this._counters.beginTiming(name + ".exec_time");
    }
    /**
     * Checks if the component is opened.
     *
     * @returns {boolean} true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._opened;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     *
     */
    open(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOpen()) {
                return;
            }
            this._connection = yield this._connectionResolver.resolve(correlationId);
            aws_sdk_2.config.update({
                accessKeyId: this._connection.getAccessId(),
                secretAccessKey: this._connection.getAccessKey(),
                region: this._connection.getRegion()
            });
            aws_sdk_2.config.httpOptions = {
                timeout: this._connectTimeout
            };
            this._lambda = new aws_sdk_1.Lambda();
            this._opened = true;
            this._logger.debug(correlationId, "Lambda client connected to %s", this._connection.getArn());
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Todo: close listening?
            if (!this.isOpen()) {
                return;
            }
            this._opened = false;
        });
    }
    /**
     * Performs AWS Lambda Function invocation.
     *
     * @param invocationType    an invocation type: "RequestResponse" or "Event"
     * @param cmd               an action name to be called.
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param args              action arguments
     * @return {any}            action result.
     */
    invoke(invocationType, cmd, correlationId, args) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cmd == null) {
                throw new pip_services3_commons_nodex_2.UnknownException(null, 'NO_COMMAND', 'Missing Seneca pattern cmd');
            }
            args = Object.assign({}, args);
            args.cmd = cmd;
            args.correlation_id = correlationId || pip_services3_commons_nodex_1.IdGenerator.nextShort();
            let params = {
                FunctionName: this._connection.getArn(),
                InvocationType: invocationType,
                LogType: 'None',
                Payload: JSON.stringify(args)
            };
            try {
                const data = yield this._lambda.invokeAsync(params);
                let result = data.Payload;
                if (typeof result === "string") {
                    try {
                        result = JSON.parse(result);
                    }
                    catch (err) {
                        throw new pip_services3_commons_nodex_3.InvocationException(correlationId, 'DESERIALIZATION_FAILED', 'Failed to deserialize result').withCause(err);
                    }
                }
                return result;
            }
            catch (err) {
                throw new pip_services3_commons_nodex_3.InvocationException(correlationId, 'CALL_FAILED', 'Failed to invoke lambda function').withCause(err);
            }
        });
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
        return __awaiter(this, void 0, void 0, function* () {
            return this.invoke('RequestResponse', cmd, correlationId, params);
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
        return this.invoke('Event', cmd, correlationId, params);
    }
}
exports.LambdaClient = LambdaClient;
//# sourceMappingURL=LambdaClient.js.map