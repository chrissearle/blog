---
title: Testing Fusion 360 3D CAM on Snapmaker
date: 2019-04-21 11:43 +0200
tags: [fusion360, cam, snapmaker]
intro: Testing out Fusion 360 CAM with snapmaker 1
---

Way back - when [snapmaker](https://www.snapmaker.com) was first on kickstarter - I joined in.

Since it took a long time - I ended up with a 3d printer way before the snapmaker arrived. So I've never really had an interest in the 3d print head.

I have been interested in the laser head and the CNC mill head.

I did run some CNC tests early on - but - I wasn't really interested in flat SVG based milling (and similarly the 2d CAM paths from fusion) and I never really understood the 3d cam paths.

But - time has passed - and a lot of youtube has gone under the bridge (especially [Winston Moy](https://www.youtube.com/user/krayvis/videos)) - and so I felt like trying again.

For this - I needed a simple model - one that wasn't going to take way too long. Secondly - I wanted to use one of the sample MDF blocks that came with it - they are about 75x75mm and 2,83mm thick.

So - based on the blue round thing - I ended up with :download{title="this model" path="/images/posts/2019/04/test.stl"}

![Test Model](/images/posts/2019/04/test.png)

It may not be much but it does have mostly curved surfaces, a couple of holes etc.

So - the tool paths I generated were:

- 2D circular for the eyes
- 3D adaptive clear for the main surfaces roughing
- 3D parallel to clean the main surfaces
- 2D contour (with tabs) to cut the piece out from stock

The circular went well, nothing unexpected.

The 3D adaptive also went well.

The parallel chattered at the ends of each run as it reached the edges of where the adaptive had cleared.

The last contour run had to be aborted. It was trying to remove far too much at once and was jumping and jamming.

I think all these issues are based on choice around boundaries. For the adaptive I chose to stop with tool center on boundary (to shave a little time). The parallel the same - again to not waste time milling waste areas. But the contour of course wants the tool outside the boundary - so it was trying to mill 2mm into a sacrifical waste board underneath - that is almost 5mm of material - in one run.

If I were to do this model again then I would adaptive clear a few mm outside the boundary for two reasons - one to give the parallel a little more space and two to remove material that would be in the way for the contour. The parallel I would run as before since we don't need a good surface finish for the waste area. Finally I would then run the contour using a few passes of lesser depth.

Not going to run it again now - it was just a test - and it took 3 hours, but at least I did get a feel for how the 3d paths worked.

Finally - here's the piece taken off the machine just after aborting the last path.

![Test Result](/images/posts/2019/04/test.jpg)
