import { IReferences } from 'pip-services3-commons-nodex';
import { LambdaService } from '../../src/services/LambdaService';
export declare class DummyLambdaService extends LambdaService {
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
