"use server";
import { z } from "zod";

import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(["pending", "paid"]),
  date: z.string(),
});
const CreateInvoiceSchema = FormSchema.omit({ id: true, date: true });

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });
export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = CreateInvoiceSchema.parse(
    Object.fromEntries(
      formData
    ) /** === {customerid : formdata.get("customrid")} */
  );

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split("T")[0];

  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

  revalidatePath("/dashboard/invoices");
  redirect("/dashboard/invoices");
}
