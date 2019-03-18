import axios from 'axios';
import {
   key,
   proxy
} from '../config';

export default class Search {
   constructor(query) {
      this.query = query;
   };

   async getResults() {
      try {
         const result = await axios(`${proxy}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
         this.recipes = result.data.recipes;
      } catch (error) {
         alert(error);
      }
   };

};