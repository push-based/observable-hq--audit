# Observable HQ - Performance Audit

![img-observablehq-audit-cover_michael_hladky](https://user-images.githubusercontent.com/10064416/162602176-ac0f5194-2933-47c1-9e39-fbe574eeec4a.PNG)

---

<!-- toc -->

- [Audit setup](#audit-setup)
- [Base Measures](#base-measures)
  - [Filmstrip Pageload](#filmstrip-pageload)
  - [Page Refresh](#page-refresh)
  - [Page Re-draw DOM](#page-re-draw-dom)
  - [Page Recalculate](#page-recalculate)
  - [Page Scroll](#page-scroll)
  - [Page Idle](#page-idle)
- [First Pokes](#first-pokes)
- [Phase 1 - Low hanging fruits & discovery](#phase-1---low-hanging-fruits--discovery)
  - [`loading`](#loading)
  - [`contain` and `content-visibility`](#contain-and-content-visibility)
- [Phase 2 - View Port and LCP Detailled Look](#phase-2---view-port-and-lcp-detailled-look)
- [Phase 3 - Hero section avatar images](#phase-3---hero-section-avatar-images)
- [Phase 4 - Hero section video](#phase-4---hero-section-video)
- [Filmstrip Pageload](#filmstrip-pageload-1)
- [Page Refresh](#page-refresh-1)
- [Page Re-draw DOM](#page-re-draw-dom-1)
- [Page Recalculate](#page-recalculate-1)
- [Page Scroll](#page-scroll-1)
- [Page Idle](#page-idle-1)
- [Filmstrip Pageload](#filmstrip-pageload-2)
- [Page Re-draw DOM](#page-re-draw-dom-2)
- [Page Recalculate](#page-recalculate-2)
- [Page Scroll](#page-scroll-2)
- [Page Idle](#page-idle-2)
- [Timeline View Of Result](#timeline-view-of-result)
- [Attachments with raw measurements](#attachments-with-raw-measurements)

<!-- tocstop -->

---

# TL;DR

**Comparison - Filmstrip**  
![observable-hq--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164160130-eff89ca9-d054-4673-bda0-a875eacedc27.PNG)

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

**Optimizations**  
Use the script in [webpagetest](https://www.webpagetest.org/) or as DevTools snippet to reproduce the changes.  
To do so just copy the [raw content](https://github.com/push-based/observable-hq--audit/blob/main/optimizations.js) from here.

**Show me how to reproduze it quickly**

To quickly check it in your browser open the DevTools "Sources" tab and click on "Snippets".
Create a snippet with the code above, execute it and measure the impact.

![img-dev-tools--snippets_michael_hladky](https://user-images.githubusercontent.com/10064416/163622952-ba8e0b03-fe96-4ffb-a8d9-4f7c4cb3442c.PNG)

**DevTools "Sources"**  
1. Open DevTools
2. Select Sources Tab
3. Select Snippets
4. Click New snippet
5. Give it a name
6. Insert scripts
7. Execute
8. Check console

**webpagetest**  
1. Open webpagetest
2. Select "Site Performance" as test
3. Select "Advanced" 
4. Paste the optimizations in the sectin "Inject Script"
5. Click on tab "Block"
6. Paste `annie-avatar.jpg ramona-avatar.jpg` in the section "Block Requests Containing"
8. Run test
9. Check result

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

### Filmstrip Pageload  

![observable-hq--filmstrip-before](https://user-images.githubusercontent.com/10064416/164156172-6c3fb7b1-2cf5-4983-ac6e-253320c62cd8.PNG)

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

![Filmstrip]()

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

Voila! 💪 The refetching is now gone and also a propperly sized image is used, only the fetch priority is still on `High` as we use CSS `background-image`. But you know, Rome...



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

## Phase 4 - Hero section video

After I added the optimized measures and the TL;DR section I tried to somehow visualize the hero video impackt as it is a major improvement of this audit and therefore it should shine. 

Let's use filmstrips to visualize the impact:

**Before**
![observable-hq--filmstrip-before](https://user-images.githubusercontent.com/10064416/164159488-7995d572-489f-49f0-8c06-7d899c06efaf.PNG)

I started by fixing the initial height of the image with `min-height:427px` to get less visual changes measures and a besser UX.

**Placeholder polishing**

To make the smithc from the placeholder to the video less visible I create a custom placeholder image.
I make a screenshot, open [squoosh.app](https://squoosh.app/editor) upload my image and start tewaking until I have around 9KB (initially it was 105KB) and used [www.base64-image.de](https://www.base64-image.de/) to make it a base64 string.

I started to preload it to get a faster paint and after some measures i decided to inline it. Way faster and easier to apply.
The `background-image: url()` is used here.

**Video**

To improve the video loading I started to experiment with preloading attributes on the image, but as this will still wait to fetch until the DOM is fully parsed i went with `<link rel="preload" as="fetch" href="https://static.observablehq.com/assets/videos/Notebook-Demo.mov">`.

I'm nervouve... :)

![observable-hq--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164160130-eff89ca9-d054-4673-bda0-a875eacedc27.PNG)

REALLY NICE!!! 🔥🔥🔥

This nice improfement series deserves a image showing the evolution of this improvement.

![observable-hq--hero-section--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164124797-baf781dc-262b-4f04-ab55-081faef5a927.PNG)

<details><summary>Heroscetion final snippet</summary>
<p>

**Be happy I used a `<details>` element!**  

```javascript
const parser = document.createElement('DIV');
function parse(html) {
    parser.innerHTML = html;
    return parser.firstChild;
}
const v = parse('<link rel="preload" as="fetch" href="https://static.observablehq.com/assets/videos/Notebook-Demo.mov">');
const s = parse("<style>.mw-section video {min-height: 427px;background-image: url('data:image/jpeg;base64,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')}</style>");

document.body.prepend(v);
document.body.prepend(s);
```
</p>
</details>

 ...  
 
> 🗣 Memo to myself: 
> Never maintin base64 images in a readm again!

# Optimized State

## Filmstrip Pageload

![observable-hq--filmstrip-after](https://user-images.githubusercontent.com/10064416/164162065-1c0f1c1b-d9f4-4f3e-af87-a695001af574.PNG)

## Page Refresh  

We can't run this comparison easily so we skip it for now. 

## Page Re-draw DOM  
![img-observablehq-redom_after](https://user-images.githubusercontent.com/10064416/163669367-3104ffae-2efb-4507-8ad4-e6d51748cd52.PNG)

**25ms** before 154ms

## Page Recalculate  

![img-observablehq-recalculate_after](https://user-images.githubusercontent.com/10064416/163669377-f6e8bfa2-7490-4b4d-9cf1-98593e874a22.PNG)

**15.45ms** before **194ms**

## Page Scroll  

![img-observablehq-scroll-after](https://user-images.githubusercontent.com/10064416/163669381-fd3097ee-4439-4343-90b4-95777da6ac2c.PNG)

No bissy areas anymore.

## Page Idle    

![img-observablehq-idle_after](https://user-images.githubusercontent.com/10064416/163669421-a31934eb-203b-4796-a6e7-6dfe5b761a27.PNG)

**5ms** before 20ms

# Comparison

## Filmstrip Pageload

![observable-hq--filmstrip-comparison](https://user-images.githubusercontent.com/10064416/164160130-eff89ca9-d054-4673-bda0-a875eacedc27.PNG)

## Page Re-draw DOM  

![img-observablehq-redom_comparison](https://user-images.githubusercontent.com/10064416/163671375-02204147-8f75-43d0-8484-b47d7f3abc36.PNG)

## Page Recalculate  

![img-observablehq-recalculate_comparison](https://user-images.githubusercontent.com/10064416/163671372-bfbd8f40-39b2-4b90-b11f-a64e4130cf0e.PNG)

## Page Scroll  

![img-observablehq-scroll-comparison](https://user-images.githubusercontent.com/10064416/163671374-02a27d3e-e2cb-4333-9e37-1673e108f530.PNG)

## Page Idle    

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
- [observablehq-recalc_after.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-recalc_after.json)
- [observablehq-redow_after.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-redom_after.json)
- [observablehq-scroll_after.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-scroll_after.json)
- [observablehq-idle_after.json](https://raw.githubusercontent.com/push-based/observable-hq--audit/master/raw/observablehq-idle_after.json)


