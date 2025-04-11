/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {typeTableLoader as _typeTableLoader} from './typeTableLoader.js';
import assert from 'assert-plus';
import {BARCODE_FORMATS} from './constants.js';
import {httpClient} from '@digitalbazaar/http-client';
import {httpsAgent} from '@bedrock/https-agent';
import {util} from '@digitalbazaar/vpqr';
import {VC_CONTEXT_V2} from './constants.js';
import {zcapClient} from './zcapClient.js';

const {util: {BedrockError}} = bedrock;

export async function barcodeToCredential({
  text, barcode, documentLoader, typeTableLoader = _typeTableLoader,
} = {}) {
  if(barcode && barcode.format !== BARCODE_FORMATS.QR_CODE) {
    throw new BedrockError(`Unsupported barcode format "${barcode.format}".`, {
      name: 'NotSupportedError',
      details: {httpStatusCode: 400, public: true}
    });
  }
  text = barcode?.data ?? text;
  const {jsonldDocument: credential} = await util.fromQrCode({
    text,
    documentLoader,
    typeTableLoader,
    expectedHeader: 'VC1-'
  });
  return {credential};
}

export async function barcodeToEnvelopedCredential({text, barcode} = {}) {
  const credential = {
    '@context': [VC_CONTEXT_V2],
    id: null,
    type: 'EnvelopedVerifiableCredential'
  };
  if(text !== undefined) {
    barcode = {data: text, format: BARCODE_FORMATS.QR_CODE};
  }
  const mediaType = `data:application/vcb;barcode-format=${barcode.format}`;
  if(barcode.format === BARCODE_FORMATS.PDF417) {
    credential.id = `${mediaType};base64,` +
      Buffer.from(barcode.data, 'utf8').toString('base64');
  } else if(barcode.format === BARCODE_FORMATS.QR_CODE) {
    credential.id = `${mediaType},${barcode.data}`;
  } else {
    throw new BedrockError(
      'Could not create enveloped verifiable credential; ' +
      `unsupported barcode format "${barcode.format}".`, {
        name: 'NotSupportedError',
        details: {httpStatusCode: 400, public: true}
      });
  }
  return {credential};
}

export async function verify({credential, capability, variables = {}} = {}) {
  // create exchange
  let exchangeId;
  try {
    const response = await zcapClient.write({
      json: {
        // quick 5 minute TTL
        ttl: 5 * 60,
        variables
      },
      capability
    });
    exchangeId = response.headers.get('location');
  } catch(cause) {
    throw new BedrockError(
      'Could not create verification exchange.', {
        name: 'OperationError',
        details: {httpStatusCode: 500, public: true},
        cause
      });
  }

  // use exchange
  let response;
  let error;
  try {
    const verifiablePresentation = {
      '@context': ['https://www.w3.org/ns/credentials/v2'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [credential]
    };
    response = await httpClient.post(exchangeId, {
      agent: httpsAgent,
      json: {verifiablePresentation}
    });
  } catch(e) {
    error = e;
  }
  return {
    credential,
    verified: response?.status === 200,
    error: error?.data,
    expired: _checkExpiration({credential})
  };
}

export async function verifyVcb({text, barcode, getVerifyOptions} = {}) {
  try {
    const verifyOptions = await getVerifyOptions({text});
    const {
      barcodeToCredential: getCredential = barcodeToCredential,
      documentLoader = _throwNotFoundError,
      verifyCredential
    } = verifyOptions;
    assert.func(getCredential);
    assert.func(documentLoader);
    assert.func(verifyCredential);

    const {credential} = await getCredential({
      text, barcode, documentLoader, typeTableLoader: _typeTableLoader
    });
    assert.object(credential);

    return verifyCredential({credential});
  } catch(cause) {
    throw new BedrockError(
      'Unable to verify VCB: ' + cause.message, {
        name: 'OperationError',
        // FIXME: should this be a 4xx?
        details: {httpStatusCode: 500, public: true},
        public: true,
        cause
      });
  }
}

// check if expiration date is less than today
function _checkExpiration({credential}) {
  credential.validUntil;
  const validUntil = new Date(credential.validUntil || '');
  const today = new Date();
  return validUntil < today;
}

function _throwNotFoundError(url) {
  throw new BedrockError(`Document "${url}" not found`, {
    name: 'NotFoundError',
    details: {httpStatusCode: 404, public: true},
    public: true
  });
}
