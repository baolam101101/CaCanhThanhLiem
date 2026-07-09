import { redirect } from "next/navigation";
// Cart feature removed — redirect to contact
export default function CartPage() {
  redirect("/contact");
}
