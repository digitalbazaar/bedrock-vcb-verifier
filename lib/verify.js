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
  text, barcode, documentLoader, typeTableLoader = _typeTableLoader
} = {}) {
  const {jsonldDocument: credential} = await barcodeToJsonldDocument({
    text, barcode, documentLoader, typeTableLoader, expectedHeader: 'VC1-'
  });
  return {credential};
}

export async function barcodeToJsonldDocument({
  text, barcode, documentLoader, typeTableLoader = _typeTableLoader,
  expectedHeader = 'VC1-'
} = {}) {
  if(barcode && barcode.format !== BARCODE_FORMATS.QR_CODE) {
    throw new BedrockError(`Unsupported barcode format "${barcode.format}".`, {
      name: 'NotSupportedError',
      details: {httpStatusCode: 400, public: true}
    });
  }
  text = barcode?.data ?? text;
  const {jsonldDocument} = await util.fromQrCode({
    text,
    documentLoader,
    typeTableLoader,
    expectedHeader
  });
  return {jsonldDocument};
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
  if(barcode.format === BARCODE_FORMATS.PDF417 ||
    barcode.format === BARCODE_FORMATS.QR_CODE) {
    credential.id = `${mediaType};base64,` +
      Buffer.from(barcode.data, 'utf8').toString('base64');
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

export async function barcodeToEnvelopedPresentation({text, barcode} = {}) {
  const presentation = {
    '@context': [VC_CONTEXT_V2],
    id: null,
    type: 'EnvelopedVerifiablePresentation'
  };
  if(text !== undefined) {
    barcode = {data: text, format: BARCODE_FORMATS.QR_CODE};
  }
  const mediaType = `data:application/vcb;barcode-format=${barcode.format}`;
  if(barcode.format === BARCODE_FORMATS.QR_CODE) {
    presentation.id = `${mediaType};base64,` +
      Buffer.from(barcode.data, 'utf8').toString('base64');
  } else {
    throw new BedrockError(
      'Could not create enveloped verifiable presentation; ' +
      `unsupported barcode format "${barcode.format}".`, {
        name: 'NotSupportedError',
        details: {httpStatusCode: 400, public: true}
      });
  }
  return {presentation};
}

export function isExpired({credential, now = new Date(), maxClockSkew}) {
  if(credential.validUntil === undefined) {
    return false;
  }
  const validUntil = new Date(credential.validUntil);
  return _compareTime({t1: now, t2: validUntil, maxClockSkew}) >= 0;
}

export async function verify({
  credential, presentation, capability, variables = {}, options
} = {}) {
  // set default options
  options = {
    checkExpiration: !options?.returnExchange,
    maxClockSkew: 300,
    returnExchange: false,
    getCredentialFromExchange: _getCredentialFromExchange,
    getPresentationFromExchange: _getPresentationFromExchange,
    ...options
  };
  const {
    checkExpiration, maxClockSkew, returnExchange, getCredentialFromExchange,
    getPresentationFromExchange} = options;
  assert.bool(checkExpiration, 'options.checkExpiration');
  assert.number(maxClockSkew, 'options.maxClockSkew');
  assert.bool(returnExchange, 'options.returnExchange');
  assert.func(getCredentialFromExchange, 'options.getCredentialFromExchange');
  assert.func(getPresentationFromExchange,
    'options.getPresentationFromExchange');
  if(options.checkExpiration && options.returnExchange) {
    throw new Error(
      'Only one of "checkExpiration" or "returnExchange" can be "true".');
  }
  if(presentation && credential) {
    throw new Error(
      'Only one of "presentation" or "credential" can be "true".');
  }
  if(!presentation && !credential) {
    throw new Error(
      'One of "presentation" or "credential" must be present.');
  }
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
    const verifiablePresentation = presentation ?? {
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

  // prepare result
  const result = {
    credential,
    verified: response?.status === 200,
    presentation: undefined,
    error: error?.data,
    exchange: undefined,
    expired: undefined
  };

  let exchange;
  const isEnvelopedVC = credential?.type === 'EnvelopedVerifiableCredential';
  const isEnvelopedVP = presentation?.type ===
    'EnvelopedVerifiablePresentation';
  if(returnExchange || isEnvelopedVP || isEnvelopedVC) {
    try {
      // fetch exchange state
      const response = await zcapClient.read({url: exchangeId, capability});
      ({data: {exchange}} = response);
      if(returnExchange) {
        result.exchange = exchange;
        return result;
      }
    } catch(cause) {
      throw new BedrockError(
        'Could not fetch verification exchange state.', {
          name: 'OperationError',
          details: {httpStatusCode: 500, public: true},
          cause
        });
    }
  }
  if(isEnvelopedVP) {
    try {
      // use exchange state to update `presentation`
      const {getPresentationFromExchange} = options;
      presentation = await getPresentationFromExchange({exchange});
      result.presentation = presentation;
    } catch(cause) {
      throw new BedrockError(
        'Could not get presentation from exchange state.', {
          name: 'OperationError',
          details: {httpStatusCode: 500, public: true},
          cause
        });
    }
  }
  if(isEnvelopedVC) {
    try {
      // use exchange state to update `credential`
      const {getCredentialFromExchange} = options;
      credential = await getCredentialFromExchange({exchange, credential});
      result.credential = credential;
    } catch(cause) {
      throw new BedrockError(
        'Could not get credential from exchange state.', {
          name: 'OperationError',
          details: {httpStatusCode: 500, public: true},
          cause
        });
    }
  }
  // get credential from error's credentialResults if not present in result
  if(result.error && !result.credential && !result.presentation) {
    credential = result?.error?.details?.credentialResults?.[0]?.credential;
    result.credential = credential;
  }
  if(checkExpiration) {
    let vcs = result.presentation ?
      result.presentation.verifiableCredential : result.credential;
    vcs = Array.isArray(vcs) ? vcs : [vcs];
    result.expired = vcs.some(vc => isExpired({credential: vc, maxClockSkew}));
  }
  return result;
}

export async function verifyVcb({text, barcode, req, getVerifyOptions} = {}) {
  try {
    const verifyOptions = await getVerifyOptions({barcode, text, req});
    const {
      barcodeToCredential: getCredential = barcodeToCredential,
      barcodeToPresentation: getPresentation = barcodeToEnvelopedPresentation,
      documentLoader = _throwNotFoundError,
      verifyCredential,
      verifyPresentation
    } = verifyOptions;
    assert.func(documentLoader);
    const data = text || barcode?.data || '';
    if(data.startsWith('VP1-')) {
      assert.func(getPresentation);
      assert.func(verifyPresentation);
      const {presentation} = await getPresentation({
        text, barcode, documentLoader, typeTableLoader: _typeTableLoader
      });
      assert.object(presentation);
      return verifyPresentation({presentation});
    }
    assert.func(getCredential);
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

function _compareTime({t1, t2, maxClockSkew}) {
  // `maxClockSkew` is in seconds, so transform to milliseconds
  if(Math.abs(t1 - t2) < (maxClockSkew * 1000)) {
    // times are equal within the max clock skew
    return 0;
  }
  return t1 < t2 ? -1 : 1;
}

function _getCredentialFromExchange({exchange} = {}) {
  // assume single step
  const stepResults = exchange.variables?.results;
  if(stepResults) {
    const stepNames = Object.keys(stepResults);
    const stepResult = stepResults[stepNames[0]];
    const vc = stepResult?.verifiablePresentation.verifiableCredential;
    if(Array.isArray(vc)) {
      return vc[0];
    }
    return vc;
  }
}

function _getPresentationFromExchange({exchange} = {}) {
  // assume single step
  const stepResults = exchange.variables?.results;
  if(stepResults) {
    const stepNames = Object.keys(stepResults);
    const stepResult = stepResults[stepNames[0]];
    const presentation = stepResult?.verifiablePresentation;
    return presentation;
  }
}

function _throwNotFoundError(url) {
  throw new BedrockError(`Document "${url}" not found`, {
    name: 'NotFoundError',
    details: {httpStatusCode: 404, public: true},
    public: true
  });
}
