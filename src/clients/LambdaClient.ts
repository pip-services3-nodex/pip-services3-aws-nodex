/** @module clients */
/** @hidden */
let _ = require('lodash');

import { IOpenable } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { IdGenerator } from 'pip-services3-commons-nodex';
import { UnknownException } from 'pip-services3-commons-nodex';
import { InvocationException } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { CounterTiming } from 'pip-services3-components-nodex';
import { Lambda, config } from 'aws-sdk';

import { AwsConnectionParams, AwsConnectionResolver } from '../connect';


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
export abstract class LambdaClient implements IOpenable, IConfigurable, IReferenceable {
    /**
     * The reference to AWS Lambda Function.
     */
    protected _lambda: any;
    /**
     * The opened flag.
     */
    protected _opened: boolean = false;
    /**
     * The AWS connection parameters
     */
    protected _connection: AwsConnectionParams;
    private _connectTimeout: number = 10000;

    /**
     * The dependencies resolver.
     */
    protected _dependencyResolver: DependencyResolver = new DependencyResolver();
    /**
     * The connection resolver.
     */
    protected _connectionResolver: AwsConnectionResolver = new AwsConnectionResolver();
    /**
     * The logger.
     */
    protected _logger: CompositeLogger = new CompositeLogger();
    /**
     * The performance counters.
     */
    protected _counters: CompositeCounters = new CompositeCounters();

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);
		this._dependencyResolver.configure(config);

        this._connectTimeout = config.getAsIntegerWithDefault('options.connect_timeout', this._connectTimeout);
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
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
    protected instrument(correlationId: string, name: string): CounterTiming {
        this._logger.trace(correlationId, "Executing %s method", name);
        return this._counters.beginTiming(name + ".exec_time");
    }

    /**
	 * Checks if the component is opened.
	 * 
	 * @returns {boolean} true if the component has been opened and false otherwise.
     */
    public isOpen(): boolean {
        return this._opened;
    }

    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     *
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

        this._lambda = new Lambda();

        this._opened = true;
        this._logger.debug(correlationId, "Lambda client connected to %s", this._connection.getArn());
    }

    /**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    public async close(correlationId: string): Promise<void> {
        // Todo: close listening?
        if (!this.isOpen()) {
            return;
        }
        this._opened = false;
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
    protected async invoke(invocationType: string, cmd: string, correlationId: string, args: any): Promise<any> {

        if (cmd == null) {
            throw new UnknownException(null, 'NO_COMMAND', 'Missing Seneca pattern cmd');
        }

        args = _.clone(args);
        args.cmd = cmd;
        args.correlation_id = correlationId || IdGenerator.nextShort();

        let params = {
            FunctionName: this._connection.getArn(),
            InvocationType: invocationType,
            LogType: 'None',
            Payload: JSON.stringify(args)
        }                        

        try {
            const data = await this._lambda.invokeAsync(params);

            let result: any = data.Payload;

            if (_.isString(result)) {
                try {
                    result = JSON.parse(result);
                } catch (err) {
                    throw new InvocationException(
                        correlationId,
                        'DESERIALIZATION_FAILED',
                        'Failed to deserialize result'
                    ).withCause(err);
                }
            }
            return result;
        } catch (err) {
            throw new InvocationException(
                correlationId,
                'CALL_FAILED',
                'Failed to invoke lambda function'
            ).withCause(err);
        }
    }    

    /**
     * Calls a AWS Lambda Function action.
     * 
     * @param cmd               an action name to be called.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            (optional) action parameters.
     * @return {any}            action result.
     */
    protected async call(cmd: string, correlationId: string, params: any = {}): Promise<any> {
        return this.invoke('RequestResponse', cmd, correlationId, params);
    }

    /**
     * Calls a AWS Lambda Function action asynchronously without waiting for response.
     * 
     * @param cmd               an action name to be called.
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            (optional) action parameters.
     * @return {any}            action result.
     */
    protected callOneWay(cmd: string, correlationId: string, params: any = {}): Promise<any> {
        return this.invoke('Event', cmd, correlationId, params);
    }

}