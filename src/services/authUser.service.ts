import { PrismaClient } from "../../prisma/generated/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { sendEmail, sendUserVerificationEmail } from "../utils/email";
import { resetPasswordEmailTemplate } from "../utils/resetPasswordEmail";

export class AuthUserService {
  private prisma: PrismaClient;
  private googleClient: OAuth2Client;

  constructor() {
    this.prisma = new PrismaClient();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  public async loginUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    // Using id instead of userId for consistency
    const token = jwt.sign(
      { id: user.id, type: "user" },
      process.env.JWT_KEY!,
      {
        expiresIn: "1d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  public async registerUser(email: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const verificationToken = jwt.sign({ email }, process.env.JWT_KEY!, {
      expiresIn: "1h",
    });

    // Create user with verification token and default values
    await this.prisma.user.create({
      data: {
        email,
        name: "", // Will be set during verification
        password: "", // Will be set during verification
        verificationToken,
        isVerified: false,
      },
    });

    await sendUserVerificationEmail(email, verificationToken);

    return {
      message: "Verification email sent",
    };
  }

  public async verifyUser(
    token: string,
    userData: {
      username: string;
      password: string;
      no_handphone: string;
    }
  ) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      email: string;
    };
    const user = await this.prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.isVerified) {
      throw new Error("User already verified");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        name: userData.username,
        password: hashedPassword,
        phone: userData.no_handphone,
      },
    });

    return {
      message: "Account verified successfully",
    };
  }

  public async socialLogin(
    googleId: string,
    email?: string,
    name?: string,
    picture?: string
  ) {
    try {
      if (!googleId) {
        throw new Error("Google ID is required");
      }

      console.log("Processing social login for Google ID:", googleId);

      // First check if user exists with this email
      const existingUser = await this.prisma.user.findFirst({
        where: { email },
      });

      if (existingUser) {
        if (!existingUser.googleId) {
          throw new Error(
            "Email already registered with password. Please use email login instead."
          );
        }
        if (existingUser.googleId !== String(googleId)) {
          throw new Error(
            "This email is already registered with a different Google account."
          );
        }
      }

      // Find user by Google ID
      let user = await this.prisma.user.findFirst({
        where: { googleId },
      });

      if (!user) {
        if (!email) {
          throw new Error("Email is required for new user registration");
        }

        console.log("User not found with Google ID, creating new user");

        // Create new user with Google ID and provided info
        user = await this.prisma.user.create({
          data: {
            email: email,
            name: name || `Google User ${googleId.substring(0, 8)}`,
            password: await bcrypt.hash(Math.random().toString(36), 10),
            isVerified: true,
            googleId: String(googleId),
            avatar: picture || null,
          },
        });

        console.log("Created new user:", user);
      } else {
        console.log("Found existing user:", user);

        // Update user info if provided
        if (email || name || picture) {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: {
              ...(email && { email }),
              ...(name && { name }),
              ...(picture && { avatar: picture }),
            },
          });
          console.log("Updated user info:", user);
        }
      }

      // Using id instead of userId for consistency
      const jwtToken = jwt.sign(
        { id: user.id, type: "user" },
        process.env.JWT_KEY!,
        {
          expiresIn: "1d",
        }
      );

      return {
        token: jwtToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        message: "Login successful",
      };
    } catch (error) {
      console.error("Social login error:", error);
      throw error;
    }
  }

  public async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_KEY!, {
      expiresIn: "1h",
    });

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL_FE}/auth/user/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset Password Anda - RekJobs",
      html: resetPasswordEmailTemplate(resetLink),
      text: `Untuk mereset password Anda, silakan kunjungi link berikut: ${resetLink}`,
    });

    return {
      message: "Email reset password berhasil dikirim",
    };
  }

  public async resetPassword(token: string, password: string) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      id: number;
    };
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
      throw new Error("Invalid or expired reset token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null, // Clear the token after use
        resetPasswordExpires: null,
      },
    });

    return {
      message: "Password reset successfully",
    };
  }

  public async checkVerificationStatus(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as {
      email: string;
    };
    const user = await this.prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      isVerified: user.isVerified,
      email: user.email,
    };
  }
}
