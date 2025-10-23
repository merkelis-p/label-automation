import { FulfilledOrder, PrintJob, PrinterStatus } from './types/index.js';
declare class Store {
    private orders;
    private printJobs;
    private printerStatus;
    addOrder(order: FulfilledOrder): void;
    getOrder(id: string): FulfilledOrder | undefined;
    getAllOrders(): FulfilledOrder[];
    updateOrder(id: string, updates: Partial<FulfilledOrder>): void;
    addPrintJob(job: PrintJob): void;
    getAllPrintJobs(): PrintJob[];
    getPrinterStatus(): PrinterStatus;
    updatePrinterStatus(updates: Partial<PrinterStatus>): void;
    clear(): void;
}
export declare const store: Store;
export {};
//# sourceMappingURL=store.d.ts.map