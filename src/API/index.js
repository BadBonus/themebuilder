const mainUrl = 'http://178.77.97.137:8002/api/';

export const getThemes = mainUrl+'getAllThemes';
export const getTheme = (id)=>mainUrl+`getThemeById/${id}`;
export const postThemeInsert = mainUrl+'themeInsert';
export const getAllProducts = mainUrl+'getAllProducts'; //возвращает все продукты
export const getThemeProducts=(id)=> mainUrl+`getThemeProducts/${id}`;// возвращает список продуктов для данной темы
export const getRestThemeProducts=(id)=> mainUrl+`getRestThemeProducts/${id}`; // возвращает список продуктов, которых нет для данной темы
export const getThemeAndProduct = (id_theme, id_prod) => mainUrl+`getThemeById/${id_theme}/${id_prod}`;// возвращает саму тему для данной комбинации id темы и продукт id
export const addTheme = mainUrl+'addTheme'; //добавляет тему для данной начальной темы и продукта
export const themeInsert = mainUrl+'themeInsert'; //можно добавить начальную тему (product_id = 1), можно просто комбинацию
export const uploadImages = mainUrl+'upload-images';


// POST
// api/addTheme - body {
//     "theme_id": 16,
//     "theme_data": {},
//     "product_id": 10
// }

// /api/themeInsert - body {
//     "user_id": 1231312,
//     "theme_title": "sdasdsad",
//     "theme_data": {},
//     "product_id": 1
// }

// upload-images, form-data: {
//     imgCollection: asdasd.zip
// }
