/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import * as documentLoaders from './documentLoaders.js';
import * as middleware from './middleware.js';
import {
  addTypeTable, addTypeTables, typeTableLoader
} from './typeTableLoader.js';
import {verify, verifyVcb} from './verify.js';
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
  documentLoaders,
  typeTableLoader,
  middleware,
  verify,
  verifyVcb,
  zcapClient
};
