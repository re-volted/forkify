import {
   elements
} from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
   elements.searchInput.value = ''
};

export const clearResults = () => {
   elements.resultsList.innerHTML = '';
   elements.searchResPages.innerHTML = '';
};

export const highlightSelected = id => {
   const resultsArr = Array.from(document.querySelectorAll('.results__link'));
   resultsArr.forEach(el => {
      el.classList.remove('results__link--active');
   })
   document.querySelector(`.results__link[href*="${id}"]`).classList.add('results__link--active');
}

export const limitRecipeTitle = (title, limit = 17) => {
   const newTitle = [];
   if (title.length > limit) {
      title.split(' ').reduce((acc, cur) => {
         if ((acc + cur.length) <= limit) {
            newTitle.push(cur);
            return acc + cur.length;
         }
      }, 0);

      return `${newTitle.join(' ')}...`;
   }
   return title;
}

const renderRecipe = recipe => {
   const markup = `
      <li>
         <a class="results__link results__link--active" href="#${recipe.recipe_id}">
            <figure class="results__fig">
               <img src="${recipe.image_url}" alt="${limitRecipeTitle(recipe.title)}">
            </figure>
            <div class="results__data">
               <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
               <p class="results__author">${recipe.publisher}</p>
            </div>
         </a>
      </li>
   `;
   elements.resultsList.insertAdjacentHTML('beforeend', markup);
};

// type: 'prev' or 'next'
const createBtn = (page, type) => `
   <button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
   <span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
      <svg class="search__icon">
         <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
      </svg>
   </button>
`;

const renderButton = (page, numOfResults, resPerPage) => {
   const pages = Math.ceil(numOfResults / resPerPage);
   let button;

   if (page === 1 && pages > 1) {
      // only next page btn
      button = createBtn(page, 'next');
   } else if (page < pages) {
      // both btns
      button = `
      ${createBtn(page, 'prev')}
      ${createBtn(page, 'next')}
      `;

   } else if (page === pages && pages > 1) {
      // only previous btn
      button = createBtn(page, 'prev');
   }

   elements.searchResPages.insertAdjacentHTML('afterbegin', button);
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
   // rendering results
   const start = (page - 1) * resPerPage;
   const end = page * resPerPage;
   recipes.slice(start, end).forEach(renderRecipe);

   // rendering buttons for pagination
   renderButton(page, recipes.length, resPerPage);
};