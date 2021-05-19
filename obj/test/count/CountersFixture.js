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
exports.CountersFixture = void 0;
let assert = require('chai').assert;
const pip_services3_components_nodex_1 = require("pip-services3-components-nodex");
function sleep(timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(res => {
            setTimeout(_ => res, timeout);
        });
    });
}
class CountersFixture {
    constructor(counters) {
        this._counters = counters;
    }
    testSimpleCounters() {
        return __awaiter(this, void 0, void 0, function* () {
            this._counters.last("Test.LastValue", 123);
            this._counters.last("Test.LastValue", 123456);
            var counter = this._counters.get("Test.LastValue", pip_services3_components_nodex_1.CounterType.LastValue);
            assert.isNotNull(counter);
            assert.isNotNull(counter.last);
            assert.equal(counter.last, 123456, 3);
            this._counters.incrementOne("Test.Increment");
            this._counters.increment("Test.Increment", 3);
            counter = this._counters.get("Test.Increment", pip_services3_components_nodex_1.CounterType.Increment);
            assert.isNotNull(counter);
            assert.equal(counter.count, 4);
            this._counters.timestampNow("Test.Timestamp");
            this._counters.timestampNow("Test.Timestamp");
            counter = this._counters.get("Test.Timestamp", pip_services3_components_nodex_1.CounterType.Timestamp);
            assert.isNotNull(counter);
            assert.isNotNull(counter.time);
            this._counters.stats("Test.Statistics", 1);
            this._counters.stats("Test.Statistics", 2);
            this._counters.stats("Test.Statistics", 3);
            counter = this._counters.get("Test.Statistics", pip_services3_components_nodex_1.CounterType.Statistics);
            assert.isNotNull(counter);
            assert.equal(counter.average, 2, 3);
            this._counters.dump();
            yield sleep(1000);
        });
    }
    testMeasureElapsedTime() {
        return __awaiter(this, void 0, void 0, function* () {
            let timer = this._counters.beginTiming("Test.Elapsed");
            yield sleep(100);
            timer.endTiming();
            let counter = this._counters.get("Test.Elapsed", pip_services3_components_nodex_1.CounterType.Interval);
            assert.isTrue(counter.last > 50);
            assert.isTrue(counter.last < 5000);
            this._counters.dump();
            yield sleep(1000);
        });
    }
}
exports.CountersFixture = CountersFixture;
//# sourceMappingURL=CountersFixture.js.map