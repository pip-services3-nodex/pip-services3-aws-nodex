/** @module count */
/** @hidden */

import { IReferenceable } from 'pip-services3-commons-nodex';
import { CounterType } from 'pip-services3-components-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IOpenable } from 'pip-services3-commons-nodex';
import { CachedCounters, Counter } from 'pip-services3-components-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { AwsConnectionResolver } from '../connect';
import { AwsConnectionParams } from '../connect';
import { CompositeLogger } from 'pip-services3-components-nodex';
import { ContextInfo } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { CloudWatchUnit } from './CloudWatchUnit';
import { CloudWatch, config } from 'aws-sdk';

/**
 * Performance counters that periodically dumps counters to AWS Cloud Watch Metrics.
 * 
 * ### Configuration parameters ###
 * 
 * - connections:                   
 *     - discovery_key:         (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *     - region:                (optional) AWS region
 * - credentials:    
 *     - store_key:             (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *     - access_id:             AWS access/client id
 *     - access_key:            AWS access/client id
 * - options:
 *     - interval:              interval in milliseconds to save current counters measurements (default: 5 mins)
 *     - reset_timeout:         timeout in milliseconds to reset the counters. 0 disables the reset (default: 0)
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
 *     let counters = new CloudWatchCounters();
 *     counters.config(ConfigParams.fromTuples(
 *         "connection.region", "us-east-1",
 *         "connection.access_id", "XXXXXXXXXXX",
 *         "connection.access_key", "XXXXXXXXXXX"
 *     ));
 *     counters.setReferences(References.fromTuples(
 *         new Descriptor("pip-services", "logger", "console", "default", "1.0"), 
 *         new ConsoleLogger()
 *     ));
 *     
 *     await counters.open("123");
 *     
 *     counters.increment("mycomponent.mymethod.calls");
 *     let timing = counters.beginTiming("mycomponent.mymethod.exec_time");
 *     try {
 *         ...
 *     } finally {
 *         timing.endTiming();
 *     }
 *     
 *     counters.dump();
 */
export class CloudWatchCounters extends CachedCounters implements IReferenceable, IOpenable {
    private _logger: CompositeLogger = new CompositeLogger();

    private _connectionResolver: AwsConnectionResolver = new AwsConnectionResolver();
    private _connection: AwsConnectionParams;
    private _connectTimeout: number = 30000;
    private _client: any = null; //AmazonCloudWatchClient

    private _source: string;
    private _instance: string;
    private _opened: boolean = false;

    /**
     * Creates a new instance of this counters.
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

        this._source = config.getAsStringWithDefault('source', this._source);
        this._instance = config.getAsStringWithDefault('instance', this._instance);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
    }

	/**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
	 * @see [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/refer.ireferences.html IReferences]] (in the Pip.Services commons package)
	 */
    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._connectionResolver.setReferences(references);

        let contextInfo = references.getOneOptional<ContextInfo>(
            new Descriptor("pip-services", "context-info", "default", "*", "1.0"));
        if (contextInfo != null && this._source == null)
            this._source = contextInfo.name;
        if (contextInfo != null && this._instance == null)
            this._instance = contextInfo.contextId;
    }

	/**
	 * Checks if the component is opened.
	 * 
	 * @returns true if the component has been opened and false otherwise.
	 */
    public isOpen(): boolean {
        return this._opened;
    }

	/**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
	 */
    public async open(correlationId: string): Promise<void> {
        if (this._opened) {
            return;
        }

        this._opened = true;
        this._connection = await this._connectionResolver.resolve(correlationId);

        config.update({
            accessKeyId: this._connection.getAccessId(),
            secretAccessKey: this._connection.getAccessKey(),
            region: this._connection.getRegion()
        });

        config.httpOptions = {
            timeout: this._connectTimeout
        };

        this._client = new CloudWatch({ apiVersion: '2010-08-01' });
    }

	/**
	 * Closes component and frees used resources.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
	 */
    public async close(correlationId: string): Promise<void> {
        this._opened = false;
        this._client = null;
    }

    private getCounterData(counter: Counter, now: Date, dimensions: any[]): any {
        let value = {
            MetricName: counter.name,
            Timestamp: counter.time,
            Dimensions: dimensions,
            Unit: CloudWatchUnit.None,
        }

        switch (counter.type) {
            case CounterType.Increment:
                value['Value'] = counter.count;
                value.Unit = CloudWatchUnit.Count;
                break;
            case CounterType.Interval:
                value.Unit = CloudWatchUnit.Milliseconds;
                //value.Value = counter.average;
                value['StatisticValues'] = {
                    SampleCount: counter.count,
                    Maximum: counter.max,
                    Minimum: counter.min,
                    Sum: counter.count * counter.average
                };
                break;
            case CounterType.Statistics:
                //value.Value = counter.average;
                value['StatisticValues'] = {
                    SampleCount: counter.count,
                    Maximum: counter.max,
                    Minimum: counter.min,
                    Sum: counter.count * counter.average
                };
                break;
            case CounterType.LastValue:
                value['Value'] = counter.last;
                break;
            case CounterType.Timestamp:
                value['Value'] = counter.time.getTime();
                break;
        }

        return value;
    }

    /**
     * Saves the current counters measurements.
     * 
     * @param counters      current counters measurements to be saves.
     */
    protected async save(counters: Counter[]): Promise<void> {
        if (this._client == null) return;

        let dimensions = [];
        dimensions.push({
            Name: "InstanceID",
            Value: this._instance
        });

        let now = new Date();

        let data = [];

        const params = {
            MetricData: data,
            Namespace: this._source
        };

        for (const counter of counters) {
            data.push(this.getCounterData(counter, now, dimensions));
            if (data.length >= 20) {
                await this.putMetricData({
                    MetricData: data,
                    Namespace: this._source
                });
                data = [];
            }
        }
        if (data.length > 0) {
            await this.putMetricData({
                MetricData: data,
                Namespace: this._source
            });
        }
    }

    private async putMetricData(params: any): Promise<void> {
        return new Promise((res, rej) => {
            this._client.putMetricData(params, (err, data) => {
                if (err) {
                    if (this._logger) this._logger.error("cloudwatch_counters", err, "putMetricData error");
                    rej(err);
                    return;
                }
                res(data);
            });
        });
    }
}