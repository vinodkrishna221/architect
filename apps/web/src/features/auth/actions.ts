"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const SignInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    accessCode: z.string().min(1, { message: "Please enter your access code." }),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData);
        const parsed = SignInSchema.safeParse(data);

        if (!parsed.success) {
            return "Invalid email or access code.";
        }

        const { email, accessCode } = parsed.data;

        await signIn("credentials", {
            email,
            accessCode,
            redirectTo: "/dashboard",
        });

        // This line will only be reached if redirect is false or if signIn doesn't throw redirect
        return "Login successful!";

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid email or access code.";
                case "AccessDenied":
                    return "You are not on the waitlist.";
                case "CallbackRouteError":
                    return "Access Denied. You are not on the waitlist.";
                default:
                    return "Something went wrong.";
            }
        }
        throw error;
    }
}
