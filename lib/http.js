/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import assert from 'assert-plus';
import {asyncHandler} from '@bedrock/express';
import cors from 'cors';
import {NAMESPACE} from './constants.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';
import {verifyBody} from '../schemas/bedrock-vcb-verifier.js';
import {verifyVcb} from './verify.js';

export function addVerifyRoutes({app, getVerifyOptions} = {}) {
  assert.func(getVerifyOptions, 'getVerifyOptions');

  const cfg = bedrock.config[NAMESPACE];
  const {routes} = cfg;

  // FIXME: just expose `verifyVcb` and a middlware that will
  // do `validate + async handler for verify VCB` to maximize customization
  // in top-level app

  // verify a VCB
  app.options(routes.verifyVcb, cors());
  app.post(
    routes.verifyVcb,
    cors(),
    validate({bodySchema: verifyBody}),
    // FIXME: determine authz
    //middleware.authorizeRequest(),
    asyncHandler(async (req, res) => {
      const {text} = req.body;
      const result = await verifyVcb({text, getVerifyOptions});
      res.json(result);
    }));
}
