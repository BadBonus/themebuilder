const mainUrl = 'http://178.77.97.137:8002/api/';

export const getThemes = mainUrl+'getAllThemes';
export const getTheme = (id)=>mainUrl+`getThemeById/${id}`;
export const postThemeInsert = mainUrl+'themeInsert';
