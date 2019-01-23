// Load the library and specify options
const replace = require('replace-in-file')
const options = {
  files: './bin/www',
  from: /..\/src/g,
  to: '../lib',
}

replace(options).then(
  changes => {
    console.log('Modified files:', changes.join(', '))
  }
).catch(
  error => {
    console.error('Error occurred:', error)
  }
)
