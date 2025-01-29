/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
export const verifyBody = {
  title: 'Verify VCB Request',
  type: 'object',
  additionalProperties: false,
  required: ['stuff'],
  properties: {
    stuff: {
      type: 'object'
    }
  }
};
