/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {
  addTypeTables, documentLoaders, middleware, verify
} from '@bedrock/vcb-verifier';
import {asyncHandler} from '@bedrock/express';
import canonicalize from 'canonicalize';
import cors from 'cors';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import '@bedrock/https-agent';
import '@bedrock/express';

const {util: {BedrockError}} = bedrock;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import {mockData} from './mocha/mock.data.js';

// in-memory exchanges only used during testing
const EXCHANGES = new Map();

bedrock.events.on('bedrock.init', async () => {
  // setup mock VCB verifier app...

  // setup CBOR-LD type table registry entries
  const registryEntry100 = new Map([{
    type: 'context',
    table: {
      'https://www.w3.org/ns/credentials/v2': 32768,
      'https://w3id.org/vc-barcodes/v1': 32769,
      'https://w3id.org/utopia/v2': 32770
    }
  }, {
    type: 'https://w3id.org/security#cryptosuiteString',
    table: {
      'ecdsa-rdfc-2019': 1,
      'ecdsa-sd-2023': 2,
      'eddsa-rdfc-2022': 3,
      'ecdsa-xi-2023': 4
    }
  }].map(({type, table}) => [type, new Map([...Object.entries(table)])]));
  const registryEntryMap = new Map([
    [100, registryEntry100]
  ]);
  addTypeTables({registryEntryMap});

  // setup document loaders
  const documentMap = new Map([
    ['https://w3id.org/vc-barcodes/v1',
      path.join(__dirname, '/contexts/vc-barcodes-v1.jsonld')],
    ['https://w3id.org/utopia/v2',
      path.join(__dirname, '/contexts/utopia-v2.jsonld')]
  ]);
  await documentLoaders.create({name: 'test', documentMap});
});

bedrock.events.on('bedrock-express.configure.routes', app => {
  const documentLoader = documentLoaders.get({name: 'test'});

  // mock capability for communicating w/mock VC-API exchange server below
  const {baseUri} = bedrock.config.server;
  const target = `${baseUri}/workflows/1/exchanges`;
  const capability = `urn:zcap:root:${encodeURIComponent(target)}`;

  // verify a VCB
  const route = '/features/verify-vcb';
  app.options(route, cors());
  app.post(
    route,
    cors(),
    middleware.createVerifyVcb({
      getVerifyOptions() {
        return {
          documentLoader,
          async verifyCredential({credential}) {
            const credentialType = credential.type.at(-1);
            // optical barcode credential Type
            if(credentialType !== 'OpticalBarcodeCredential') {
              throw new Error(`Unknown credential type "${credentialType}".`);
            }
            return verify({credential, capability});
          }
        };
      }
    }));

  // setup mock VC-API exchange server...
  app.post('/workflows/1/exchanges', asyncHandler(async (req, res) => {
    const {variables} = req.body;
    const exchange = {
      id: randomUUID(),
      // 15 minute expiry in seconds
      ttl: 60 * 15,
      variables,
      state: 'pending'
    };
    EXCHANGES.set(exchange.id, exchange);

    const workflowId = `${baseUri}/workflows/1`;
    const location = `${workflowId}/exchanges/${exchange.id}`;
    res.status(204).location(location).send();
  }));
  app.post(
    '/workflows/1/exchanges/:localExchangeId',
    asyncHandler(async (req, res) => {
      const {localExchangeId} = req.params;
      let exchange = EXCHANGES.get(localExchangeId);
      if(exchange && exchange.state !== 'pending') {
        EXCHANGES.delete(exchange.id);
        exchange = null;
      }
      if(!exchange) {
        throw new BedrockError(
          `Exchange "${localExchangeId}" not found.`, {
            name: 'NotFoundError',
            details: {httpStatusCode: 404, public: true}
          });
      }

      // only "verify" specific VC
      const {
        verifiablePresentation: {
          verifiableCredential: [verifiableCredential]
        }
      } = req.body;
      if(canonicalize(mockData.verifiableCredential) !==
        canonicalize(verifiableCredential)) {
        throw new BedrockError('Verification error.', {
          name: 'DataError',
          details: {httpStatusCode: 400, public: true}
        });
      }

      // complete exchange
      exchange.state = 'complete';

      // nothing to return, verification successful
      res.json({});
    }));
});

import '@bedrock/test';
bedrock.start();
