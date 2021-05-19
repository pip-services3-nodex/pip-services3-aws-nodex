import { IReferences } from 'pip-services3-commons-nodex';
import { LambdaFunction } from '../../src/containers/LambdaFunction';
export declare class DummyLambdaFunction extends LambdaFunction {
    private _controller;
    constructor();
    setReferences(references: IReferences): void;
    private getPageByFilter;
    private getOneById;
    private create;
    private update;
    private deleteById;
    protected register(): void;
}
export declare const handler: (event: any) => Promise<any>;
