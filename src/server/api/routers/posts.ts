import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);

    if (!author || !author.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return (await addUserDataToPosts([post]))[0];
    }),
  getAll: publicProcedure
    .input(
      z.object({
        cursor: z.number(),
        itemsPerPage: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, itemsPerPage } = input;
      const posts = await ctx.prisma.post.findMany({
        skip: (cursor - 1) * itemsPerPage,
        take: itemsPerPage + 1,
        orderBy: [{ createdAt: "desc" }],
      });

      let hasNextPage = false;
      if (posts.length > itemsPerPage) {
        hasNextPage = true;
        posts.pop();
      }

      return {
        posts: await addUserDataToPosts(posts),
        pagination: { currentPage: cursor, hasNextPage },
      };
    }),

  getPostsByUserId: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: [{ createdAt: "desc" }],
        })
        .then(addUserDataToPosts)
    ),

  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed").min(1).max(255),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.currentUserId;

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content: input.content,
        },
      });

      return post;
    }),
  deleteById: privateProcedure
    .input(
      z.object({
        postId: z.string().cuid(),
        authorId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.authorId !== ctx.currentUserId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
        });
      }

      await ctx.prisma.post.delete({
        where: {
          id: input.postId,
        },
      });
    }),
});
