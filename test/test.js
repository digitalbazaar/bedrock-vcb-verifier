/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import * as schemas from '../schemas/bedrock-vcb-verifier.js';
import {
  addTypeTables,
  barcodeToCredential,
  barcodeToEnvelopedCredential,
  barcodeToEnvelopedPresentation,
  barcodeToJsonldDocument,
  documentLoaders, middleware, verify
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

const TEXT_DECODER = new TextDecoder();

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
    ['https://w3id.org/utopia/v2',
      path.join(__dirname, '/contexts/utopia-v2.jsonld')],
    ['https://w3id.org/age/v1',
      path.join(__dirname, '/contexts/age-v1.jsonld')],
    ['https://w3id.org/cit/v1',
      path.join(__dirname, '/contexts/cit-v1.jsonld')]
  ]);
  await documentLoaders.create({name: 'test', documentMap});
});

bedrock.events.on('bedrock-express.configure.routes', app => {
  const documentLoader = documentLoaders.get({name: 'test'});

  // mock capability for communicating w/mock VC-API exchange server below
  const {baseUri} = bedrock.config.server;
  const target = `${baseUri}/workflows/1/exchanges`;
  const capability = `urn:zcap:root:${encodeURIComponent(target)}`;

  // verify a VCB credential or presentation
  const verifyVcbRoute = '/features/verify-vcb';
  app.options(verifyVcbRoute, cors());
  app.post(
    verifyVcbRoute,
    cors(),
    middleware.createVerifyVcb({
      getVerifyOptions() {
        return {
          // use preferred `barcodeToEnvelopedCredential` method
          barcodeToCredential: barcodeToEnvelopedCredential,
          async verifyCredential({credential}) {
            return verify({credential, capability});
          },
          barcodeToPresentation: barcodeToEnvelopedPresentation,
          async verifyPresentation({presentation}) {
            return verify({presentation, capability});
          }
        };
      }
    }));

  // verify a VCB with custom schema and access req object
  const customSchema = structuredClone(schemas.verifyBody);
  customSchema.additionalProperties = true;
  const verifyVcbRouteCustomSchema = '/features/verify-vcb/custom-schema';
  app.options(verifyVcbRouteCustomSchema, cors());
  app.post(
    verifyVcbRouteCustomSchema,
    cors(),
    middleware.createVerifyVcb({
      validation: {verifyBodySchema: customSchema},
      getVerifyOptions({req}) {
        const {scanLocation} = req.body;
        return {
          // use preferred `barcodeToEnvelopedCredential` method
          barcodeToCredential: barcodeToEnvelopedCredential,
          async verifyCredential({credential}) {
            const result = await verify({credential, capability});
            return {...result, scanLocation};
          }
        };
      }
    }));

  // legacy verify a VCB
  const legacyVerifyVcbRoute = '/features/legacy-verify-vcb';
  app.options(legacyVerifyVcbRoute, cors());
  app.post(
    legacyVerifyVcbRoute,
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
    const {variables = {}} = req.body;
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
      let verifiableCredential;
      const {verifiablePresentation} = req.body;
      if(verifiablePresentation.type === 'EnvelopedVerifiablePresentation') {
        const {contents, format} = _parseEnvelope({
          envelope: verifiablePresentation
        });
        if(format.typeAndSubType !== 'application/vcb') {
          throw new BedrockError('Verification error.', {
            name: 'DataError',
            details: {httpStatusCode: 400, public: true}
          });
        }
        const barcode = {
          data: contents,
          format: format.parameters.get('barcode-format') ?? 'qr_code'
        };
        if(format.parameters.has('base64')) {
          barcode.data = new Uint8Array(Buffer.from(contents, 'base64'));
          if(barcode.format === 'qr_code') {
            barcode.data = TEXT_DECODER.decode(barcode.data);
          }
        }
        const {jsonldDocument} = await barcodeToJsonldDocument({
          barcode, documentLoader, expectedHeader: 'VP1-'
        });
        if(canonicalize(mockData.verifiablePresentation) !==
        canonicalize(jsonldDocument)) {
          throw new BedrockError('Verification error.', {
            name: 'DataError',
            details: {httpStatusCode: 400, public: true}
          });
        }
        exchange.variables.results = {
          verify: {
            verifiablePresentation: jsonldDocument
          }
        };
      } else {
        verifiableCredential = verifiablePresentation.verifiableCredential[0];
        // parse enveloped VC
        if(verifiableCredential.type === 'EnvelopedVerifiableCredential') {
          const {contents, format} = _parseEnvelope({
            envelope: verifiableCredential
          });
          if(format.typeAndSubType !== 'application/vcb') {
            throw new BedrockError('Verification error.', {
              name: 'DataError',
              details: {httpStatusCode: 400, public: true}
            });
          }
          const barcode = {
            data: contents,
            format: format.parameters.get('barcode-format') ?? 'qr_code'
          };
          if(format.parameters.has('base64')) {
            barcode.data = new Uint8Array(Buffer.from(contents, 'base64'));
            if(barcode.format === 'qr_code') {
              barcode.data = TEXT_DECODER.decode(barcode.data);
            }
          }
          ({credential: verifiableCredential} = await barcodeToCredential({
            barcode, documentLoader
          }));
        }
        if(canonicalize(mockData.verifiableCredential) !==
        canonicalize(verifiableCredential)) {
          throw new BedrockError('Verification error.', {
            name: 'DataError',
            details: {httpStatusCode: 400, public: true}
          });
        }
        exchange.variables.results = {
          verify: {
            verifiablePresentation: {
              ...verifiablePresentation,
              verifiableCredential: [mockData.verifiableCredential]
            }
          }
        };
      }
      // complete exchange
      exchange.state = 'complete';

      // nothing to return, verification successful
      res.json({});
    }));

  app.get(
    '/workflows/1/exchanges/:localExchangeId',
    asyncHandler(async (req, res) => {
      const {localExchangeId} = req.params;
      let exchange = EXCHANGES.get(localExchangeId);
      if(!exchange) {
        throw new BedrockError(
          `Exchange "${localExchangeId}" not found.`, {
            name: 'NotFoundError',
            details: {httpStatusCode: 404, public: true}
          });
      }
      exchange = {
        ...exchange,
        id: `${target}/${localExchangeId}`
      };
      res.json({exchange});
    }));
});

import '@bedrock/test';
bedrock.start();

function _parseEnvelope({envelope}) {
  const {id} = envelope;
  const format = {};
  const comma = id.indexOf(',');
  if(id.startsWith('data:') && comma !== -1) {
    const mediaType = id.slice('data:'.length, comma);
    const parts = mediaType.split(';');
    format.mediaType = mediaType;
    format.typeAndSubType = parts.shift();
    const [type, subType] = format.typeAndSubType.split('/');
    format.type = type;
    format.subType = subType;
    format.parameters = new Map(parts.map(s => s.trim().split('=')));
  }
  return {contents: id.slice(comma + 1), format};
}
