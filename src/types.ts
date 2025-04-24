import { Request, Response, NextFunction } from "express";

export enum ApplicationStatusLocal {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

export interface RequestWithUser extends Request {
  user: {
    id: number;
    type: "user" | "company";
    role: "COMPANY" | "JOB_SEEKER";
  };
}

export type RequestHandlerWithUser = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => Promise<void>;
