import { FulfilledOrder, PrintJob, PrinterStatus } from './types/index.js';

class Store {
  private orders: Map<string, FulfilledOrder> = new Map();
  private printJobs: PrintJob[] = [];
  private printerStatus: PrinterStatus = {
    printerId: '',
    name: '',
    status: 'offline',
    lastCheck: new Date().toISOString(),
  };

  // Orders
  addOrder(order: FulfilledOrder): void {
    this.orders.set(order.id, order);
  }

  getOrder(id: string): FulfilledOrder | undefined {
    return this.orders.get(id);
  }

  getAllOrders(): FulfilledOrder[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  updateOrder(id: string, updates: Partial<FulfilledOrder>): void {
    const order = this.orders.get(id);
    if (order) {
      Object.assign(order, updates);
    }
  }

  // Print Jobs
  addPrintJob(job: PrintJob): void {
    this.printJobs.unshift(job);
    if (this.printJobs.length > 100) {
      this.printJobs = this.printJobs.slice(0, 100);
    }
  }

  getAllPrintJobs(): PrintJob[] {
    return this.printJobs;
  }

  // Printer Status
  getPrinterStatus(): PrinterStatus {
    return { ...this.printerStatus };
  }

  updatePrinterStatus(updates: Partial<PrinterStatus>): void {
    Object.assign(this.printerStatus, updates);
  }

  // Clear all data
  clear(): void {
    this.orders.clear();
    this.printJobs = [];
    // Reset printer status to offline when clearing test data
    this.printerStatus = {
      printerId: '',
      name: '',
      status: 'offline',
      lastCheck: new Date().toISOString(),
    };
  }
}

export const store = new Store();
