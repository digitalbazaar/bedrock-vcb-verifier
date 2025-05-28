/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import {asyncHandler} from '@bedrock/express';
import {createValidateMiddleware as validate} from '@bedrock/validation';
import {verifyBody} from '../schemas/bedrock-vcb-verifier.js';
import {verifyVcb} from './verify.js';

export function createVerifyVcb({
  getVerifyOptions, validation: {verifyBodySchema = verifyBody}
} = {}) {
  assert.func(getVerifyOptions, 'getVerifyOptions');

  const mw = [
    validate({bodySchema: verifyBodySchema}),
    asyncHandler(async (req, res) => {
      const {text, barcode} = req.body;
      const result = await verifyVcb({text, req, barcode, getVerifyOptions});
      res.json(result);
    })];
  return function verifyVcbMiddleware(req, res, next) {
    _invokeMiddlewares({req, res, next, middlewares: mw.slice()});
  };
}

function _invokeMiddlewares({req, res, next, middlewares}) {
  if(!Array.isArray(middlewares)) {
    return middlewares(req, res, next);
  }
  if(middlewares.length === 1) {
    return middlewares[0](req, res, next);
  }
  const middleware = middlewares.shift();
  const localNext = (...args) => {
    if(args.length === 0) {
      return _invokeMiddlewares({req, res, next, middlewares});
    }
    next(...args);
  };
  middleware(req, res, localNext);
}
