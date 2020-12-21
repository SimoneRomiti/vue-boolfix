var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      all: [],
      actors: [],
      filmActors: [],
      searchedString: "",
      nullColor: 'grey',
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
      visible: true,
      vote: [],
      language: []
    },

    methods: {
      searchFilm: function(){
        var self = this;

        let getOne = axios
        .get('https://api.themoviedb.org/3/search/movie',
        {
          params: {
            api_key: "00d4d16d41869351335359c44741a330",
            language: "it-IT",
            query: self.searchedString
          }
        })
        let getTwo = axios
        .get('https://api.themoviedb.org/3/search/tv',
        {
          params: {
            api_key: "00d4d16d41869351335359c44741a330",
            language: "it-IT",
            query: self.searchedString
          }
        })

        // IF SEARCHEDSTRING E' VUOTO ALLORA NON FA NESSUNA CHIAMATA AL SERVER METTE VISIBLE = FALSE E QUINI CANCELLA TUTTI I MOVIE-POSTER PRESENTI
        if(self.searchedString == ""){
          self.visible = false;
        } else{
          self.visible = true;

          Promise.all([getOne, getTwo])
          .then(function(response){

            self.films = [];

            self.all =
            response[0].data.results            .concat(response[1].data.results);

            self.all.sort(function(a, b){
              return b.popularity - a.popularity;
            })


            var i = 0;
            while(i < 20 && self.all[i] != null){
              self.films.push(self.all[i]);
              i++;
            }


            console.log("films", self.films);

            const creditsInitialPath = 'https://api.themoviedb.org/3/movie/';
            const creditsFinalPath = '/credits';
            const creditsSeriePath = 'https://api.themoviedb.org/3/tv/'

            for(var i = 0; i < self.films.length; i++){
              self.vote[i] = Math.ceil(self.films[i].vote_average);
            }

            for(var i = 0; i < self.films.length; i++){
              if(self.films[i].title != null){

                axios
                .get(creditsInitialPath + self.films[i].id + creditsFinalPath,
                {
                  params: {
                    api_key: "00d4d16d41869351335359c44741a330",
                    language: "it-IT",
                  }
                })


                .then((response) => {
                  for(var k = 0; k < 5; k++){
                    if(response.data.cast[k] != null){
                      console.log(response.data.cast[k].name);
                    }
                  }
                })
                
              } else {
                axios
                .get(creditsSeriePath + self.films[i].id + creditsFinalPath,
                {
                  params: {
                    api_key: "00d4d16d41869351335359c44741a330",
                    language: "it-IT",
                  }
                })


                .then((response) => {
                  for(var k = 0; k < 5; k++){
                    if(response.data.cast[k] != null){
                      console.log(response.data.cast[k].name);
                    }
                  }
                })
              }

            }

          })
        }
      },

      searchFilmEnterKey: function(){
        if(event.which == 13){
          this.searchFilm();
        }
      },

    }
  }
);
