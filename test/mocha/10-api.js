/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {httpClient} from '@digitalbazaar/http-client';
import {httpsAgent} from '@bedrock/https-agent';

import {mockData} from './mock.data.js';

describe('http API', () => {
  const target = '/features/verify-vcb';
  describe('verify a VCB', () => {
    let url;
    before(async () => {
      url = `${bedrock.config.server.baseUri}${target}`;
    });

    it('succeeds when sending valid VCB text', async () => {
      let err;
      let result;
      try {
        const response = await httpClient.post(url, {
          agent: httpsAgent,
          json: {text: mockData.vcbText}
        });
        result = response.data;
      } catch(e) {
        err = e;
      }
      assertNoError(err);
      should.exist(result);
      result.should.include.keys(['credential', 'verified', 'expired']);
      result.verified.should.equal(true);
    });
  });
});
