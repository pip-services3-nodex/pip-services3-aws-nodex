import { ConfigParams } from 'pip-services3-commons-nodex';
import { References } from 'pip-services3-commons-nodex';
import { ContextInfo } from 'pip-services3-components-nodex';
import { Descriptor } from 'pip-services3-commons-nodex';

import { CloudWatchLogger } from '../../src';
import { LoggerFixture } from './LoggerFixture';

suite('CloudWatchLogger', ()=> {
    let _logger: CloudWatchLogger;
    let _fixture: LoggerFixture;

    let AWS_REGION = process.env["AWS_REGION"] || "";
    let AWS_ACCESS_ID = process.env["AWS_ACCESS_ID"] || "";
    let AWS_ACCESS_KEY = process.env["AWS_ACCESS_KEY"] || "";

    if (!AWS_REGION || !AWS_ACCESS_ID || !AWS_ACCESS_KEY)
        return;

    setup(async () => {

        _logger = new CloudWatchLogger();
        _fixture = new LoggerFixture(_logger);

        _logger.configure(ConfigParams.fromTuples(
            "group", "TestGroup",
            "connection.region", AWS_REGION,
            "credential.access_id", AWS_ACCESS_ID,
            "credential.access_key", AWS_ACCESS_KEY
        ));

        let contextInfo = new ContextInfo();
        contextInfo.name = "TestStream";

        _logger.setReferences(References.fromTuples(
            new Descriptor("pip-services", "context-info", "default", "default", "1.0"), contextInfo,
            new Descriptor("pip-services", "counters", "cloudwatch", "default", "1.0"), _logger
        ));

        await _logger.open(null);
    });

    teardown(async () => {
        await _logger.close(null);
    });

    test('Log Level', () => {
        _fixture.testLogLevel();
    });

    test('Simple Logging', async () => {
        await _fixture.testSimpleLogging();
    });

    test('Error Logging', async () => {
        await _fixture.testErrorLogging();
    });

});