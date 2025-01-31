/*!
 * Copyright (c) 2018-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {jsonLdDocumentLoader} from '@bedrock/jsonld-document-loader';
import {didIo} from '@bedrock/did-io';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';

const {util: {BedrockError}} = bedrock;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// <app path>/node_modules/@bedrock/vcb-verifier/lib/<here>
const APP_PATH = path.join(__dirname, '../../../../');

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

  // load context files
  await Promise.all([...contextMap.entries()]
    .map(async ([url, relativePath]) => {
      const file = path.join(__dirname, relativePath);
      if(!file.startsWith(APP_PATH)) {
        throw new BedrockError(
          'Cannot read context file; file path is not within application path.', {
            name: 'OperationError',
            details: {httpStatusCode: 500, public: true},
            public: true
          });
      }
      const json = await fs.readFile(file);
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
  DOCUMENT_LOADERS.set(name, loader);

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
      name: 'OperationError',
      details: {httpStatusCode: 500, public: true},
      public: true,
      cause
    });
}
