const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';

import { Dummy } from '../Dummy';
import { DummyLambdaFunction } from './DummyLambdaFunction';

suite('DummyLambdaService', () => {
    let DUMMY1: Dummy = { id: null, key: "Key 1", content: "Content 1" };
    let DUMMY2: Dummy = { id: null, key: "Key 2", content: "Content 2" };

    let lambda: DummyLambdaFunction;

    suiteSetup(async () => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'controller.descriptor', 'pip-services-dummies:controller:default:default:1.0',
            'service.descriptor', 'pip-services-dummies:service:awslambda:default:1.0'
        );

        lambda = new DummyLambdaFunction();
        lambda.configure(config);
        await lambda.open(null);
    });

    suiteTeardown(async () => {
        await lambda.close(null);
    });

    test('CRUD Operations', async () => {

        // Create one dummy
        let dummy1 = await lambda.act({
                cmd: 'dummies.create_dummy',
                dummy: DUMMY1
        });
        assert.isObject(dummy1);
        assert.equal(dummy1.content, DUMMY1.content);
        assert.equal(dummy1.key, DUMMY1.key);

        // Create another dummy
        let dummy2 = await lambda.act({
                cmd: 'dummies.create_dummy',
                dummy: DUMMY2
        });
        assert.isObject(dummy2);
        assert.equal(dummy2.content, DUMMY2.content);
        assert.equal(dummy2.key, DUMMY2.key);

        // Update the dummy
        dummy1.content = 'Updated Content 1'
        const updatedDummy1 = await lambda.act({
                cmd: 'dummies.update_dummy',
                dummy: dummy1
        });
        assert.isObject(updatedDummy1);
        assert.equal(updatedDummy1.id, dummy1.id);
        assert.equal(updatedDummy1.content, dummy1.content);
        assert.equal(updatedDummy1.key, dummy1.key);
        dummy1 = updatedDummy1

        // Delete dummy
        await lambda.act({
                cmd: 'dummies.delete_dummy',
                dummy_id: dummy1.id
        });

        const dummy = await lambda.act({
                cmd: 'dummies.get_dummy_by_id',
                dummy_id: dummy1.id
        });
        assert.isNull(dummy || null);
    });

});
