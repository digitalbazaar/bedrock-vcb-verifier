/*!
 * Copyright (c) 2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as base64UrlUniversal from 'base64url-universal';
import * as bedrock from '@bedrock/core';
import * as cborld from '@digitalbazaar/cborld';
import {decode, hash, parse} from '@bedrock/pdf417-dl-canonicalizer';

const {
  util: {BedrockError},
} = bedrock;

const CA_IIN = '636014';
const VCB_SPEC_INN = '000000';
const INN = {
  [VCB_SPEC_INN]: {subfile: 'ZZ', field: 'ZZA'},
  [CA_IIN]: {subfile: 'ZC', field: 'ZCE'},
};

export async function parsePdf417({
  pdf417String,
  documentLoader,
  typeTableLoader,
} = {}) {
  const encoder = new TextEncoder();
  const pdfBytes = encoder.encode(pdf417String);
  const decoded = decode({pdfBytes});
  validate(decoded);
  const {subfile, field} = INN[decoded.issuerIdentificationNumber];
  // Get subfile and field based on INN
  const subfileObject = decoded.subfiles.find(sf => sf.type === subfile);
  const zce = subfileObject.data[field];
  // TODO: update this to base64nopad for CA
  const cborldBytes = base64UrlUniversal.decode(zce);
  // decode the CBOR-LD bytes into a Javascript object
  const jsonldDocument = await cborld.decode({
    cborldBytes,
    documentLoader,
    typeTableLoader,
  });
  const {protectedComponentIndex} = jsonldDocument.credentialSubject;
  const parsedData = await parse({pdfBytes, fields: protectedComponentIndex});
  const hashed = await hash({parsedData});
  return {jsonldDocument, hashed};
}

function validate(values) {
  if(!(values.numberOfEntries > 1)) {
    throw new BedrockError(`Error: invalid number of entries`, {
      name: 'OperationError',
      details: {httpStatusCode: 500, public: true},
    });
  }
  if(!values.issuerIdentificationNumber in INN) {
    throw new BedrockError(
      `Error: Incorrect IIN - ${values.issuerIdentificationNumber}`,
      {
        name: 'OperationError',
        details: {httpStatusCode: 500, public: true},
      }
    );
  }
}
