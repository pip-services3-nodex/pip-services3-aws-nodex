"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let process = require('process');
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const DummyClientFixture_1 = require("../DummyClientFixture");
const DummyLambdaClient_1 = require("./DummyLambdaClient");
suite('DummyLambdaClient', () => {
    let awsAccessId = process.env['AWS_ACCESS_ID'];
    let awsAccessKey = process.env['AWS_ACCESS_KEY'];
    let lambdaArn = process.env['LAMBDA_ARN'];
    if (!awsAccessId || !awsAccessKey || !lambdaArn) {
        return;
    }
    let lambdaConfig = pip_services3_commons_nodex_1.ConfigParams.fromTuples('connection.protocol', 'aws', 'connection.arn', lambdaArn, 'credential.access_id', awsAccessId, 'credential.access_key', awsAccessKey, 'options.connection_timeout', 30000);
    let client;
    let fixture;
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        client = new DummyLambdaClient_1.DummyLambdaClient();
        client.configure(lambdaConfig);
        fixture = new DummyClientFixture_1.DummyClientFixture(client);
        yield client.open(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield client.close(null);
    }));
    test('Crud Operations', () => __awaiter(void 0, void 0, void 0, function* () {
        yield fixture.testCrudOperations();
    }));
});
//# sourceMappingURL=DummyLambdaClient.test.js.map