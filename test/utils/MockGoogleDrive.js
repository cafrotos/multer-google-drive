const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class Drive {
  create(params, cb) {
    crypto.randomBytes(16, function (err, raw) {
      let id = err ? undefined : raw.toString('hex');
      let name = params.resource.name;
      let dest = fs.createWriteStream(path.join(__dirname, '../upload-folder', name));
      params.media.body
        .on('end', () => {
          cb(null, { data: {id, name} })
        })
        .pipe(dest);
    })
  }
}

let instance = new Drive();
Object.freeze(instance);

module.exports = instance;