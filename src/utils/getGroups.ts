import formatTimeWithoutSeconds from './formatTimeWithoutSeconds';
const fetchGroups = async () => {
  const fetchedGroups = await window.api.getGroups();
  console.log(fetchedGroups,'fetchGroups')
  return ({
    ...fetchedGroups,
    groups: [
      {
        id_grupo: 0,
        nombre_grupo: 'Todos',
        horarios: [],
        creado_en: '',
        actualizado_en: '',
      },
      ...fetchedGroups.groups.map(el => ({
        id_grupo: el.id_grupo,
        nombre_grupo: el.nombre_grupo.toString(),
        horarios: el.horarios.map(h => ({
          ...h,
          hora_inicio: formatTimeWithoutSeconds(h.hora_inicio),
          hora_fin: formatTimeWithoutSeconds(h.hora_fin),
        })),
        creado_en: el.creado_en,
        actualizado_en: el.actualizado_en,
      }))
    ]
  });
};

export { fetchGroups };