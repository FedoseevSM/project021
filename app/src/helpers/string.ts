const w1 = /^(?:[A-Za-zА-Яа-я\d\s]+)$/;
const w2 = /^(?:[A-Za-zА-Яа-я\d]+)$/

export function isOnlyDigitLetters(value: string, withWhiteSpaces = true) {
  return (withWhiteSpaces ? w1 : w2).test(value)
}


export function urlify(text: string) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

export function retrieveProp(htmlString: string, from: string, prop: string) {
  const tmp = document.createElement('div');
  tmp.innerHTML = htmlString;
  const elem: any = tmp.getElementsByTagName(from)[0];
  return elem ? elem[prop] : '';
}