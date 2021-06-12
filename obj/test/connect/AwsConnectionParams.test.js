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
const assert = require('chai').assert;
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const AwsConnectionParams_1 = require("../../src/connect/AwsConnectionParams");
suite('AwsConnectionParams', () => {
    test('Test Empty Connection', () => __awaiter(void 0, void 0, void 0, function* () {
        let connection = new AwsConnectionParams_1.AwsConnectionParams();
        assert.equal("arn:aws::::", connection.getArn());
    }));
    test('Parse ARN', () => __awaiter(void 0, void 0, void 0, function* () {
        let connection = new AwsConnectionParams_1.AwsConnectionParams();
        connection.setArn("arn:aws:lambda:us-east-1:12342342332:function:pip-services-dummies");
        assert.equal("lambda", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal("function", connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());
        connection.setArn("arn:aws:s3:us-east-1:12342342332:pip-services-dummies");
        assert.equal("s3", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal(null, connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());
        connection.setArn("arn:aws:lambda:us-east-1:12342342332:function/pip-services-dummies");
        assert.equal("lambda", connection.getService());
        assert.equal("us-east-1", connection.getRegion());
        assert.equal("12342342332", connection.getAccount());
        assert.equal("function", connection.getResourceType());
        assert.equal("pip-services-dummies", connection.getResource());
    }));
    test('Compose AR', () => __awaiter(void 0, void 0, void 0, function* () {
        let connection = AwsConnectionParams_1.AwsConnectionParams.fromConfig(pip_services3_commons_nodex_1.ConfigParams.fromTuples('connection.service', 'lambda', 'connection.region', 'us-east-1', 'connection.account', '12342342332', 'connection.resource_type', 'function', 'connection.resource', 'pip-services-dummies', 'credential.access_id', '1234', 'credential.access_key', 'ABCDEF'));
        assert.equal("arn:aws:lambda:us-east-1:12342342332:function:pip-services-dummies", connection.getArn());
        assert.equal("1234", connection.getAccessId());
        assert.equal("ABCDEF", connection.getAccessKey());
    }));
});
//# sourceMappingURL=AwsConnectionParams.test.js.map