---
title: Transcoding with MKV and ffmpeg
date: 2018-11-27 14:34 +0100
tags: [mkv, matrovska, codec, vc-1, h264, ffmpeg, plex]
intro: Learning ffmpeg unnecessarily :)
---

_Update: I should have checked the plex support site to start with - this is already documented on [this support article](https://support.plex.tv/articles/201358273-converting-iso-video-ts-and-other-disk-image-formats/).
However - I did get to learn a fair bit more about how ffmpeg command line works :)_

---

To make it easier to use the films I buy easier for the kids - I use Plex.

But given that we're a two-language house - I often want to keep multiple audio and subtitle tracks around - so I don't want to burn them into the video track.

To do this - I've been keeping the files in the Matrovska/MKV format.

Some clients need the server to transcode on the fly (for example if you want subtitles and the client needs them just in the video stream).

Now - some of these video files are using a VC-1 codec. Transcoding VC-1 on the fly is not a low CPU task for the server so I'd like to convert them to an easier format (in this case h264).

But I want to keep the MKV format and keep the audio and subtitles untouched.

So - there are various programs out there that can do parts of this - but how to batch it with ffmpeg? I have a few to go through- it would be nice to find a command line tool that can be run. FFmpeg looks like the best candidate here (in fact half or more of the GUIs that do this sort of stuff use it behind the scenes).

So - it means I guess I have to try to figure out the command line for FFmpeg.

The example file I have has the following track list:

1. video (VC-1)
2. audio (English)
3. audio (Norwegian)
4. subtitles (English PGS)
5. subtitles (Norwegian PGS)

## Getting the track info

```shell
ffmpeg -i file.mkv
```

This gives a fair bit of info - including the tracks (streams):

```
Stream #0:0(eng): Video: vc1 (Advanced) (WVC1 / 0x31435657), yuv420p(bt709, progressive),
  1920x1080 [SAR 1:1 DAR 16:9], 23.98 fps, 23.98 tbr, 1k tbn, 47.95 tbc
Stream #0:1(eng): Audio: ac3, 48000 Hz, 5.1(side), fltp, 640 kb/s (default)
Metadata:
  title           : English 3/2+1
Stream #0:2(nor): Audio: ac3, 48000 Hz, 5.1(side), fltp, 640 kb/s
Metadata:
  title           : Norwegian 3/2+1
Stream #0:3(eng): Subtitle: hdmv_pgs_subtitle (default)
Metadata:
  title           : English
Stream #0:4(nor): Subtitle: hdmv_pgs_subtitle
Metadata:
  title           : Norwegian
```

## Attempt 1 - tell it to convert the video stream

So - the first thing I tried was _can I tell it to convert any video stream and hope that the rest just works?_

```shell
ffmpeg -i file.mkv -c:v libx264 out.mkv
```

The answer here is - no - it doesn't do what you assume and to go back and read the manual :)

You can see this from the stream mapping it builds up:

```
Stream mapping:
  Stream #0:0 -> #0:0 (vc1 (native) -> h264 (libx264))
  Stream #0:1 -> #0:1 (ac3 (native) -> vorbis (libvorbis))
```

OK - so stream 0 is getting converted - but the audio is getting converted too. And there is no subtitle in the resulting file.

## Attempt 2 - tell it to copy audio and subtitle unchanged

The next step was to tell it to convert the video file, and to copy the audio and subtitles.

```shell
ffmpeg -i file.mkv -c:v libx264 -c:a copy -c:s copy -n out.mkv
```

This does make some progress - it now gives the following stream mapping:

```
Stream mapping:
  Stream #0:0 -> #0:0 (vc1 (native) -> h264 (libx264))
  Stream #0:1 -> #0:1 (copy)
  Stream #0:3 -> #0:2 (copy)
```

So - I got an h264 video stream and the English audio and the English subtitles.

So the next bit is to get more than one of each output file.

## Attempt 3 - tell it to process more than one of each type of stream

Reading the manual again led me to the map command. This time I will tell it exactly what streams to include.

```shell
ffmpeg -i file.mkv \
  -map 0:0 -map 0:1 -map 0:2 -map 0:3 -map 0:4 \
  -c:v libx264 -c:a:0 copy -c:a:1 copy -c:s:0 copy -c:s:1 copy \
  out.mkv
```

Here we ask it to include all of 0:0 through 0:4.

Then we say

- convert the video file
- copy the first audio file
- copy the second audio file
- copy the first subtitle
- copy the second subtitle

The stream map looks like this now:

```
Stream mapping:
  Stream #0:0 -> #0:0 (vc1 (native) -> h264 (libx264))
  Stream #0:1 -> #0:1 (copy)
  Stream #0:2 -> #0:2 (copy)
  Stream #0:3 -> #0:3 (copy)
  Stream #0:4 -> #0:4 (copy)
```

## Attempt 4 - simplification

Can we make the command simpler? We want to do the same thing for all audio and subtitle streams.

```shell
ffmpeg -i file.mkv \
  -map 0:0 -map 0:1 -map 0:2 -map 0:3 -map 0:4 \
  -c:v libx264 -c:a -c:s copy \
  out.mkv
```

Testing this gave the same stream map and the same output file - so it looks like we can say -c:s copy and get all subtitles in the map just copied.

But - in an example - it appears that there is a further simplification available:

```shell
ffmpeg -i file.mkv \
  -map 0 \
  -c copy -c:v libx264 \
  out.mkv
```

with the comment

- select all the input streams (first input = 0) to be processed (using "-map 0")
- mark all the streams to be just copied to the output (using "-c copy")
- mark just the video streams to be re-encoded (using "-c:v libx265")

And yes - this does the right thing:

```
Stream mapping:
  Stream #0:0 -> #0:0 (vc1 (native) -> h264 (libx264))
  Stream #0:1 -> #0:1 (copy)
  Stream #0:2 -> #0:2 (copy)
  Stream #0:3 -> #0:3 (copy)
  Stream #0:4 -> #0:4 (copy)
```

We can also compare the information to the original:

```
Stream #0:0(eng): Video: h264 (High), yuv420p(progressive),
  1920x1080 [SAR 1:1 DAR 16:9], 23.98 fps, 23.98 tbr, 1k tbn, 47.95 tbc
Metadata:
  ENCODER         : Lavc58.22.101 libx264
  DURATION        : 00:21:26.077000000
Stream #0:1(eng): Audio: ac3, 48000 Hz, 5.1(side), fltp, 640 kb/s (default)
Metadata:
  title           : English 3/2+1
  DURATION        : 00:21:27.040000000
Stream #0:2(nor): Audio: ac3, 48000 Hz, 5.1(side), fltp, 640 kb/s
Metadata:
  title           : Norwegian 3/2+1
  DURATION        : 00:21:27.040000000
Stream #0:3(eng): Subtitle: hdmv_pgs_subtitle (default)
Metadata:
  title           : English
  DURATION        : 00:21:23.866000000
Stream #0:4(nor): Subtitle: hdmv_pgs_subtitle
Metadata:
  title           : Norwegian
  DURATION        : 00:21:23.866000000
```

Here we can see that it has changed the video codec and also added some metadata (ENCODER and DURATION).

So we now have the streams in place - what about quality?

## Attempt 5 - bitrate

If we run:

```shell
ffmpeg -i file.mkv
```

we can see the bitrate:

```
Duration: 00:21:27.01, start: 0.000000, bitrate: 10896 kb/s
```

But if we run the command on the converted file:

```shell
ffmpeg -i out.mkv
```

it now looks like:

```
Duration: 00:21:27.04, start: 0.000000, bitrate: 3070 kb/s
```

So - reading the [FFmpeg page on h264 encoding](https://trac.ffmpeg.org/wiki/Encode/H.264) - the line _Use this mode if you want to keep the best quality and don't care about the file size._ seems very appealing.

Let's try a crf of 17 (near the edge of the range that the page calls sane and _visually lossless or nearly so_) and we'll go with a profile of _slower_

This gives us the new command:

```shell
ffmpeg -i file.mkv \
  -map 0 \
  -c copy -c:v libx264 -preset slower -crf 17 \
  out.mkv
```

This runs a _little_ slower :)

The original file is 30834 frames and was running the conversion at about 40fps on my laptop - taking about 12-13 minutes. This conversion is running at about 10-15fps and that gives an estimate of around 30-45 minutes. The longer the source file the more of a difference this will make.

But - this gives the following results:

<table class="table table-dark table-striped table-bordered ">
<thead>
<tr>
<th>File</th>
<th>Size</th>
<th>Bitrate</th>
</tr>
</thead>
<tbody>
<tr><td>file.mkv         </td><td>1752999086</td><td>10896 kb/s</td></tr>
<tr><td>no_preset.mkv    </td><td>494040188 </td><td>3070 kb/s </td></tr>
<tr><td>slower_preset.mkv</td><td>827987122 </td><td>5146 kb/s </td></tr>
</tbody>
</table>

Subjectively - the result is pretty good - as they said on the encoding page for crf 17 - _visually lossless or nearly so_ - for my eyesight on my displays - this seems to be the case - YMMV :)
