/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import assert from 'assert-plus';
import {httpClient} from '@digitalbazaar/http-client';
import {httpsAgent} from '@bedrock/https-agent';
import {typeTableLoader} from './typeTableLoader.js';
import {util} from '@digitalbazaar/vpqr';
import {zcapClient} from './zcapClient.js';

const {util: {BedrockError}} = bedrock;

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

export async function verifyVcb({text, getVerifyOptions} = {}) {
  try {
    const verifyOptions = await getVerifyOptions({text});
    const {documentLoader, verifyCredential} = verifyOptions;
    assert.func(documentLoader);
    assert.func(verifyCredential);

    const {jsonldDocument: credential} = await util.fromQrCode({
      text,
      documentLoader,
      typeTableLoader,
      expectedHeader: 'VC1-',
    });

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
