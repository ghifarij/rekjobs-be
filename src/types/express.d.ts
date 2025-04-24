import * as express from "express";

export type UserPayload = {
  id: number;
};

export type CompanyPayload = {
  id: number;
};

declare global {
  namespace Express {
    export interface Request {
      user?: UserPayload;
      company?: CompanyPayload;
    }
  }
}
