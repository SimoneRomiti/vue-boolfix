var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      all: [],
      actors: [],
      filmActors: [],
      searchedString: "",
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
      visible: true,
      hide: true,
      vote: [],
      voteOther: [],
      language: [],
      popularSearch: [],
      restSearch: []
    },

    methods: {
      searchFilm: function(){
        var self = this;

        // IF SEARCHEDSTRING E' VUOTO ALLORA NON FA NESSUNA CHIAMATA AL SERVER METTE VISIBLE = FALSE E QUINI CANCELLA TUTTI I MOVIE-POSTER PRESENTI
        if(self.searchedString == ""){
          self.visible = false;
          self.hide = true;
        } else{
          self.visible = true;

          // GET PER RICERCA SU FILM
          let getOne = axios
          .get('https://api.themoviedb.org/3/search/movie',
          {
            params: {
              api_key: "00d4d16d41869351335359c44741a330",
              language: "it-IT",
              query: self.searchedString
            }
          })

          // GET PER RICERCA SU SERIE
          let getTwo = axios
          .get('https://api.themoviedb.org/3/search/tv',
          {
            params: {
              api_key: "00d4d16d41869351335359c44741a330",
              language: "it-IT",
              query: self.searchedString
            }
          })

          // CHIAMATA SIMULTANEA PER RICERCA FILM E SERIE TV
          Promise.all([getOne, getTwo])
          .then(function(response){

            self.films = [];
            self.popularSearch = [];
            self.restSearch = [];

            // CONCATENAZIONE IN UNICO ARRAY DEI RISULTATI PER FILM E SERIE
            self.all =
            response[0].data.results          .concat(response[1].data.results);

            // ORDINAMENTO FILM E SERIE IN BASE ALLA POPOLARITA'
            self.all.sort(function(a, b){
              return b.popularity - a.popularity;
            })

            // RESTITUISCE AL MASSIMO I PRIMI 20 RISULTATI
            var i = 0;
            while(i < 20 && self.all[i] != null){
              self.films.push(self.all[i]);
              i++;
            }

            // CREAZIONE TOP
            // var i = 0;
            // while(i < 3 && self.films[i] != null){
              self.popularSearch.push(self.films[0]);
              i++;
            // }

            // CREAZIONE OTHER
            var i = 1;
            while(i < self.films.length && self.films[i] != null){
              self.restSearch.push(self.films[i]);
              i++;
            }

            console.log("films", self.films);

            // FUNZIONE PER CREAZIONE ARRAY VOTI
            self.vote = self.getArrayVote(self.popularSearch);
            self.voteOther = self.getArrayVote(self.restSearch);

            self.actors = [];
            const creditsInitialPath = 'https://api.themoviedb.org/3/movie/';
            const creditsFinalPath = '/credits';
            const creditsSeriePath = 'https://api.themoviedb.org/3/tv/'

            // CHIAMATE CAST SOLO SU TOP
            // if(self.films.length < 1){
            //   var x = self.films.length;
            // } else{
            //   var x = 1;
            // }
            // CICLO PER EVENTUALE MODIFICA SE INSERIRE CAST ANCHE SU RESTSEARCH
            for(var i = 0; i < 1; i++){
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
                  self.filmActors = [];
                  for(var k = 0; k < 5; k++){
                    if(response.data.cast[k] != null && response.data.cast[k] != ""){
                      self.filmActors.push(response.data.cast[k].name);
                    }
                  }

                  self.actors.push(self.filmActors);
                  console.log(self.actors);

                  self.hide = false;
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
                  self.filmActors = [];
                  for(var k = 0; k < 5; k++){
                    if(response.data.cast[k] != null && response.data.cast[k] != ""){
                      self.filmActors.push(response.data.cast[k].name);
                    }
                  }

                  self.actors.push(self.filmActors);
                  console.log(self.actors);

                  self.hide = false;
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

      getArrayVote: function(array){
        var arrayVote = [];
        for(var i = 0; i < array.length; i++){
          arrayVote[i] = Math.ceil(array[i].vote_average);
        }
        return arrayVote;
      },
    }
  }
);
