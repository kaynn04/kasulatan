"use server";

import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function logoutUser() {
    await deleteSession();
    redirect("/login");
}
