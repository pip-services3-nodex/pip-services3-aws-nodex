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
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_commons_nodex_2 = require("pip-services3-commons-nodex");
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
const pip_services3_commons_nodex_3 = require("pip-services3-commons-nodex");
const CloudWatchLogger_1 = require("../../src/log/CloudWatchLogger");
const LoggerFixture_1 = require("./LoggerFixture");
suite('CloudWatchLogger', () => {
    let _logger;
    let _fixture;
    let AWS_REGION = process.env["AWS_REGION"] || "";
    let AWS_ACCESS_ID = process.env["AWS_ACCESS_ID"] || "";
    let AWS_ACCESS_KEY = process.env["AWS_ACCESS_KEY"] || "";
    if (!AWS_REGION || !AWS_ACCESS_ID || !AWS_ACCESS_KEY) {
        return;
    }
    setup(() => __awaiter(void 0, void 0, void 0, function* () {
        _logger = new CloudWatchLogger_1.CloudWatchLogger();
        _fixture = new LoggerFixture_1.LoggerFixture(_logger);
        _logger.configure(pip_services3_commons_nodex_1.ConfigParams.fromTuples("group", "TestGroup", "connection.region", AWS_REGION, "credential.access_id", AWS_ACCESS_ID, "credential.access_key", AWS_ACCESS_KEY));
        let contextInfo = new pip_services3_components_nodex_1.ContextInfo();
        contextInfo.name = "TestStream";
        _logger.setReferences(pip_services3_commons_nodex_2.References.fromTuples(new pip_services3_commons_nodex_3.Descriptor("pip-services", "context-info", "default", "default", "1.0"), contextInfo, new pip_services3_commons_nodex_3.Descriptor("pip-services", "counters", "cloudwatch", "default", "1.0"), _logger));
        yield _logger.open(null);
    }));
    teardown(() => __awaiter(void 0, void 0, void 0, function* () {
        yield _logger.close(null);
    }));
    test('Log Level', () => {
        _fixture.testLogLevel();
    });
    test('Simple Logging', () => __awaiter(void 0, void 0, void 0, function* () {
        yield _fixture.testSimpleLogging();
    }));
    test('Error Logging', () => __awaiter(void 0, void 0, void 0, function* () {
        yield _fixture.testErrorLogging();
    }));
});
//# sourceMappingURL=CloudWatchLogger.test.js.map