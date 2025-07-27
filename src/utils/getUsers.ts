const fetchUsers = async () => {
  const fetchedUsers = await window.api.getUsers();
  console.log('fetchedUsers', fetchedUsers)
  return(fetchedUsers);
};

export { fetchUsers };