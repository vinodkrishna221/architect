"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const SignInSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const data = Object.fromEntries(formData);
        const parsed = SignInSchema.safeParse(data);

        if (!parsed.success) {
            return "Invalid email address.";
        }

        const { email } = parsed.data;

        await signIn("nodemailer", {
            email,
            redirect: false, // We handle redirect in client or it happens automatically? 
            // Actually with redirect:false we get a response.
            // But for Magic Links, usually we just want to trigger the email sending.
            // If we use redirect: true (default), it redirects to verify-request page.
        });

        // If we get here, it means signIn didn't throw (so email sent)
        return "Magic link sent! Check your email.";

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
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
