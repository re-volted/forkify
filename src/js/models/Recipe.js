import axios from 'axios';
import {
   key,
   proxy
} from '../config';

export default class Recipe {
   constructor(id) {
      this.id = id;
   }

   async getRecipe() {
      try {
         const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
         this.title = res.data.recipe.title;
         this.img = res.data.recipe.image_url;
         this.author = res.data.recipe.publisher;
         this.url = res.data.recipe.source_url;
         this.ingredients = res.data.recipe.ingredients;
      } catch (error) {
         console.log(error);
         alert('Ooops... Something went wrong...');
      }
   }

   calcTime() {
      // Assuming that 15 min is needed for every 3 ingredients
      const numIng = this.ingredients.length;
      const periods = Math.ceil(numIng / 3);
      this.time = periods * 15;
   }

   calcServings() {
      this.servings = 4;
   }

   parseIngredients() {
      const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
      const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
      const units = [...unitsShort, 'kg', 'g'];

      const newIngredients = this.ingredients.map(el => {
         // 1. Uniform units
         let ingredient = el.toLowerCase();
         unitsLong.forEach((unit, i) => {
            ingredient = ingredient.replace(unit, unitsShort[i]);
         });

         // 2. Remove parentheses using a REGULAR EXPRESSION
         ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

         // 3. Parse ingredients into count, unit and ingredient
         const arrIng = ingredient.split(' ');
         const unitIndex = arrIng.findIndex(elem => units.includes(elem));

         let objIng;

         if (unitIndex > -1) {
            // There is a unit
            const arrCount = arrIng.slice(0, unitIndex);
            let count;
            if (arrCount.length === 1) {
               count = eval(arrIng[0].replace('-', '+'));
            } else {
               count = eval(arrIng.slice(0, unitIndex).join('+'));
            }

            objIng = {
               count,
               unit: arrIng[unitIndex],
               ingredient: arrIng.slice(unitIndex + 1).join(' ')
            }
         } else if (parseInt(arrIng[0], 10)) {
            // Ingredient has no unit, but it has a quantity
            objIng = {
               count: parseInt(arrIng[0], 10),
               unit: '',
               ingredient: arrIng.slice(1).join(' ')
            }
         } else if (unitIndex === -1) {
            // There is no unit and no quantity
            objIng = {
               count: 1,
               unit: '',
               ingredient // in ES6 no need to write x: x
            }
         }

         return objIng;
      });
      this.ingredients = newIngredients;
   }

   updateServings(type) {
      // new servings
      const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

      // new ingredients
      this.ingredients.forEach(ing => {
         ing.count *= (newServings / this.servings);
      });

      this.servings = newServings;
   }
}