/** @module containers */
import { ICommandable } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';

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
export abstract class CommandableLambdaFunction extends LambdaFunction {

    /**
     * Creates a new instance of this lambda function.
     * 
     * @param name          (optional) a container name (accessible via ContextInfo)
     * @param description   (optional) a container description (accessible via ContextInfo)
     */
    public constructor(name: string, description?: string) {
        super(name, description);
        this._dependencyResolver.put('controller', 'none');
    }

    private registerCommandSet(commandSet: CommandSet) {
        let commands = commandSet.getCommands();
        for (let index = 0; index < commands.length; index++) {
            let command = commands[index];

            this.registerAction(command.getName(), null, async params => {
                let correlationId = params.correlation_id;
                let args = Parameters.fromValue(params);
                let timing = this.instrument(correlationId, this._info.name + '.' + command.getName());

                try {
                    const result = await command.execute(correlationId, args);
                    timing.endTiming();
                    return result;
                } catch (err) {
                    timing.endTiming(err);
                    throw err;
                }
            });
        }
    }

    /**
     * Registers all actions in this lambda function.
     */
    public register(): void {
        let controller: ICommandable = this._dependencyResolver.getOneRequired<ICommandable>('controller');
        let commandSet = controller.getCommandSet();
        this.registerCommandSet(commandSet);
    }
}
