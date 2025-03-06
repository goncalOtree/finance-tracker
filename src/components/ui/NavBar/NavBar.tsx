import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";
import NavBarStyle from "./NavBarStyle";

export default async function NavBar() {
  const user = await currentUser();
  if (user) {
    await syncUser(); //POST
  }

  return (
    <NavBarStyle/>
  );
}
