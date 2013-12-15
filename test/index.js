var markdownpdf = require("../")
  , assert = require("assert")
  , fs = require("fs")
  , tmp = require("tmp")
  , through = require("through")

tmp.setGracefulCleanup()

// TODO: Remove when 0.12 is released
var encoding = process.version.indexOf("0.8") == -1 ? {encoding: "utf8"} : "utf8"

describe("markdownpdf", function() {

  it("should generate a nonempty PDF from ipsum.md", function (done) {
    this.timeout(5000)

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er)
      fs.close(tmpPdfFd)

      markdownpdf().from(__dirname + "/fixtures/ipsum.md").to(tmpPdfPath, function (er) {
        assert.ifError(er)

        // Read the file
        fs.readFile(tmpPdfPath, encoding, function (er, data) {
          assert.ifError(er)
          // Test not empty
          assert.ok(data.length > 0)
          done()
        })
      })
    })
  })

  it("should call preProcessMd hook", function (done) {
    this.timeout(5000)

    var writeCount = 0
      , preProcessMd = function () { return through(function (data) { writeCount++; this.queue(data) }) }

    markdownpdf({preProcessMd: preProcessMd}).from(__dirname + "/fixtures/ipsum.md").to.string(function (er, pdfStr) {
      assert.ifError(er)

      // Test not empty
      assert.ok(pdfStr.length > 0)
      assert(writeCount > 0, "Write count expected to be > 0")
      done()
    })
  })

  it("should call preProcessHtml hook", function (done) {
    this.timeout(5000)

    var writeCount = 0
      , preProcessHtml = function () { return through(function (data) { writeCount++; this.queue(data) }) }

    markdownpdf({preProcessHtml: preProcessHtml}).from(__dirname + "/fixtures/ipsum.md").to.string(function (er, pdfStr) {
      assert.ifError(er)

      // Test not empty
      assert.ok(pdfStr.length > 0)
      assert(writeCount > 0, "Write count expected to be > 0")
      done()
    })
  })

  it("should concatenate source files", function (done) {
    this.timeout(5000)

    var files = [
        __dirname + "/fixtures/first.md"
      , __dirname + "/fixtures/second.md"
    ]

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath, tmpPdfFd) {
      assert.ifError(er)
      fs.close(tmpPdfFd)

      markdownpdf().concat.from(files).to(tmpPdfPath, function (er) {
        assert.ifError(er)

        // Read the file
        fs.readFile(tmpPdfPath, encoding, function (er, data) {
          assert.ifError(er)
          // Test not empty
          assert.ok(data.length > 0)
          done()
        })
      })
    })
  })

  it("should write to multiple paths when converting multiple files", function (done) {
    this.timeout(5000)

    var files = [
        __dirname + "/fixtures/first.md"
      , __dirname + "/fixtures/second.md"
    ]

    tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath0, tmpPdfFd0) {
      assert.ifError(er)
      fs.close(tmpPdfFd0)

      tmp.file({postfix: ".pdf"}, function (er, tmpPdfPath1, tmpPdfFd1) {
        assert.ifError(er)
        fs.close(tmpPdfFd1)

        markdownpdf().from.paths(files).to.paths([tmpPdfPath0, tmpPdfPath1], function (er) {
          assert.ifError(er)

          // Read the file
          var content0 = fs.readFileSync(tmpPdfPath0, encoding)
          var content1 = fs.readFileSync(tmpPdfPath1, encoding)

          assert.ok(content0.length > 0)
          assert.ok(content1.length > 0)
          assert.ok(content0.length != content1.length)

          done()
        })
      })
    })
  })

})
