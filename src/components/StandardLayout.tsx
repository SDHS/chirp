import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import type { PropsWithChildren } from "react";

const StandardLayout = ({ children }: PropsWithChildren) => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const isRootPage = router.pathname === "/";

  return (
    <main className="flex h-screen justify-center">
      <div className="w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        <div className="flex min-h-[4rem] items-center justify-between bg-slate-600 p-4">
          {!isRootPage ? (
            <div
              className="cursor-pointer text-2xl"
              onClick={() => router.back()}
            >
              &#x2190;
            </div>
          ) : (
            <div />
          )}
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <SignOutButton />}
        </div>
        {children}
      </div>
    </main>
  );
};

export default StandardLayout;
