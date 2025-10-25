/**
 * Wrap first page of an existing PDF into an A6 page with specific margins and 90% scale.
 * - Fits the original page into the (A6 - margins) box, preserving aspect ratio.
 * - Then applies an additional 0.90 factor.
 * - Centers within the content box.
 *
 * Return: a new PDF buffer ready to send to PrintNode with `fit_to_page: false`.
 */
export declare function toA6WithMarginsAndScale(pdfBuffer: Buffer): Promise<Buffer>;
//# sourceMappingURL=pdf-utils.d.ts.map