/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as documentLoaders from './documentLoaders.js';
import {
  addTypeTable, addTypeTables, typeTableLoader
} from './typeTableLoader.js';
import {verify, verifyVcb} from './verify.js';
import {addVerifyRoutes} from './http.js';
import {zcapClient} from './zcapClient.js';
import '@bedrock/credentials-context';
import '@bedrock/did-context';
import '@bedrock/security-context';
import '@bedrock/veres-one-context';

// load config defaults
import './config.js';

// export APIs
export {
  addTypeTable,
  addTypeTables,
  addVerifyRoutes,
  documentLoaders,
  typeTableLoader,
  verify,
  verifyVcb,
  zcapClient
};
