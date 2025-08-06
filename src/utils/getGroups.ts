const fetchGroups = async () => {
  const fetchedGroups = await window.api.getGroups();
  return ({
    ...fetchedGroups,
    groups: [
      {
        id_grupo: 0,
        nombre_grupo: 'Todos',
      },
      ...fetchedGroups.groups.map(el => ({
        id_grupo: el.id_grupo,
        nombre_grupo: el.nombre_grupo.toString(),
      }))
    ]
  });
};

export { fetchGroups };