# Observable HQ - Performance Audit

![img-observablehq-audit-cover_michael_hladky](https://user-images.githubusercontent.com/10064416/162594786-47aa6668-efb6-4d5e-aef1-f557ed6dac76.PNG)

---

![img-observablehq-main-page_michael_hladky](https://user-images.githubusercontent.com/10064416/162594795-95c9ea5f-a61c-444c-a014-b40847dead89.PNG)

## TL;DR

**CSS**

```css
/* too-bar (c1) */
nav.bb {
  height: 55px;
  contain: strict;
  content-visibility:auto;
  contain-intrinsic-size: 55px;
}

/* all sections (c2) */
#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2 {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 300px;
}

/* img, video */
img, video {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}


/* cards */
.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573 {
  contain: strict;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}

/* LCP video */
.mw-section video {
  background-image: url(https://static.observableusercontent.com/thumbnail/820c1ce779bde2347e128aab81a550e16f95126993729412583ac517dd0c2c1f.jpg);
}
```

**HTML**

```html
<!-- At pageload `31` images are loaded, after relevant images are loaded lazy `14` are loaded. -->
<img loading="lazy">
```


## Visual Areas

![img-observablehq-main-page-areas_michael_hladky](https://user-images.githubusercontent.com/10064416/162594799-2cff5cb3-7ead-46cd-aca7-19d55df3646d.PNG)


**Areas:**
- tool-bar - `document.querySelector('nav.bb')`
- section - `document.querySelectorAll('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
  - hero-section - `document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
    - video (LCP) - document.querySelectorAll('.mw-section video') 
  - carousel - `document.querySelectorAll('.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573')`
  - DOM animation - `document.querySelector('.jsx-6e9c885e3fde48d5')`
- footer - `document.querySelector('footer')`

![img-observablehq-main-page-areas-detail-1_michael_hladky](https://user-images.githubusercontent.com/10064416/162594810-79308250-4d5e-4371-87e8-20caaf10d192.PNG)

![img-observablehq-main-page-areas-detail-2_michael_hladky](https://user-images.githubusercontent.com/10064416/162594812-715e170d-e891-4c53-a59c-ad76fbd9c273.PNG)

## Initial state

To start with our audit we need the status quo.

Following measures where taken:
- Page refresh (a full page refresh triggeres over the performace panel)
- Page re-dom (a full removal and addinf back of the DOM)
- Page re-calculate (transformZ 0.1 on body)
- Page idle (after page is fully loaded some seconds of no interaction)

**Page Refresh**

![img-observablehq-refresh_before](https://user-images.githubusercontent.com/10064416/162595144-c52a5612-b9ca-4457-836d-e586b0b7659f.PNG)

**Page Re-draw DOM**

![img-observablehq-redom_before](https://user-images.githubusercontent.com/10064416/162595154-dd7da7bd-872e-436e-923b-f382e802dadc.PNG)

**Page Recalculate**

![img-observablehq-recalculate_before](https://user-images.githubusercontent.com/10064416/162595151-8eee0c6f-0896-4993-b0df-7b3bbc6f690f.PNG)

**Page Scroll**

![img-observablehq-scroll-before](https://user-images.githubusercontent.com/10064416/162595147-77b4b43e-75ba-4c37-adb1-3f9eda1b90d6.PNG)

**Page Idle**

![img-observablehq-idle_before](https://user-images.githubusercontent.com/10064416/162595146-a932c466-4b37-4b71-b06e-5fdb032560d9.PNG)

## Audit Thought Process

### First Quick Findings

**Spcipting:**
- script dirven animations
- bad lib for DOM animation

**DOM & Styles:**
- animation noise
- styled components triggering refetch of resources (check in hero section)

**Media:**
- no UI facade for hero GIF
- lazy loading options present
- no compression
- wrong dimensions


After my first impression of the flames and the fact that I **can't touch code nor assets** I decided to focus first on the things I can **easily test and measure**.
This includes runtime measures of DOM and CSS changes.

### `loading`

After a look in the delivered HTML I have little hope we can land an impact with lazy loading resources as they already have it in use pretty much every where.

Let's quickly check the images without loading lazy on the page... 

```javascript
const imgs = document.querySelectorAll('img');
const eager = Array.from(imgs).map(i => i.getAttribute('loading')).filter(l => !l).length;

console.log(eager+ ' of ' + imgs.length + ' imgs eager (LCP included)');
document.title= eager+ ' of ' + imgs.length + ' imgs eager (LCP included)';
```

> 82 of 137 imgs eager (LCP included)
 
Let's give it a quick try:

```javascript
const imgs = document.querySelectorAll('img');
const eager = Array.from(imgs).forEach(i => i.setAttribute('loading', 'lazy);

console.log(eager+ ' of ' + imgs.length + ' imgs eager (LCP included)');
document.title= eager+ ' of ' + imgs.length + ' imgs eager (LCP included)';
```

At pageload `31` images are loaded, after all images are loaded lazy `13` are loaded.
 
### `contain` and `content-visibility`

I start with the quick wins first and worked my way through the previously defined sections.

**Tool-bar**

![img-observablehq-toolbar_michael-hladky](https://user-images.githubusercontent.com/10064416/162595392-e1c37faf-cb29-4751-adca-242f8d463c05.PNG)

The tool-bar is my first candidate. A clear case for `contain:strict` as (even if it self is without fixed dimensions, its first and only child is) we can assume static dimensiones. I did a check for mobile, to be shure it is the same there, which was the case: `height: 55px`. 

It will be off screen when we scroll so we can consider `content-visibility` and `contain-intrinsic-size`. 

I don't measure as I don't asume any big impact.

The interactions with tool-bar elements did not show any animated changes nor dropdowns. The only thing interesting was, when I clicked the searchbox a full bage overlay showed up. At the beginning I did not see it but after some interaction I spotted a flicker in the tiny images of the headline. 

![img-observablehq-search_michael-hladky](https://user-images.githubusercontent.com/10064416/162595399-b200c764-77b2-4ac1-966e-4f933e126f6c.PNG)


Let's make a note for the hero section to analyze this.

**Sections**


The majority of the pages content is organized in sections with mid size DOM size. In general the site is media heavy but there are some specific sections containing more relevant animation or media we could have a look at. 

We can try if their content is staiy stable if we apply `content-visibility:auto`... It is quite a hick up in the scrollbar, an intrinsic size of `300px` makes it way better. Now a quick check on mobile... It's, at least with touchpad and laptop noticable that the scroll is a bit janky, but lets keep ti for now and take a measure.

Looks good! Recalculate styles and redom shows pretty nice improvements already.

**Section - Examples**

One of the interesting sections is the examples section. 
There we have 2 carousels containing main cards with images.   

Their position is animated with translateX which is already pretty good. As an side effect the psint area is huge.  

![img-observablehq-section-carousel_before_michael-hladky](https://user-images.githubusercontent.com/10064416/162595420-22e49b9e-2023-47f4-ad03-f648d10f3b88.PNG)

Here we can apply again `contain' and `content-visibility`. 

```css
img, video {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

After we applied the styles we can see in the layers panel that the paint area is now limited to the cards visible in the viewport or obscured. Another check in the layers panel shows us the affected nodes.

![img-observablehq-section-carousel_after_michael-hladky](https://user-images.githubusercontent.com/10064416/162595425-17c5a007-e364-47a5-a926-68c32de85b8b.PNG)


**Section - Usage**

A quick look with the paintflash feature shows that again they did quite a good job, transition is used to run the dimensional changes.

![img-observablehq-section-usage-paint-flash_michael-hladky](https://user-images.githubusercontent.com/10064416/162595643-b5c901db-a784-4962-a0ce-33db806c3d0d.PNG)

Maybe a small improvement could be done with `will-change`? I have to understand the animation first... 

[ANIMATION AND ELEMENTS]()

From what I understand now, the animation is driven by transform and some properties are translate. The animated elements are all contained by on container with fixed with and height. Some elements are animated out of the container border-box and faded out.

I can access all selected elements like this `document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')`. 

In can start now to fiddle around, but first I have to stop all the background noise so I can focus on the one animation.

- tool-bar - `document.querySelector('nav.bb')`
- section - `document.querySelectorAll('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
  - hero-section - `document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
    - video (LCP) - document.querySelectorAll('.mw-section video') 
  - carousel - `document.querySelectorAll('.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573')`
  - DOM animation - `document.querySelector('.jsx-6e9c885e3fde48d5')`
- footer - `document.querySelector('footer')`


```javascript
// hero video
document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2').remove();
// carousel
Array.from(document.querySelectorAll('.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573')).forEach(i => i.remove());
```

As the dom changes and it's hard to make changes directly on the element in the Elements tab I first add a class that I can target:

```javascript
// animated divs
Array.from(document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')).forEach(i => i.classList.add('animated-elem'));
```


**Footer**

TODO

## View Port and LCP Detailled Look

**Section - Hero**

The hero section maintains a littla bit of fancy text and a video. 

From the toolbar review I have a note regards a flicker in the tiny images of the headline on the right. When openin and closing the search overlay I realized that some images are constantly loaded. 
2 images visible in the small bubbles in the headline.

![img-observablehq-search-fetch_michael-hladky](https://user-images.githubusercontent.com/10064416/162595418-a4dbc55e-3808-4a00-a10c-c2b2035c3789.PNG)

A second look in conparison to the rest of the resources showed that these 2 images are with far distance the biggest on the page. 🤣
Due to the usage of CSS and the background-image attribute the priority is always `high` so there is no chance our LCP content gets first. 

![img-observablehq-search-network_michael-hladky](https://user-images.githubusercontent.com/10064416/162595605-1853ef8d-c326-49c4-9ae5-371aac394c04.PNG)

I assume it is triggeren by reacts CD and the usage of css variables as background image but iI'm not sure ATM. 

For now I will keep it with a note to research later...

**LCP Asset**

The video tag on the right is streamed so the first image can get displayes early on.

```html
<video autoplay="" loop="" playsinline="" class="w-100" style="margin-bottom: -4px;">
  <source src="https://static.observablehq.com/assets/videos/Notebook-Demo.mov" type="video/mp4">
</video>
```
 Here we can apply our finding from above to our advantage. We can use a image and set it as background image of the video tag. 
 As this is our LCP and the CSS rule will fetch it with high priority we could create an optimized image for the first paint to improve LCP.

In the snippet below I just used an image from the cards to showcase the effect. For a visual feedback you can add a back ground color to check the impact visually.
 
```css
.mw-section video {
  background-image: url(https://static.observableusercontent.com/thumbnail/820c1ce779bde2347e128aab81a550e16f95126993729412583ac517dd0c2c1f.jpg);
/* just to demonstrate impact visually */
background-color: red;
}
```


