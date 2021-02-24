import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
// import icons from 'url:../img/icons.svg'; //parcel 1
//parcel 2 have to put url: before path for static files e..g
//images videos
import 'core-js/stable'; //polyfill everything else
import 'regenerator-runtime/runtime'; //polyfill async await //so anyone can use in their browser
import { async } from 'regenerator-runtime';
//in parcel can important more than js, icons
// const recipeContainer = document.querySelector('.recipe');
//can use hot module here as before
// https://forkify-api.herokuapp.com/v2
//jonas made his own api or project
//only 100 requests per hour so server isn't over loaded, his own server

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id); //async func will return a promise that need to handle when call that function, async func calling another async func
    //does not return anything , but having acess to state varaible , load recipe is not a pure func is manipulating state outside of it , are ways around this but not todays
    // const { recipe } = model.state;

    //2) rendering the recipe
    //all images and icons from dist file
    recipeView.render(model.state.recipe);
    // const recipeView = new recipeView(model.state.view);
  } catch (err) {
    // alert(err);
    recipeView.renderError();
    console.error(err);
  }
};
// window.addEventListener('hashchange', controlRecipes);
// window.addEventListener('load', controlRecipes);
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;
    //2) load search results
    await model.loadSearchResults(query);
    //3) display search results
    resultsView.render(model.getSearchResultsPage());
    //render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationView.render(model.state.search);
};
// controlSearchResults();

const controlServings = function (newServings) {
  model.updateServings(newServings);
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1)add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);
    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmarks);
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
//upload the new recipe data;
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
///////////////////////////////////////
//the hash = #id
//changing of the hash is event we can listen for , take the hash, take the id, load the recipe with the id
//?search = var pizza = value, query string, search for pizza
//same planning as mapty
/* user stories, features
as a user i want to dearch for recipes, so that i can find new ideas for meals

features
!-- not for each as method needs to return something --
search func, input field to send request to api with searched keywords 
display results with pagination 
display recipe with cooking time, servings and ingredients 
as a user , i want to be able to update the no. of sefings so can cook meal for diff nujm of ppl
change servings func , update all ingreds accord to curr num of servings 
as a user, i want to bookmark recipes
bookmarking func display list of all bookm recipes 
create recipes
user can upload recipes 
user recipes will automatically be bookmarked
user can only see their own recupes, not recipes from other users
see my bookmarks and own recipes whhen i leave app and come back later 
store bookmark data in the broswr using local storage
on page load, read daved bookmarks from local storage and display

features 
search func: api search request 
results with pagination 
display recipe -> other features later


1.user searches - aysync load search results, render search results, pag buttoms , user clicks pag (bind handler) user selects recipe (bind handler ) - async load recipe - page loads with recipe id - render recipe

parcel can convert sass to css
sadd makes css easier to write and read in large projects
src folder with assets in scripts, js 
npm init
npm install parcel@next -D
npm install sass@1.12.20
npm run start

compiler parcel takes source code and compiles into browser ready code

why worry about architecture?
structure: like a house, software needs a structure, the way we organise our code into modules, classes and functions,
maintainability: a project is never done! we need to be able to easily change it in the future
expandibility: we also need to be able to easily add new features 
the perfect arhcitecture has best of 3 bits
we can create our own architecture (mapty project)
we can use a well-estab architecture pattern like MVC, mvp, flux ,etc (this project)
we can use a framework like react,angular, vue, svelte, etc
we also need to be able to easily add new features
business logic
code that solves the actual business problem
directly related to what business does and what it needs 
example: sending messages (whatsapp), storing transactions (bank)
state 
essentially stores all the data about the application
should be the single source of truth
what page user views, data from api 
ui should be kept in sync with the state
ui changes, state should change
one of the most dif tasks - so many libraries e.g. reduc and mobx
state libraries exist

http library 
resp for making and reciveing ajax requests 
optional but almost always necess in real-world apps

application logic (router)
code that is only concerned about the implemention of apllication itself
handles navigation and Ui events 

presentation logic (ui layer)
code that is concerned about the visible part of the application
essentialy deisplaus application state

model-view-controller mvc artichecture

model - business logic, state, http library - web
controller - application logic - bridge btw model and views (which don't know about one another)
handles ui events and dispatches tasks to model and view
view - presenation logic , user
one of big goals is to separate business logic from presentation logic, makes dev easier
click by user - 0, controller handles click, ask model for data, update ui, controls and orchestrates the whole app/action, model does ajax request to web, model sends data to controller which sends to view 
...> data flow bottom line
only controller that does imports and calls function
model and view completely stand alone and isolated, don't import eachother or controller, don't know controller exists, sit there waiting for instructions from controller 
controller -> model -> controller asks for data - > view
implementation diagram


//views are bigger, don't want file with 100s lines of code
controlRecipes acts as a bridge

display no.of pages btwn pag buttobs
abil to sort search results by duration or no of ingred
perfrom ingred vali in view, before submitting the form
improve recipe ingred input, seprate in multiple fields and allow more than 6 ingredeints


shopping list feature, button on recipe to add ingredeints to a list,
weekly meal planning feature, assign recipes to the next 7 days and show on weekly calendar, drop down list?
get nutrtiion data on each ingred from spoonacular api food-api and calc total calorites of recipe

//hosting service (server) netlify
*/
