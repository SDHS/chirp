import superjson from "superjson";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";

const generateSSGHelper = () =>
  createProxySSGHelpers({
    router: appRouter,
    ctx: {
      prisma,
      currentUserId: null,
    },
    transformer: superjson,
  });

export default generateSSGHelper;
