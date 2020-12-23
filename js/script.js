var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      all: [],
      actors: [],
      filmActors: [],
      searchedString: "",
      resultFor: "",
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
      visible: true,
      show: false,
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
        self.resultFor = self.searchedString;
        // IF SEARCHEDSTRING E' VUOTO ALLORA NON FA NESSUNA CHIAMATA AL SERVER METTE VISIBLE = FALSE E QUINI CANCELLA TUTTI I MOVIE-POSTER PRESENTI
        if(self.searchedString == ""){
          self.visible = false;
          self.hide = true;
        } else{

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
            response[0].data.results.concat(response[1].data.results);

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

            // CREAZIONE TOP 3
            var i = 0;
            while(i < 3 && self.films[i] != null){
              self.popularSearch.push(self.films[i]);
              i++;
            }

            // CREAZIONE OTHER
            var i = 3;
            while(i < self.films.length && self.films[i] != null){
              self.restSearch.push(self.films[i]);
              i++;
            }

            console.log("films", self.films);
            self.visible = true;

            // FUNZIONE PER CREAZIONE ARRAY VOTI
            self.vote = self.getArrayVote(self.popularSearch);
            self.voteOther = self.getArrayVote(self.restSearch);


          // INSERIMENTO CAST COME NUOVO OGGETTO DI FILMS[i]
            // SVUOTAMENTO ARRAY DI APPOGGIO DOPO UNA RICERCA E SALVATAGGIO VARIABILI PER CHIAMATA GET
            const creditsInitialPath = 'https://api.themoviedb.org/3/movie/';
            const creditsFinalPath = '/credits';
            const creditsSeriePath = 'https://api.themoviedb.org/3/tv/'

            // CREAZIONE DI ARRAY CONTENENTE TUTTI I GET PER RICHIAMARE IL CAST DI OGNI FILM RICERCATO, SIA PER I FILM CHE PER LE SERIE
            let promises = [];
            for(var i = 0; i < self.films.length; i++){
              if(self.films[i].title != null){
                promises.push(axios.get(creditsInitialPath + self.films[i].id + creditsFinalPath,
                  {
                    params: {
                      api_key: "00d4d16d41869351335359c44741a330",
                      language: "it-IT",
                    }
                  }
                ));
              } else{
                promises.push(axios.get(creditsSeriePath + self.films[i].id + creditsFinalPath,
                  {
                    params: {
                      api_key: "00d4d16d41869351335359c44741a330",
                      language: "it-IT",
                    }
                  }
                ));
              }
            }
            // PROMISE ALL DELL'ARRAY CONTENENTE I GET E THEN CHE HA COME RESPONSES UN ARRAY CHE CONTIENE IN RESPONSES[i] LE INFORMAZIONI (COMPRESO IL CAST) DEL FILM CHE SI TROVA IN POSIZIONE I
            Promise.all(promises)
            .then((responses) => {

              // SCORRO TUTTI I FILM RICERCATI E SELEZIONO I PRIMI 5 ELEMENTI PRESENTI NELLA CHIAVE CAST DI RESPONSES[i] E PUSHO TUTTO IN ARRAYACTOR CHE SARA' INSERITO COME NUOVO OGGETTO DI FILMS[i]
              for(var i = 0; i < self.films.length; i++){
                var arrayActor = [];
                for(var k = 0; k < 5; k++){
                  if(responses[i].data.cast[k] != null && responses[i].data.cast[k] != ""){
                    arrayActor.push(responses[i].data.cast[k].name);

                    self.films[i] = {
                      ...self.films[i],
                      cast: arrayActor
                    };
                  }

                }
              }
              console.log("NUOVO", self.films);
              self.hide = false;
              self.$forceUpdate();
            })

            // GENERI
            let promisesTwo = [];
            const getFilmGenrePath = axios.get('https://api.themoviedb.org/3/genre/movie/list', {
              params: {
                api_key: '00d4d16d41869351335359c44741a330'
              }
            })
            const getSerieGenrePath = axios.get('https://api.themoviedb.org/3/genre/tv/list', {
              params: {
                api_key: '00d4d16d41869351335359c44741a330'
              }
            })

            Promise.all([getFilmGenrePath, getSerieGenrePath])
            .then((responses) => {
              var array = [];
              for(var i = 0; i < self.films.length; i++){
                if(self.films[i].title != null){
                  array = [];
                  for( var k = 0; k < responses[0].data.genres.length; k++){
                    for(var j = 0; j < self.films[i].genre_ids.length; j++){
                      if(self.films[i].genre_ids[j] == responses[0].data.genres[k].id){
                        array.push(responses[0].data.genres[k].name);

                      }
                    }

                  }
                  self.films[i] = {
                    ...self.films[i],
                    genres: array
                  }

                } else {
                  array = [];
                  for( var k = 0; k < responses[1].data.genres.length; k++){
                    for(var j = 0; j < self.films[i].genre_ids.length; j++){
                      if(self.films[i].genre_ids[j] == responses[1].data.genres[k].id){
                        array.push(responses[1].data.genres[k].name);

                      }
                    }
                  }
                  self.films[i] = {
                    ...self.films[i],
                    genres: array
                  }
                }
              }
              console.log("NUOVO 2", self.films);
              self.$forceUpdate();
            })
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
