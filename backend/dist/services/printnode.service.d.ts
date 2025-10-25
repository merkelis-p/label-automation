export declare function printLabel(pdfBuffer: Buffer, title: string): Promise<{
    jobId: number;
    success: boolean;
}>;
export declare function getPrinterCapabilities(): Promise<any>;
export declare function getPrinterStatus(): Promise<{
    online: boolean;
    queueLength: number;
}>;
//# sourceMappingURL=printnode.service.d.ts.map