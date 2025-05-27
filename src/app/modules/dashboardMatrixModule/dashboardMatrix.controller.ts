import { Request, Response } from 'express';
import asyncHandler from '../../../shared/asyncHandler';
import User from '../userModule/user.model';
import Order from '../orderModule/order.model';
import Blog from '../blogModule/blog.model';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import orderServices from '../orderModule/order.services';
import Book from '../bookModule/book.model';

const retrieveDashboardMatrix = asyncHandler(async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();

  try {
    // total insights
    const [totalUsers, totalOrders, totalProducts, totalBlogs] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Book.countDocuments(),
      Blog.countDocuments(),
    ]);

    // Initialize data structures for monthly stats
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const userGrowth = Array(12).fill(0);
    const orderGrowth = Array(12).fill(0);

    // Fetch monthly stats for users in the given year
    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    usersByMonth.forEach(({ _id, count }) => {
      userGrowth[_id - 1] = count;
    });

    // Fetch monthly stats for orders in the given year
    const ordersByMonth = await Order.aggregate([
      { $match: { createdAt: { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) } } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
    ]);
    ordersByMonth.forEach(({ _id, count }) => {
      orderGrowth[_id - 1] = count;
    });

    // Normalize data for chart representation
    const maxUsers = Math.max(...userGrowth) || 1;
    const maxOrders = Math.max(...orderGrowth) || 1;

    const chartData = {
      months,
      userStatistics: userGrowth.map((count) => (count / maxUsers) * 100),
      orderStatistics: orderGrowth.map((count) => (count / maxOrders) * 100),
    };

    const responseData = {
      totalUsers,
      totalOrders,
      totalProducts,
      totalBlogs,
      chartData,
    };

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      status: 'success',
      message: 'Dashboard metrics retrieved successfully',
      data: responseData,
    });
  } catch (error) {
    console.error(error);
    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: 'error',
      message: 'Failed to retrieve dashboard metrics.',
      data: null,
    });
  }
});

// const retrieveUserDashboardInsights = asyncHandler(async (req: Request, res: Response) => {
//     const totalOrders = await orderServices.getAllOrders();
//     let totalPending = 0;
//     let totalProcessing = 0;
//     let totalShipped = 0;
//     let totalDeliverd = 0;
//     let totalCancelled = 0;

//     totalOrders.map((order) => {
//         switch (order.status) {
//             case 'pending':
//                 totalPending++
//                 break;
//             case 'processing':
//                 totalProcessing++
//                 break;
//             case 'shipped':
//                 totalShipped++
//                 break;
//             case 'deliverd':
//                 totalDeliverd++
//                 break;
//             case 'cancelled':
//                 totalCancelled++
//                 break
//             default:
//                 break;
//         }
//     })

//     const responseData = {
//         totalPending,
//         totalProcessing,
//         totalShipped,
//         totalDeliverd,
//         totalCancelled,
//     }

//     sendResponse(res, {
//         statusCode: StatusCodes.OK,
//         status: 'success',
//         message: 'User dashboard insights retrieved successfully',
//         data: responseData,
//     })

// })

export default {
  retrieveDashboardMatrix,
  // retrieveUserDashboardInsights
};
