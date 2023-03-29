import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "~/utils/api";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <Link href={`/post/${post.id}`}>
      <div key={post.id} className="flex gap-3 border-b border-slate-400 p-4">
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
    </Link>
  );
};

export default PostView;
