class Store {
    constructor() {
        this.orders = new Map();
        this.printJobs = [];
        this.printerStatus = {
            printerId: '',
            name: '',
            status: 'offline',
            lastCheck: new Date().toISOString(),
        };
    }
    // Orders
    addOrder(order) {
        this.orders.set(order.id, order);
    }
    getOrder(id) {
        return this.orders.get(id);
    }
    getAllOrders() {
        return Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    updateOrder(id, updates) {
        const order = this.orders.get(id);
        if (order) {
            Object.assign(order, updates);
        }
    }
    // Print Jobs
    addPrintJob(job) {
        this.printJobs.unshift(job);
        if (this.printJobs.length > 100) {
            this.printJobs = this.printJobs.slice(0, 100);
        }
    }
    getAllPrintJobs() {
        return this.printJobs;
    }
    // Printer Status
    getPrinterStatus() {
        return { ...this.printerStatus };
    }
    updatePrinterStatus(updates) {
        Object.assign(this.printerStatus, updates);
    }
    // Clear all data
    clear() {
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
//# sourceMappingURL=store.js.map