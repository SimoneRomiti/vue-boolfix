var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      searchedString: "",
      nullColor: 'grey',
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
      visible: true,
      vote: []
    },

    methods: {
      searchFilm: function(){
        var self = this;

        // IF SEARCHEDSTRING E' VUOTO ALLORA NON FA NESSUNA CHIAMATA AL SERVER METTE VISIBLE = FALSE E QUINI CANCELLA TUTTI I MOVIE-POSTER PRESENTI
        if(self.searchedString == ""){
          self.visible = false;
        } else{
          self.visible = true;

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
            console.log("response", self.films);
            for(var i = 0; i < self.films.length; i++){
              self.vote[i] = Math.ceil(self.films[i].vote_average);
            }
            console.log(self.vote);
          })
        }
      },

      searchFilmEnterKey: function(){
        if(event.which == 13){
          this.searchFilm();
        }
      }
    }
  }
);
