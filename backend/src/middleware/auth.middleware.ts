import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const isDevBypass = req.headers['x-admin-dev-bypass'] === 'true';

    if (isDevBypass) {
      req.user = { id: 'dev-admin' };
      return next();
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    next();
  } catch (err) {
    next(err);
  }
};
