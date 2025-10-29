import { populate } from 'dotenv';
import IdGenerator from '../../../utils/IdGenerator';
import userServices from '../userModule/user.services';
import { IInvoice } from './invoice.interface';
import Invoice from './invoice.model';
import CustomError from '../../errors';
import subscriptionPurchaseServices from '../subscriptionPurchaseModule/subscriptionPurchase.services';
import boxServices from '../boxModule/box-services';
import surveyServices from '../surveyModule/survey.services';
import { ObjectId } from 'mongoose';

class InvoiceService {
  async createInvoice() {
    const users = await userServices.getAllPurchedUsers();

    if (users.length > 0) {
      const lastInvoice = await this.getLastInvoice();
      let lastInvoiceId = lastInvoice ? parseInt(lastInvoice.invoiceId.split('-')[1]) : 0;

      await Promise.all(
        users
          .filter((user) => user.boxId) // Only users with a valid box
          .map(async (user) => {
            // Step 1: Deactivate all previous invoices for this user
            await Invoice.updateMany({ user: user._id, isActive: true }, { $set: { isActive: false } });

            // Step 2: Create the new invoice and mark it as active
            const invoiceData = {
              invoiceId: IdGenerator.generateSerialId('INV', ++lastInvoiceId, 5),
              user: user._id,
              box: user.boxId,
              isActive: true,
              soldBooks: [],
            };

            return await Invoice.create(invoiceData);
          }),
      );
    }
  }

  async createInvoiceForSingleUser(userId: string) {
    const user = await userServices.getSpecificUser(userId);
    // console.log("user", user)
    if (!user) {
      throw new CustomError.NotFoundError('User not found!');
    }

    const subscriptionPurchaseByUser = await subscriptionPurchaseServices.getSubscriptionPurchaseByUserId(userId);
    // console.log(subscriptionPurchaseByUser)
    if (subscriptionPurchaseByUser) {
      // console.log(user.survey._id)
      const survey = await surveyServices.getSurveyBySurveyId(user.survey._id as unknown as ObjectId)
      // console.log(survey)
      const box = await boxServices.getSpecificBoxByCategoryId(survey?.category as unknown as string);

      if (box) {
        const lastInvoice = await this.getLastInvoice();
        let lastInvoiceId = lastInvoice ? parseInt(lastInvoice.invoiceId.split('-')[1]) : 0;
        const invoiceData = {
          invoiceId: IdGenerator.generateSerialId('INV', ++lastInvoiceId, 5),
          user: user._id,
          box: box._id,
          isActive: true,
          soldBooks: [],
        };

        return await Invoice.create(invoiceData);
      }
    }
  }

  async getAllInactiveInvoicesByUserId(id: string) {
    return await Invoice.find({ user: id, isActive: false }).populate([
      {
        path: 'user',
        select: 'email phone subscription survey gender role',
        populate: {
          path: 'survey',
          select: '',
          populate: {
            path: 'favoriteCollection',
            select: ''
          }
        }
      },
      {
        path: 'box',
        select: 'books',
        populate: {
          path: 'books',
          select: 'name price coverImage'
        }
      },
      {
        path: 'soldBooks.bookId',
        select: 'name price coverImage'
      },
      {
        path: 'extraBooks',
        select: 'name price coverImage'
      }
    ]);
  }

  async getActiveInvoiceByUserId(id: string) {
    return await Invoice.findOne({ user: id, isActive: true }).populate([
      {
        path: 'user',
        select: 'email phone subscription survey gender role',
        populate: {
          path: 'survey',
          select: '',
          populate: {
            path: 'favoriteCollection',
            select: ''
          }
        }
      },
      {
        path: 'box',
        select: 'books',
        populate: {
          path: 'books',
          select: 'name price coverImage'
        }
      },
      {
        path: 'soldBooks.bookId',
        select: 'name price coverImage'
      },
      {
        path: 'extraBooks',
        select: 'name price coverImage'
      }
    ]);
  }

  async updateInvoice(id: string, invoiceData: IInvoice) {
    return await Invoice.findByIdAndUpdate(id, invoiceData, { new: true });
  }

  async getInvoiceById(id: string) {
    return await Invoice.findById(id).populate([
      {
        path: 'soldBooks.bookId',
        select: 'name price'
      },
      {
        path: 'extraBooks',
        select: 'name'
      }
    ]);
  }

  async getLastInvoice() {
    return await Invoice.findOne().sort({ _id: -1 });
  }

  // async getAllInactiveInvoicesByUserId(id: string) {
  //   return await Invoice.find({ user: id, isActive: false });
  // }
}

export default new InvoiceService();