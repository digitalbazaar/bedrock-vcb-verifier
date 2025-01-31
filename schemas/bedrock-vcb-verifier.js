/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
export const verifyBody = {
  title: 'Verify VCB Request',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    // FIXME: pass media type and/or format/type in another property or
    // allow use of conneg w/non-JSON payload
    text: {
      title: 'Text encoding of a VCB',
      type: 'string',
      // must start with `VC1-` header
      pattern: '^VC1-'
    }
  }
};
