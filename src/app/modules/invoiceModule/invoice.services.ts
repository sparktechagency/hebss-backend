import { IInvoice } from './invoice.interface';
import Invoice from './invoice.model';

class InvoiceService {
  async createInvoice(invoiceData: IInvoice) {
    const invoice = new Invoice(invoiceData);
    return await invoice.save();
  }

  async getAllInactiveInvoicesByUserId(id: string) {
    return await Invoice.find({ user: id, isActive: false });
  }

  async getActiveInvoiceByUserId(id: string) {
    return await Invoice.findOne({ user: id, isActive: true });
  }

  async updateInvoice(id: string, invoiceData: IInvoice) {
    return await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
  }

  async getInvoiceById(id: string) {
    return await Invoice.findById(id);
  }

  async getLastInvoice() {
    return await Invoice.findOne().sort({ _id: -1 });
  }
}

export default new InvoiceService();
