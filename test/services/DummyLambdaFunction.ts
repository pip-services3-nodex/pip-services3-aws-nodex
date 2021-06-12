import { LambdaFunction } from '../../src/containers/LambdaFunction';
import { DummyFactory } from '../DummyFactory';

export class DummyLambdaFunction extends LambdaFunction {
    public constructor() {
        super("dummy", "Dummy lambda function");
        this._factories.add(new DummyFactory());
    }
}

export const handler = new DummyLambdaFunction().getHandler();