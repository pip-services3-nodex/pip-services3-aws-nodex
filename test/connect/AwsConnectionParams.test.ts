const assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-nodex';
import { AwsConnectionParams } from '../../src/connect/AwsConnectionParams';

suite('AwsConnectionParams', ()=> {

    test('Test Empty Connection', async () => {
        let connection = new AwsConnectionParams();
        assert.equal("arn:aws::::", connection.getArn());
    });

    test('Parse ARN', async () => {
        let connection = new AwsConnectionParams();

        connection.setArn("arn:aws:lambda:us-east-1:12342342332:function:pip-services-dummies")
        assert.equal("lambda", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal("function", connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());

        connection.setArn("arn:aws:s3:us-east-1:12342342332:pip-services-dummies")
        assert.equal("s3", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal(null, connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());

        connection.setArn("arn:aws:lambda:us-east-1:12342342332:function/pip-services-dummies")
        assert.equal("lambda", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal("function", connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());

    });

    test('Compose AR', async () => {
        let connection = AwsConnectionParams.fromConfig(
            ConfigParams.fromTuples(
                'connection.service', 'lambda',
                'connection.region', 'us-east-1',
                'connection.account', '12342342332',
                'connection.resource_type', 'function',
                'connection.resource', 'pip-services-dummies',
                'credential.access_id', '1234',
                'credential.access_key', 'ABCDEF'
            )
        );

        assert.equal("arn:aws:lambda:us-east-1:12342342332:function:pip-services-dummies", connection.getArn());
        assert.equal("1234", connection.getAccessId());
        assert.equal("ABCDEF", connection.getAccessKey());
    });
});