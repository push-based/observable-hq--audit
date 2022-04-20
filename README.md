# Observable HQ - Performance Audit

![img-observablehq-audit-cover_michael_hladky](https://user-images.githubusercontent.com/10064416/162602176-ac0f5194-2933-47c1-9e39-fbe574eeec4a.PNG)

---

# TL;DR

**Comparison - Flame charts**
| Re-apply DOM | Recalculate styles |  
| -- | -- |
| ![img-observablehq-redom_comparison](https://user-images.githubusercontent.com/10064416/163671375-02204147-8f75-43d0-8484-b47d7f3abc36.PNG) | ![img-observablehq-recalculate_comparison](https://user-images.githubusercontent.com/10064416/163671372-bfbd8f40-39b2-4b90-b11f-a64e4130cf0e.PNG)   |

| Scroll down and up again   | Idle   |  
| -- | -- |
| ![img-observablehq-scroll-comparison](https://user-images.githubusercontent.com/10064416/163671374-02a27d3e-e2cb-4333-9e37-1673e108f530.PNG) | ![img-observablehq-idle-comparison](https://user-images.githubusercontent.com/10064416/163671373-5ee69409-50e0-4290-bbb6-24cfaeb6b981.PNG) | 
 
**Average Improvements in milliseconds**
| Measure            | Ø Task before   | TTB before   | Ø Task after | TTB after   | Notes                                                   |
| ------------------ | --------------  | ------------ | ------------ | ----------- | ------------------------------------------------------- |
| Re-apply DOM       |  110ms / 160ms  | 90ms / 110ms | 27ms / 21ms  | 0ms         | numbers apply to add DOM task/ recalculate styles task  |
| Recalculate styles |  230ms          | 180ms        | 18ms         | 0ms         | numbers apply to recalculate tasks                      |
| Scroll down/up     |  60ms           | 11ms         | 9ms          | 0ms         | taksk of bissy sections                                 |
| Idle               |  20ms           | 0ms          | 4ms          | 0ms         | n/a                                                     |  

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
// add above styles to the page
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

**Show me how to reproduze it quickly**

To quickly check it in your browser open the DevTools "Sources" tab and click on "Snippets".
Create a snippet with the code above, execute it and measure the impact.

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

The pages, from the first glims, contains lot's of images and I guess live demos of the editor. It took quite a while to load the LCP video, but maybe because I sit in the kitchen instead of my desk. 🙃   
There, I always have bad connection. 💤

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

> **Tip:**  
> The areas are collected through my audit. Whenever I was identifying an elemen I was also saving the selector here.
> I included the method e.g. `querySelector` to get the list of all relevant elements with the snippet.
> This will save me some time and I don't need to maintain it in DevtTool yet.

![img-observablehq-main-page-areas-detail-1_michael_hladky](https://user-images.githubusercontent.com/10064416/162594810-79308250-4d5e-4371-87e8-20caaf10d192.PNG)

![img-observablehq-main-page-areas-detail-2_michael_hladky](https://user-images.githubusercontent.com/10064416/162594812-715e170d-e891-4c53-a59c-ad76fbd9c273.PNG)

# Initial state

To start with our audit we need a reproduzeable way to measure the status quo, and in what conditions we took the measure.

- [webpagetest - lighthouse before](https://www.webpagetest.org/result/220418_BiDcBT_8RK/)
- [webpagetest - performance test before](https://www.webpagetest.org/result/220418_BiDcWY_8SD/)
- [webpagetest - performance test after](https://www.webpagetest.org/result/220418_BiDcQX_8Y2/)
- [webpagetest - performance test avatar blocked](https://www.webpagetest.org/result/220419_AiDc0C_HG9/)
- [webpagetest - performance test preload img & video](https://www.webpagetest.org/result/220419_AiDc80_J8T/)
- [webpagetest - performance test hero section comparison](https://www.webpagetest.org/video/compare.php?tests=220420_BiDcZZ_GM,220420_AiDc2E_JN,220420_AiDcC1_JP,220420_AiDc79_JQ)
## Audit setup

**Target**  
I took the Observable HQ site for the audit as it is a really nice tool and I could maybe provide some benefit to them.

**URL:**  
[http://observablehq.com](http://observablehq.com)

**Conditions**  
I used "native throtteling" in this audit 🤣, which means all my measures are done in my kitchen with flaky internet connection and no power pluck in. 😅
The only thing I made shure was to have everything open in incognito mode.

**Device**  
All the measures are done on a _ThinkPad X1 (i7 8th Gen)_ on a _Windows OS_

## Base Measures

The following measures where taken:
- Page refresh (a full page refresh triggeres over the performace panel)
- Page re-dom (a full removal and addinf back of the DOM)
- Page re-calculate (transformZ 0.1 on body)
- Page idle (after page is fully loaded some seconds of no interaction)

**Measure Process**

All measures are produced with small scripts I hold in my `DevTools` -> `Snippets` tab.

This is how I performed the measures:

![img-measure-process--snippets_michael-hladky](https://user-images.githubusercontent.com/10064416/163649294-8580b81e-1a15-4231-81fd-c986f542b183.png)

1. Open the `Performance` tab 
2. In the bottom section, select the `Quick source` tab (and close all other tabs)
3. Start profiling with `Ctrl + E` or the ⏺ button
4. Click on the  ▶  butto to execute the script
5. Start profiling with `Ctrl + E` or the ⏹ button

> **Tip:**  
> The `console` tab pop`s in after every script execution.
> This is annoying because we have to click on the `Quick source` tab again.
> To lessen the pain and live-hack it we can shrink the output area to the minimum.
> By doing this we can have a short distance between the tabs and the execute button.

### Page Refresh  

![img-observablehq-refresh_before](https://user-images.githubusercontent.com/10064416/162595144-c52a5612-b9ca-4457-836d-e586b0b7659f.PNG)

### Page Re-draw DOM  

![img-observablehq-redom_before](https://user-images.githubusercontent.com/10064416/162595154-dd7da7bd-872e-436e-923b-f382e802dadc.PNG)

To reproduce the measure:
1. Setup the script below as snippet in DevTools -> Sources -> Snippets
2. Setup DevTools as described in "Measure Process" above.
3. Start recording
4. Execute script over "Quick source"
5. Stop recording
6. Analyse flames and save the profile if needed

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
++runs === 4 && clearInterval(id) && console.log('relayout done!');
fullRedom();
}, 2400);
```

### Page Recalculate  

![img-observablehq-recalculate_before](https://user-images.githubusercontent.com/10064416/162595151-8eee0c6f-0896-4993-b0df-7b3bbc6f690f.PNG)

To reproduce the measure:
1. Setup the script below as snippet in DevTools -> Sources -> Snippets
2. Setup tedTools as described in "Measure Process" above.
3. Start recording
4. Execute script over "Quick source"
5. Stop recording
6. Analyse flames and save the profile if needed

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
6. Analyse flames and save the profile if needed

```javascript
// Scroll up down
const scrollHeight = document.documentElement.scrollHeight;

console.log('scrollHeight', scrollHeight); 


window.scroll({
  top: scrollHeight, 
  behavior: 'smooth'
});

// wait for a second, then scroll back up
setTimeout(() => window.scroll({
  top: 0, 
  behavior: 'smooth'
  }), 3000);

console.log('scroll done!'); 
``` 

### Page Idle    

![img-observablehq-idle_before](https://user-images.githubusercontent.com/10064416/162595146-a932c466-4b37-4b71-b06e-5fdb032560d9.PNG)

To reproduce the measure just recorde the page without any interaction for some time.

# Audit Documentation

## First Pokes

After my first impression of the flames and the fact that I **can't touch code nor assets** I decided to focus first on the things I can **easily test and measure**.
This includes runtime measures of DOM and CSS changes.

Here the transfered list from my handwriting as I was too lazy to start a readme right away. 

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

To be more productive I try to focus the audit process on the same technique across the page and then switch to the next one I think is applicable.

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

As this most problbby will have an impact on other images and paint heavy assets too, let's add another rule for all `img` and `video` tags: 

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

From what I understand now, the animation is driven by transform and some properties are translate. The animated elements are all contained by on container with fixed `with` and `height`. Some elements are animated out of the container border-box and faded out.

I can access all selected elements like this `document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')`. 

In can start now to fiddle around, but first I have to stop all the background noise so I can focus on the one animation.

```javascript
// hero video
document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2').remove();
// carousel
Array.from(document.querySelectorAll('.jsx-1511261573 > .jsx-1511261573 > .jsx-1511261573')).forEach(i => i.remove());
```

As the DOM changes and it's hard to make changes directly on the element in the Elements tab I first add a class that I can target:

```javascript
// animated divs
Array.from(document.querySelectorAll('.jsx-6e9c885e3fde48d5 > div')).forEach(i => i.classList.add('animated-elem'));
```

Ok, unfortunately my default approach does not work, the class attribute is controled by JavaScript and I have to go with a `data` attribute:

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
Neverthe less, I have now 2 snippets to remove noise from the page. 🏆

**Footer**

The footer is another clear candidate for our silver bullets ;), Let's see what we can do.

```css
footer {
  contain: content;
  content-visibility: auto;
  contain-intrinsic-size: 200px;
}
```

Pretty nice we could even maintain the height exactly. 

## Phase 2 - View Port and LCP Detailled Look

**Section - Hero**

The hero section maintains a little bit of fancy text and a video. 

From the toolbar review I have a note regards a flicker in the tiny images of the headline on the right. When openin and closing the search overlay I realized that some images are constantly loaded. 
2 images visible in the small bubbles in the headline.

![img-observablehq-search-fetch_michael-hladky](https://user-images.githubusercontent.com/10064416/162595418-a4dbc55e-3808-4a00-a10c-c2b2035c3789.PNG)

A second look in comparison to the rest of the resources showed that these 2 images are **with far distance the biggest** on the page. 🤣  
Due to the usage of CSS and the background-image attribute the priority is always `high` so there is no chance our LCP content gets loaded first. 

![img-observablehq-search-network_michael-hladky](https://user-images.githubusercontent.com/10064416/163600935-ae0151a8-da8d-47e8-9a76-3b3d7c55ccbb.PNG)

I assume it is triggeren by react's CD and the usage of CSS variables as background image but I'm not sure ATM. 

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

I'm back at the image flicker 🥰. This war gripping my attention from the beginning but I was not sure if it has enough potential to dig in deeper so early on. 
Now that I am pretty satisfied with my first findings I can **finally** have a closer look here. 

I realized I did not put the selector for the small bubbles containing the avatar image in the doc before... 🙄 Again a turn with the element inspector ... meh! ... and the console.

Here we go: 
```javascript
// avatar 1 - element
document.querySelectorAll('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(1)');
// avatar 1 - URL
https://static.observablehq.com/assets/annie-avatar.jpg
// avatar 2 - element
document.querySelectorAll('.marketing-presence-widget.jsx-140043cc736fed23:nth-child(2)');
// avatar 2 - URL
https://static.observablehq.com/assets/ramona-avatar.jpg
```
Now as I remember, I wanted to use a random profile picture from a card to show case the impact. Let me do that right now where I am in the elements panel mood...

```jacascript
// dummy avatar 1
https://avatars.observableusercontent.com/avatar/4b4606a6f4b81cdc32e2a3271381da5fad8ffdbd1089b14e89ebcfd1c98a11c0?s=128
// dummy avatar 2
https://avatars2.githubusercontent.com/u/96189?v=4&s=128
```

Ok. Now as I am prepared with some snippets let's finally dig.

I will open the network tab to see if a block of those image URL's has an impact.

![img-observablehq-network-block-url_michael_hladky](https://user-images.githubusercontent.com/10064416/162598903-2920fbfe-fd31-4d38-a2e2-ddbd2f88cd6b.PNG)

![img-observablehq-avatar-network_after_michael-hladky](https://user-images.githubusercontent.com/10064416/162599516-21698e60-06e1-4418-88fb-fb9412440fb1.PNG)

Woof, only from observing it over the screen it is a drastic difference. Also the networe waterfall looks way more "paralell".

It definitely pays of to think about a solution here!

My first try to change "something" was to just replace the CSS variable value, but it seems it is somewhere recalculated to the same value and set again... hmm.

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

Voila! 💪 The refetching is now gone and also a propperly sized image is used, only the fetch priority is still on `High` as we use CSS `background-image`.

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

Perfect after this improvement they also have fetch priority `low` 🥳🥳🥳.


Bam... I would say let's call it a day. 🌑
The snippets to remeasure are now pretty nice to use and I'm excited to run the measures with the improvements and compare them after some 😴.

...

After I added the optimized measures and the TL;DR section I tried to somehow visualize the hero video impackt as it is a major improvement of this audit and therefore it should shine. 

- fimstrip before
- filstrip after dummy placeholder
![observable-hq--hero-video-placeholder--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164109075-a219a9c5-60a2-4b77-b2b3-d6df280e67c7.PNG)

- with nice placeholder
- with all optimizations

```javascript
const parser = document.createElement('DIV');
function parse(html) {
    parser.innerHTML = html;
    return parser.firstChild;
}
const v = parse('<video id="video" preload="metadata" src="https://static.observablehq.com/assets/videos/Notebook-Demo.mov" controls style="visibility: hidden; width: 0; height: 0; contain: strict; content-visibility: auto; top: -9000px;position: fixed;"></video>');
const i = parse('<link rel="preload" as="image" href="https://static.observableusercontent.com/thumbnail/820c1ce779bde2347e128aab81a550e16f95126993729412583ac517dd0c2c1f.jpg">');
const s = parse('<style>.mw-section video {background-image: url(https://static.observableusercontent.com/thumbnail/820c1ce779bde2347e128aab81a550e16f95126993729412583ac517dd0c2c1f.jpg);}</style>');

document.body.prepend(s);
document.body.prepend(v);
document.body.prepend(i);
```

<details><summary>Heroscetion snippet snippet</summary>
<p>

#### Be happy I used a `<details>` element!

```javascript
const parser = document.createElement('DIV');
function parse(html) {
    parser.innerHTML = html;
    return parser.firstChild;
}
const v = parse('<video id="video" preload="metadata" src="https://static.observablehq.com/assets/videos/Notebook-Demo.mov" controls style="visibility: hidden; width: 0; height: 0; contain: strict; content-visibility: auto; top: -9000px;position: fixed;"></video>');
const s = parse("<style>.mw-section video {background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4RCyRXhpZgAATU0AKgAAAAgAAodpAAQAAAABAAAIMuocAAcAAAgMAAAAJgAAAAAc6gAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkAMAAgAAABQAABCAkAQAAgAAABQAABCUkpEAAgAAAAMyNAAAkpIAAgAAAAMyNAAA6hwABwAACAwAAAh0AAAAABzqAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAyMjowNDoxOSAyMzoxMzozNQAyMDIyOjA0OjE5IDIzOjEzOjM1AAAA/+EJoGh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4NCjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iPjxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9InV1aWQ6ZmFmNWJkZDUtYmEzZC0xMWRhLWFkMzEtZDMzZDc1MTgyZjFiIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPjx4bXA6Q3JlYXRlRGF0ZT4yMDIyLTA0LTE5VDIzOjEzOjM1LjIzNjwveG1wOkNyZWF0ZURhdGU+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwveDp4bXBtZXRhPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwACAQEBAQECAQEBAgICAgIEAwICAgIFBAQDBAYFBgYGBQYGBgcJCAYHCQcGBggLCAkKCgoKCgYICwwLCgwJCgoK/9sAQwECAgICAgIFAwMFCgcGBwoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoK/8AAEQgB3AKnAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYS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')}</style>");

document.body.prepend(s);
document.body.prepend(v);
```
 ![observable-hq--hero-section--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164124065-7988130d-f800-4eeb-8189-1d9dad9d4567.PNG)

 

</p>
</details>
# Optimized State

## Base Measures

### Page Refresh  

We can't run this comparison easily so we skip it for now. 

### Page Re-draw DOM  
![img-observablehq-redom_after](https://user-images.githubusercontent.com/10064416/163669367-3104ffae-2efb-4507-8ad4-e6d51748cd52.PNG)

**25ms** before 154ms

### Page Recalculate  

![img-observablehq-recalculate_after](https://user-images.githubusercontent.com/10064416/163669377-f6e8bfa2-7490-4b4d-9cf1-98593e874a22.PNG)

**15.45ms** before **194ms**

### Page Scroll  

![img-observablehq-scroll-after](https://user-images.githubusercontent.com/10064416/163669381-fd3097ee-4439-4343-90b4-95777da6ac2c.PNG)

No bissy areas anymore.

### Page Idle    

![img-observablehq-idle_after](https://user-images.githubusercontent.com/10064416/163669421-a31934eb-203b-4796-a6e7-6dfe5b761a27.PNG)

**5ms** before 20ms

## Comparison

### Page Re-draw DOM  

![img-observablehq-redom_comparison](https://user-images.githubusercontent.com/10064416/163671375-02204147-8f75-43d0-8484-b47d7f3abc36.PNG)

### Page Recalculate  

![img-observablehq-recalculate_comparison](https://user-images.githubusercontent.com/10064416/163671372-bfbd8f40-39b2-4b90-b11f-a64e4130cf0e.PNG)

### Page Scroll  

![img-observablehq-scroll-comparison](https://user-images.githubusercontent.com/10064416/163671374-02a27d3e-e2cb-4333-9e37-1673e108f530.PNG)

### Page Idle    

![img-observablehq-idle-comparison](https://user-images.githubusercontent.com/10064416/163671373-5ee69409-50e0-4290-bbb6-24cfaeb6b981.PNG)


# Resources

- [Edited images of this audit as slide deck](https://docs.google.com/presentation/d/1x167yfcHr--3366FC1Lvr_YhzZ-ySyoGBlSjkBz8d94/edit?usp=sharing)

## Timeline View Of Result

- [Timeline - Recalculate styles before](https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-recalc_before.json)
- [Timeline - Redraw DOM styles before](https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-redom_before.json)
- [Timeline - Scroll before](https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-scroll_before.json)
- [Timeline - Idle before](https://chromedevtools.github.io/timeline-viewer/?loadTimelineFromURL=https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-idle_before.json)


## Attachments with raw measurements

> Raw files and screenshots of measurements can be found in the `/raw` directory.

- [observablehq-recalc_before.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-recalc_before.json)
- [observablehq-redow_before.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-redom_before.json)
- [observablehq-scroll_before.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-scroll_before.json)
- [observablehq-idle_before.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-idle_before.json)


