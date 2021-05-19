import { DataPage } from 'pip-services3-commons-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams} from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';
import { FilterParamsSchema } from 'pip-services3-commons-nodex';
import { PagingParamsSchema } from 'pip-services3-commons-nodex';

import { LambdaFunction } from '../../src/containers/LambdaFunction';
import { IDummyController } from '../IDummyController';
import { DummyFactory } from '../DummyFactory';
import { DummySchema } from '../DummySchema';
import { Dummy } from "../Dummy";

export class DummyLambdaFunction extends LambdaFunction {
    private _controller: IDummyController;

    public constructor() {
        super("dummy", "Dummy lambda function");
        this._dependencyResolver.put('controller', new Descriptor('pip-services-dummies', 'controller', 'default', '*', '*'));
        this._factories.add(new DummyFactory());
    }

    public setReferences(references: IReferences): void {
        super.setReferences(references);
        this._controller = this._dependencyResolver.getOneRequired<IDummyController>('controller');
    }

    private async getPageByFilter(params: any): Promise<DataPage<Dummy>> {
        return this._controller.getPageByFilter(
            params.correlation_id,
            new FilterParams(params.filter),
            new PagingParams(params.paging)
        );
    }

    private async getOneById(params: any): Promise<Dummy> {
        return this._controller.getOneById(
            params.correlation_id,
            params.dummy_id
        );
    }

    private async create(params: any): Promise<Dummy> {
        return this._controller.create(
            params.correlation_id,
            params.dummy
        );
    }

    private async update(params: any): Promise<Dummy> {
        return this._controller.update(
            params.correlation_id,
            params.dummy,
        );
    }

    private async deleteById(params: any): Promise<Dummy> {
        return this._controller.deleteById(
            params.correlation_id,
            params.dummy_id,
        );
    }

    protected register() {
        this.registerAction(
            'get_dummies',
            new ObjectSchema(true)
                .withOptionalProperty("filter", new FilterParamsSchema())
                .withOptionalProperty("paging", new PagingParamsSchema())
            , this.getPageByFilter);

        this.registerAction(
            'get_dummy_by_id',
            new ObjectSchema(true)
                .withOptionalProperty("dummy_id", TypeCode.String)
            , this.getOneById);

        this.registerAction(
            'create_dummy',
            new ObjectSchema(true)
                .withRequiredProperty("dummy", new DummySchema())
            , this.create);

        this.registerAction(
            'update_dummy',
            new ObjectSchema(true)
                .withRequiredProperty("dummy", new DummySchema())
            , this.update);

        this.registerAction(
            'delete_dummy',
            new ObjectSchema(true)
                .withOptionalProperty("dummy_id", TypeCode.String)
            , this.deleteById);
    }
}

export const handler = new DummyLambdaFunction().getHandler();