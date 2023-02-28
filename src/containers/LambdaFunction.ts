/** @module containers */
/** @hidden */ 
const process = require('process');

import { BadRequestException } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { DependencyResolver } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { Schema } from 'pip-services3-commons-nodex';
import { UnknownException } from 'pip-services3-commons-nodex';
import { Container } from 'pip-services3-container-nodex';
import { CompositeCounters } from 'pip-services3-components-nodex';
import { ConsoleLogger } from 'pip-services3-components-nodex';
import { CompositeTracer } from 'pip-services3-components-nodex';
import { InstrumentTiming } from 'pip-services3-rpc-nodex';

import { ILambdaService } from '../services/ILambdaService';

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
 * - <code>\*:service:awslambda:\*:1.0</code>       (optional) [[https://pip-services3-nodex.github.io/pip-services3-aws-nodex/interfaces/services.ilambdaservice.html ILambdaService]] services to handle action requests
 * - <code>\*:service:commandable-awslambda:\*:1.0</code> (optional) [[https://pip-services3-nodex.github.io/pip-services3-aws-nodex/interfaces/services.ilambdaservice.html ILambdaService]] services to handle action requests
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
export abstract class LambdaFunction extends Container {
    /**
     * The performanc counters.
     */
    protected _counters = new CompositeCounters();
    /**
     * The tracer.
     */
    protected _tracer: CompositeTracer = new CompositeTracer();
    /**
     * The dependency resolver.
     */
    protected _dependencyResolver = new DependencyResolver();
    /**
     * The map of registred validation schemas.
     */
    protected _schemas: { [id: string]: Schema } = {};
    /**
     * The map of registered actions.
     */
    protected _actions: { [id: string]: any } = {};
    /**
     * The default path to config file.
     */
    protected _configPath: string = './config/config.yml';

    /**
     * Creates a new instance of this lambda function.
     * 
     * @param name          (optional) a container name (accessible via ContextInfo)
     * @param description   (optional) a container description (accessible via ContextInfo)
     */
    public constructor(name?: string, description?: string) {
        super(name, description);

        this._logger = new ConsoleLogger();
        this._dependencyResolver
    }

    private getConfigPath(): string {
        return process.env.CONFIG_PATH || this._configPath;
    }

    private getParameters(): ConfigParams {
        return ConfigParams.fromValue(process.env);
    }

    private captureErrors(correlationId: string): void {
        // Log uncaught exceptions
        process.on('uncaughtException', (ex) => {
            this._logger.fatal(correlationId, ex, "Process is terminated");
            process.exit(1);
        });
    }

    private captureExit(correlationId: string): void {
        this._logger.info(correlationId, "Press Control-C to stop the microservice...");

        // Activate graceful exit
        process.on('SIGINT', () => {
            process.exit();
        });

        // Gracefully shutdown
        process.on('exit', () => {
            this.close(correlationId);
            this._logger.info(correlationId, "Goodbye!");
        });
    }

	/**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
	 */
    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._counters.setReferences(references);
        this._dependencyResolver.setReferences(references);

        this.register();
    }

    /**
	 * Opens the component.
	 * 
	 * @param correlationId 	(optional) transaction id to trace execution through call chain.
     */
     public async open(correlationId: string): Promise<void> {
         if (this.isOpen()) return;

         await super.open(correlationId);
         this.registerServices();
     }


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
    protected instrument(correlationId: string, name: string): InstrumentTiming {
        this._logger.trace(correlationId, "Executing %s method", name);
        this._counters.incrementOne(name + ".exec_count");

        let counterTiming = this._counters.beginTiming(name + ".exec_time");
        let traceTiming = this._tracer.beginTrace(correlationId, name, null);
        return new InstrumentTiming(correlationId, name, "exec",
            this._logger, this._counters, counterTiming, traceTiming);
    }

    /**
     * Runs this lambda function, loads container configuration,
     * instantiate components and manage their lifecycle,
     * makes this function ready to access action calls.
     *  
     */
    public async run(): Promise<void> {
        let correlationId = this._info.name;

        let path = this.getConfigPath();
        let parameters = this.getParameters();
        this.readConfigFromFile(correlationId, path, parameters);

        this.captureErrors(correlationId);
        this.captureExit(correlationId);
    	await this.open(correlationId);
    }

    /**
     * Registers all actions in this lambda function.
     * 
     * Note: Overloading of this method has been deprecated. Use LambdaService instead.
     */
    protected register(): void {}

    /**
     * Registers all lambda services in the container.
     */
    protected registerServices(): void {
        // Extract regular and commandable Lambda services from references
        let services = this._references.getOptional<ILambdaService>(
            new Descriptor("*", "service", "awslambda", "*", "*")
        );
        let cmdServices = this._references.getOptional<ILambdaService>(
            new Descriptor("*", "service", "commandable-awslambda", "*", "*")
        );
        services.push(...cmdServices);

        // Register actions defined in those services
        for (let service of services) {
            // Check if the service implements required interface
            if (typeof service.getActions !== "function") continue;

            let actions = service.getActions();
            for (let action of actions) {
                this.registerAction(action.cmd, action.schema, action.action);
            }
        }
    }

    /**
     * Registers an action in this lambda function.
     * 
     * Note: This method has been deprecated. Use LambdaService instead.
     * 
     * @param cmd           a action/command name.
     * @param schema        a validation schema to validate received parameters.
     * @param action        an action function that is called when action is invoked.
     */
    protected registerAction(cmd: string, schema: Schema, 
        action: (params: any) => Promise<any>): void {
        if (cmd == '') {
            throw new UnknownException(null, 'NO_COMMAND', 'Missing command');
        }

        if (action == null) {
            throw new UnknownException(null, 'NO_ACTION', 'Missing action');
        }

        if (typeof action != "function") {
            throw new UnknownException(null, 'ACTION_NOT_FUNCTION', 'Action is not a function');
        }

        if (this._actions.hasOwnProperty(cmd)) {
            throw new UnknownException(null, 'DUPLICATED_ACTION', `"${cmd}" action already exists`);
        }

        // Hack!!! Wrapping action to preserve prototyping context
        const actionCurl = (params) => {
            // Perform validation
            if (schema != null) {
                let correlationId = params.correlaton_id;
                let err = schema.validateAndReturnException(correlationId, params, false);
                if (err != null) {
                    throw err;
                }
            }

            // Todo: perform verification?
            return action.call(this, params);
        };

        this._actions[cmd] = actionCurl;
    }

    /**
     * Executes this AWS Lambda function and returns the result.
     * This method can be overloaded in child classes
     * if they need to change the default behavior
     * 
     * @params event the event parameters (or function arguments)
     * @returns the result of the function execution.
     */
    protected async execute(event: any): Promise<any> {
        let cmd: string = event.cmd;
        let correlationId = event.correlation_id;
        
        if (cmd == null) {
            throw new BadRequestException(
                correlationId, 
                'NO_COMMAND', 
                'Cmd parameter is missing'
            );
        }
        
        const action: any = this._actions[cmd];
        if (action == null) {
            throw new BadRequestException(
                correlationId, 
                'NO_ACTION', 
                'Action ' + cmd + ' was not found'
            )
            .withDetails('command', cmd);
        }
        
        return action(event);
    }
    
    private async handler(event: any): Promise<any> {
        // If already started then execute
        if (this.isOpen()) {
            return this.execute(event);
        }
        // Start before execute
        await this.run();
        return this.execute(event);
    }
    
    /**
     * Gets entry point into this lambda function.
     * 
     * @param event     an incoming event object with invocation parameters.
     */
    public getHandler(): (event: any) => Promise<any> {
        let self = this;
        
        // Return plugin function
        return async function (event) {
            // Calling run with changed context
            return self.handler.call(self, event);
        }
    }

    /**
     * Calls registered action in this lambda function.
     * "cmd" parameter in the action parameters determin
     * what action shall be called.
     * 
     * This method shall only be used in testing.
     * 
     * @param params action parameters.
     */
    public async act(params: any): Promise<any> {
        return this.getHandler()(params);
    }

}