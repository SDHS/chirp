import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

const StandardLayout = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  return (
    <main className="flex h-screen justify-center">
      <div className="w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        <div className="flex items-center justify-center bg-slate-600">
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <SignOutButton />}
        </div>
        {children}
      </div>
    </main>
  );
};

export default StandardLayout;
