/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
export const verifyBody = {
  title: 'Verify VCB Request',
  type: 'object',
  additionalProperties: true,
  required: ['text'],
  properties: {
    // allow use of conneg w/non-JSON payload
    text: {
      title: 'Text encoding of a VCB',
      type: 'string',
    },
    type: {
      title: 'Type of scanned barcode',
      type: 'string',
      enum: [
        // See https://wicg.github.io/shape-detection-api/#barcodeformat-section
        'aztec',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'data_matrix',
        'ean_13',
        'ean_8',
        'itf',
        'pdf417',
        'qr_code',
        'unknown',
        'upc_a',
        'upc_e'
      ]
    },
  },
};
