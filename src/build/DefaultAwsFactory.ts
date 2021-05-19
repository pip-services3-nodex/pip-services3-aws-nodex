/** @module build */
import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { CloudWatchLogger } from '../log/CloudWatchLogger';
import { CloudWatchCounters } from '../count/CloudWatchCounters';

/**
 * Creates AWS components by their descriptors.
 * 
 * @see [[CloudWatchLogger]]
 * @see [[CloudWatchCounters]]
 */
export class DefaultAwsFactory extends Factory {
    public static readonly Descriptor = new Descriptor("pip-services", "factory", "aws", "default", "1.0");
    
	public static readonly CloudWatchLoggerDescriptor = new Descriptor("pip-services", "logger", "cloudwatch", "*", "1.0");
	public static readonly CloudWatchCountersDescriptor = new Descriptor("pip-services", "counters", "cloudwatch", "*", "1.0");
    
	/**
	 * Create a new instance of the factory.
	 */
	public constructor() {
        super();
		this.registerAsType(DefaultAwsFactory.CloudWatchLoggerDescriptor, CloudWatchLogger);
		this.registerAsType(DefaultAwsFactory.CloudWatchCountersDescriptor, CloudWatchCounters);
	}
}