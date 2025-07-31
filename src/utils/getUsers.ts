const fetchUsers = async () => {
  const fetchedUsers = await window.api.getUsers();
  return(fetchedUsers);
};

export { fetchUsers };