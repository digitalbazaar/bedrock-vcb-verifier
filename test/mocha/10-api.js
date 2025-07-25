/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {httpClient} from '@digitalbazaar/http-client';
import {httpsAgent} from '@bedrock/https-agent';

import {mockData} from './mock.data.js';

describe('http API', () => {
  describe('verify a VCB', () => {
    const target = '/features/verify-vcb';
    const customSchemaTarget = '/features/verify-vcb/custom-schema';
    let url;
    let customSchemaUrl;
    before(async () => {
      url = `${bedrock.config.server.baseUri}${target}`;
      customSchemaUrl = `${bedrock.config.server.baseUri}${customSchemaTarget}`;
    });

    it('verifies VCB "text" transformed to an enveloped VC', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {text: mockData.vcbCredentialText}
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['credential', 'verified']);
      result.verified.should.equal(true);
    });

    it('verifies VCB "barcode" transformed to an enveloped VC', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {
            barcode: {
              data: mockData.vcbCredentialText,
              format: 'qr_code'
            }
          }
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['credential', 'verified']);
      result.verified.should.equal(true);
    });

    it('use custom schema and req body with enveloped VC', async () => {
      let err;
      let result;
      try {
        const scanLocation = {
          position: {
            coords: {latitude: 43.769562, longitude: 11.255814}
          }
        };
        const response = await httpClient.post(customSchemaUrl, {
          agent: httpsAgent,
          json: {
            barcode: {
              data: mockData.vcbCredentialText,
              format: 'qr_code'
            },
            scanLocation
          }
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['credential', 'verified', , 'scanLocation']);
      result.verified.should.equal(true);
    });

    it('verifies VCB "text" transformed to an enveloped VP', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {text: mockData.vcbPresentationText}
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['presentation', 'verified']);
      result.verified.should.equal(true);
    });

    it('verifies VCB "barcode" transformed to an enveloped VP', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {
            barcode: {
              data: mockData.vcbPresentationText,
              format: 'qr_code'
            }
          }
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['presentation', 'verified']);
      result.verified.should.equal(true);
    });

    it('fails to verify a VCB barcode containing an enveloped VP ' +
      'with a VC with a bad signature', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {
            barcode: {
              data: mockData.badSignatureVcbPresentationText,
              format: 'qr_code'
            }
          }
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['presentation', 'verified', 'error']);
      result.verified.should.equal(false);
      result.presentation.should.be.an('object');
      result.error.should.be.an('object');
    });
  });

  describe('(legacy) verify a VCB', () => {
    const target = '/features/legacy-verify-vcb';
    let url;
    before(async () => {
      url = `${bedrock.config.server.baseUri}${target}`;
    });

    it('verifies VCB "text" locally converted from CBOR-LD', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {text: mockData.vcbCredentialText}
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['credential', 'verified']);
      result.verified.should.equal(true);
    });
  });
});
