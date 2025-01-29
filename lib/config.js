/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {config} from '@bedrock/core';
import {NAMESPACE} from './constants.js';

const cfg = config[NAMESPACE] = {};

cfg.routes = {
  verify: '/verify'
};
