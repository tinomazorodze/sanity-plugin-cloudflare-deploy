import { useCurrentUser } from "sanity";

export function useDeploymentUser() {
  const user = useCurrentUser();

  if (!user) {
    return undefined;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.profileImage,
  };
}
