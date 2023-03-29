// 2:10:14
import type { GetStaticProps, NextPage } from "next";
import Image from "next/image";
import Head from "next/head";
import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import StandardLayout from "~/components/StandardLayout";

import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";

import { api } from "~/utils/api";

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  console.log("data", data);

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{username} profile</title>
      </Head>
      <StandardLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profilePicture}
            alt={`${data.username ?? ""}'s profile picture`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-2 border-black bg-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400" />
      </StandardLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      currentUserId: null,
    },
    transformer: superjson,
  });

  const slug = ctx.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");
  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
