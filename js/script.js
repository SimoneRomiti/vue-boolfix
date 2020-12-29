var app = new Vue(
  {
    el: "#container",
    data: {
      films: [],
      all: [],
      arrayGenres: [],
      totalGenres: [],
      searchedString: "",
      resultFor: "",
      notAvailableImage: "img/image-not-available.png",
      initialPath: "https://image.tmdb.org/t/p/w220_and_h330_face",
      visible: true,
      hide: true,
      homepage: true,
      vote: [],
      voteOther: [],
      language: [],
      popularSearch: [],
      restSearch: [],
      selected: "ALL"
    },

    created: function() {
      this.turnToHomepage();
    },

    methods: {
      searchFilm: function(){
        var self = this;
        self.selected = "ALL";
        self.visible = false;
        self.resultFor = self.searchedString;
        console.log("OK");
        // IF SEARCHEDSTRING E' VUOTO ALLORA NON FA NESSUNA CHIAMATA AL SERVER METTE VISIBLE = FALSE E QUINI CANCELLA TUTTI I MOVIE-POSTER PRESENTI
        if(self.searchedString == ""){
          self.visible = false;
          self.hide = true;
          self.turnToHomepage();
        } else{
          self.totalGenres = [];
          self.homepage = false;

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

            self.visible = true;

            // FUNZIONE PER CREAZIONE ARRAY VOTI
            self.vote = self.getArrayVote(self.popularSearch);
            self.voteOther = self.getArrayVote(self.restSearch);


            // FUNZIONE PER INSERIMENTO CAST COME NUOVO OGGETTO DI FILMS[i]
            self.insertCast();

            // FUNZIONE PER INSERIMENTO GENERI SENZA DUPLICATI DEI FILM RICERCATI IN NUOVO ARRAY
            self.getGenres();
            self.hide = false;
            console.log("films", self.films);
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

      insertCast: function(){
        var self = this;
        // SALVATAGGIO VARIABILI PER CHIAMATA GET
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
        // PROMISE ALL DELL'ARRAY CONTENENTE I GET E THEN CHE HA COME RESPONSES UN ARRAY CHE CONTIENE IN RESPONSES[i] I CREDITS (COMPRESO IL CAST) DEL FILM CHE SI TROVA IN POSIZIONE I
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
          self.$forceUpdate();
        })
      },

      getGenres: function(){
        // GENERI
        var self = this;
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
        // PROMISE ALL DI ARRAY CON 2 ELEMENTI IL PRIMO CONTIENE IL GET PER I GENERI DEI FILM E IL SECONDO IL GET PER I GENERI DELLE SERIE
        Promise.all([getFilmGenrePath, getSerieGenrePath])
        .then((responses) => {

          // CICLO PER TUTTI I FILM RICERCATI
          for(var i = 0; i < self.films.length; i++){
            // IF FILM
            if(self.films[i].title != null){
              // SVUOTO L'ARRAY CHE ANDRA' A CONTENERE I GENERI DI FILMS[i]
              self.arrayGenres = [];
              self.insertGenres(responses[0], i);

              // ELSE SERIE
            } else {
              self.arrayGenres = [];
              self.insertGenres(responses[1], i);
            }
          }
          self.$forceUpdate();
        })
      },

      insertGenres: function(response, i){
        var self = this;
        // CICLO PER TUTTI I GENERI DEI FILM PRESENTI NELL'API
        for(var k = 0; k < response.data.genres.length; k++){
          // CICLO PER TUTTI GLI ID GENERI CHE HA FILMS[i]
          for(var j = 0; j < self.films[i].genre_ids.length; j++){
            // CONFRONTO TRA ID PRESENTI IN FILMS[i] E ID DI TUTTI I GENERI, SE UGUALI PUSH IN ARRAY IL GENERE CORRISPONDENTE ALL'ID
            if(self.films[i].genre_ids[j] == response.data.genres[k].id){
              self.arrayGenres.push(response.data.genres[k].name);
            }
          }
        }
        // AGGIUNGO IN FILMS[i] L'OGGETTO GENRES CONTENENTE L'ARRAY IN CUI HO PUSHATO DOPO IL CONFRONTO
        self.films[i] = {
          ...self.films[i],
          genres: self.arrayGenres
        }

        // CREAZIONE DI ARRAY CONTENENTE TUTTI I GENERI PRESENTI NEI FILM RICERCATI SENZA GENERI DUPLICATI
        for(var x = 0; x < self.arrayGenres.length; x++){
          if(!self.totalGenres.includes(self.arrayGenres[x] )){
            self.totalGenres.push(self.arrayGenres[x]);
          }
        }
      },

      turnToHomepage: function(){
        var self = this;
        self.films = [];
        self.homepage = true;
        axios
        .get('https://api.themoviedb.org/3/trending/all/week', {
          params: {
            api_key: '00d4d16d41869351335359c44741a330'
          }
        })
        .then((response) => {
          console.log(response.data.results);
          self.films = response.data.results;

          self.vote = self.getArrayVote(self.films);
          self.insertCast();
          self.getGenres();
        })
      }
    }
  }
);
