import { useUserProfileContext } from '../contexts/UserProfileContext';

export function useUserProfile() {
  return useUserProfileContext();
}
