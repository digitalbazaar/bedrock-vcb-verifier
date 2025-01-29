/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
import {addVerifyRoutes} from './http.js';
import {zcapClient} from './zcapClient.js';

// load config defaults
import './config.js';

// export APIs
export {addVerifyRoutes, zcapClient};
