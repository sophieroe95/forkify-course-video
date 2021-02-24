import { async } from 'regenerator-runtime/runtime';
import { API_URL } from './config.js';
import { AJAX, getJSON } from './helpers.js';
import { RES_PER_PAGE } from './config.js';
import { KEY } from './config.js';

export const state = {
  recipe: {},
  search: { query: '', results: [], page: 1, resultsPerPage: RES_PER_PAGE },
  bookmarks: [],
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    // const res = await fetch();
    // // 'https://forkify-api.herokuapp.com/api/v2/recipes/5ed6604591c37cdc054bc886'
    // //fetch returns promise, so await promise, but async func so does not block thread of execution, //fetch returns response object
    // const data = await res.json(); //res.json() returns another promise have to wait for, then get data
    // if (!res.ok) throw new Error(`${data.message} (${res.status})`); //from response of serverapi, res.ok is in response itself
    // console.log(res, data);
    // // let recipe = data.data.recipe;
    // const { recipe } = data.data;
    //reformat data
    // state.recipe = {
    //   id: recipe.id,
    //   title: recipe.title,
    //   publisher: recipe.publisher,
    //   sourceUrl: recipe.source_url,
    //   image: recipe.image_url,
    //   servings: recipe.servings,
    //   cookingTime: recipe.cooking_time,
    //   ingredients: recipe.ingredients,

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
    console.log(state.recipe);
  } catch (err) {
    //temp error handling
    console.error(`${err}`);
    throw err;
    //propagated err by throwing it down to next async func
  }
  //func will do not do anything, will change state object then controller will take recipe
  //satte object updated by load recipe, live connection with controller
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    //getjson returns a promise
    console.log(data);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
    //reformat data
    // state.recipe = {
    //   id: recipe.id,
    //   title: recipe.title,
    //   publisher: recipe.publisher,
    //   sourceUrl: recipe.source_url,
    //   image: recipe.image_url,
    //   servings: recipe.servings,
    //   cookingTime: recipe.cooking_time,
    //   ingredients: recipe.ingredients,
    // };
  } catch (err) {
    //temp error handling
    console.error(`${err}`);
    throw err;
    //propagated err by throwing it down to next async func
  }
  //func will do not do anything, will change state object then controller will take recipe
  //satte object updated by load recipe, live connection with controller
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};
export const addBookmark = function (recipe) {
  //add bookmark
  state.bookmarks.push(recipe);
  //mark current recipe as bookmark
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  //delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  //mark current recipe as not bookmark
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();
// console.log(state.bookmarks);

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error('wrong ingred format, please use correct format');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

/* netlify only html,css, js
surge - free and even easier
many servers across world in 
git = version control
if make a mistake can go back to prvious verions
git init
github - store local repo in the cloud
gitlab, gitbucket also
git add -A
git reset --hard HEAD (if have just added)
git log - take a look at prev commit
:q
git reset --hard idnumber
git branch - lists branchesgit 
git branch new-feature
git merge new-feature
git cheat sheet, education.github.com/git-cheat-sheet-education.pdf  */
