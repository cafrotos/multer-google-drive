# Multer google drive

Engine lưu trữ cho Multer sử dụng Google Drive API.

## Cài đặt

```sh
npm install --save multer-google-drive
```

## Cách sử dụng

```javascript
var {google} = require('googleapis')
var express = require('express')
var multer = require('multer')
var GoogleDriveStorage = require('multer-google-drive')

var app = express()
var drive = google.drive({version: 'v3', auth: /*.....*/})

var upload = multer({
  storage: GoogleDriveStorage({
    drive: drive,
    parents: 'id-parents',
    fileName: function (req, file, cb) {
      let filename = `test-${file.originalname}`;
      cb(null, filename);
    }
  })
})

app.post('/upload', upload.array('file', 3), function(req, res, next) {
  res.send('Upload thành công ' + req.files.length + ' files!')
})
```

### Tham số

File upload sẽ được lưu theo các tham số của `multer-google-drive`:

Key | Mô tả | Ghi chú
--- | --- | ---
`drive` | Object drive tạo từ googleapis | `googleapis`
`fileName` | Tên của file khi lưu trên google drive | 
`mimeType` | Kiểu  | `googleapis`
`parents` | Thư mục gốc trên google drive | `googleapis`
`fields` | Dữ liệu tham chiếu từ google drive | `googleapis`