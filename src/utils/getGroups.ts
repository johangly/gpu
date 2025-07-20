const fetchGroups = async () => {
  const fetchedGroups = await window.api.getGroups();
  return ([
    { id_grupo: 'all', id_name: 'all', nombre_grupo: 'Todos', creado_en: '', actualizado_en: '' },
    ...fetchedGroups.groups.map(el => ({
      id_grupo: el.id_grupo,
      id_name: el.nombre_grupo.toLowerCase(),
      nombre_grupo: el.nombre_grupo.toLowerCase(),
      creado_en: el.creado_en,
      actualizado_en: el.actualizado_en,
    }))
  ]);
};

export { fetchGroups };