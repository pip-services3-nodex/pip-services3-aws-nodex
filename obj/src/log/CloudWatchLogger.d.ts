/** @module log */
import { IReferenceable } from 'pip-services3-commons-nodex';
import { LogLevel } from 'pip-services3-components-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IOpenable } from 'pip-services3-commons-nodex';
import { CachedLogger } from 'pip-services3-components-nodex';
import { LogMessage } from 'pip-services3-components-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
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
export declare class CloudWatchLogger extends CachedLogger implements IReferenceable, IOpenable {
    private _timer;
    private _connectionResolver;
    private _client;
    private _connection;
    private _connectTimeout;
    private _group;
    private _stream;
    private _lastToken;
    private _logger;
    /**
     * Creates a new instance of this logger.
     */
    constructor();
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     * @see [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/refer.ireferences.html IReferences]] (in the Pip.Services commons package)
     */
    setReferences(references: IReferences): void;
    /**
     * Writes a log message to the logger destination.
     *
     * @param level             a log level.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param error             an error object associated with this message.
     * @param message           a human-readable message to log.
     */
    protected write(level: LogLevel, correlationId: string, ex: Error, message: string): void;
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId: string): Promise<void>;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    close(correlationId: string): Promise<void>;
    private formatMessageText;
    /**
     * Saves log messages from the cache.
     *
     * @param messages  a list with log messages
     */
    protected save(messages: LogMessage[]): Promise<void>;
    private createLogGroup;
    private describeLogStreams;
    private createLogStream;
    private putLogEvents;
}
