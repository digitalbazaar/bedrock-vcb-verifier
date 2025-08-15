# bedrock-vcb-verifier ChangeLog

## 1.6.1 - 2025-08-15

### Fixed
- Remove unusued `media_type` value from schema.

## 1.6.0 - 2025-07-25

### Added
- Verify enveloped verifiable presentations.

## 1.5.0 - 2025-05-28

### Changed
- Pass `req`, `barcode` to `getVerifyOptions`; allow custom verify body schemas.

## 1.4.0 - 2025-05-20

### Added
- Return credential in results when verification error occurs.

## 1.3.3 - 2025-05-12

### Changed
- Use `vpqr` 6.0.0. This supports decoding the CBOR-LD 1.0 tag (0xcb1d).

## 1.3.2 - 2025-04-21

### Fixed
- Always base64-encode QR code VCBs to ensure proper data URL construction.

## 1.3.1 - 2025-04-17

### Fixed
- Return the unenveloped `credential` in the result returned from `verify()`.

## 1.3.0 - 2025-04-14

### Added
- Add `maxClockSkew=300` (300 seconds) option for checking credential
  expiration period.
- Add `returnExchange=false` option to return the retrieved exchange
  state from `verify()`.

### Changed
- For enveloped credentials, return the unenveloped `credential` in the
  result returned from `verify()`.

## 1.2.1 - 2025-04-11

### Fixed
- Use array to express `@context` w/`EnvelopedVerifiableCredential`.

## 1.2.0 - 2025-04-10

### Added
- Add option to return a `barcodeToCredential` function from
  `getVerifyOptions` that is passed to `verifyVcb()`. This function returns
  the VC that will be passed to `verifyCredential`.
- Expose `barcodeToEnvelopedCredential` function that can be returned as an
  option from `getVerifyOptions` in order to produce the credential that is
  to be passed to `verifyCredential`. This is the new preferred method of
  verifying a VCB as it will send it through a VC API exchange as an
  `EnvelopedVerifiableCredential` without any need for configuring local
  CBOR-LD infrastructure. Note that a future major version of this package may
  remove the ability to locally configure CBOR-LD infrastructure. Instead,
  the VC API verifier instance associated with the VC API exchange used to
  verify credentials should be configured with the necessary CBOR-LD settings.
- Expose `barcodeToCredential` helper function to convert a barcode in
  either `text` (string) or `barcode` (object w/ `data` and `format`) to
  a verifiable credential using locally configured CBOR-LD infrastructure. This
  method is not preferred and is provided for backwards compatibility purposes;
  instead `barcodeToEnvelopedCredential` should be used to produce an
  `EnvelopedVerifiableCredential` without the need for any local CBOR-LD
  configuration.
- Accept `barcode` object or `text` field.

## 1.1.0 - 2025-02-05

### Updated
- Add `documentMap` name for use with `documentLoaders.create()` indicating
  that non-contexts can be added to a document loader. The previous (and
  now deprecated but still supported) name was `contextMap`.

## 1.0.1 - 2025-02-05

### Updated
- Add optional chaining to response object.

## 1.0.0 - 2025-02-02

- See git history for changes.
