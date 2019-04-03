const crypto = require('crypto');
const parallel = require('run-parallel');

function staticValue(value) {
  return function (req, file, cb) {
    cb(null, value)
  }
}

function getFileName(req, file, cb) {
  if (file.originalname) cb(null, file.originalname);
  else crypto.randomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

var defaultMimeType = staticValue('application/octet-stream');

function collect(storage, req, file, cb) {
  parallel([
    storage.getFileName.bind(storage, req, file),
    storage.getMimeType.bind(storage, req, file),
    storage.getParents.bind(storage, req, file),
    storage.getFields.bind(storage, req, file),
  ], (err, value) => {
    if (err) return cb(err);

    cb.call(storage, null, {
      fileName: value[0],
      mimeType: value[1],
      parents: value[2],
      fields: value[3]
    })
  })
}

function GoogleDriveStorage(opts) {
  switch (typeof opts.drive) {
    case 'object': this.drive = opts.drive; break
    default: throw new TypeError('drive must be object!');
  }
  switch (typeof opts.fileName) {
    case 'function': this.getFileName = opts.fileName; break;
    default: this.getFileName = getFileName;
  }
  switch (typeof opts.mimeType) {
    case 'function': this.getMimeType = opts.mimeType; break;
    default: this.getMimeType = defaultMimeType;
  }
  switch (typeof opts.parents) {
    case 'function': this.getParents = opts.parents; break;
    case 'string': this.getParents = staticValue([opts.parents]); break;
    default: throw new TypeError('parents must be require')
  }
  switch (typeof opts.fields) {
    case 'function': this.getFields = opts.fields; break;
    case 'string': this.getFields = staticValue(opts.fields); break;
    default: this.getFields = staticValue(null);
  }
}

GoogleDriveStorage.prototype._handleFile = function (req, file, cb) {
  collect(this, req, file, (err, opts) => {
    if (err) return cb(err);

    const params = {
      resource: {
        name: opts.fileName,
        parents: opts.parents
      },
      media: {
        mimeType: opts.mimeType,
        body: file.stream
      },
      fields: opts.fields
    }

    this.drive.create(params, (err, res) => {
      if(err) return cb(err);

      cb(null, {
        fileName: res.data.name,
        fileId: res.data.id
      })
    })
  })
}

GoogleDriveStorage.prototype._removeFile = function (req, file, cb) {
  this.drive.delete({
    fileId: file.id
  }, cb)
}

module.exports = (opts) => {
  return new GoogleDriveStorage(opts);
}