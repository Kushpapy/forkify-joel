import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
   
      //1)Updating bookmarks view
      bookmarksView.update(model.state.bookmarks);

    //2) Loadding recipe
    await model.loadRecipe(id);

    //3. Rendering recipe
    recipeView.render(model.state.recipe);

    //3)Updating bookmarks view
    // bookmarksView.update(model.state.bookmarks);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1. Get search query
    const query = searchView.getQuery();

    if (!query) return;

    //2.load search result
    await model.loadSearchResults(query);

    //.render search result
    //console.log(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    //render pagination
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  //render page based on number in goToPage
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render pagination
  paginationView.render(model.state.search);

  console.log(model.state);
};

const controlServings = function (newServings) {
  //Update the recipe servings
  model.updateServings(newServings);

  //update the recipe view
  //recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //add or remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  console.log(model.state.recipe);
  
  //Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
 try {
   //Render spinner
    addRecipeView.renderSpinner();
  //upload recipe to  model
 await model.uploadRecipe(newRecipe);

 //Render recipe
 recipeView.render(model.state.recipe);

 //success message
 addRecipeView.renderMessage();

 //render bookmark
 bookmarksView.render(model.state.bookmarks);

 //change ID in URL
 window.history.pushState(null, '', `#${model.state.recipe.id}`);

 //close form window
 setTimeout(function(){
  addRecipeView.toggleWindow();
 }, MODAL_CLOSE_SEC * 1000)
 } catch (error) {
  console.log(error);
  addRecipeView.renderError(error.message)
 }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe)
};

init();
