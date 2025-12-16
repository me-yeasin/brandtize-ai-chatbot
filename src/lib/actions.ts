"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models/user";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(prevState: string | undefined | null, formData: FormData): Promise<string | null> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = RegisterSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return validatedFields.error.flatten().fieldErrors.email?.[0] ||
               validatedFields.error.flatten().fieldErrors.password?.[0] ||
               validatedFields.error.flatten().fieldErrors.name?.[0] ||
               "Invalid input data";
    }

    const { name, email, password } = validatedFields.data;

    try {
        await connectToDatabase();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return "Email already in use";
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,
            password: hashedPassword,
        });

    } catch (error) {
        console.error("Registration error:", error);
        return "Failed to create user";
    }

    // Attempt to sign in directly after registration is handled by the redirect in the form action
    // But since this is a server action, we might just want to redirect to login
    // For now, we return null to indicate success in the component
    return null;
}
