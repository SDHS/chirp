// 1:18:38
import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { toast } from "react-hot-toast";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import StandardLayout from "~/components/StandardLayout";
import PostView from "~/components/PostView";
import LoadingSpinner from "~/components/LoadingSpinner";

import { api } from "~/utils/api";

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

const ITEMS_PER_PAGE = 5;

const Feed = () => {
  const {
    data,
    isLoading: postsLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = api.posts.getAll.useInfiniteQuery(
    {
      itemsPerPage: ITEMS_PER_PAGE,
    },
    {
      getNextPageParam: ({ pagination }) =>
        pagination.hasNextPage ? pagination.currentPage + 1 : undefined,
      initialCursor: 1,
    }
  );

  if (postsLoading) {
    return (
      <div className="mt-14 flex items-center justify-center">
        <LoadingSpinner size={60} />
      </div>
    );
  }

  if (!data) return <div>Something went wrong...</div>;

  return (
    <>
      <div className="flex flex-col">
        {data.pages.map((page, i) => (
          <React.Fragment key={i}>
            {page.posts.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </React.Fragment>
        ))}
      </div>
      {hasNextPage && (
        <div className="flex w-full items-center justify-center p-2">
          <button
            className="w-full rounded-md bg-slate-600 p-2 md:max-w-xs"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <LoadingSpinner /> : "Load more"}
          </button>
        </div>
      )}
    </>
  );
};

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  if (!userLoaded) {
    return <div />;
  }

  return (
    <StandardLayout>
      {isSignedIn && (
        <div className="flex border-b border-slate-400 p-4">
          <CreatePostWizard />
        </div>
      )}
      <Feed />
    </StandardLayout>
  );
};

export default Home;
