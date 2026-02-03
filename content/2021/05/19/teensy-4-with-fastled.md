---
title: Teensy 4 with FastLED
date: 2021-05-19 08:06 +0200
tags: [arduino, platformio, fastled, ws2812b, octows2811]
intro: Getting FastLED programs to run on teensy 4.0 and 4.1 with either WS2812Serial or OctoWS2811
---

## The issue

I have never managed to get a Teensy 4.0 or 4.1 microcontroller to run a vanilla FastLED program properly.

Either all LEDS are lit white or - a sequence starts - then hangs very soon after startup.

However - I have managed to get it to run using two different external libraries.

---

## WS2812Serial

The WS2812Serial library comes with Teensyduino. It can be used along with FastLED to control the LEDs.

For PlatformIO - the [following config](https://github.com/chrissearle/teensy4_fastled/blob/main/serial/platformio.ini) is needed:

```ini
[env:teensy40]
platform = teensy
board = teensy40
framework = arduino
lib_deps =
    FastLED
```

Then the actual [arduino program](https://github.com/chrissearle/teensy4_fastled/blob/main/serial/main.cpp):

**Includes**

```cpp
#include <WS2812Serial.h>
#define USE_WS2812SERIAL

#define FASTLED_INTERNAL
#include <FastLED.h>
```

**Setup**

```cpp
#define NUM_LEDS 240

#define LED_PIN 1

CRGB leds[NUM_LEDS];

void setup() {
    FastLED.addLeds<WS2812SERIAL, LED_PIN, GRB>(leds, NUM_LEDS);
}
```

### Limitations

You must use a serial pin - from [this example](https://github.com/PaulStoffregen/WS2812Serial/blob/master/examples/FastLED_Cylon/FastLED_Cylon.ino) we can see:

```cpp
// Usable pins:
//   Teensy LC:   1, 4, 5, 24
//   Teensy 3.2:  1, 5, 8, 10, 31   (overclock to 120 MHz for pin 8)
//   Teensy 3.5:  1, 5, 8, 10, 26, 32, 33, 48
//   Teensy 3.6:  1, 5, 8, 10, 26, 32, 33
//   Teensy 4.0:  1, 8, 14, 17, 20, 24, 29, 39
//   Teensy 4.1:  1, 8, 14, 17, 20, 24, 29, 35, 47, 53
```

I do not think you can run parallel strings with this setup.

---

## OctoWS2811

This [blog post on blinkylights.blog](https://blinkylights.blog/2021/02/03/using-teensy-4-1-with-fastled/) shows an approach using OctoWS2811 together with FastLED.

The code here is heavily based on that - just replaces RGB with GRB (as the blog post notes - "There is a minor bug in this code where I ignore the RGB_ORDER parameter in setting r, g, and b. You can fix this if your strip uses GRB order or other.")

OctoWS2811 hasn't had a release in a while - the last one (1.4) says support for Teensy 3.5/3.6 - so this uses the github version.

For PlatformIO - the [following config](https://github.com/chrissearle/teensy4_fastled/blob/main/octo/platformio.ini) is needed:

```ini
[env:teensy40]
platform = teensy
board = teensy40
framework = arduino
lib_deps =
    SPI
    FastLED
    https://github.com/PaulStoffregen/OctoWS2811
```

Then the actual [arduino program](https://github.com/chrissearle/teensy4_fastled/blob/main/octo/main.cpp):

**Custom Controller**

This [custom controller](https://github.com/chrissearle/teensy4_fastled/blob/main/octo/CTeensy4Controller.h) is the same as the one from the blinkylights blog just adjusted to work with GRB order.

```cpp
#include <OctoWS2811.h>
#include <FastLED.h>
#include <Arduino.h>

template <EOrder RGB_ORDER = RGB,
          uint8_t CHIP = WS2811_800kHz>
class CTeensy4Controller : public CPixelLEDController<RGB_ORDER, 8, 0xFF>
{
    OctoWS2811 *pocto;

public:
    CTeensy4Controller(OctoWS2811 *_pocto)
        : pocto(_pocto){};

    virtual void init() {}
    virtual void showPixels(PixelController<RGB_ORDER, 8, 0xFF> &pixels)
    {

        uint32_t i = 0;
        while (pixels.has(1))
        {
            uint8_t g = pixels.loadAndScale0();
            uint8_t r = pixels.loadAndScale1();
            uint8_t b = pixels.loadAndScale2();
            pocto->setPixel(i++, r, g, b);
            pixels.stepDithering();
            pixels.advanceData();
        }

        pocto->show();
    }
};
```

**Includes**

```cpp
#include <Arduino.h>
#include <OctoWS2811.h>

#define FASTLED_INTERNAL
#include <FastLED.h>

#include "CTeensy4Controller.h"
```

**Setup**

This sets up for a single string. However - by adjusting numPins to match the number of parallel strings (and adding the pin numbers to pinList) this can be run in parallel.

Code here is also mostly taken directly from the blinkylights blog - but sets up for GRB order.

```cpp
const int numPins = 1;
byte pinList[numPins] = {1};

const int ledsPerStrip = 240;
CRGB leds[numPins * ledsPerStrip];

// These buffers need to be large enough for all the pixels.
// The total number of pixels is "ledsPerStrip * numPins".
// Each pixel needs 3 bytes, so multiply by 3.  An "int" is
// 4 bytes, so divide by 4.  The array is created using "int"
// so the compiler will align it to 32 bit memory.
DMAMEM int displayMemory[ledsPerStrip * numPins * 3 / 4];
int drawingMemory[ledsPerStrip * numPins * 3 / 4];

OctoWS2811 octo(ledsPerStrip, displayMemory, drawingMemory, WS2811_GRB | WS2811_800kHz, numPins, pinList);

CTeensy4Controller<GRB, WS2811_800kHz> *pcontroller;

void setup()
{
  octo.begin();
  pcontroller = new CTeensy4Controller<GRB, WS2811_800kHz>(&octo);

  FastLED.addLeds(pcontroller, leds, numPins * ledsPerStrip);
}
```
