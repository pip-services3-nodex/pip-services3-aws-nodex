/** @module services */

import { Schema } from "pip-services3-commons-nodex";

export class LambdaAction {
    /**
     * Command to call the action
     */
    public cmd: string;

    /**
     * Schema to validate action parameters
     */
    public schema: Schema;

    /**
     * Action to be executed
     */
    public action: (params: any) => Promise<any>;
}