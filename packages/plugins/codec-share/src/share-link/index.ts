export {
	SHARE_LINK_VERSION,
	SHARE_LINK_PREFIX,
	SHARE_LINK_WARNING_LENGTH,
	SHARE_LINK_CORRUPTED_MESSAGE,
	encodeSharePayload,
	decodeSharePayload,
	encodeShareLink,
	formatShareClipboardText,
	estimateShareLinkLength,
	extractSharePayloadFromLocation,
	extractSharePayloadFromText
} from './chronos-share-link-codec';
export type { ShareLinkResult } from './chronos-share-link-codec';
export {
	ensureShareLinkBrotliReady,
	brotliCompressShare,
	brotliDecompressShare,
	SHARE_BROTLI_QUALITY
} from './share-link-brotli';
