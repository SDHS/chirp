import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useUser } from "@clerk/nextjs";

import LoadingSpinner from "./LoadingSpinner";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isDeleting } = api.posts.deleteById.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();
    },
    onError: () => {
      toast.error("Oops! An error occurred whilst deleting the chirp!");
    },
  });

  return (
    <Link href={`/post/${post.id}`}>
      <div className="flex justify-between border-b border-slate-400 ">
        <div key={post.id} className="flex gap-3 p-4">
          <Link href={`/@${author.username}`}>
            <Image
              src={author.profilePicture}
              alt={`@${author.username}'s profile picture`}
              width={56}
              height={56}
              className="rounded-full"
            />
          </Link>
          <div className="flex flex-col">
            <div className="flex text-slate-300">
              <Link href={`/@${author.username}`}>
                <span className="font-bold">{`@${author.username}`}</span>
              </Link>
              <span className="whitespace-pre-wrap"> • </span>
              <span className="self-center text-xs font-thin">{`${dayjs(
                post.createdAt
              ).fromNow()}`}</span>
            </div>
            <span className="text-2xl">{post.content}</span>
          </div>
        </div>
        <div className="mr-4 self-center">
          {isDeleting ? (
            <LoadingSpinner />
          ) : (
            <>
              {user?.id === author.id && (
                <div
                  className="text-3xl text-red-300"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    mutate({ authorId: author.id, postId: post.id });
                  }}
                >
                  &#215;
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostView;
