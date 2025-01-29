/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as bedrock from '@bedrock/core';
import {asyncHandler} from '@bedrock/express';
import cors from 'cors';
import {verify} from './verify.js';
import {verifyBody} from '../schemas/vcb-verifier.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';

export function addVerifyRoutes({app} = {}) {
  const cfg = bedrock.config[NAMESPACE];
  const {routes} = cfg.authorization.oauth2;

  // verify a VCB
  app.options(routes.verifyBody, cors());
  app.post(
    routes.verifyBody,
    cors(),
    validate({bodySchema: verifyBody}),
    // FIXME: determine authz
    //middleware.authorizeRequest(),
    asyncHandler(async (req, res) => {
      const {stuff} = req.body;
      const result = await verify({stuff});
      res.json({result});
    }));
}
