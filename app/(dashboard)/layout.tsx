import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";
import { getProfile } from "@/lib/profile.action";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileResult = await getProfile();
  const profile =
    profileResult.success && profileResult.data
      ? (profileResult.data as {
          full_name?: string | null;
          email?: string | null;
        })
      : null;

  return (
    <>
      <Navbar profile={profile} />
      {children}
      <Toaster position="top-right" />
    </>
  );
}
