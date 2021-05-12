let assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-nodex';
import { PagingParams } from 'pip-services3-commons-nodex';

import { IDummyClient } from './IDummyClient';

export class DummyClientFixture {
    private _client: IDummyClient;

    public constructor(client: IDummyClient) {
        this._client = client;
    }

    public async testCrudOperations(): Promise<void> {
        let dummy1 = { id: null, key: "Key 1", content: "Content 1" };
        let dummy2 = { id: null, key: "Key 2", content: "Content 2" };

        // Create one dummy
        const createdDummy1 = await this._client.createDummy(null, dummy1);
        assert.isObject(createdDummy1);
        assert.equal(createdDummy1.content, dummy1.content);
        assert.equal(createdDummy1.key, dummy1.key);
        dummy1 = createdDummy1;

        // Create another dummy
        const createdDummy2 = await this._client.createDummy(null, dummy2);
        assert.isObject(createdDummy2);
        assert.equal(createdDummy2.content, dummy2.content);
        assert.equal(createdDummy2.key, dummy2.key);
        dummy2 = createdDummy2;

        // Get all dummies
        const dummyDataPage = await this._client.getDummies(
            null,
            new FilterParams(),
            new PagingParams(0, 5, false)
        );
        assert.isObject(dummyDataPage);
        assert.isTrue(dummyDataPage.data.length >= 2);

        // Update the dummy
        dummy1.content = 'Updated Content 1';
        const updatedDummy1 = await this._client.updateDummy(null, dummy1);
        assert.isObject(updatedDummy1);
        assert.equal(updatedDummy1.content, dummy1.content);
        assert.equal(updatedDummy1.key, dummy1.key);
        dummy1 = updatedDummy1;

        // Delete dummy
        await this._client.deleteDummy(null, dummy1.id);

        // Try to get delete dummy
        const dummy = await this._client.getDummyById(null, dummy1.id);
        assert.isNull(dummy || null);
    }

}
