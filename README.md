# Observable HQ - Performance Audit

![img-observablehq-audit-cover_michael_hladky](https://user-images.githubusercontent.com/10064416/162602176-ac0f5194-2933-47c1-9e39-fbe574eeec4a.PNG)

---

# TL;DR

**Styles**

```html
<style>
/* img, video */
img, video {
  contain: content;
  content-visibility: auto;
}
/* too-bar */
nav.bb {
  height: 55px;
  contain: strict;
  content-visibility:auto;
  contain-intrinsic-size: 55px;
}
/* all sections */
#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2 {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 300px;
}
/* hero text avatars*/
.marketing-presence-widget.jsx-140043cc736fed23:after {
  background-image: none !important;
}

.marketing-presence-widget.jsx-140043cc736fed23 {
  positing: relative;
}

.marketing-presence-widget.jsx-140043cc736fed23 img.avatar {
  top: -28px;
  position: relative;
  z-index: 10;
  border-radius: 50% 50% 50% 3px;
}

/* carousels */
.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573 {
  contain: strict;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
  
/* cards */
.carousel-notebook {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
  
/* LCP video */
.mw-section video {
  background-image: url(https://static.observableusercontent.com/thumbnail/820c1ce779bde2347e128aab81a550e16f95126993729412583ac517dd0c2c1f.jpg);
}
  
/* footer */
footer {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
</style>
```

**Scripting**

```javascript
// add above scripts to page
const stylesString = `...` // Copy paste above styles here 
const styleTag = document.createElement('style');
styleTag.innerHTML = stylesString;
document.head.appendChild(styleTag);

// avatars
document.querySelector('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1)')
  .innerHTML = '<img class="avatar" width="32" height="32" src="https://avatars.observableusercontent.com/avatar/4b4606a6f4b81cdc32e2a3271381da5fad8ffdbd1089b14e89ebcfd1c98a11c0?s=128">';
document.querySelector('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(2)')
  .innerHTML = '<img class="avatar" width="32" height="32" src="https://avatars2.githubusercontent.com/u/96189?v=4&s=128">';

// images
// At pageload `31` images are loaded, after relevant images are loaded lazy `14` are loaded
const imgs = document.querySelectorAll('img, iframe');
Array.from(imgs)
  .forEach(i => {
    i.setAttribute('loading', 'lazy');
  });
```

## Show me how to reproduze it quickly

To quickly check it in your browser open the DevTools "Sources" tab and click on "Snippets".

![img-dev-tools--snippets_michael_hladky](https://user-images.githubusercontent.com/10064416/163622952-ba8e0b03-fe96-4ffb-a8d9-4f7c4cb3442c.PNG)

1. Open DevTools
2. Select Sources Tab
3. Select Snippets
4. Click New snippet
5. Give it a name
6. Insert scripts
7. Execute
8. Check console

# Main Page

![img-observablehq-main-page_michael_hladky](https://user-images.githubusercontent.com/10064416/162594795-95c9ea5f-a61c-444c-a014-b40847dead89.PNG)

The pages, from the first grims, contaons lost of images and i gues live demos of the editor. It took quite a while to load the LCP video, but maybe because I sit in the kitchen instead of my desk. There I always have bad connection.

To get a good first overview let's start with the visible part in more detail.

# Page Elements

![img-observablehq-main-page-areas_michael_hladky](https://user-images.githubusercontent.com/10064416/162594799-2cff5cb3-7ead-46cd-aca7-19d55df3646d.PNG)


**Areas:**
- tool-bar - `document.querySelector('nav.bb')`
- section - `document.querySelectorAll('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
  - hero-section - `document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
    - avatars - `document.querySelectorAll('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1)')` or `:nth-child(2)` for second avatar 
    - video (LCP) - `document.querySelectorAll('.mw-section video')` 
  - carousel - `document.querySelectorAll('.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573')`
  - DOM animation - `document.querySelector('.jsx-6e9c885e3fde48d5')`
- footer - `document.querySelector('footer')`

![img-observablehq-main-page-areas-detail-1_michael_hladky](https://user-images.githubusercontent.com/10064416/162594810-79308250-4d5e-4371-87e8-20caaf10d192.PNG)

![img-observablehq-main-page-areas-detail-2_michael_hladky](https://user-images.githubusercontent.com/10064416/162594812-715e170d-e891-4c53-a59c-ad76fbd9c273.PNG)

# Initial state

To start with our audit we need the status quo.

## Audit setup

**Target**  
I took the Observable HQ site for the audit as it is a really nice tool and I could maybe provide some benefit to them.

**URL:**  
[http://observablehq.com](http://observablehq.com)

**Conditions**  
I used "native throtteling" in this audit, which means all my measures are done in my kitchen with flaky internet connection and no power pluck in. 😅
The only thing I made shure was to have everyithing open in incognito mode.

**Device**  
All the measures are done on a ThinkPad X1 (i7 8th Gen) on a Windows OS

## Base Measures

Following measures where taken:
- Page refresh (a full page refresh triggeres over the performace panel)
- Page re-dom (a full removal and addinf back of the DOM)
- Page re-calculate (transformZ 0.1 on body)
- Page idle (after page is fully loaded some seconds of no interaction)

**Measure Process**

All measures are produced with small scripts I hold in my `DevTooly` -> `Snippets` tab.

This is how I performed the measures:

![img-measure-process--snippets_michael-hladky](https://user-images.githubusercontent.com/10064416/163622475-60ccd81f-8002-4535-9a03-90e20b3061cc.png)

1. Open the `Performance` tab 
2. In the bottom section, select the `Quick source` tab (and close all other tabs)
3. Start profiling with `Ctrl + E` or the ⏺ butto
4. Click on the  ▶  butto to execute the script
5. The `console` tab pop`s in which is annoying because we have to click on the `Quick source` tab again
6. Start profiling with `Ctrl + E` or the ⏹ butto

### Page Refresh  

![img-observablehq-refresh_before](https://user-images.githubusercontent.com/10064416/162595144-c52a5612-b9ca-4457-836d-e586b0b7659f.PNG)

### Page Re-draw DOM  

![img-observablehq-redom_before](https://user-images.githubusercontent.com/10064416/162595154-dd7da7bd-872e-436e-923b-f382e802dadc.PNG)

To reproduce the measure:
1. Setup the script below as snippet in DevTools -> Sources -> Snippets
2. Setup tedTools as described in "Measure Process" above.
3. Start recording
4. Execute script over "Quick source"
5. Stop recording

**dom-redraw.js**
```javascript
const bi = document.body.innerHTML; 
function fullRedom() {
if(window.__pb_full_redom_listener === true) { console.log('You clicked too fast');}
document.body.innerHTML = '';
setTimeout(() => {
window.performance.mark('redom-start');

document.body.innerHTML = bi;
window.__pb_full_relayout_listener = true;

    if (window.__pb_full_redom_listener) {
        window.performance.mark('redom-end');
        window.performance.measure('full-redom', 'redom-start', 'redom-end');
        const duration = window.performance.getEntriesByName('full-redom')[0].duration;
        console.log(`full-redom: ${duration}`, duration > 50 ? '❌' : '✔');
        window.performance.clearMarks();
        window.performance.clearMeasures();
        window.__pb_full_relayout_listener = false;
    }

    }, 400);
}
let runs = 0;
const id = setInterval(() => {
++runs === 10 && clearInterval(id) && console.log('relayout done!');
fullRedom();
}, 1400);
```

### Page Recalculate  

![img-observablehq-recalculate_before](https://user-images.githubusercontent.com/10064416/162595151-8eee0c6f-0896-4993-b0df-7b3bbc6f690f.PNG)

To reproduce the measure:
1. Setup the script below as snippet in DevTools -> Sources -> Snippets
2. Setup tedTools as described in "Measure Process" above.
3. Start recording
4. Execute script over "Quick source"
5. Stop recording

**full-relayout.js**
```javascript
function fullRelayout() {
if(window.__pb_full_relayout_listener === true) { console.log('You clicked too fast');}
window.performance.mark('relayout-start');
document.body.style.zoom === '1' ? document.body.style.zoom = '1.01' : document.body.style.zoom = '1';
window.__pb_full_relayout_listener = true;
setTimeout(() => {
    if (window.__pb_full_relayout_listener) {
        window.performance.mark('relayout-end');
        window.performance.measure('full-relayout', 'relayout-start', 'relayout-end');
        const duration = window.performance.getEntriesByName('full-relayout')[0].duration;
        console.log(`full-relayout: ${duration}`, duration > 50 ? '❌' : '✔');
        window.performance.clearMarks();
        window.performance.clearMeasures();
        window.__pb_full_relayout_listener = false;
    }
});
}
let runs = 0;
const id = setInterval(() => {
++runs === 10 && clearInterval(id) && console.log('relayout done!');
fullRelayout();
}, 1000);
```

### Page Scroll  

![img-observablehq-scroll-before](https://user-images.githubusercontent.com/10064416/163596137-3532bef3-3faf-477e-9e8d-ed0936e8f277.PNG)

To reproduce the measure:
1. Setup the script below as snippet in DevTools -> Sources -> Snippets
2. Setup tedTools as described in "Measure Process" above.
3. Start recording
4. Execute script over "Quick source"
5. Stop recording

```javascript
// Scroll up down
window.scroll({
  top: scrollHeight, 
  behavior: 'smooth'
});

// wait for a second, then scroll back up
setTimeout(() => window.scroll({
  top: 0, 
  behavior: 'smooth'
  }), 3000);

console.log('Scroll done!'); 

``` 

### Page Idle    

![img-observablehq-idle_before](https://user-images.githubusercontent.com/10064416/162595146-a932c466-4b37-4b71-b06e-5fdb032560d9.PNG)

To reproduce the measure just recorde the page without any interaction for some time.

# Audit Documentation

## First Pokes

After my first impression of the flames and the fact that I **can't touch code nor assets** I decided to focus first on the things I can **easily test and measure**.
This includes runtime measures of DOM and CSS changes.

Here the transfered list form my skretch paper as I was too lazy to start a readme right away. 

> **First Quick Findings**
> 
> Scripting:
> - script dirven animations
> - bad lib for DOM animation
> 
> DOM & Styles:
> - animation noise
> - styled components triggering refetch of resources (check in hero section)
> 
> Media:
> - no UI facade for hero GIF
> - lazy loading options present
> - no compression
> - wrong dimensions

To be more productive I try to focus me audit process on the same technique across the page and then switch to the next one I think is applicable.

## Phase 1 - Low hanging fruits & discovery

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
 
Let's give it a quick try 😁

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

Their position is animated with translateX which is already pretty good. As an side effect the paint area is huge.  

![img-observablehq-section-carousel_before_michael-hladky](https://user-images.githubusercontent.com/10064416/162595420-22e49b9e-2023-47f4-ad03-f648d10f3b88.PNG)

Here we can try to apply `contain` and `content-visibility`. Especially `content-visibility` will have the impact.  

```css
img, video {
  contain: content;
  content-visibility: auto;
}
```

As this most problbby will have an impact on other images and paint heave assets too, lets add another rule for all `img` and `video` tags: 

```css
.carousel-notebook {
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

![img-observablehq-section-usage-identified_michael-hladky](https://user-images.githubusercontent.com/10064416/162597373-96476722-68c0-447f-8aa8-fba12fe0ef79.PNG)

From what I understand now, the animation is driven by transform and some properties are translate. The animated elements are all contained by on container with fixed with and height. Some elements are animated out of the container border-box and faded out.

I can access all selected elements like this `document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')`. 

In can start now to fiddle around, but first I have to stop all the background noise so I can focus on the one animation.

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

Ok, unfortunately my default approach does not work, the class attribute is controled by javascript and I have to go with a `data` attribute:

```javascript
Array.from(document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')).forEach(i => i.setAttribute('data-xyz', 'inner'));
Array.from(document.querySelector('.jsx-6e9c885e3fde48d5')).forEach(i => i.setAttribute('data-xyz', 'container'));
``` 

With a little bit of CSS I can now target and visually identify the involved elements:

```css
[data-xyz="container"] {
  border: 1px solid blue;
}
[data-xyz="inne"] {
  border: 1px solid red;
}
```

After some time spent with those 6 elements I did the following thing:

```css
[data-xyz="container"] {
  contain: layout;
}
[data-xyz="wrap"] {
  contain: layout;
  will-change: height; 
}
[data-xyz="inner"] {
  contain: strict;
  content-visibility: auto; 
}

```

I could not measure any impact clearly so I move on 🤷‍. 
Neverthe less, I have now 2 scnippets to remove noise from the page. 🏆

**Footer**

The footer is another clear candidate for our silver bullets ;), Lets see what we can have.

```css
footer {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

## Phase 2 - View Port and LCP Detailled Look

**Section - Hero**

The hero section maintains a littla bit of fancy text and a video. 

From the toolbar review I have a note regards a flicker in the tiny images of the headline on the right. When openin and closing the search overlay I realized that some images are constantly loaded. 
2 images visible in the small bubbles in the headline.

![img-observablehq-search-fetch_michael-hladky](https://user-images.githubusercontent.com/10064416/162595418-a4dbc55e-3808-4a00-a10c-c2b2035c3789.PNG)

A second look in conparison to the rest of the resources showed that these 2 images are with far distance the biggest on the page. 🤣
Due to the usage of CSS and the background-image attribute the priority is always `high` so there is no chance our LCP content gets first. 

![img-observablehq-search-network_michael-hladky](https://user-images.githubusercontent.com/10064416/163600935-ae0151a8-da8d-47e8-9a76-3b3d7c55ccbb.PNG)

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

## Phase 3 - Hero section avatar images

I'm back at the image flicker haha. This war gripping my attention from the beginning but I was not sure if it has enough potential to dig in deeper so early on. 
Now I pretty satisfied with my first findings and can have **finally** a closer look here. 

I realized I did not put the selector for the small bubbles containing the avatar imaeg in the doc before... 🙄 Again a turn with the element inspector and the console.

Here we go: 
```javascript
// avatar 1
document.querySelectorAll('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1)');
// avatar 2
document.querySelectorAll('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(2)');
```
Now as I remember, I wanted to use a random profile picture from a card to show case the impact. Let me do that right now where I am in the elements panel mood...

```jacascript
// dummy avatar 1
https://avatars.observableusercontent.com/avatar/4b4606a6f4b81cdc32e2a3271381da5fad8ffdbd1089b14e89ebcfd1c98a11c0?s=128
// dummy avatar 2
https://avatars2.githubusercontent.com/u/96189?v=4&s=128
```

Ok. Now as I am prepared with some snippets let's finally dig.

I will open the network tab to see if a block of those images has an impact.

![img-observablehq-network-block-url_michael_hladky](https://user-images.githubusercontent.com/10064416/162598903-2920fbfe-fd31-4d38-a2e2-ddbd2f88cd6b.PNG)

![img-observablehq-avatar-network_after_michael-hladky](https://user-images.githubusercontent.com/10064416/162599516-21698e60-06e1-4418-88fb-fb9412440fb1.PNG)

Woof, only from observing it over the screen it is a drastic difference. Also the networe waterfall looks way more "paralell".

It definitely pays of to think about a solution here!

My first try to change "something" was to just replace the css variable value, but it seems it is somewhere recalculated to the same value and set again... hmm.

```css
element.style {
 /* new url below */
 --presence-avatar: url(https://avatars.observableusercontent.com/avatar/4b4606a…?s=128);
}
```

Let's try to go with static CSS values and selectors.

```css
.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1):after {
  background-image: url(https://avatars.observableusercontent.com/avatar/4b4606a6f4b81cdc32e2a3271381da5fad8ffdbd1089b14e89ebcfd1c98a11c0?s=128);
}
.marketing-presence-widget.jsx-140043cc736fed23:nth-child(2):after {
  background-image: url(https://avatars.observableusercontent.com/avatar/4b4606a…?s=128);
}
``` 

Voila!  💪 The refetching is now gone and also a propperly sized image is used, only the fetch priority is still on `High` as we use CSS `background-image`.

As a last improvement I will edit the DOM structure a bit to get native lazy-loading and priority in place.

```css
/* reset background-image */
.marketing-presence-widget.jsx-140043cc736fed23:after {
  background-image: none !important;
}

.marketing-presence-widget.jsx-140043cc736fed23 {
  positing: relative;
}

.marketing-presence-widget.jsx-140043cc736fed23 img.avatar {
  top: -28px;
  position: relative;
  z-index: 10;
  border-radius: 50% 50% 50% 3px;
}
```

```javascript
document.querySelector('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1)')
  .innerHTML = '<img class="avatar" width="32" height="32" src="https://avatars.observableusercontent.com/avatar/4b4606a6f4b81cdc32e2a3271381da5fad8ffdbd1089b14e89ebcfd1c98a11c0?s=128">';

document.querySelector('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(2)')
  .innerHTML = '<img class="avatar" width="32" height="32" src="https://avatars2.githubusercontent.com/u/96189?v=4&s=128">';
```

Perfect after this improvement they also have fetch priority `low`.


# Resources
- [Edited images of this audit as slide deck](https://docs.google.com/presentation/d/1x167yfcHr--3366FC1Lvr_YhzZ-ySyoGBlSjkBz8d94/edit?usp=sharing)
- [Raw measures](/raw)
