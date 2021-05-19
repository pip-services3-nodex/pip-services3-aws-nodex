let process = require('process');

import { ConfigParams } from 'pip-services3-commons-nodex';
import { DummyClientFixture } from '../DummyClientFixture';
import { DummyCommandableLambdaClient } from './DummyCommandableLambdaClient';

suite('DummyCommandableLambdaClient', ()=> {
    let awsAccessId = process.env['AWS_ACCESS_ID'];
    let awsAccessKey = process.env['AWS_ACCESS_KEY'];
    let lambdaArn = process.env['LAMBDA_ARN'];
    
    if (!awsAccessId || !awsAccessKey || !lambdaArn) {
        return;
    }

    let lambdaConfig = ConfigParams.fromTuples(
        'connection.protocol', 'aws',
        'connection.arn', lambdaArn,
        'credential.access_id', awsAccessId,
        'credential.access_key', awsAccessKey,
        'options.connection_timeout', 30000
    );

    let client: DummyCommandableLambdaClient;
    let fixture: DummyClientFixture;

    setup(async () => {
        client = new DummyCommandableLambdaClient();
        client.configure(lambdaConfig);

        fixture = new DummyClientFixture(client);

        await client.open(null);
    });

    teardown(async () => {
        await client.close(null);
    });

    test('Crud Operations', async () => {
        await fixture.testCrudOperations();
    });

});