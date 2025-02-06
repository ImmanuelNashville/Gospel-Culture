import { useContext } from 'react';
import { UserDataContext } from '../context/user';

export const useUserDataContext = () => {
  const userDataContext = useContext(UserDataContext);
  if (!userDataContext) {
    throw new Error(
      'No UserDataContext.Provider found when calling `useUserDataContext`. Make sure this component is a child the UserDataContext.Provider somewhere in the component tree.'
    );
  }
  return userDataContext;
};
