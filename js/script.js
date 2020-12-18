var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      searchedString: "",
    },

    methods: {
      searchFilm: function(){
        var self = this;
        axios
        .get('https://api.themoviedb.org/3/search/movie',
        {
          params: {
            api_key: "00d4d16d41869351335359c44741a330",
            language: "it-IT",
            query: self.searchedString
          }
        })
        .then(function(response){
          self.films = response.data.results;
          console.log(self.films);
        })
      }
    }
  }
);
