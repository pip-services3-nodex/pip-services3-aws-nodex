/** @module services */

import { LambdaAction } from './LambdaAction';

/**
 * An interface that allows to integrate lambda services into lambda function containers
 * and connect their actions to the function calls.
 */
export interface ILambdaService {
    /**
     * Get all actions supported by the service.
     * @returns an array with supported actions.
     */
    getActions(): LambdaAction[];
}