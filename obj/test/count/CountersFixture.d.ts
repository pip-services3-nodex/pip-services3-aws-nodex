import { CachedCounters } from 'pip-services3-components-nodex';
export declare class CountersFixture {
    private _counters;
    constructor(counters: CachedCounters);
    testSimpleCounters(): Promise<void>;
    testMeasureElapsedTime(): Promise<void>;
}
