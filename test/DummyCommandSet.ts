import { DataPage } from 'pip-services3-commons-nodex';
import { CommandSet } from 'pip-services3-commons-nodex';
import { ICommand } from 'pip-services3-commons-nodex';
import { Command } from 'pip-services3-commons-nodex';
import { Parameters } from 'pip-services3-commons-nodex';
import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';
import { ObjectSchema } from 'pip-services3-commons-nodex';
import { TypeCode } from 'pip-services3-commons-nodex';
import { FilterParamsSchema } from 'pip-services3-commons-nodex';
import { PagingParamsSchema } from 'pip-services3-commons-nodex';

import { Dummy } from './Dummy';
import { IDummyController } from './IDummyController';
import { DummySchema } from './DummySchema';

export class DummyCommandSet extends CommandSet {
    private _controller: IDummyController;

	constructor(controller: IDummyController) {
		super();

		this._controller = controller;

		this.addCommand(this.makeGetPageByFilterCommand());
		this.addCommand(this.makeGetOneByIdCommand());
		this.addCommand(this.makeCreateCommand());
		this.addCommand(this.makeUpdateCommand());
		this.addCommand(this.makeDeleteByIdCommand());
	}

	private makeGetPageByFilterCommand(): ICommand {
		return new Command(
			"get_dummies",
			new ObjectSchema(true)
                .withOptionalProperty("filter", new FilterParamsSchema())
                .withOptionalProperty("paging", new PagingParamsSchema()),
			(correlationId: string, args: Parameters): Promise<DataPage<Dummy>> => {
				let filter = FilterParams.fromValue(args.get("filter"));
				let paging = PagingParams.fromValue(args.get("paging"));
				return this._controller.getPageByFilter(correlationId, filter, paging);
			}
		);
	}

	private makeGetOneByIdCommand(): ICommand {
		return new Command(
			"get_dummy_by_id",
            new ObjectSchema(true)
                .withRequiredProperty("dummy_id", TypeCode.String),
			(correlationId: string, args: Parameters): Promise<Dummy> => {
				let id = args.getAsString("dummy_id");
				return this._controller.getOneById(correlationId, id);
			}
		);
	}

	private makeCreateCommand(): ICommand {
		return new Command(
			"create_dummy",
            new ObjectSchema(true)
                .withRequiredProperty("dummy", new DummySchema()),
			(correlationId: string, args: Parameters): Promise<Dummy> => {
				let entity: Dummy = args.get("dummy");
				return this._controller.create(correlationId, entity);
			}
		);
	}

	private makeUpdateCommand(): ICommand {
		return new Command(
			"update_dummy",
            new ObjectSchema(true)
                .withRequiredProperty("dummy", new DummySchema()),
			(correlationId: string, args: Parameters): Promise<Dummy> => {
				let entity: Dummy = args.get("dummy");
				return this._controller.update(correlationId, entity);
			}
		);
	}

	private makeDeleteByIdCommand(): ICommand {
		return new Command(
			"delete_dummy",
            new ObjectSchema(true)
                .withRequiredProperty("dummy_id", TypeCode.String),
			(correlationId: string, args: Parameters): Promise<Dummy> => {
				let id = args.getAsString("dummy_id");
				return this._controller.deleteById(correlationId, id);
			}
		);
	}

}