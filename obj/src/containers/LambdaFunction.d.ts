import { DependencyResolver } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { Schema } from 'pip-services3-commons-nodex';
import { Container } from 'pip-services3-container-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { CompositeTracer } from 'pip-services3-components-nodex';
import { InstrumentTiming } from 'pip-services3-rpc-nodex';
/**
 * Abstract AWS Lambda function, that acts as a container to instantiate and run components
 * and expose them via external entry point.
 *
 * When handling calls "cmd" parameter determines which what action shall be called, while
 * other parameters are passed to the action itself.
 *
 * Container configuration for this Lambda function is stored in <code>"./config/config.yml"</code> file.
 * But this path can be overriden by <code>CONFIG_PATH</code> environment variable.
 *
 * ### References ###
 *
 * - <code>\*:logger:\*:\*:1.0</code>            (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>\*:counters:\*:\*:1.0</code>          (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>\*:service:lambda:\*:1.0</code>       (optional) [[https://pip-services3-nodex.github.io/pip-services3-aws-nodex/interfaces/services.ilambdaservice.html ILambdaService]] services to handle action requests
 * - <code>\*:service:commandable-lambda:\*:1.0</code> (optional) [[https://pip-services3-nodex.github.io/pip-services3-aws-nodex/interfaces/services.ilambdaservice.html ILambdaService]] services to handle action requests
 *
 * @see [[LambdaClient]]
 *
 * ### Example ###
 *
 *     class MyLambdaFunction extends LambdaFunction {
 *         public constructor() {
 *             base("mygroup", "MyGroup lambda function");
 *         }
 *     }
 *
 *     let lambda = new MyLambdaFunction();
 *
 *     await service.run();
 *     console.log("MyLambdaFunction is started");
 */
export declare abstract class LambdaFunction extends Container {
    /**
     * The performanc counters.
     */
    protected _counters: CompositeCounters;
    /**
     * The tracer.
     */
    protected _tracer: CompositeTracer;
    /**
     * The dependency resolver.
     */
    protected _dependencyResolver: DependencyResolver;
    /**
     * The map of registred validation schemas.
     */
    protected _schemas: {
        [id: string]: Schema;
    };
    /**
     * The map of registered actions.
     */
    protected _actions: {
        [id: string]: any;
    };
    /**
     * The default path to config file.
     */
    protected _configPath: string;
    /**
     * Creates a new instance of this lambda function.
     *
     * @param name          (optional) a container name (accessible via ContextInfo)
     * @param description   (optional) a container description (accessible via ContextInfo)
     */
    constructor(name?: string, description?: string);
    private getConfigPath;
    private getParameters;
    private captureErrors;
    private captureExit;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
    open(correlationId: string): Promise<void>;
    /**
     * Adds instrumentation to log calls and measure call time.
     * It returns a InstrumentTiming object that is used to end the time measurement.
     *
     * Note: This method has been deprecated. Use LambdaService instead.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param name              a method name.
     * @returns {InstrumentTiming} object to end the time measurement.
     */
    protected instrument(correlationId: string, name: string): InstrumentTiming;
    /**
     * Runs this lambda function, loads container configuration,
     * instantiate components and manage their lifecycle,
     * makes this function ready to access action calls.
     *
     */
    run(): Promise<void>;
    /**
     * Registers all actions in this lambda function.
     *
     * Note: Overloading of this method has been deprecated. Use LambdaService instead.
     */
    protected register(): void;
    /**
     * Registers all lambda services in the container.
     */
    protected registerServices(): void;
    /**
     * Registers an action in this lambda function.
     *
     * Note: This method has been deprecated. Use LambdaService instead.
     *
     * @param cmd           a action/command name.
     * @param schema        a validation schema to validate received parameters.
     * @param action        an action function that is called when action is invoked.
     */
    protected registerAction(cmd: string, schema: Schema, action: (params: any) => Promise<any>): void;
    /**
     * Executes this AWS Lambda function and returns the result.
     * This method can be overloaded in child classes
     * if they need to change the default behavior
     *
     * @params event the event parameters (or function arguments)
     * @returns the result of the function execution.
     */
    protected execute(event: any): Promise<any>;
    private handler;
    /**
     * Gets entry point into this lambda function.
     *
     * @param event     an incoming event object with invocation parameters.
     */
    getHandler(): (event: any) => Promise<any>;
    /**
     * Calls registered action in this lambda function.
     * "cmd" parameter in the action parameters determin
     * what action shall be called.
     *
     * This method shall only be used in testing.
     *
     * @param params action parameters.
     */
    act(params: any): Promise<any>;
}
