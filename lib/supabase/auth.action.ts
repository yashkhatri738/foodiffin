"use server";

import { createClient } from "./server";
import { supabaseAdmin } from "./admin";

type AuthResult<T = unknown> = {
    success: boolean;
    data?: T;
    error?: string;
};

export async function login(email: string, password: string): Promise<AuthResult> {
    try {
        const supabase = await createClient();

        const res = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (res.error) {    
            return { success: false, error: res.error.message };
        }

        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to login" };
    }
}

export async function logout(): Promise<AuthResult> {
    try {
        const supabase = await createClient();
        const res = await supabase.auth.signOut();

        if (res.error) {
            return { success: false, error: res.error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to logout" };
    }
}

export async function register(
    fullName: string,
    email: string,
    password: string
): Promise<AuthResult> {
    try {
        const supabase = await createClient();
        const res = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (res.error) {
            return { success: false, error: res.error.message };
        }

        // Upsert profile row using admin client (bypasses RLS, works before session is active)
        const userId = res.data.user?.id;
        if (userId) {
            await supabaseAdmin.from("profiles").upsert(
                { id: userId, full_name: fullName },
                { onConflict: "id" }
            );
        }

        return { success: true, data: res.data };
    } catch (err: any) {
        return { success: false, error: err?.message ?? "Failed to register" };
    }
}