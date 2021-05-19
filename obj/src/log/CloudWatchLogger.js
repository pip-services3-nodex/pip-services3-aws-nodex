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
exports.CloudWatchLogger = void 0;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_2 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const aws_sdk_1 = require("aws-sdk");
const aws_sdk_2 = require("aws-sdk");
const AwsConnectionResolver_1 = require("../connect/AwsConnectionResolver");
/**
 * Logger that writes log messages to AWS Cloud Watch Log.
 *
 * ### Configuration parameters ###
 *
 * - stream:                        (optional) Cloud Watch Log stream (default: context name)
 * - group:                         (optional) Cloud Watch Log group (default: context instance ID or hostname)
 * - connections:
 *     - discovery_key:               (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *     - region:                      (optional) AWS region
 * - credentials:
 *     - store_key:                   (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *     - access_id:                   AWS access/client id
 *     - access_key:                  AWS access/client id
 * - options:
 *     - interval:        interval in milliseconds to save current counters measurements (default: 5 mins)
 *     - reset_timeout:   timeout in milliseconds to reset the counters. 0 disables the reset (default: 0)
 *
 * ### References ###
 *
 * - <code>\*:context-info:\*:\*:1.0</code>      (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/info.contextinfo.html ContextInfo]] to detect the context id and specify counters source
 * - <code>\*:discovery:\*:\*:1.0</code>         (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connections
 * - <code>\*:credential-store:\*:\*:1.0</code>  (optional) Credential stores to resolve credentials
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/count.counter.html Counter]] (in the Pip.Services components package)
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/count.cachedcounters.html CachedCounters]] (in the Pip.Services components package)
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/log.compositelogger.html CompositeLogger]] (in the Pip.Services components package)

 *
 * ### Example ###
 *
 *     let logger = new Logger();
 *     logger.config(ConfigParams.fromTuples(
 *         "stream", "mystream",
 *         "group", "mygroup",
 *         "connection.region", "us-east-1",
 *         "connection.access_id", "XXXXXXXXXXX",
 *         "connection.access_key", "XXXXXXXXXXX"
 *     ));
 *     logger.setReferences(References.fromTuples(
 *         new Descriptor("pip-services", "logger", "console", "default", "1.0"),
 *         new ConsoleLogger()
 *     ));
 *
 *     await logger.open("123");
 *
 *     logger.setLevel(LogLevel.debug);
 *
 *     logger.error("123", ex, "Error occured: %s", ex.message);
 *     logger.debug("123", "Everything is OK.");
 */
class CloudWatchLogger extends pip_services3_components_nodex_1.CachedLogger {
    /**
     * Creates a new instance of this logger.
     */
    constructor() {
        super();
        this._connectionResolver = new AwsConnectionResolver_1.AwsConnectionResolver();
        this._client = null; //AmazonCloudWatchLogsClient
        this._connectTimeout = 30000;
        this._group = "undefined";
        this._stream = null;
        this._lastToken = null;
        this._logger = new pip_services3_components_nodex_2.CompositeLogger();
    }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        super.configure(config);
        this._connectionResolver.configure(config);
        this._group = config.getAsStringWithDefault('group', this._group);
        this._stream = config.getAsStringWithDefault('stream', this._stream);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     * @see [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/refer.ireferences.html IReferences]] (in the Pip.Services commons package)
     */
    setReferences(references) {
        super.setReferences(references);
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);
        let contextInfo = references.getOneOptional(new pip_services3_commons_nodex_2.Descriptor("pip-services", "context-info", "default", "*", "1.0"));
        if (contextInfo != null && this._stream == null)
            this._stream = contextInfo.name;
        if (contextInfo != null && this._group == null)
            this._group = contextInfo.contextId;
    }
    /**
     * Writes a log message to the logger destination.
     *
     * @param level             a log level.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param error             an error object associated with this message.
     * @param message           a human-readable message to log.
     */
    write(level, correlationId, ex, message) {
        if (this._level < level) {
            return;
        }
        super.write(level, correlationId, ex, message);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._timer != null;
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
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
            this._client = new aws_sdk_1.CloudWatchLogs({ apiVersion: '2014-03-28' });
            try {
                yield this.createLogGroup({
                    logGroupName: this._group
                });
            }
            catch (err) {
                if (err.code != "ResourceAlreadyExistsException") {
                    throw err;
                }
            }
            try {
                yield this.createLogStream({
                    logGroupName: this._group,
                    logStreamName: this._stream
                });
            }
            catch (err) {
                if (err.code == "ResourceAlreadyExistsException") {
                    const data = yield this.describeLogStreams({
                        logGroupName: this._group,
                        logStreamNamePrefix: this._stream,
                    });
                    if (data.logStreams.length > 0) {
                        this._lastToken = data.logStreams[0].uploadSequenceToken;
                    }
                    if (this._timer == null) {
                        this._timer = setInterval(() => { this.dump(); }, this._interval);
                    }
                    return;
                }
                throw err;
            }
            this._lastToken = null;
        });
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.save(this._cache);
            if (this._timer) {
                clearInterval(this._timer);
            }
            this._cache = [];
            this._timer = null;
            this._client = null;
        });
    }
    formatMessageText(message) {
        let result = "";
        result += "[" + (message.source ? message.source : "---") + ":" +
            (message.correlation_id ? message.correlation_id : "---") + ":" + message.level + "] " +
            message.message;
        if (message.error != null) {
            if (!message.message) {
                result += "Error: ";
            }
            else {
                result += ": ";
            }
            result += message.error.message;
            if (message.error.stack_trace) {
                result += " StackTrace: " + message.error.stack_trace;
            }
        }
        return result;
    }
    /**
     * Saves log messages from the cache.
     *
     * @param messages  a list with log messages
     */
    save(messages) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isOpen() || messages == null || messages.length == 0) {
                return;
            }
            if (this._client == null) {
                throw new pip_services3_commons_nodex_1.ConfigException("cloudwatch_logger", 'NOT_OPENED', 'CloudWatchLogger is not opened');
            }
            let events = [];
            messages.forEach(message => {
                events.push({
                    timestamp: message.time.getTime(),
                    message: this.formatMessageText(message)
                });
            });
            // get token again if saving log from another container
            const streamData = yield this.describeLogStreams({
                logGroupName: this._group,
                logStreamNamePrefix: this._stream,
            });
            if (streamData.logStreams.length > 0) {
                this._lastToken = streamData.logStreams[0].uploadSequenceToken;
            }
            const logData = yield this.putLogEvents({
                logEvents: events,
                logGroupName: this._group,
                logStreamName: this._stream,
                sequenceToken: this._lastToken
            });
            this._lastToken = logData.nextSequenceToken;
        });
    }
    createLogGroup(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                this._client.createLogGroup(params, err => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res();
                });
            });
        });
    }
    describeLogStreams(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                this._client.describeLogStreams(params, (err, data) => {
                    if (err) {
                        rej(err);
                        return;
                    }
                    res(data);
                });
            });
        });
    }
    createLogStream(paramsStream) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                this._client.createLogStream(paramsStream, (err, data) => {
                    if (err) {
                        if (err.code == "ResourceAlreadyExistsException") {
                            let params = {
                                logGroupName: this._group,
                                logStreamNamePrefix: this._stream,
                            };
                            this._client.describeLogStreams(params, (err, data) => {
                                if (data.logStreams.length > 0) {
                                    this._lastToken = data.logStreams[0].uploadSequenceToken;
                                }
                                rej(err);
                                return;
                            });
                        }
                        else {
                            rej(err);
                            return;
                        }
                    }
                    else {
                        this._lastToken = null;
                        res(data);
                        return;
                    }
                });
            });
        });
    }
    putLogEvents(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res, rej) => {
                this._client.putLogEvents(params, (err, data) => {
                    if (err) {
                        if (this._logger)
                            this._logger.error("cloudwatch_logger", err, "putLogEvents error");
                    }
                    res(data);
                });
            });
        });
    }
}
exports.CloudWatchLogger = CloudWatchLogger;
//# sourceMappingURL=CloudWatchLogger.js.map