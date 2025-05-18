import z from 'zod';

// Enums for validation
const statusEnum = z.enum(['pending', 'shipped', 'delivered', 'failed']);
const paymentTypeEnum = z.enum(['cash', 'card', 'online']);
const paymentStatusEnum = z.enum(['paid', 'unpaid']);
const discountTypeEnum = z.enum(['percentage', 'fixed']);

// Order Item Schema
const orderItemSchema = z.object({
  itemId: z.string({
    required_error: 'Item ID is required!',
  }),
//   name: z.string({
//     required_error: 'Item name is required!',
//   }),
//   price: z
//     .number({
//       required_error: 'Item price is required!',
//     })
//     .positive('Price must be a positive number!'),
//   currency: z.string({
//     required_error: 'Currency is required!',
//   }),
  quantity: z
    .number({
      required_error: 'Item quantity is required!',
    })
    .min(1, 'Quantity must be at least 1!'),
});

// Address Schema
const addressSchema = z.object({
  state: z.string({
    required_error: 'State is required!',
  }),
  street: z.string({
    required_error: 'Street is required!',
  }),
  city: z.string({
    required_error: 'City is required!',
  }),
  country: z.string({
    required_error: 'Country is required!',
  }),
  zipCode: z.string({
    required_error: 'Zip Code is required!',
  }),
});

// Order Validation Schema
const createOrderZodSchema = z.object({
  body: z.object({

    user: z.object({
      userId: z.string({
        required_error: 'User ID is required!',
      }),
      name: z.string({
        required_error: 'User name is required!',
      }),
      email: z
        .string({
          required_error: 'User email is required!',
        })
        .email('Invalid email address!'),
    }),
    items: z.array(orderItemSchema).min(1, 'At least one item is required!'),
    // price: z.object({
    //   amount: z
    //     .number({
    //       required_error: 'Total price amount is required!',
    //     })
    //     .positive('Total price must be a positive number!'),
    //   currency: z.string({
    //     required_error: 'Currency is required!',
    //   }),
    // }),
    // total: z.object({
    //   amount: z
    //     .number({
    //       required_error: 'Total amount is required!',
    //     })
    //     .min(0, 'Total amount cannot be negative!'),
    //   currency: z.string({
    //     required_error: 'Currency is required!',
    //   }),
    // }),
    // shippingAddress: addressSchema,
    status: statusEnum.optional(), // Default: 'pending' (handled in Mongoose schema)
    // paymentInfo: z.object({
    //   type: paymentTypeEnum.optional(), // Default: 'cash'
    //   status: paymentStatusEnum.optional(), // Default: 'unpaid'
    //   tnxId: z.string({
    //     required_error: 'Transaction ID is required!',
    //   }),
    // }),
  }),
});

// Fetch Order Validation
const getOrderZodSchema = z.object({
  params: z.object({
    orderId: z.string({
      required_error: 'Order ID is missing in request params!',
    }),
  }),
});

const OrderValidationZodSchema = {
  createOrderZodSchema,
  getOrderZodSchema,
};

export default OrderValidationZodSchema;
