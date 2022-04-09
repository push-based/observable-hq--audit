# Observable HQ - Performance Audit

---

## Initial state

To start with our audit we need the status quo.

Following measures where taken:
- Page refresh (a full page refresh triggeres over the performace panel)
- Page re-dom (a full removal and addinf back of the DOM)
- Page re-calculate (transformZ 0.1 on body)
- Page idle (after page is fully loaded some seconds of no interaction)

Following devices where erspected:
- Desktop

### Page refresh

### Findings

**Spcipting:**
- script dirven animations
- bad lib for DOM animation

**DOM & Styles:**
- animation noise
- styled components triggering refetch of resources

**Media:**
- no UI facade for hero GIF
- no lazy loading
- no compression
- wrong dimensions 

## Visual Areas

[Page view]()

**Areas:**
- tool-bar `document.querySelector('nav.bb')`
- section `document.querySelectorAll('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
  - hero-section `document.querySelector('#__next > .jsx-2b91b8133a45a7a2 > .jsx-2b91b8133a45a7a2')`
- footer `document.querySelector('footer')`

## CSS only improvements

After my first impression of the flames and the fact that I **can't touch code nor assets** I decided to focus first on the things I can **easily test and measure**.
This includes runtime measures of DOM and CSS changes.

### `loading`

After a look in the delivered HTML I have little hope we can land an impact with lazy loading resources as they already have it in use pretty much every where.

Let's quickly check the images without loading lazy on the page... 

### `contain` and `content-visibility`

I start with the quick wins first and worked my way through the previously defined sections.

**Tool-bar**

The tool-bar is my first candidate. A clear case for `contain:strict` as (even if it self is without fixed dimensions, its first and only child is) we can assume static dimensiones. I did a check for mobile, to be shure it is the same there, which was the case: `height: 55px`. 

It will be off screen when we scroll so we can consider `content-visibility` and `contain-intrinsic-size`. 

The interactions with tool-bar elements did not show any animated changes nor dropdowns. The only thing interesting was, when I clicked the searchbox a full bage overlay showed up.

I don't measure as I don't asume any big impact.

**Section**

The majority of the pages content is organized in sections with mid size DOM size. In general the site is media heavy but there are some specific sections containing more relevant animation or media we could have a look at. 

We can try if their content is staiy stable if we apply `content-visibility:auto`... It is quite a hick up in the scrollbar, an intrinsic size of `300px` makes it way better. Now a quick check on mobile... It's, at least with touchpad and laptop noticable that the scroll is a bit janky, but lets keep ti for now and take a measure.

Looks good! Recalculate styles and redom shows pretty nice improvements already.



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
```
