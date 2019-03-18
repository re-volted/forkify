import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import {
   elements,
   renderLoader,
   clearLoader
} from './views/base';
import * as searchView from './views/searchView';
import * as listView from './views/listView';
import * as recipeView from './views/recipeView';
import * as likesView from './views/likesView';

// State of the app
// - Search object
// - Current recipe object
// - Shopping list object
// - Liked recipes

// PUTTING FOCUS ON INPUT AFTER DOM LOADED
document.addEventListener('DOMContentLoaded', () => {
   elements.searchInput.focus();
});

const state = {};

// 
// SEARCH CONTROLLER
// 
const controlSearch = async () => {
   // 1. Get the query from the view
   const query = searchView.getInput();

   if (query) {
      // 2. New search object and add to state
      state.search = new Search(query);

      // 3. Prepare the UI for coming results
      searchView.clearInput();
      searchView.clearResults();
      renderLoader(elements.searchRes);

      try {
         // 4. Search for recipes
         await state.search.getResults();

         // 5. Render results on UI
         clearLoader();
         searchView.renderResults(state.search.recipes);
      } catch (error) {
         alert('Something went wrong with the search...');
         clearLoader();
      }
   }
};

elements.searchForm.addEventListener('submit', e => {
   e.preventDefault();
   controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
   const btn = e.target.closest('.btn-inline');
   if (btn) {
      const goToPage = parseInt(btn.dataset.goto, 10);
      searchView.clearResults();
      searchView.renderResults(state.search.recipes, goToPage);
   }
});

// 
// RECIPE CONTROLLER
//
const controlRecipe = async () => {
   // getting ID from URL
   const id = window.location.hash.replace('#', '');

   if (id) {
      // 1. Prepare UI for changes
      recipeView.clearRecipe();
      renderLoader(elements.recipe);

      // 1a. Highlight the searched item
      // console.log(state.search, id);
      if (state.search) {
         searchView.highlightSelected(id)
      };

      // 2. Create new recipe object
      state.recipe = new Recipe(id);

      try {
         // 3. Get recipe data
         await state.recipe.getRecipe();
         state.recipe.parseIngredients();
         // 4. Calculate servings and time
         state.recipe.calcTime();
         state.recipe.calcServings();
         // 5. Render recipe
         clearLoader();
         recipeView.renderRecipe(
            state.recipe,
            state.likes.isLiked(id)
         );
      } catch (error) {
         alert('Error processing recipe.')
      }
   }
}

// adding different event types to the same eventListener
['hashchange', 'load'].forEach(e => {
   window.addEventListener(e, controlRecipe)
});

// 
// LIST CONTROLLER
//
const controlList = () => {
   // Create new list if there is none yet
   if (!state.list) state.list = new List();

   // Add each ingredient to the list and UI
   state.recipe.ingredients.forEach(el => {
      const item = state.list.addItem(el.count, el.unit, el.ingredient);
      listView.renderItem(item);
   });
};

// Delete and update list item events
elements.shoppingList.addEventListener('click', e => {
   const id = e.target.closest('.shopping__item').dataset.itemid;

   // handle delete btn
   if (e.target.matches('.shopping__delete, .shopping__delete *')) {
      // delete from state
      state.list.deleteItem(id);
      // delete from UI
      listView.deleteItem(id);

      // handle for count update
   } else if (e.target.matches('.shopping__count-value')) {
      const val = parseFloat(e.target.value);
      state.list.updateCount(id, val);
   }
});

// 
// LIKES CONTROLLER
//
const controlLike = () => {
   if (!state.likes) state.likes = new Likes();
   const currentID = state.recipe.id;

   // user has not liked current recipe yet
   if (!state.likes.isLiked(currentID)) {
      // Add like to the state
      const newLike = state.likes.addLike(
         currentID,
         state.recipe.title,
         state.recipe.author,
         state.recipe.img
      );

      // Toggle the like btn
      likesView.toggleLikeBtn(true);

      // Add like to UI list
      likesView.renderLike(newLike);

      // user has liked the current recipe
   } else {
      // Remove like from the state
      state.likes.deleteLike(currentID);

      // Toggle the like btn
      likesView.toggleLikeBtn(false);

      // Remove like from UI list
      likesView.deleteLike(currentID);
   }
   likesView.toggleLikeMenu(state.likes.getNumLikes());
}

// Restore liked recipes on page load
window.addEventListener('load', () => {
   state.likes = new Likes();

   // Restore likes
   state.likes.readStorage();

   // Toggle like menu btn
   likesView.toggleLikeMenu(state.likes.getNumLikes());

   // Render existing likes
   state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Clicking servings inc or dec
elements.recipe.addEventListener('click', e => {
   if (e.target.matches('.btn-decrease, .btn-decrease *')) {
      if (state.recipe.servings > 1) {
         state.recipe.updateServings('dec');
         recipeView.updateServingsIngredients(state.recipe);
      }
   } else if (e.target.matches('.btn-increase, .btn-increase *')) {
      state.recipe.updateServings('inc');
      recipeView.updateServingsIngredients(state.recipe);
   } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
      // add ingredients to shopping list
      controlList();
   } else if (e.target.matches('.recipe__love, .recipe__love *')) {
      // Like controller
      controlLike();
   }
});