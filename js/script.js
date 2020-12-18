var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      searchedString: "",
      nullColor: 'grey',
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
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
          console.log(self.films[0].poster_path == null);
        })
      }
    }
  }
);
