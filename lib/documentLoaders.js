/*!
 * Copyright (c) 2018-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {didIo} from '@bedrock/did-io';
import fs from 'node:fs/promises';
import {jsonLdDocumentLoader} from '@bedrock/jsonld-document-loader';
import path from 'node:path';

const {util: {BedrockError}} = bedrock;

const DOCUMENT_LOADERS = new Map();
export let defaultDocumentLoader;

bedrock.events.on('bedrock.init', async () => {
  const loader = jsonLdDocumentLoader.clone();
  loader.setDidResolver(didIo);
  defaultDocumentLoader = loader.build();
});

// create a named, reusable document loader
export async function create({name, contextMap} = {}) {
  // create new loader based on bedrock loader w/did-io resolution
  const loader = jsonLdDocumentLoader.clone();
  loader.setDidResolver(didIo);

  const appDirectory = path.join(
    path.dirname(global.bedrock.main.filename), '/');

  // load context files
  await Promise.all([...contextMap.entries()]
    .map(async ([url, filename]) => {
      if(!filename.startsWith(appDirectory)) {
        throw new BedrockError(
          'Cannot read context file; ' +
          'file name is not within application path.', {
            name: 'OperationError',
            details: {httpStatusCode: 500, public: true},
            public: true
          });
      }
      const json = await fs.readFile(filename);
      loader.addStatic(url, JSON.parse(json));
    }));

  if(DOCUMENT_LOADERS.has(name)) {
    throw new BedrockError(
      `Cannot create document loader "${name}"; it already exists.`, {
        name: 'OperationError',
        details: {httpStatusCode: 500, public: true},
        public: true
      });
  }
  DOCUMENT_LOADERS.set(name, loader.build());

  return loader;
}

export function get({name, useDefault = false} = {}) {
  const loader = DOCUMENT_LOADERS.get(name) ??
    (useDefault && defaultDocumentLoader);
  if(loader) {
    return loader;
  }
  throw new BedrockError(
    `Document loader "${name}" not found.`, {
      name: 'NotFoundError',
      details: {httpStatusCode: 400, public: true},
      public: true
    });
}
