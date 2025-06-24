"use server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registerformState, State } from "./definitions";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: "Please select a customer.",
    message: "Please select a customer.",
  }),
  amount: z.coerce.number().gt(0, {
    message: "Please enter an amount greater than $0.",
  }),
  status: z.enum(["pending", "paid"], {
    message: "Please select an invoice status.",
  }),
  date: z.string(),
});
const formSchema = FormSchema.omit({ id: true, date: true });
const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedfields = formSchema.safeParse(
    Object.fromEntries(
      formData
    ) /** === {customerid : formdata.get("customrid")} */
  );

  if (!validatedfields.success) {
    return {
      errors: validatedfields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Invoice.",
    };
  }
  const { customerId, amount, status } = validatedfields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }

  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  redirect("/dashboard/invoices");
}

export async function Editinvoice(
  id: string,
  prevState: State,
  formData: FormData
) {
  const validatedfields = formSchema.safeParse(
    Object.fromEntries(
      formData
    ) /** === {customerid : formdata.get("customrid")} */
  );

  if (!validatedfields.success) {
    return {
      errors: validatedfields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to update Invoice.",
    };
  }

  const { amount, customerId, status } = validatedfields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, date = ${date}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return {
      message: "Database Error: Failed to Create Invoice.",
    };
  }
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
  redirect("/dashboard/invoices");
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.name) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}
const RegisterFormSchema = z.object({
  name: z.string().min(1, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
});

export async function Registeruser(
  prevState: registerformState, // Changed from string | undefined to State for consistency
  formData: FormData
): Promise<registerformState> {
  // Changed return type to Promise<State>
  const validatedfields = RegisterFormSchema.safeParse(
    Object.fromEntries(formData)
  );

  console.log(formData);

  if (!validatedfields.success) {
    return {
      errors: validatedfields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Register User.",
    };
  }

  const { name, email, password } = validatedfields.data;
  try {
    // Check if user already exists
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      return {
        message:
          "Registration Failed: User with this email already exists. Please try a different email.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4(); // Generate a unique ID

    await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${id}, ${name}, ${email}, ${hashedPassword})
      `;
  } catch (error) {
    return {
      success: false,
      message: "Database Error: Failed to Register User.",
    };
  }
  redirect("/login");
}
