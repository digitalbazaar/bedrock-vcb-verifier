/*!
 * Copyright (c) 2024-2025 Digital Bazaar, Inc. All rights reserved.
 */
export const verifyBody = {
  title: 'Verify VCB Request',
  type: 'object',
  additionalProperties: true,
  properties: {
    barcode: {
      title: 'Scanned barcode information',
      type: 'object',
      additionalProperties: false,
      required: ['data', 'format'],
      properties: {
        data: {
          title: 'Data from barcode scan',
          type: 'string',
        },
        media_type: {
          title: 'Media type of the scanned barcode',
          type: 'string',
        },
        format: {
          title: 'Format of the scanned barcode',
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
            'upc_e',
          ]
        }
      }
    },
    // allow use of conneg w/non-JSON payload
    text: {
      title: 'Text encoding of a VCB',
      type: 'string',
    },
  },
};
