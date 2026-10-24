"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import { createSession, deleteSession, getUserId } from "./session";

export type FormState = { error?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;

  if (await db.user.findUnique({ where: { email } }))
    return { error: "This email is already registered" };

  const user = await db.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12) },
  });
  await createSession(user.id);
  redirect("/");
}

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return { error: "Wrong email or password" };
  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

async function requireUser() {
  const id = await getUserId();
  if (!id) redirect("/login");
  return id;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export async function addTask(formData: FormData) {
  const userId = await requireUser();
  const title = String(formData.get("title") ?? "").trim().slice(0, 200);
  if (!title) return;
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 60) || null;
  const p = String(formData.get("priority"));
  const due = String(formData.get("dueDate") ?? "");
  await db.task.create({
    data: {
      title,
      subject,
      priority: PRIORITIES.includes(p) ? p : "MEDIUM",
      dueDate: due ? new Date(due) : null,
      userId,
    },
  });
  revalidatePath("/");
}

export async function toggleTask(id: string) {
  const userId = await requireUser();
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) return;
  await db.task.update({ where: { id }, data: { done: !task.done } });
  revalidatePath("/");
}

export async function deleteTask(id: string) {
  const userId = await requireUser();
  await db.task.deleteMany({ where: { id, userId } });
  revalidatePath("/");
}
