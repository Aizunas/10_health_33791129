const bcrypt = require('bcrypt');

bcrypt.hash('smiths', 10, (err, hash) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Password hash for "smiths":');
    console.log(hash);
  }
  process.exit();
});