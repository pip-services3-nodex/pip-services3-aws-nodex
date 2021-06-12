import { LambdaFunction } from './LambdaFunction';
/**
 * Abstract AWS Lambda function, that acts as a container to instantiate and run components
 * and expose them via external entry point. All actions are automatically generated for commands
 * defined in [[https://pip-services3-nodex.github.io/pip-services3-commons-nodex/interfaces/commands.icommandable.html ICommandable components]]. Each command is exposed as an action defined by "cmd" parameter.
 *
 * Container configuration for this Lambda function is stored in <code>"./config/config.yml"</code> file.
 * But this path can be overriden by <code>CONFIG_PATH</code> environment variable.
 *
 * Note: This component has been deprecated. Use LambdaService instead.
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
 *     class MyLambdaFunction extends CommandableLambdaFunction {
 *         private _controller: IMyController;
 *         ...
 *         public constructor() {
 *             base("mygroup", "MyGroup lambda function");
 *             this._dependencyResolver.put(
 *                 "controller",
 *                 new Descriptor("mygroup","controller","*","*","1.0")
 *             );
 *         }
 *     }
 *
 *     let lambda = new MyLambdaFunction();
 *
 *     await service.run();
 *     console.log("MyLambdaFunction is started");
 */
export declare abstract class CommandableLambdaFunction extends LambdaFunction {
    /**
     * Creates a new instance of this lambda function.
     *
     * @param name          (optional) a container name (accessible via ContextInfo)
     * @param description   (optional) a container description (accessible via ContextInfo)
     */
    constructor(name: string, description?: string);
    private registerCommandSet;
    /**
     * Registers all actions in this lambda function.
     */
    register(): void;
}
