---
title: Ruby on Rails and IE 8 - respond_to and HTTP accept headers
date: 2010-03-18 23:35:15 +0100
tags: [rails, ruby on rails, respond-to, http-accept, ie8]
---

Ruby on Rails offers the ability to respond to a given request with different types depending on the URL.

For example - http://server/controller.html gives HTML where http://server/controller.pdf sends a PDF file.

However - what happens if the URL is just http://server/controller ? Well then rails will use the HTTP_ACCEPT header sent by the browser (at least in 2.3.x - haven't tested other versions).

So - when adding support for /controller.xls it seemed a little strange that all users apart from IE got the HTML page where IE8 (I suspect more but have only tested with v8) got the excel file.

## The problem

The issue is in the accept header sent by IE:

- image/gif
- image/jpeg
- image/pjpeg
- application/x-ms-application
- application/vnd.ms-xpsdocument
- application/xaml+xml
- application/x-ms-xbap
- application/x-shockwave-flash
- application/vnd.ms-excel
- application/vnd.ms-powerpoint
- application/msword
- \*/\*

If we change

```ruby
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @items }
    end
```

to

```ruby
    respond_to do |format|
      format.html # index.html.erb
      format.xml  { render :xml => @items }
      format.xls do
        excel = Item.get_excel

        send_file(excel.get_spreadsheet_tempfile_name,
                  :type => 'application/vnd.ms-excel',
                  :disposition => 'attachment',
                  :filename => excel.get_destination_filename)
      end
    end
```

then everyone will get the excel file if they request /controller.xls but IE gets the excel file also for /controller - instead of the first entry in the list - the HTML response. From the accept headers list you can see that the excel mimetype is specifically listed.

## The Workaround

Most googling suggested setting the order of the respond_to elements - but here the HTML response is first.

So - as a workaround - force prefix the accept header before the call to respond_to

For this example I just grabbed the HTML part of the Safari 4 accept header and prefixed it.

```ruby
  def set_accept_header
    accept = request.env["HTTP_ACCEPT"]

    request.env["HTTP_ACCEPT"] = "application/xml,application/xhtml+xml,text/html;q=0.9,#{accept}"
  end
```

This can be called as a standard method call in the directly affected method or as a before_filter - depending on your needs.

Note that this is a very simplified method - it doesn't check to see what's present there or if it is IE that is the client - but for the application it was needed for its good enough ;)
