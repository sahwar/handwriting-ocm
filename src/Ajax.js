let AJAX = {
  request: null,
  prepare: function(method, url){
      this.request = new XMLHttpRequest();
      this.request.open(method, url, true);
  },
  then: function(callback) {
      let result = {};
      this.request.onerror = this.request.onload = (request) => {

        let response = request.target; 
        if(response.status == 200) {
            callback(JSON.parse(request.target.response));
        } else {
            callback(new Error("Error : " + response.status));
        }
      };
  },
  get: function(url,callback) {
      this.prepare('GET',url);
      this.then(callback);
      this.request.send();
  },
  post: function(url, params, callback) {
      this.prepare('POST',url);
      this.then(callback);
      this.request.setRequestHeader("content-type", "application/json");
      this.request.send(JSON.stringify(params));
  }
}
export default AJAX;