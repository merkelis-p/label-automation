import { Request, Response } from 'express';
import { store } from '../store.js';

export async function getOrders(_req: Request, res: Response): Promise<void> {
  const orders = store.getAllOrders();
  res.json(orders);
}

export async function getPrintJobs(
  _req: Request,
  res: Response
): Promise<void> {
  const jobs = store.getAllPrintJobs();
  res.json(jobs);
}

export async function getPrinterStatus(
  _req: Request,
  res: Response
): Promise<void> {
  const status = store.getPrinterStatus();
  res.json(status);
}
