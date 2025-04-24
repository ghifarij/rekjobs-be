import { sign, SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import ms from "ms";

export const base_url_fe = process.env.NEXT_PUBLIC_BASE_URL_FE;
export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export function generateToken(
  payload: any,
  expiresIn: ms.StringValue = "1d"
): string {
  const msValue = ms(expiresIn) as number;
  const options: SignOptions = { expiresIn: msValue / 1000 };
  return sign(payload, process.env.JWT_KEY as string, options);
}
