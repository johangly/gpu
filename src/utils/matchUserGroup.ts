import type { User, SessionGroup } from "../types";

function matchUserGroup(user: User, groups: SessionGroup[]) {
  const newUser = {
    ...user,
    'grupo': groups.find((group) => {
      if (
        group.id_grupo !== 0 ? user.grupo.id_grupo === group.id_grupo : 0
      ) {
        return group;
      }
    })
  }
  return newUser;
} 
  
export default matchUserGroup;