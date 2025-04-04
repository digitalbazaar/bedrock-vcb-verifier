# bedrock-vcb-verifier ChangeLog

## 1.2.0 - 2025-mm-dd

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
