/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import assert from 'assert-plus';

const {util: {BedrockError}} = bedrock;

const TYPE_TABLES = new Map();

export function addTypeTable({registryEntryId, typeTable} = {}) {
  assert.number(registryEntryId, 'registryEntryId');
  if(!(typeTable instanceof Map)) {
    throw new TypeError('"typeTable" must be a Map.');
  }

  if(TYPE_TABLES.has(registryEntryId)) {
    throw new BedrockError(
      `Cannot add type table "${registryEntryId}"; it already exists.`, {
        name: 'OperationError',
        details: {httpStatusCode: 500, public: true},
        public: true
      });
  }
  TYPE_TABLES.set(registryEntryId, typeTable);
}

export function addTypeTables({registryEntryMap} = {}) {
  if(!(registryEntryMap instanceof Map)) {
    throw new TypeError('"registryEntryMap" must be a Map.');
  }

  for(const [registryEntryId, typeTable] of registryEntryMap) {
    addTypeTable({registryEntryId, typeTable});
  }
}

export async function typeTableLoader({registryEntryId} = {}) {
  return TYPE_TABLES.get(registryEntryId);
}
