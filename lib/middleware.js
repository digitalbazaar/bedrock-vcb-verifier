/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import assert from 'assert-plus';
import {asyncHandler} from '@bedrock/express';
import {BARCODE_FORMATS} from './constants.js';
import {createValidateMiddleware as validate} from '@bedrock/validation';
import {verifyBody} from '../schemas/bedrock-vcb-verifier.js';
import {verifyVcb} from './verify.js';

export function createVerifyVcb({getVerifyOptions} = {}) {
  assert.func(getVerifyOptions, 'getVerifyOptions');

  const mw = [
    validate({bodySchema: verifyBody}),
    asyncHandler(async (req, res) => {
      const {text, barcode} = req.body;
      const data = barcode?.data ?? text;
      // default to 'qr_code' format if value is not included
      const format = barcode?.format || BARCODE_FORMATS.QR_CODE;
      // accept text or data and default format to qr_code
      const result = await verifyVcb({data, format, getVerifyOptions});
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
