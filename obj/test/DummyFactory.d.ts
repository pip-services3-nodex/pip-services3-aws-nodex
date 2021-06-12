import { Factory } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';
export declare class DummyFactory extends Factory {
    static Descriptor: Descriptor;
    static ControllerDescriptor: Descriptor;
    static LambdaServiceDescriptor: Descriptor;
    static CmdLambdaServiceDescriptor: Descriptor;
    constructor();
}
