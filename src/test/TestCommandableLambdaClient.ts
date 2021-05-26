/** @module test */
import { CommandableLambdaClient } from "../clients/CommandableLambdaClient";

export class TestCommandableLambdaClient extends CommandableLambdaClient {
    public constructor(baseRoute: string) {
        super(baseRoute);
    }

    /**
     * Calls a remote action in AWS Lambda function.
     * The name of the action is added as "cmd" parameter
     * to the action parameters. 
     * 
     * @param cmd               an action name
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param params            command parameters.
     * @return {any}            action result.
     */
    public async callCommand<T>(name: string, correlationId: string, params: any): Promise<T> {
        return super.callCommand(name, correlationId, params);
    }
}