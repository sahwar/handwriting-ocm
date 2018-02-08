export function foreach(array, callback) {
  for(let ind=0; ind<array.length; ind++) {
    callback(array[ind],ind);
  }
} 
export function rand(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}