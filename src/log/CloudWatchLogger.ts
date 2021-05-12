/** @module log */
/** @hidden */
import { IReferenceable } from 'pip-services3-commons-nodex';
import { LogLevel } from 'pip-services3-components-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IOpenable } from 'pip-services3-commons-nodex';
import { CachedLogger } from 'pip-services3-components-nodex';
import { LogMessage } from 'pip-services3-components-nodex';
import { ConfigException } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { AwsConnectionResolver } from '../connect';
import { AwsConnectionParams } from '../connect';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { ContextInfo } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex'
import { CloudWatchLogs, config } from 'aws-sdk';

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
export class CloudWatchLogger extends CachedLogger implements IReferenceable, IOpenable {
    private _timer: any;

    private _connectionResolver: AwsConnectionResolver = new AwsConnectionResolver();
    private _client: any = null; //AmazonCloudWatchLogsClient
    private _connection: AwsConnectionParams;
    private _connectTimeout: number = 30000;

    private _group: string = "undefined";
    private _stream: string = null;
    private _lastToken: string = null;

    private _logger: CompositeLogger = new CompositeLogger();

    /**
     * Creates a new instance of this logger.
     */
    public constructor() {
        super();
    }

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
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
    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);

        let contextInfo = references.getOneOptional<ContextInfo>(
            new Descriptor("pip-services", "context-info", "default", "*", "1.0"));
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
    protected write(level: LogLevel, correlationId: string, ex: Error, message: string): void {
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
    public isOpen(): boolean {
        return this._timer != null;
    }

	/**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
	 */
    public async open(correlationId: string): Promise<void> {
        if (this.isOpen()) {
            return;
        }

        this._connection = await this._connectionResolver.resolve(correlationId);

        config.update({
            accessKeyId: this._connection.getAccessId(),
            secretAccessKey: this._connection.getAccessKey(),
            region: this._connection.getRegion()
        });

        config.httpOptions = {
            timeout: this._connectTimeout
        };

        this._client = new CloudWatchLogs({ apiVersion: '2014-03-28' });

        try {
            await this.createLogGroup({
                logGroupName: this._group
            });
        } catch (err) {
            if (err.code != "ResourceAlreadyExistsException") {
                throw err;
            }
        }


        try {
            await this.createLogStream({
                logGroupName: this._group,
                logStreamName: this._stream
            });
        } catch (err) {
            if (err.code == "ResourceAlreadyExistsException") {
                const data = await this.describeLogStreams({
                    logGroupName: this._group,
                    logStreamNamePrefix: this._stream,
                });
                if (data.logStreams.length > 0) {
                    this._lastToken = data.logStreams[0].uploadSequenceToken;
                }
                if (this._timer == null) {
                    this._timer = setInterval(() => { this.dump() }, this._interval);
                }
                return;
            }
            throw err;
        }
        this._lastToken = null;
    }

	/**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
	 */
    public async close(correlationId: string): Promise<void> {
        await this.save(this._cache);
        if (this._timer) {
            clearInterval(this._timer);
        }

        this._cache = [];
        this._timer = null;
        this._client = null;
    }

    private formatMessageText(message: LogMessage): string {
        let result: string = "";
        result += "[" + (message.source ? message.source : "---") + ":" +
            (message.correlation_id ? message.correlation_id : "---") + ":" + message.level + "] " +
            message.message;
        if (message.error != null) {
            if (!message.message) {
                result += "Error: ";
            } else {
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
    protected async save(messages: LogMessage[]): Promise<void> {
        if (!this.isOpen() || messages == null || messages.length == 0) {
            return;
        }

        if (this._client == null) {
            throw new ConfigException(
                "cloudwatch_logger", 'NOT_OPENED', 'CloudWatchLogger is not opened'
            );
        }

        let events = [];
        messages.forEach(message => {
            events.push({
                timestamp: message.time.getTime(),
                message: this.formatMessageText(message)
            });
        });

        // get token again if saving log from another container
        const streamData = await this.describeLogStreams({
            logGroupName: this._group,
            logStreamNamePrefix: this._stream,
        });
        if (streamData.logStreams.length > 0) {
            this._lastToken = streamData.logStreams[0].uploadSequenceToken;
        }

        const logData = await this.putLogEvents({
            logEvents: events,
            logGroupName: this._group,
            logStreamName: this._stream,
            sequenceToken: this._lastToken
        });
        this._lastToken = logData.nextSequenceToken;
    }

    private async createLogGroup(params: any): Promise<void> {
        return new Promise((res, rej) => {
            this._client.createLogGroup(params, err => {
                if (err) {
                    rej(err);
                    return;
                }
                res();
            });
        });
    }

    private async describeLogStreams(params: any): Promise<any> {
        return new Promise((res, rej) => {
            this._client.describeLogStreams(params, (err, data) => {
                if (err) {
                    rej(err);
                    return;
                }
                res(data);
            });
        });
    }

    private async createLogStream(paramsStream): Promise<any> {
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
    }

    private async putLogEvents(params: any): Promise<any> {
        return new Promise((res, rej) => {
            this._client.putLogEvents(params, (err, data) => {
                if (err) {
                    if (this._logger) this._logger.error("cloudwatch_logger", err, "putLogEvents error");
                }
                res(data);
            });
        });
    }
}