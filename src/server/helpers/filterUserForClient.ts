import type { User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => ({
  id: user.id,
  username: user.username,
  profilePicture: user.profileImageUrl,
});
