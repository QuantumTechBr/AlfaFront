export function slugify(input) {
  if (!input) return '';

  // make lower case and trim
  var slug = input.toLowerCase().trim();

  // remove accents from charaters
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // replace invalid chars with spaces
  slug = slug.replace(/[^a-z0-9\s-]/g, ' ').trim();

  // replace multiple spaces or hyphens with a single hyphen
  slug = slug.replace(/[\s-]+/g, '-');

  return slug;
}

export function randomColor() {
  const corAleatoria = '#' + Math.floor(Math.random() * 16777215).toString(16);
  return corAleatoria;
}

export function saveCSVFile(filename, data) {
  // ADD BOM (Codificação)
  data = "\uFEFF" + data;
  var blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export const relativePercentageDifference = (a, b) => 
  Math.abs( ( ( a - b ) / ( ( a + b ) / 2 ) ) * 100 );
export const percentageChange = (a, b) => ( b / a * 100 ) - 100;

export function later(delay, value) {
  return new Promise(resolve => setTimeout(resolve, delay, value));
}