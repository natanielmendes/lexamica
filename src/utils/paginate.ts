import { Request, Response, NextFunction } from 'express';
import { Model } from 'mongoose';

export const paginate = (model: Model<any>) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // @ts-ignore
    const result = await model.paginate({}, { page, limit, lean: true });

    res.json({
      data: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      nextPage: result.nextPage,
      prevPage: result.prevPage,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
      lastPage: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};
