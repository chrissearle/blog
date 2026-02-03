---
title: PDFKit on heroku on rails 3 - downloadable PDFs and avoiding Backlog too deep
date: 2011-04-10 23:14:25 +0200
tags: [ruby, rails, heroku, pdfkit]
---

### Backlog too deep errors running PDFKit on heroku

Running PDFKit on heroku kept giving Backlog too deep errors in the logs.

This error occurs when there are not enough dynos (think threads) available. The default (free) is one dyno.

The reason for this is that the request calls out to wkhtmltopdf which in turn requests the embedded resources (script files, images, css files etc). These go into the queue waiting for the original call to terminate which it doesn't.

From [http://jguimont.com/post/2627758108/pdfkit-and-its-middleware-on-heroku](http://jguimont.com/post/2627758108/pdfkit-and-its-middleware-on-heroku) I changed the pdfkit.rb initializer file (can be in any initializer but since I already have one for pdfkit to set paper layout and size) to include:

```ruby
    ActionController::Base.asset_host = Proc.new { |source, request|
      if request.env["REQUEST_PATH"].include? ".pdf"
        "file://#{Rails.root.join('public')}"
      else
        "#{request.protocol}#{request.host_with_port}"
      end
    }
```

This then retrieves these resources locally as files rather than as web requests when the request path includes ".pdf".

### Download rather than inline with PDFKit

A second issue was that I wanted to download the PDF's rather than have them appear inline.

This is controlled by the HTTP response header Content-Disposition.

The PDFKit middleware simply generates the PDF - it doesn't play with the headers beyond that.

You can check in your controller (or views) if the current generation is PDF by checking the request headers.

e.g. for setting the Content-Disposition for download (attachment):

```ruby
    if (request.headers['Rack-Middleware-PDFKit'] == 'true')
      headers["Content-Disposition"] = "attachment; filename=filename.pdf"
    end
```
