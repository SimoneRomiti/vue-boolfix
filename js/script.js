var app= new Vue(
  {
    el: "#container",
    data: {
      mouse: false,
    },
    methods: {
      turnTrue: function(){
        this.mouse = true;
      },
      turnFalse: function(){
        this.mouse = false;
      }
    }
  }
)
