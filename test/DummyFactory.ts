import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { DummyController } from './DummyController';

export class DummyFactory extends Factory {
	public static Descriptor = new Descriptor("pip-services-dummies", "factory", "default", "default", "1.0");
	public static ControllerDescriptor = new Descriptor("pip-services-dummies", "controller", "default", "*", "1.0");
	
	public constructor() {
		super();
		this.registerAsType(DummyFactory.ControllerDescriptor, DummyController);
	}
	
}