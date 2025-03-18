/*!
 * Copyright (c) 2025 Digital Bazaar, Inc. All rights reserved.
 */
export const NAMESPACE = 'vcb-verifier';
export const VC_CONTEXT_V2 = 'https://www.w3.org/ns/credentials/v2';

// See https://wicg.github.io/shape-detection-api/#barcodeformat-section
export const BARCODE_FORMATS = Object.freeze({
  AZTEC: 'aztec',
  CODE_128: 'code_128',
  CODE_39: 'code_39',
  CODE_93: 'code_93',
  CODABAR: 'codabar',
  DATA_MATRIX: 'data_matrix',
  EAN_13: 'ean_13',
  EAN_8: 'ean_8',
  ITF: 'itf',
  PDF417: 'pdf417',
  QR_CODE: 'qr_code',
  UNKNOWN: 'unknown',
  UPC_a: 'upc_a',
  UPC_e: 'upc_e'
});
