const { assert } = require('chai');
const multer = require('multer');
const stream = require('stream');
const FormData = require('form-data');
const onFinished = require('on-finished');
const fs = require('fs');
const path = require('path')
const mockDrive = require('./utils/MockGoogleDrive');
const GoogleDriveStorage = require('../');

function submitForm (multer, form, cb) {
  form.getLength(function (err, length) {
    if (err) return cb(err)

    let req = new stream.PassThrough()

    req.complete = false
    form.once('end', function () {
      req.complete = true
    })

    form.pipe(req)
    req.headers = {
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': length
    }

    multer(req, null, function (err) {
      onFinished(req, function () { cb(err, req) })
    })
  })
}

describe("Multer google drive", () => {
  it("GoogleDriveStorage is function", () => {
    assert.equal(typeof GoogleDriveStorage, 'function');
  })
  it("Upload file", (done) => {
    let storage = GoogleDriveStorage({drive: mockDrive, parents: '123'})
    let form = new FormData();
    let upload = multer({storage});
    let uploadSingle = upload.single('file');
    var file = fs.createReadStream(path.join(__dirname, 'files', 'photo.jpg'))

    form.append('name', 'Multer')
    form.append('file', file)

    submitForm(uploadSingle, form, function (err, req) {
      assert.ifError(err)
      assert.equal(req.body.name, 'Multer')
      assert.equal(req.file.fieldname, 'file')
      assert.equal(req.file.originalname, 'photo.jpg')
      
      let isUpload = fs.existsSync(path.join(__dirname, 'files', 'upload_photo.jpg'))
      assert.equal(isUpload, true);

      fs.unlinkSync(path.join(__dirname, 'files', 'upload_photo.jpg'))
      done()
    })
  })
})