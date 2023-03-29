// 1:18:38
import { useState } from "react";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { toast } from "react-hot-toast";
import Head from "next/head";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import LoadingSpinner from "~/components/LoadingSpinner";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors?.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later!");
      }
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      <Image
        src={user.profileImageUrl}
        alt="Profile image"
        width={56}
        height={56}
        className="rounded-full"
      />
      <input
        placeholder="Type some emojis!"
        className="grow bg-transparent outline-none"
        disabled={isPosting}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            mutate({ content: input });
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}
      {isPosting && (
        <div className="flex flex-col justify-center">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profilePicture}
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex text-slate-300">
          <span className="font-bold">{`@${author.username}`}</span>
          <span className="whitespace-pre-wrap"> • </span>
          <span className="self-center text-xs font-thin">{`${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();
  if (postsLoading) {
    return (
      <div className="mt-14 flex items-center justify-center">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  if (!data) return <div>Something went wrong...</div>;

  return (
    <div className="flex flex-col">
      {data?.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const SinglePostPage: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) {
    return <div />;
  }

  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">Single post page</main>
    </>
  );
};

export default SinglePostPage;
