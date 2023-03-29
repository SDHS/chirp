import type { PropsWithChildren } from "react";

const StandardLayout = ({ children }: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="w-full overflow-y-scroll border-x border-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};

export default StandardLayout;
